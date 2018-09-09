import Site from './site';
import Player from '../player';
import $ from 'jquery';

export default class Espn  extends Site {
  constructor(ff) {
    super(ff, 'espn');
    this.baseUrl = 'http://games.espn.go.com/';
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

  _fetchTakenPlayersForLeague(league, opt_offset, opt_slotCategoryGroup) {
    let urlString = `http://games.espn.go.com/ffl/freeagency?leagueId=${league.leagueId}&seasonId=${league.seasonId}&avail=4`;
    if (opt_offset) {
      urlString += `&startIndex=${opt_offset}`;
    }
    if (opt_slotCategoryGroup) {
      urlString += `&slotCategoryGroup=${opt_slotCategoryGroup}`;
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
          const owningTeamEl = $(currPlayerRow).find('td:nth-child(3) a');

          if ($(owningTeamEl).length > 0) {
            const owningTeamUrllets = this.ff.getUrlVars($(owningTeamEl).attr('href'));
            const owningTeamId = owningTeamUrllets.teamId;
            this.addPlayerMapping(league, currPlayerId, owningTeamId);
          }
        }
        if (elements.length === 50) {
          if (opt_offset === undefined) {
            opt_offset = 0;
          }
          opt_offset += 50;
          this._fetchTakenPlayersForLeague(league, opt_offset, opt_slotCategoryGroup);
        } else {
          this.updateLocalLeague(league);
          this.save();
        }
      }.bind(this)
    });

  }

  fetchAllPlayersForLeague(league, listOfPlayers, port, opt_offset) {
    let urlString = `http://games.espn.go.com/ffl/freeagency?leagueId=${league.leagueId}&seasonId=${league.seasonId}&avail=-1`;
    if (opt_offset) {
      urlString += `&startIndex=${opt_offset}`;
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
          let name = parts[0];
          if(name.includes("D/ST")) {
            const nametoks = name.split(/\s+/);
            name = nametoks[0] + " " + nametoks[1];
            const player = new Player(currPlayerId, name, null, "D/ST", league.leagueId, 'espn');
            listOfPlayers[currPlayerId] = player;
            this.addPlayerToDict(player);
            continue;
          }
          let team;
          let pos;
          if(parts[1] !== undefined) {
            team = parts[1].split(/\s+/)[1];
            pos = parts[1].split(/\s+/)[2];
          }

          const player = new Player(currPlayerId, name, team, pos, league.leagueId, 'espn');
          listOfPlayers[currPlayerId] = player;
          this.addPlayerToDict(player);
        }
        if (elements.length === 50) {
          if (opt_offset === undefined) {
            opt_offset = 0;
          }
          opt_offset += 50;
          this.fetchAllPlayersForLeague(league, listOfPlayers, port, opt_offset);
        } else {
          console.log("done");
          if(port !== undefined) {
            port.postMessage({status: "addLeagueComplete"});
          }
        }
      }.bind(this)
    });
  }

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

  buildDropUrl(playerId, league) {
    const params = {
      leagueId: league.leagueId,
      teamId: league.teamId,
      incoming: 1,
      trans: '3_' + playerId + '_' + league.teamId + '_20_-1_1001'
    };

    //ffl/clubhouse?leagueId=291420&teamId=1&incoming=1&trans=3_1428_1_20_-1_1001')
    return this.baseUrl + 'ffl/clubhouse?' + $.param(params);
  }

  buildTradeUrl(playerId, ownedByTeamId, league) {
    const params = {
      teamId: ownedByTeamId,
      leagueId: league.leagueId,
      trans: '4_' + playerId + '_'
    };

    //ffl/trade?teamId=1&leagueId=264931&trans=4_10452_
    return this.baseUrl + 'ffl/trade?' + $.param(params);
  }

  buildFreeAgentUrl(playerId, league) {
    const params = {
      incoming: 1,
      leagueId: league.leagueId,
      trans: '2_' + playerId + '_-1_1001_' + league.teamId + '_20'
    };

    //ffl/freeagency?leagueId=264931&incoming=1&trans=2_8416_-1_1001_1_20'

    //ffl/freeagency?leagueId=264931&incoming=1&trans=2_11252_-1_1001_2_20'
    return this.baseUrl + 'ffl/freeagency?' + $.param(params);
  }
}




