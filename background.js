import FFStorage from './src/storage';
import FF from './src/ff';

let fantasyFind = new FF(new FFStorage());
let settingsPort; // Port for communicating between settings and background

chrome.runtime.onInstalled.addListener(function(details) {
  // Force install for latest update;
  details.reason = 'install';

  if (details.reason === 'install') {
    const tempSettings = fantasyFind.getUserSettings();
    localStorage.clear();

    // Re-create FF because the sites loaded their information from disk.
    fantasyFind = new FF(FFStorage);

    if (tempSettings !== undefined) {
      fantasyFind.setUserSettings(tempSettings);
    } else {
      fantasyFind.setUserSettings({inline: true});
    }
    // Don't get rid of the callback otherwise this won't work.
    chrome.tabs.create({url: 'settings.html', active: true}, function() {});
  } else if (details.reason === 'update') {
    chrome.tabs.create({url: 'settings.html', active: true}, function() {});
  }

  // Setup alarm/timer for periodic league updates
  chrome.alarms.create('updateLeagues', {delayInMinutes: 30, periodInMinutes: 30});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.method) {

    // Fetch player object by player id
    case 'getPlayerById':
      sendResponse(fantasyFind.getPlayerById(request.playerId));
      break;
    // Search for player by name
    case 'playerSearch':
      fantasyFind.playerSearch(window.listOfPlayers, request.query, function(results) {
        results.forEach(function(p) {
          fantasyFind.updatePlayerStatus(p);
        });
        sendResponse({results: results});
      });
      break;
    // Update/save user settings in local storage
    case "changeSetting":
      fantasyFind.setUserSettings(request.query);
      break;

    // Fetch user settings from local storage
    case "getSettings":
      sendResponse(fantasyFind.getUserSettings());
      break;

    // Add term to blacklist
    case "addBlacklistURL":
      sendResponse(fantasyFind.addBlacklistURL(request.url));
      break;

    // Remove term from blacklist
    case "removeBlacklistURL":
      sendResponse(fantasyFind.removeBlacklistURL(request.url));
      break;
    // Add team to local storage and get taken players
    case "addTeam":
      sendResponse(fantasyFind[request.site].addUserTeam(request.league));
      break;

    // Delete team from local storage and destroy league object
    case "removeTeam":
      sendResponse(fantasyFind[request.site].removeUserTeam(request.leagueId));
      break;

    // Update list of all players in both the list and name dict
    case "checkAllPlayers":
      // If neither ESPN or Yahoo has been initialized, we know this is the first run
      // so we need to populate the player list
      if(!window.listOfPlayersInitESPN && !window.listOfPlayersInitYahoo) {
        window.listOfPlayersInitESPN = request.site === 'espn';
        window.listOfPlayersInitYahoo = request.site === 'yahoo';
        //fantasyFind[request.site].resetLeagues();
        fantasyFind[request.site].fetchAllPlayersForLeague(request.league, window.listOfPlayers, settingsPort);
      } else {
      // We know that the player list must have been updated, and we have the potential to have different ID's from 
      // different sites. So we need to create a mapping between the different site's IDs
        if(request.site === 'espn' && !window.listOfPlayersInitESPN) {
          fantasyFind[request.site].addPlayerIdsForSite(request.league, settingsPort);
          window.listOfPlayersInitESPN = true;
        } else if (request.site === 'yahoo' && !window.listOfPlayersInitYahoo) {
          fantasyFind[request.site].addPlayerIdsForSite(request.league, settingsPort);
          window.listOfPlayersInitYahoo = true;
        // We are adding a league for a site that has already been initialized. Not much to be done here.
        } else {
          settingsPort.postMessage({status: "addLeagueComplete"});
        }
      }
      sendResponse(true);
      break;

    // Fetch player name dict -- mainly used for parser.js
    case "getDict":
      sendResponse(window.playerDict);
      break;

    // Add a nickname->player mapping
    case "addCustomMapping":
      sendResponse(fantasyFind.addCustomMapping(request.name, request.playerId));
      break;

    // Remove a nickname mapping
    case "removeCustomMapping":
      sendResponse(fantasyFind.removeCustomMapping(request.name, request.playerId));
      break;

    // Get list of known mappings
    case "getCustomMapping":
      sendResponse(fantasyFind.getCustomMapping());
      break;
  }
  return true;
});

// Periodically update the taken players via chrome alarm
chrome.alarms.onAlarm.addListener(function(alarm) {
  if(alarm.name === 'updateLeagues') {
    let leagues = fantasyFind.getLeaguesFromStorage();
    leagues = leagues || [];
    for(let i = 0; i < leagues.length; i++) {
      fantasyFind[leagues[i].site].refreshTakenPlayers(leagues[i]);
    }
  }
});

// Handle the settings port. For now, all we need to do is store it to be used later
// The main point of the settings port is to send a message back to settings.js to
// re-enable the input field when the fetchAllPlayers function is done. Prevents collisions
// when mapping different sites' player IDs
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === "settings");
  window.settingsPort = port;
  // port.onMessage.addListener(function(msg) {
  //   if(msg.)
  // })
});
