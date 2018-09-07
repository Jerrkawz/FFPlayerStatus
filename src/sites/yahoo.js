import Site from './site';
import Player from '../player';
import $ from 'jquery';

export default class Yahoo extends Site {
  constructor(ff) {
    super(ff, 'yahoo');
    this.baseUrl = 'http://football.fantasysports.yahoo.com/';
  }

  getFetchPlayersUrl(league, taken, pos) {
    let sportUrlShort = '';
    if (league.sport === 'baseball') {
      sportUrlShort = 'b1';
    } else if (league.sport === 'football') {
      sportUrlShort = 'f1';
    }

    let urlString = `http://${league.sport}.fantasysports.yahoo.com/${sportUrlShort}/${league.leagueId}/players?&sort=PR&sdir=1&status=`;
    urlString += taken ? 'T' : 'ALL';
    urlString += `&pos=${pos}&stat1=S_S_${new Date().getFullYear()}&jsenabled=1`;

    return urlString;
  }

  refreshTakenPlayers(league) {
    league.playerIdToTeamIndex = {};
    this.fetchTakenPlayers(league);
  }

  fetchTakenPlayers(league) {
    this._fetchTakenPlayersForLeague(league, 'O');
    this._fetchTakenPlayersForLeague(league, 'K');
  }

  _fetchTakenPlayersForLeague(league, pos, offset) {
    let urlString = this.getFetchPlayersUrl(league, true, pos);
    if (offset !== undefined) {
      urlString += '&count=' + offset;
    }
    console.log(urlString);

    const findOwnerIndex = function (headerDivs) {
      let index = false;
      for (let i = 0; i < headerDivs.length; i++) {
        const currHeaderDiv = headerDivs[i];
        if($(currHeaderDiv).html().toLowerCase() === "owner") {
          index = i;
        }
      }
      return index;
    };

    $.ajax({
      url: urlString,
      data: 'text',
      success: function(data) {
        const elements = $($('<div>').html(data)[0]).find('.players tbody tr');
        //Should be each player row

        const ownerIndex = findOwnerIndex($(data).find(".players thead tr.Last th>div"));

        for(let i = 0; i < elements.length; i++) {
          const currPlayerRow = $(elements[i]);
          const playerAnchor = $(currPlayerRow.children()[1]).find('.name');
          const ownerAnchor = $(currPlayerRow.children()[ownerIndex]).find('a');

          const currPlayerId =  $(playerAnchor).attr('href').match(/players\/([0-9]+)/)[1];
          const owningTeamId = $(ownerAnchor).attr('href').match(/\/[0-9]+\/([0-9]+)/)[1];
          if (owningTeamId) {
            this.addPlayerMapping(league, currPlayerId, owningTeamId);
          }
        }

        if (elements.length === 25) {
          if (offset === undefined) {
            offset = 0;
          }
          offset += 25;
          this._fetchTakenPlayersForLeague(league, pos, offset);
        }  else {
          this.updateLocalLeague(league);
          this.save();
        }
      }.bind(this)
    });
  }

  fetchAllPlayersForLeague(league, listOfPlayers, settingsPort) {
    this._fetchAllPlayersForLeague(league, listOfPlayers, 'O', settingsPort);
    this._fetchAllPlayersForLeague(league, listOfPlayers, 'K');
  }

  _fetchAllPlayersForLeague(league, listOfPlayers, position, port, offset) {
    let urlString = this.getFetchPlayersUrl(league, false, position);
    if (offset !== undefined) {
      urlString += '&count=' + offset;
    }
    console.log(urlString);

    $.ajax({
      url: urlString,
      data: 'text',
      error() {
        console.log("error");
      },
      success: function(data) {
        const elements = $($('<div>').html(data)[0]).find('.players tbody tr');
        //Should be each player row
        for(let i = 0; i < elements.length; i++) {
          const currPlayerRow = $(elements[i]);
          const playerAnchor = $(currPlayerRow.children()[1]).find('.name');
          const currPlayerId =  $(playerAnchor).attr('href').match(/players\/([0-9]+)/)[1];
          const name = $(playerAnchor).text();
          const playerInfoAnchor = $(currPlayerRow.children()[1]).find('.ysf-player-name > span');
          const parts = $(playerInfoAnchor).text().split(" - ");
          const team = parts[0];
          const pos = parts[1];
          const player = new Player(currPlayerId, name, team, pos, league.leagueId, 'yahoo');

          listOfPlayers[currPlayerId] = player;
          this.addPlayerToDict(player);
        }
        if (elements.length === 25) {
          if (offset === undefined) {
            offset = 0;
          }
          offset += 25;
          this._fetchAllPlayersForLeague(league, listOfPlayers, position, port, offset);
        } else {
          console.log("done");
          if(port !== undefined) {
            port.postMessage({status: "addLeagueComplete"});
          }
        }
      }.bind(this)
    });
  }

  addPlayerIdsForSite(league, port) {
    this._addPlayerIdsForSite(league, 'O', port);
    this._addPlayerIdsForSite(league, 'K');
  }

  _addPlayerIdsForSite(league, position, port, offset) {
    let urlString = this.getFetchPlayersUrl(league, false, position);
    if (offset !== undefined) {
      urlString += '&count=' + offset;
    }
    $.ajax({
      url: urlString,
      data: 'text',
      success: function(data) {
        const elements = $($('<div>').html(data)[0]).find('.players tbody tr');
        //Should be each player row
        for(let i = 0; i < elements.length; i++) {
          const currPlayerRow = $(elements[i]);
          const playerAnchor = $(currPlayerRow.children()[1]).find('.name');
          const currPlayerId =  $(playerAnchor).attr('href').match(/players\/([0-9]+)/)[1];
          const name = $(playerAnchor).text();
          const names = name.split(/\s+/);
          let firstName = names[0].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');
          let lastName = names[1].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');
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
            player.otherIds[league.site] = currPlayerId;
          }
        }
        if (elements.length === 25) {
          if (offset === undefined) {
            offset = 0;
          }
          offset += 25;
          this._addPlayerIdsForSite(league, position, port, offset);
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
    // This can be comboed into dropping and adding at the same time
    // http://football.fantasysports.yahoo.com/f1/302311/addplayer?apid=25802&dpid=24912

    ///f1/302311/2/dropplayer?dpid=24912
    return `${this.baseUrl}f1/${league.leagueId}/${league.teamId}/dropplayer?dpid=${playerId}`;
  }

  buildTradeUrl(playerId, ownedByTeamId, league) {
    // 2 is your team id
    // stage=1 must be present
    // mid2=3 2 is your team id to their team id
    // tpids = the player you want
    ///f1/302311/2/proposetrade?stage=1&mid2=3&tpids[]=7200
    return `${this.baseUrl}f1/${league.leagueId}/${league.teamId}/proposetrade?stage=1&mid2=${ownedByTeamId}&tpids[]=${playerId}`;
  }

  buildFreeAgentUrl(playerId, league) {
    //f1/302311/addplayer?apid=25802
    return `${this.baseUrl}f1/${league.leagueId}/${league.teamId}/addplayer?apid=${playerId}`;
  }
}






