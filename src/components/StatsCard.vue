<template>
  <div class="stats-card">
    <div class="player-info">
      <div class="player-img">
        <img :src="player.profileImage">
      </div>
      <div class="player-search-name">
        {{player.name}}
        <div class="player-positions">{{player.positions}}</div>
      </div>
    </div>
     <div class="stats-table">
    <b-tabs>
    <b-tab title="Availability" active>
      <div class="player-details-availability player-details-section active">
        <div v-for="league in player.leagueStatus" :key="league.leagueId" class="league-row">
        <div class="league-row-padder">
          <div :class="league.site + ' site-icon'"></div>
          <div class="league-name">{{league.leagueName}}</div>
          <a class="ff-btn-link" :href="league.actionUrl" target="_blank">
            <b-button v-if="league.status === 1" variant="success" size="sm" class="ff-btn"> <!-- <FontAwesomeIcon icon="plus"></FontAwesomeIcon> --> Add</b-button>
            <b-button v-if="league.status === 2" variant="warning" size="sm" class="ff-btn"> <!-- <FontAwesomeIcon icon="random"></FontAwesomeIcon> --> Trade</b-button>
            <b-button v-if="league.status === 3" variant="error" size="sm" class="ff-btn"> <!-- <FontAwesomeIcon icon="times"></FontAwesomeIcon> --> Drop</b-button>
          </a>
        </div>
      </div>
    </div>
    </b-tab>
    <b-tab title="Stats" >
    </b-tab>
  </b-tabs>
</div>
  </div>
</template>

<script>

export default {
  props: {
      player: {}
  }
}
</script>
<style>
/* This isn't scoped css becuase we need to style down into b-tabs. We manually scope it by prefixing with .stats-card */
.stats-card .player-info {
  display:flex; 
}

.stats-card .player-img {
  display: flex;
  align-items: center;
}

.stats-card .player-img img {
  height: 40px;
  width: 55px;
}

.stats-card .player-search-name {
  display: inline-block;
  vertical-align: top;
  padding: 15px 5px 15px 10px;
  max-width: 125px;
}

.stats-card .player-search-name .player-positions {
  font-size: 12px;
}

.stats-card .player-details-availability {
  padding-top: 5px;
}

.stats-card .league-row {
  width: 100%;
}

.stats-card .league-row:nth-child(odd) {
  background: #f9f9f9;
}

.stats-card .league-row:nth-child(even) {
  background: rgba(0,0,0,.05)
}

.stats-card .site-icon {
  width: 10px;
  height: 10px;
  margin-top: 9px;
  display: inline-block;
}
.stats-card .site-icon.espn {
  background: url('images/espn.png');
  background-size: 10px;

}

.stats-card .league-name {
  display: inline-block;
  vertical-align: top;
  width: 130px;
  line-height: 20px;
  margin-top: 5px;
  padding: 0px 5px;
  max-height: 20px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.stats-card .league-row .ff-btn {
  float: right;
  width: 80px;
  margin: 0px;
  box-sizing: border-box;
  line-height: 1;
}

/* All below styles are why we cant use scoped css in this component */
.stats-card .tabs .nav-item {
  width: 50%;
}

.stats-card .tabs .nav-item a {
  padding: .1rem;
  text-align: center;
}
</style>