import Site from './site';
import Player from '../player';
import $ from 'jquery';
import FantasyFilter from './utils/FantasyFilter';

const BASE_URL = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/{0}/segments/0/leagues/{1}';
const PROFILE_IMAGE = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/{0}.png&w=96&h=70&cb=1';
const PLAYER_URL = `${BASE_URL}?view=kona_player_info`;
const SEASON_ID = 2020; // TODO fix

export default class Espn  extends Site {
  constructor(ff) {
    super(ff, 'espn');se
  }

  initLeague(leagueId, teamId, callback) {
    const urlString = BASE_URL.replace('{0}', SEASON_ID).replace('{1}', leagueId);
    $.ajax({
      url: urlString,
      data: 'text',
      headers: {
        'Accept': '*/*',
      },
      success: function(data) {
        const league = {};
        league.leagueId = leagueId;
        league.leagueName = data.settings.name;
        league.shortNames = [];
        league.site = 'espn';
        league.sport = 'football';
        league.playerIdToTeamIndex = {};
        league.teamId = teamId;
 
        data.teams.forEach(team => {
          league.shortNames.push(team.abbrev);
          debugger;
          if (team.id == teamId) {
            league.teamName = `${team.location} ${team.nickname}`;
          }
        });
        callback(league);
      }.bind(this)
    });
  }

  getLocalLeague(league) {
    for(let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].leagueId === league.leagueId) {
        return this.leagues[i];
      }
    }  
  }

  refreshTakenPlayers(league) {
    league.playerIdToTeamIndex = {};
    this.fetchTakenPlayers(league);
  }

  fetchTakenPlayers(league) {
    this._fetchTakenPlayersForLeague(league);
  }

  _fetchTakenPlayersForLeague(league, opt_offset) {
    const urlString = PLAYER_URL.replace('{0}', SEASON_ID).replace('{1}', league.leagueId);
    const builder = new FantasyFilter.Builder();
    const fantasyFilter = builder
      .withPlayerStatus('ONTEAM')
      .withSortPercOwned(2, false)
      .withOffset(opt_offset || 0)
      .build();

    $.ajax({
      url: urlString,
      data: 'text',
      headers: {
        'Accept': '*/*',
        'x-fantasy-filter': JSON.stringify(fantasyFilter)
      },
      success: function(data) {
        data.players.forEach(playerData => {
          const owningTeamId = playerData.onTeamId;
          const currPlayerId = playerData.player.id;
          this.addPlayerMapping(league, currPlayerId, owningTeamId);
        });

        if (data.players.length === 50) {
          opt_offset = (opt_offset || 0) + 50;
          this._fetchTakenPlayersForLeague(league, opt_offset);
        } else {
          this.updateLocalLeague(league);
          this.save();
        }
      }.bind(this)
    });

  }

  fetchAllPlayersForLeague(league, port, opt_offset) {
    const urlString = PLAYER_URL.replace('{0}', SEASON_ID).replace('{1}', league.leagueId);
    const builder = new FantasyFilter.Builder();
    const fantasyFilter = builder
      .withSortPercOwned(2, false)
      .withOffset(opt_offset || 0)
      .build();
    
    $.ajax({
      url: urlString,
      data: 'text',
      headers: {
        'Accept': '*/*',
        'x-fantasy-filter': JSON.stringify(fantasyFilter)
      },
      success: function(data) {
        data.players.forEach(playerData => {
          const currPlayerId = playerData.player.id;
          const name = playerData.player.fullName;
          const profileImage = PROFILE_IMAGE.replace('{0}', currPlayerId);
          if (name.includes("D/ST")) {
            const player = new Player(currPlayerId, name, null, "D/ST", league.leagueId, 'espn', profileImage);
            this.addPlayerToDict(player);
          } else {
            const team = playerData.player.proTeamId; // TODO map from pro team id to team name (either statically or dynamically)
            const pos = playerData.player.defaultPositionId; // TODO map from id to position name (either statically or dynamically)
            const player = new Player(currPlayerId, name, team, pos, league.leagueId, 'espn', profileImage);
            this.addPlayerToDict(player);
          }
        });
        if (data.players.length === 50) {
          opt_offset = (opt_offset || 0) + 50;
          this.fetchAllPlayersForLeague(league, port, opt_offset);
        } else {
          console.log("done");
          if(port !== undefined) {
            port.postMessage({status: "addLeagueComplete"});
          }
        }
      }.bind(this)
    });
  }

  // TODO Fix this method
  addPlayerIdsForSite(league, port, opt_offset) {
    let urlString = 'http://games.espn.go.com/ffl/freeagency?leagueId=' + league.leagueId + '&seasonId=' + league.seasonId + '&avail=-1';
    if (opt_offset) {
      urlString += '&startIndex=' + opt_offset;
    }
    $.ajax({
      url: urlString,
      data: 'text',
      success: function(data) {
        const elements = $($('<div>').html(data)[0]).find('table.playerTableTable tr.pncPlayerRow');
        //Should be each player row
        for(let i = 0; i < elements.length; i++) {
          const currPlayerRow = $(elements[i]);
          const currPlayerId =  $(currPlayerRow).attr('id').substring(4);
          const nameDiv = $(currPlayerRow).find('td.playertablePlayerName');
          const parts = nameDiv[0].innerText.split(",");
          const name = parts[0];
          if(name.includes("D/ST")) {
            continue;
          }

          const names = name.split(/\s+/);
          let firstName = names[0].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');
          let lastName = names[names.length - 1].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');
          if(lastName === 'jr.' || lastName === 'sr.' || lastName === 'v' || lastName === 'ii' || lastName === 'iii') {
            lastName = names[names.length - 2].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');
          }
          if(window.playerDict[lastName] === undefined) {
            console.log("no entry for " + firstName + " " + lastName);
            continue;
          }
          let player = window.playerDict[lastName][firstName];
          if(player === undefined) {
            const oldFirstName = firstName; 
            if(firstName === 'steven') firstName = 'stephen';
            else if (firstName === 'stephen') firstName = 'steven';
            else if (firstName === 'rob') firstName = 'robert';
            else if (firstName === 'robert') firstName = 'rob';
            else if (firstName === 'benjamin') firstName = 'benny';
            else if (firstName === 'benny') firstName = 'benjamin';
            else if (firstName === 'walt') firstName = 'walter';
            else if (firstName === 'walter') firstName = 'walt';
            player = window.playerDict[lastName][firstName];
            window.playerDict[lastName][oldFirstName] = player;
          }
          if(player !== undefined) {
            player.otherIds['espn'] = currPlayerId;
          }
        }
        if (elements.length === 50) {
          if (opt_offset === undefined) {
            opt_offset = 0;
          }
          opt_offset += 50;
          this.addPlayerIdsForSite(league, port, opt_offset);
        } else {
          console.log("done");
          if(port !== undefined) {
            port.postMessage({status: "addLeagueComplete"});
          }
        }
      }.bind(this)
    });
  }


  // TODO I cleaned them up but none of these urls work still, they must have changed over the years, need to find the new ones
  buildDropUrl(playerId, league) {
    const { leagueId, teamId } = league;
    const params = {
      leagueId,
      teamId,
      incoming: 1,
      trans: `3_${playerId}_${league.teamId}_20_-1_1001`
    };

    const urlString = BASE_URL.replace('{0}', SEASON_ID).replace('{1}', leagueId);

    //ffl/clubhouse?leagueId=291420&teamId=1&incoming=1&trans=3_1428_1_20_-1_1001')
    return `${urlString}/ffl/clubhouse?${$.param(params)}`;
  }

  buildTradeUrl(playerId, ownedByTeamId, league) {
    const { leagueId } = league;
    const params = {
      teamId: ownedByTeamId,
      leagueId,
      trans: `4_${playerId}_`
    };

    const urlString = BASE_URL.replace('{0}', SEASON_ID).replace('{1}', leagueId);

    //ffl/trade?teamId=1&leagueId=264931&trans=4_10452_
    return `${urlString}/ffl/trade?${$.param(params)}`;
  }

  buildFreeAgentUrl(playerId, league) {
    const { leagueId, teamId } = league;
    const params = {
      incoming: 1,
      leagueId,
      trans: `2_${playerId}_-1_1001_${teamId}_20`
    };

    const urlString = BASE_URL.replace('{0}', SEASON_ID).replace('{1}', leagueId);

    //ffl/freeagency?leagueId=264931&incoming=1&trans=2_11252_-1_1001_2_20'
    return `${urlString}/ffl/freeagency?${$.param(params)}`;
  }
}




