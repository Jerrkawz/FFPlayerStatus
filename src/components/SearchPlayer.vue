<template>
  <div class="search-player">
    <div class="player-img">
      <img :src="player.profileImage">
    </div>
    <div class="player-search-name"><a target="_blank" :href="player.playerProfileUrl">{{player.name}}</a>
      <div class="player-positions">{{player.positions}}</div>
    </div>
    <InlineAvailability :leagueStatus="player.leagueStatus"></InlineAvailability>
    <div class="player-search-expand"><span class="expand-icon icon-chevron-sign-right"></span></div>
    <!-- <div class="player-details">
      <div class="player-details-header">
        <h2 class="selected" data-section-ref=".player-details-availability" data-player-id="16763">Availability</h2>
        <h2 data-section-ref=".player-details-stats" data-player-id="16763">Stats</h2>
      </div>
      <div class="player-details-availability active player-details-section">
        <div class="league-row">
          <div class="league-row-padder">
            <div class="site-icon espn"></div>
            <div class="league-name">Taco's truck</div>
            <a class="ff-btn-link" href="http://games.espn.go.com/ffl/freeagency?incoming=1&amp;leagueId=703055&amp;trans=2_16763_-1_1001_1_20"
              target="_blank">
              <div class="ff-btn status1" data-player-id="16763" data-player-name="Jordan Matthews" data-action-type="Add">
                <span class="ff-btn-icon fa fa-plus"></span>
                <div class="ff-btn-text">Add</div>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div class="player-details-stats player-details-section">
        <div class="loading-spinner icon-refresh icon-spin icon-large"></div>
      </div>
    </div> -->
  </div>
</template>
<script>
import InlineAvailability from 'InlineAvailability';
export default {
  name: 'SearchPlayer',
  components: {
    InlineAvailability
  },
  props: {
    player: {}
  }
}
</script>
<style scoped>
.search-player {
  text-align: left;
  font-size: 14px;
}

.search-player .player-img {
  display: inline-block;
}

.search-player .player-img img {
  height: 40px;
  width: 55px;
}

.search-player .player-search-name {
  display: inline-block;
  vertical-align: top;
  padding: 15px 5px 15px 10px;
  max-width: 125px;
}

.search-player .player-search-name a {
  font-weight: bold;
  color: black;
  text-decoration: none;
}

.search-player .player-search-name a:hover {
  text-decoration: underline;
  color: blue;
}

.search-player .player-search-name .player-positions {
  font-size: 12px;
}

.search-player:nth-child(odd) {
  background: #f9f9f9;
}

.search-player:nth-child(odd).current {
  background: #c6c6c6;
}

.search-player:nth-child(even) {
  background: rgba(15, 91, 26, 0.1);
}

.search-player:nth-child(even).current {
  background: #c6c6c6;
}
</style>
