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
    <ul class="nav nav-tabs">
      <li class="nav-item" @click.prevent.stop="handleAvailabilityClick">
        <a class="nav-link" :class="{active: isActive('availability')}" href="#">Availability</a>
      </li>
      <li class="nav-item" @click.prevent.stop="handleStatsClick">
        <a class="nav-link" :class="{active: isActive('stats')}" href="#">Stats</a>
      </li>
    </ul>
    <div class="tab-content">
      <div v-if ="activeTab === 'availability'" class="player-details-availability player-details-section">
        <div v-for="league in player.leagueStatus" :key="league.leagueId" class="league-row">
        <div class="league-row-padder">
          <div :class="league.site + ' site-icon'"></div>
          <div class="league-name">{{league.leagueName}}</div>
          <a class="ff-btn-link" :href="league.actionUrl" target="_blank">
            <button v-if="league.status === 1" type="button" class="btn btn-sm btn-success">Add <img class="small-icon" :src="addImage"/></button>
            <button v-if="league.status === 2" type="button" class="btn btn-sm btn-danger">Drop <img class="small-icon" :src="dropImage"/></button>
            <button v-if="league.status === 3" type="button" class="btn btn-sm btn-warning">Trade <img class="small-icon" :src="tradeImage"/></button>
          </a>
        </div>
      </div>
    </div>
    <div v-if ="activeTab === 'stats'">
      Coming soon
    </div>
  </div>
</template>

<script>

export default {
  props: {
      player: {}
  },
  data() {
    return {
      activeTab: 'availability'
    }
  },
  methods: {
    handleAvailabilityClick() {
      this.activeTab = 'availability';
    },
    handleStatsClick() {
      this.activeTab = 'stats';
    },
    isActive(tabName) {
      return this.activeTab === tabName;
    }
  },
  computed: {
    addImage() {
      return chrome.runtime.getURL('images/plus-white.svg');
    },
    dropImage() {
      return chrome.runtime.getURL('images/times-white.svg');
    },
    tradeImage() {
      return chrome.runtime.getURL('images/random-white.svg');
    },
  }
}
</script>
<style scoped>

.stats-table {
  padding: 2px;
}

.stats-card .player-info {
  display: flex; 
  background: rgba(0,0,0,.03);
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
  padding-left: 5px;
}
.stats-card .site-icon.espn {
  background: url('images/espn.png');
  background-size: 10px;

}

.ff-btn-link {
  float: right;
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

.small-icon {
  height: 12px;
  width: 12px;
}

/* All below styles are copied from bootstrap */
.nav-item {
  width: 50%;
  margin-bottom: -1px;
}

.stats-card .tabs .nav-item a {
  padding: .1rem;
  text-align: center;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

.nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.nav-tabs .nav-link {
  border: 1px solid transparent;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
  display: block;
  padding: .5rem 1rem;
}

.nav-tabs .nav-link:focus, .nav-tabs .nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.btn {
  display: inline-block;
  font-weight: 400;
  color: #212529;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: .25rem;
}

.btn-sm {
  padding: .25rem .5rem;
  font-size: .65rem;
  line-height: 1.5;
  border-radius: .2rem;
}

.btn-success {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-warning {
  color: #fff;
  background-color: #ffc107;
  border-color: #ffc107;
}
</style>