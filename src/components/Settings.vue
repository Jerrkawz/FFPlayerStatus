<template>
  <div>
    <div class="card">
      <h5 class="card-header">Settings</h5>
      <div class="card-body">
        <h5 class="card-title">Your Leagues</h5>
        <div id="teamlist_ctnr">
          <div class="form-group">
            <form @submit.prevent="addLeagueUrl">
              <input type="url" id="teamlist_input" class="form-control settings-input" placeholder="Enter URL" v-model="leagueUrl" required>
              <span class="input-group-btn" id="teamlist-btn-span">
                <button type="submit" class="btn btn-primary settings-button" id="teamlist_add_btn">Add</button>
              </span>
              <small class="form-text text-muted">Paste the URL of your ESPN or Yahoo "My Team" page</small>
            </form>
          </div>
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
        <div class="form-check">
          <input v-model="rosterAnnotations" @change="saveSettings" class="form-check-input" type="checkbox" value="" id="defaultCheck1">
          <label class="form-check-label" for="defaultCheck1">
            All Websites
          </label>
        </div>
        <div class="form-check">
          <input v-model="globalAnnotations" @change="saveSettings" class="form-check-input" type="checkbox" value="" id="defaultCheck2">
          <label class="form-check-label" for="defaultCheck2">
            League and Roster
          </label>
        </div>
        <div class="form-check">
          <input v-model="inline" @change="saveSettings" class="form-check-input" type="checkbox" value="" id="defaultCheck2">
          <label class="form-check-label" for="defaultCheck2">
            Inline Availability
          </label>
        </div>
      </div>
    </div>
    <div class="card">
      <h5 class="card-header">URL Blacklist</h5>
      <div class="card-body">
        <div id="blacklist-input-grp" class="form-group">
          <input type="text" class="form-control settings-input" placeholder="Enter URL" id="blacklist_input">
          <span class="input-group-btn" id="blacklist_btn_span">
            <button type="submit" class="btn btn-primary settings-button" id="blacklist_add_btn">Submit</button>
          </span>
          <small class="form-text text-muted">
            The terms below will prevent the plugin from running on certain pages. If a term is found within the
            page's URL, the plugin
            will not work on that page.
          </small>
        </div>
        <table class="table table-striped table-bordered" id="blacklist_tbl">
          <tbody></tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <h5 class="card-header">Custom Name Mappings</h5>
      <div class="card-body">
        'Cuz we all love nicknames
        <div id="custom-mapping-body">
          <button type="submit" class="btn btn-primary" id="cm_add_btn">Add+</button>
          <table class="table table-striped table-bordered" id="custom-mapping-table">
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import FF from '../ff';
import $ from 'jquery';
import  FontAwesomeIconLib from '@fortawesome/vue-fontawesome';
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
      this.inline = response.inline;
      this.globalAnnotations = response.globalAnnotations;
      this.rosterAnnotations = response.rosterAnnotations;
    }.bind(this));
  },
  data: function() {
    return {
      leagueUrl: '',
      leagues: [],
      loadingLeagueId: null,
      inline: true,
      globalAnnotations: true,
      rosterAnnotations: true
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
    saveSettings() {
      chrome.extension.sendMessage({
				method: 'changeSetting',
				query: {
          inline: this.inline,
          globalAnnotations: this.globalAnnotations,
          rosterAnnotations: this.rosterAnnotations
        }
			});
    }
  }
};
</script>


<style scoped>
.settings-input {
  display: inline-block;
  width: 500px;
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
