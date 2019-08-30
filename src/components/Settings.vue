<template>
  <div>
    <b-card-header header-tag="header" class="card-header" role="tab">
      <a v-b-toggle="'collapse-settings'" href="javascript: void();" @click.prevent>Settings</a>
    </b-card-header>
    <b-collapse visible id="collapse-settings">
      <b-card-body>
        <h5 class="card-title">Your Leagues</h5>
        <div>
          <b-form-group>
            <b-form inline @submit.prevent="addLeague">
              <span class="site-picker">
                <img class="teamlist-icon" src="images/espn.png"/>
                <img class="dropdown-arrow" src="images/chevron-down-solid.svg"/>
              </span>
              <b-form-input id="teamlist_input" class="settings-input" placeholder="Enter League ID" v-model="leagueId" required></b-form-input>
              <b-input-group>
                <b-button type="submit" class="settings-button" variant="primary">Add</b-button>
              </b-input-group>
            </b-form>
            <b-form-text text-variant="muted">Your league ID is typically from the URL. Click here for more information on locating league ID.</b-form-text>
          </b-form-group>
          <table class="table table-striped table-bordered teamlist_tbl">
            <tbody>
              <tr v-for="league in leagues" :key="league.leagueId">
                <td class="teamlist">
                <a :href="league.url">
                  <img class="teamlist-icon" :src="'images/' + league.site + '.png'"/>
                </a>
                </td>
                <td class="tl-teamname" :id="league.leagueId">
                  {{league.teamName}}
                  <b-spinner v-if="league.leagueId == loadingLeagueId" label="loading" small variant="primary"></b-spinner>
                </td>
                <td class="teamlist_remove">
                  <img src="images/times-solid.svg" @click="removeLeague(league.leagueId)" class="team_remove_icon"/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h5 class="card-title">Annotations</h5>
        <b-form-group>
          <b-checkbox-group stacked v-model="annotations" :options="annotationOptions" @change="saveSettings">
          </b-checkbox-group>
        </b-form-group>
      </b-card-body>
    </b-collapse>
    <b-card-header header-tag="header" class="card-header" role="tab">
      <a v-b-toggle="'collapse-blacklist'" href="javascript: void();" @click.prevent>URL Blacklist</a>
    </b-card-header>
    <b-collapse visible id="collapse-blacklist">
      <b-card-body>
        <b-form-group>
          <b-form inline>
            <b-form-input type="text" class="settings-input" placeholder="Enter URL"></b-form-input>
            <b-input-group>
              <b-button type="submit" class="settings-button" variant="primary">Submit</b-button>
            </b-input-group>
          </b-form>
          <b-form-text text-variant="muted">
            The terms below will prevent the plugin from running on certain pages. If a term is found within the
            page's URL, the plugin
            will not work on that page.
          </b-form-text>
        </b-form-group>
        <table class="table table-striped table-bordered">
          <tbody></tbody>
        </table>
      </b-card-body>
    </b-collapse>
    <b-card-header header-tag="header" class="card-header" role="tab">
      <a href="javascript: void();" v-b-toggle="'collapse-custom-mappings'" @click.prevent>
          Custom Name Mappings
      </a>
      <!-- <FontAwesomeIcon id="name-tooltip" icon="info-circle"></FontAwesomeIcon> -->
      <b-tooltip target="name-tooltip" placement="top">
        'Cuz we all love nicknames
      </b-tooltip>
    </b-card-header>
    <b-collapse visible id="collapse-custom-mappings">
      <b-card-body>
        <div id="custom-mapping-body">
          <b-button type="submit" variant="primary">Add+</b-button>
          <table class="table table-striped table-bordered" id="custom-mapping-table">
            <tbody></tbody>
          </table>
        </div>
      </b-card-body>
    </b-collapse>
  </div>
</template>

<script>

import FF from '../ff'
import $ from 'jquery'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  name: 'Settings',
  created: function() {
    this.ff = new FF();
    this.leagues = this.ff.getLeaguesFromStorage();
    
		chrome.extension.sendMessage({method: "getSettings"}, function (response) {
      // Filter out only true properties then return those names
      Object.keys(response).forEach(key => {
        if (response[key]) {
          this.annotations.push(key);
        }
      });
    }.bind(this));
  },
  data: function() {
    return {
      leagueId: '',
      leagues: [],
      loadingLeagueId: null,
      annotations: [],
      annotationOptions: [
        {text: 'All Websites', value:'globalAnnotations'},
        {text: 'League and Roster', value:'rosterAnnotations'},
        {text: 'Inline Availability', value:'inline'},
      ]
    }
  },
  methods: {
    addLeague() {
      this.loadingLeagueId = this.leagueId;
      this.leagues.push({leagueId: this.leagueId, site: 'espn'}); // Temporary loading league
      chrome.runtime.sendMessage({method: 'addTeam', site: 'espn', leagueId: this.leagueId}, function() {
        debugger;
        this.leagues = this.ff.getLeaguesFromStorage();
        this.loadingLeagueId = null;
      }.bind(this));
      chrome.runtime.sendMessage({method: 'checkAllPlayers', site: 'espn', leagueId: this.leagueId}, function() {});
    },
    removeLeague(leagueId) {
      chrome.runtime.sendMessage({method: 'removeTeam', site: 'espn', leagueId}, function(response){
				this.leagues = this.ff.getLeaguesFromStorage();
			}.bind(this));
    },
    saveSettings(selected) {
      chrome.extension.sendMessage({
				method: 'changeSetting',
				query: {
          inline: selected.includes('inline'),
          globalAnnotations: selected.includes('globalAnnotations'),
          rosterAnnotations: selected.includes('rosterAnnotations')
        }
			});
    }
  }
};
</script>


<style scoped>

.site-picker {
  padding: 6px;
  height: 38px;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  margin-right: 5px;
  display: flex;
}

.dropdown-arrow {
  height: 12px;
  width: 12px;
  margin-left: 5px;
  margin-top: auto;
  margin-bottom: auto;
}

.card-header {
  font-size: 20px;
}

.settings-input {
  display: inline-block;
  width: 445px;
  margin-right: 5px;
}

.settings-button {
  vertical-align: top;
}

td.teamlist {
  width: 1px;
}

td.teamlist_remove {
  text-align: center;
  width: 50px;
}

.team_remove_icon {
  height: 20px;
  width: 20px;
  cursor: pointer;
}

.teamlist-icon {
  height: 20px;
  width: 20px;
}

.tl-teamname {
  text-align: center;
}

.teamlist_tbl {
  width: 560px;
}

/* bootstrap override, too much whitespace */
.table td, .table th {
  padding: .5rem;
}
</style>
