import Espn from './sites/espn';
import Yahoo from './sites/yahoo';
import FFStorage from './storage';

const FREE_AGENT = 1;
const DROP = 2;
const TRADE = 3;

export default class FF {
  constructor() {
    this.storage = new FFStorage();

    this.espn = new Espn(this);
    this.yahoo = new Yahoo(this);
    this.customMappings = this.storage.get("global", "nicknames") || {};
  }

  getLeaguesFromStorage() {
    let leagues = [];
    leagues = leagues.concat(this.espn.getLeaguesFromStorage());
    leagues = leagues.concat(this.yahoo.getLeaguesFromStorage());
    return leagues;
  }

  loadPlayers() {
    window.playerDict = this.storage.get('global', 'playerDict') || {};
    window.listOfPlayers = this.storage.get('global', 'listOfPlayers') || {};
  }

  /** 
   * Parses team info from URL
   * Used by: fetchTakenPlayersForLeague
   */
  getUrlVars(url) {
    let hash;
    const vars = {};
    const hashes = url.slice(url.indexOf('?') + 1).split('&');
    for(let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  /**
   * Refresh taken status for player
   * @param {Object} player 
   */
  updatePlayerStatus(player) {
    const leagues = this.getLeaguesFromStorage();
    player.leagueStatus.length = 0;
    for (let i = 0; i < leagues.length; ++i) {
      const league = leagues[i];
      const leagueId = league.leagueId;
      const teamId = league.teamId;
  
      const playerStatus = {};
      playerStatus.site = league.site;
      playerStatus.leagueId = leagueId;
      playerStatus.leagueName = leagues[i].leagueName;
  
      let idForSite;
      if (league.site === player.site) {
        idForSite = player.id;
      } else {
        idForSite = player.otherIds[league.site];
      }
      const ownedByTeamId = league.playerIdToTeamIndex[idForSite];
  
      debugger;
      if (ownedByTeamId) {
        playerStatus.ownedByTeamName = league.shortNames[ownedByTeamId];
        if (ownedByTeamId === teamId) {
          playerStatus.status = DROP;
          playerStatus.actionUrl = this[league.site].buildDropUrl(idForSite, league);
        } else {
          playerStatus.status = TRADE;
          playerStatus.actionUrl = this[league.site].buildTradeUrl(idForSite, ownedByTeamId, league);
        }
  
        player.leagueStatus.push(playerStatus);
      } else {
        playerStatus.status = FREE_AGENT;
        playerStatus.actionUrl = this[league.site].buildFreeAgentUrl(idForSite, league);
        player.leagueStatus.push(playerStatus);
      }
    }
  }

  /**
   * Look up player by name
   * @param {Object} searchSpace 
   * @param {String} playerName 
   * @param {Function} callback 
   */
  playerSearch(searchSpace, playerName, callback) {
    const players = Object.values(searchSpace);
    const validPlayers = players.filter(player => {
      return player.name.toLowerCase().indexOf(playerName) >= 0;
    });
  
    return callback(validPlayers);
  }

  /**
   * Get player from list by ID and update status
   * @param {Integer} playerId 
   */
  getPlayerById(playerId) {
    const player = window.listOfPlayers[playerId];
    if (!player.id) {
      return;
    }
  
    this.updatePlayerStatus(player);
    return player;
  }

  /**
   * Fetch user settings from local storage
   */
  getUserSettings() {
    return this.storage.get("global", "settings");
  }

  /**
   * Save user settings to local storage
   * @param {Object} settingObj 
   */
  setUserSettings(settingObj) {
    let currSettings = this.getUserSettings();
    if (!currSettings) {
      currSettings = {};
    }
  
    const newSettingsKeys = Object.keys(settingObj);
    for (let i = newSettingsKeys.length - 1; i >= 0; i--) {
      currSettings[newSettingsKeys[i]] = settingObj[newSettingsKeys[i]];
    }
  
    this.storage.set("global", "settings", currSettings);
  }

  /**
   * Add a blacklist term and save to localstorage
   * @param {String} url 
   */
  addBlacklistURL(url) {
    const currSettings = this.getUserSettings();
    let blacklist = currSettings === undefined ? [] : currSettings['blacklist'];
    if(blacklist === undefined) {
      blacklist = [];
    }
  
    if(blacklist.indexOf(url) === -1) {
      blacklist.push(url);
    }
    this.setUserSettings({'blacklist' : blacklist});
  }

  /**
   * Remove blacklist term
   * @param {String} url 
   */
  removeBlacklistURL(url) {
    const currSettings = this.getUserSettings();
    let blacklist = currSettings === undefined ? [] : currSettings['blacklist'];
    if(blacklist === undefined) {
      blacklist = [];
    }
    const idx = blacklist.indexOf(url);
    if(idx !== -1) {
      blacklist.splice(idx, 1);
    }
    this.setUserSettings({'blacklist' : blacklist});
  }

  /**
   * Add nickname to player id
   * @param {String} nickname 
   * @param {Integer} playerId 
   */
  addCustomMapping(nickname, playerId) {
    this.customMappings[nickname] = playerId;
    this.storage.set("global", "nicknames", this.customMappings);
  }

  /**
   * Remove player nickname
   * @param {String} nickname 
   */
  removeCustomMapping(nickname) {
    delete this.customMappings[nickname];
    this.storage.set("global", "nicknames", this.customMappings);
  }

  /**
   * Return all of the custom mappings
   */
  getCustomMapping() {
    return this.customMappings;
  }
}