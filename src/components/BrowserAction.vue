<template>
  <div>
    <div class="player-search-input-wrapper">
      <input id="search" v-model="searchValue" class="player-search-input" type="search" placeholder="i.e. Matt Ryan" results="10" autosave="player_search" @search="searchInput" incremental="true"/>
    </div>
    <div class="player-results">
      <SearchPlayer v-for="player in players" :key="player.id" :player="player"></SearchPlayer>
    </div>
    <div class="browser-action-footer">
      <div class="footer-btn">
        <div @click="goToSettings" id="settings-btn" class="ff-btn grey">
          <i class="fa fa-gear" aria-hidden="true"></i><span>Settings</span>
        </div>
        <div id="refresh-btn" class="ff-btn grey">
          <i class="fa fa-refresh" aria-hidden="true"></i><span>Refresh</span>
        </div>
      </div>
    </div> 
  </div>
</template>
<script>
import SearchPlayer from 'SearchPlayer';

export default {
    name: 'BrowserAction',
    components: {
      SearchPlayer
    },
    data: function() {
      return {
        players: [],
        searchValue: ''
      }
    },
    methods: {
      searchInput() {
        debugger;
        chrome.extension.sendMessage({method: 'playerSearch', query: this.searchValue}, response => {
            this.players = response.results.sort((result1, result2) => {
              if (result1.name < result2.name) return -1;
              if (result1.name > result2.name) return 1;
              return 0;
            });
        });
      },
      goToSettings() {
        window.open(chrome.extension.getURL("settings.html"), "_blank");
      }
  }
}
</script>
<style scoped>
.browser-action-footer {
  vertical-align: bottom;
  background: rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0px;
  width: 100%;
  text-align: center;
}

.browser-action-footer .footer-btn {
  display: inline-block;
  vertical-align: bottom;
}

.player-results {
  position: absolute;
  top: 40px;
  bottom: 28px;
  left: 0px;
  right: 0px;
  overflow: scroll;
}

.player-search-input-wrapper {
  padding: 5px 10px;
}

.player-search-input-wrapper .player-search-input {
  width: 100%;
}

.fa-gear,
.fa-refresh {
  margin-right: 5px;
}

.ff-btn {
  display: inline-block;
  padding: 5px 10px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.5);
  box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.5);
  font-size: 12px;
  font-weight: bold;
  line-height: 14px;
  text-align: center;
  cursor: pointer;
  margin: 2px;
}

.ff-btn.grey {
  background: #6b717c;
  background: -ms-linear-gradient(top, #898c91, #4e5766);
  background: -webkit-gradient(linear, left top, left bottom, from(#898c91), to(#4e5766));
  background: -moz-linear-gradient(center top, #898c91 0%, #4e5766 100%);
  background: -moz-gradient(center top, #898c91 0%, #4e5766 100%);
  color: #ffffff;
}

.ff-btn.grey:hover {
  background: #757b87;
  background: -ms-linear-gradient(top, #919498, #596375);
  background: -webkit-gradient(linear, left top, left bottom, from(#919498), to(#596375));
  background: -moz-linear-gradient(center top, #919498 0%, #596375 100%);
  background: -moz-gradient(center top, #919498 0%, #596375 100%);
}

.ff-btn.grey:active {
  background: #757b87;
  background: -ms-linear-gradient(top, #919498, #596375);
  background: -webkit-gradient(linear, left top, left bottom, from(#919498), to(#596375));
  background: -moz-linear-gradient(center top, #919498 0%, #596375 100%);
  background: -moz-gradient(center top, #919498 0%, #596375 100%);
  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
  box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.5);
}
</style>
