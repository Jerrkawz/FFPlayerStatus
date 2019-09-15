export default class Site {
  constructor(ff, siteName) {
    this.ff = ff;
    this.site = siteName;
    this.baseUrl;
    this.userId;
    this.lastLogin;
    this.leagues = [];
    this.load();
  }

  load() {
    // Kill this once storage is pulled from ff
    if (!this.ff) {
      return;
    }
    const site = this.ff.storage.getValue(this.site);
    if (site) {
      this.userId = this.site;
      this.lastLogin = site.lastLogin;
    }
  }

  save() {
    this.ff.storage.setValue(this.site, {
      userId: this.site,
      lastLogin: this.lastLogien
    });
    this.ff.storage.setValue(this.getSiteUserKey(), {'leagues': this.leagues});
  }

  updateLocalLeague(league) {
    for(let i = 0; i < this.leagues.length; i++) {
      if(this.leagues[i].leagueId === league.leagueId) {
        this.leagues[i] = league;
      }
    }
  }

  fetchTakenPlayersForAllLeagues() {
    const leagues = this.leagues;
    for (let i = 0; i < leagues.length; i++) {
      const league = leagues[i];
      if (league.sport === 'football') {
        this.fetchTakenPlayers(league);
      }
    }
  }

  teamExists(league) {
    for (let i = 0; i < this.leagues.length; i++) {
      if (this.leagues[i].leagueId === league.leagueId) {
        return true;
      }
    }
    return false;
  }

  addUserTeam(leagueId, teamId, callback) {
    this.initLeague(leagueId, teamId, (league) => {
      this.fetchTakenPlayers(league);
      let leaguesObject = this.ff.storage.get(this.getSiteUserKey(), 'leagues');
      leaguesObject = leaguesObject || [];
      leaguesObject.push(league);
      this.ff.storage.set(this.getSiteUserKey(), 'leagues', leaguesObject);
      this.leagues.push(league);
      callback(league);
    });
  }

  removeUserTeam(leagueId) {
    for(let i = 0; i < this.leagues.length; i++) {
      if(this.leagues[i].leagueId === leagueId) {
        this.leagues.splice(i, 1);
        break;
      }
    }
    let leagues = this.ff.storage.get(this.getSiteUserKey(), 'leagues');
    leagues = leagues || [];
    for(let i = 0; i < leagues.length; i++) {
      if(leagues[i].leagueId === leagueId) {
        leagues.splice(i, 1);
        this.ff.storage.set(this.getSiteUserKey(), 'leagues', leagues);
        return;
      }
    }
  }

  addPlayerMapping(league, currPlayerId, owningTeamId) {
    league.playerIdToTeamIndex[currPlayerId] = owningTeamId;
  }

  addPlayerToDict(player) {
    const parts = player.name.split(/\s+/);
    let firstName = parts[0].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');
    const lastName = parts[1].toLowerCase().replace(/[,/#!$%^&*;:{}=~()]/g,'');

    if(!(lastName in window.playerDict)) {
      window.playerDict[lastName] = {};
    }
    window.playerDict[lastName][firstName] = player;
    // For players like C.J. Anderson with .'s in their name, which some type and others don't...
    if(firstName.indexOf(".") !== -1) {
      firstName = firstName.replace(/\./g, '');
      window.playerDict[lastName][firstName] = player;
    }
    window.listOfPlayers[player.id] = player;
    this.savePlayers();
  }

  getLeaguesFromStorage() {
    const leagueInfo = this.ff.storage.getValue(this.getSiteUserKey());
    return leagueInfo && leagueInfo.leagues ? leagueInfo.leagues : [];
  }

  resetLeagues() {
    this.ff.storage.set(this.getSiteUserKey(), 'leagues', []);
    this.leagues = [];
  }

  resetStorage() {
    this.resetLeagues();
    this.ff.storage.set('global', 'lastLeagueUpdate', Date.now());
  }

  getSiteUserKey() {
    return this.site;
  }

  savePlayers() {
    this.ff.storage.set('global', 'playerDict', window.playerDict);
    this.ff.storage.set('global', 'listOfPlayers', window.listOfPlayers);
  }
}
