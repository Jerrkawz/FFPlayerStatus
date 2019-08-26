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
            <b-form inline @submit.prevent="addLeagueUrl">
              <b-form-input type="url" id="teamlist_input" class="settings-input" placeholder="Enter URL" v-model="leagueUrl" required></b-form-input>
              <b-input-group>
                <b-button type="submit" class="settings-button" variant="primary">Add</b-button>
              </b-input-group>
            </b-form>
            <b-form-text text-variant="muted">Paste the URL of your ESPN or Yahoo "My Team" page</b-form-text>
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
                  <FontAwesomeIcon v-if="league.leagueId == loadingLeagueId" icon="spinner" spin style="padding-left: 2px;"></FontAwesomeIcon>
                </td>
                <td class="teamlist_remove">
                  <FontAwesomeIcon icon="times" @click="removeLeague(league.leagueId)" class="team_remove_icon"></FontAwesomeIcon>
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
      <FontAwesomeIcon id="name-tooltip" icon="info-circle"></FontAwesomeIcon>
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
import  FontAwesomeIconLib from '@fortawesome/vue-fontawesome'
const { FontAwesomeIcon } = FontAwesomeIconLib;

// Fetch and parse all player team names in league
function getLeagueTeams(response) {
  const teams = {};
  const listItems = $(response).find('#games-tabs1 li a');
  listItems.each(function(i, elem) {
    const parts = parseURL(elem.getAttribute("href"));
    teams[parts['teamId']] = $(elem).text();
  });
  return teams;
}

// Fetch and parse all shortname/abbreviations for team names in league
function getLeagueTeamsShortNames(teams) {
  const abbrevs = [];
  for (let key in teams) {
    const parts = teams[key].split(/\s/);
    abbrevs[key] = parts[parts.length-1];
  }
  return abbrevs;
}
  
// Pull league variables from URL
function parseURL(url) {
  let hash;
  const league = {};
  const hashes = url.slice(url.indexOf('?') + 1).split('&');
  for(let i = 0; i < hashes.length; i++)
  {
      hash = hashes[i].split('=');
      // vars.push(hash[0]);
      league[hash[0]] = hash[1];
  }
  return league;
}
  
// Get user team name
function getLeagueName(response) {
  const item = $(response).find("div.nav-main-breadcrumbs").children().eq(2);
  return $(item).text();
}
// Build and initialize league object
// Called when teamlist_add_btn pressed
function initLeague(url) {
  const league = parseURL(url);
  league.url = url;
  $.ajax({
    url: url,
    data: 'text',
    async: false,
    success: function(response) {
      league.leagueName = getLeagueName(response);

      const teams = getLeagueTeams(response);
      league.teamName = teams[league.teamId];
      league.shortNames = getLeagueTeamsShortNames(teams);
      league.site = 'espn';
      league.sport = 'football';
      league.playerIdToTeamIndex = {};
    }.bind(this)
  });
  return league;
}
    
export default {
  name: 'Settings',
  components: {
    FontAwesomeIcon
  },
  created: function() {
    this.ff = new FF();
    this.leagues = this.ff.getLeaguesFromStorage();

    const port = chrome.runtime.connect({name: "settings"});
    port.onMessage.addListener((msg) => {
			if (msg.status === 'addLeagueComplete') {
        this.loadingLeagueId = null;
      }
    });
    
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
      leagueUrl: '',
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
    addLeagueUrl() {
      const league = initLeague(this.leagueUrl);
      this.leagues.push(league);
      this.loadingLeagueId = league.leagueId;
      chrome.runtime.sendMessage({method: 'addTeam', site: 'espn', league: league}, function() {});
      chrome.runtime.sendMessage({method: 'checkAllPlayers', site: 'espn', league: league}, function() {});

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

.card-header {
  font-size: 20px;
}

.settings-input {
  display: inline-block;
  width: 500px;
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
