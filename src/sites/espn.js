import Site from './site';
import Player from '../player';
import $ from 'jquery';
import FantasyFilter from './utils/FantasyFilter';

const SEASON_ID = 2020; // TODO fix
const BASE_URL = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/{0}/segments/0/leagues/{1}';
const ADD_URL = `https://fantasy.espn.com/football/rosterfix?leagueId={0}&seasonId=${SEASON_ID}&teamId={1}&players={2}&type=claim`;
const DROP_URL = `https://fantasy.espn.com/football/rosterfix?leagueId={0}&seasonId=${SEASON_ID}&teamId={1}&type=drop`
const TRADE_URL = `https://fantasy.espn.com/football/team/trade?leagueId={0}&seasonId=${SEASON_ID}&teamId={1}&fromTeamId={2}&step=1&players={3}`
const PROFILE_IMAGE = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/{0}.png&w=96&h=70&cb=1';
const PLAYER_URL = `${BASE_URL}?view=kona_player_info`;

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

  // TODO this is a little hacky, it just sends you to the rosterfix page instead of dropping the player directly. Its not url addressable from what i could tell
  // so we would have to build a confirm modal if we used the direct call
  buildDropUrl(league) {
    const { leagueId, teamId } = league;
  
    // https://fantasy.espn.com/football/rosterfix?leagueId=88495909&seasonId=2020&teamId=1&players=2570986&type=claim
    return DROP_URL
      .replace('{0}', leagueId)
      .replace('{1}', teamId);
  }

  buildTradeUrl(playerId, ownedByTeamId, league) {
    const { leagueId, teamId } = league;

    // https://fantasy.espn.com/football/team/trade?leagueId=88495909&seasonId=2020&teamId=5&fromTeamId=1&step=1&players=3139477
    return TRADE_URL
      .replace('{0}', leagueId)
      .replace('{1}', ownedByTeamId)
      .replace('{2}', teamId)
      .replace('{3}', playerId);
  }

  buildFreeAgentUrl(playerId, league) {
    const { leagueId, teamId } = league;

    // https://fantasy.espn.com/football/rosterfix?leagueId=88495909&seasonId=2020&teamId=1&players=2570986&type=claim
    return ADD_URL
      .replace('{0}', leagueId)
      .replace('{1}', teamId)
      .replace('{2}', playerId);
  }
}




