import { $ } from 'jquery';

export default class Player {
  constructor(id, name, team, pos, leagueId, site) {
    this.id = id;
    this.name = name;
    this.leagueIds;
    if (!this.name) {
      return;
    }
    this.team = team;
    const year = new Date().getFullYear();
    if(site === 'espn') {
      this._fetchEspnProfilePic(leagueId, year);
      this.playerProfileUrl = 'http://espn.go.com/nfl/player/_/id/' + this.id + '/';
    }
    else if (site === 'yahoo') {
      this._fetchYahooProfilePic(leagueId, year);
      this.playerProfileUrl = 'http://sports.yahoo.com/nfl/players/' + this.id;
    }

    this.site = site;
    this.otherIds = {};
    this.leagueStatus = [];
    this.positions = pos;
  }

  /* Private functions */
  
  _fetchEspnProfilePic(leagueId, year) {
    $.ajax({
      url: "http://games.espn.com/ffl/format/playerpop/overview?leagueId=" + leagueId + "&playerId=" + this.id + "&playerIdType=playerId&seasonId=" + year + "&xhr=1",
      type: "GET",
      success: function (response) {
        this.profileImage = $(response).find('.mugshot img').attr('src');
      }.bind(this)
    });
  }

  _fetchYahooProfilePic() {
    $.ajax({
      url: this.playerProfileUrl,
      type: "GET",
      success: function (response) {
        let img = $(response).find('.player-image > img').css('background-image');
        if (img !== undefined) {
          img = img.replace('url(', '').replace(')', '').replace(/\"/gi, "");
        }
        this.profileImage = img;
      }.bind(this)
    });
  }
}