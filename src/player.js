import $ from 'jquery';

export default class Player {
  constructor(id, name, team, pos, leagueId, site, profileImage) {
    this.id = id;
    this.name = name;
    this.leagueIds;
    if (!this.name) {
      return;
    }
    this.team = team;
    const year = new Date().getFullYear();
    if (site === 'yahoo') {
      this._fetchYahooProfilePic(leagueId, year);
      this.playerProfileUrl = 'http://sports.yahoo.com/nfl/players/' + this.id;
    }

    this.site = site;
    this.otherIds = {};
    this.leagueStatus = [];
    this.positions = pos;
    this.profileImage = profileImage;
  }

  /* Private functions */
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