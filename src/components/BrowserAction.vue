<template>
  <div>
    <div class="player-search-input-wrapper">
      <input id="search" v-model="searchValue" class="form-control player-search-input" type="search" placeholder="i.e. Matt Ryan" results="10" autosave="player_search" @search="searchInput" incremental="true"/>
    </div>
    <div class="player-results">
      <SearchPlayer class="search-result" v-for="player in players" :key="player.id" :player="player"></SearchPlayer>
    </div>
    <div class="browser-action-footer">
      <div class="footer-btn">
        <b-button class="ff-btn" @click="goToSettings" size="sm">
          <!--<FontAwesomeIcon icon="cog"></FontAwesomeIcon> --> Settings
        </b-button>
        <b-button class="ff-btn" size="sm">
          <!-- <FontAwesomeIcon icon="sync"></FontAwesomeIcon>  --> Refresh
        </b-button>
      </div>
    </div> 
  </div>
</template>
<script>
import SearchPlayer from 'SearchPlayer'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
    name: 'BrowserAction',
    components: {
      SearchPlayer,
    },
    data: function() {
      return {
        players: [],
        searchValue: ''
      }
    },
    methods: {
      searchInput() {
        if (!this.searchValue) {
          this.players = [];
          return;
        }

        chrome.extension.sendMessage({method: 'playerSearch', query: this.searchValue.toLowerCase()}, response => {
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
  font-size: 10px;
  height: 1.5rem;
  width: 100%;
}

.fa-cog,
.fa-sync {
  margin-right: 5px;
}
.ff-btn {
    font-size: 12px;
    padding: .1rem .25rem;
}

.search-result:nth-child(odd) {
    background: #f9f9f9;
}

.search-result:nth-child(even) {
    background: rgba(15, 91, 26, 0.1);
}

</style>
