import $ from 'jquery';
import Vue from 'vue';
import inlineAvailability from 'InlineAvailability';

const DEBOUNCE = 500; // ms
const PARENT_BLOCKLIST = ['ff-name', 'player-search-name'];

const InlineAvailability = Vue.extend(inlineAvailability);
Vue.component('inlineAvailability', InlineAvailability);

const foundLastNames = {};
let  addInlineAvailability = true;
let cachedResponses = {};

window.playerDict = window.playerDict || {};
window.customMappings = window.customMappings || {};

/**
 * Parse the DOM and search for valid player names. Surround names with <span>
 * tags.
 */
function injectMarkup(inNodes) {
  const nodes = [];

  function addMarkup(node, firstName, lastName, playerId) {
    const regex = new RegExp('(?![^<]*>|[^<>]*</)(' + firstName + '\\s' + lastName + ')', 'gi');
    //const regex = new RegExp('\\b(' + firstName + '\\s' + lastName + ')\\b', 'gi'); need to test this
    const surround = `<span class="fantasy-finder" style="padding-right: 4px;"><span class="ff-name" data-playerId="${playerId}" style="display:inline;">$1</span></span> `;
    const newtext = node.replace(regex, surround);
    //html = html.replaceText(regex,surround);
    //text = text.replace(regex, surround);
    return newtext;
  }

  function addMarkupDST(node, team, playerId) {
    const regex = new RegExp('(' + team + '\\s' + 'D/ST' + ')', 'gi');
    const surround = `<span class="fantasy-finder" style="padding-right: 4px;"><span class="ff-name" data-playerId="${playerId}" style="display:inline;">$1</span></span>`;
    const newtext = node.replace(regex, surround);
    return newtext;
  }

  function checkCustomMapping(text) {
    if(!window.customMappings) {
      for (const key in window.customMappings) {
        const regex = new RegExp('\\b' + key.toLowerCase() + '\\b');
        const idx = text.toLowerCase().search(regex);
        if(idx !== -1) {
          const regex = new RegExp('(?![^<]*>|[^<>]*</)(' + key + ')', 'gi');
          const surround = `<span class="fantasy-finder" style="padding-right: 4px;"><span class="ff-name" data-playerId="${window.customMappings[key]}" style="display:inline;">$1</span></span>`;
          text = text.replace(regex, surround);
        }
      }
    }
    return text;
  }

  function findName(node) {
    const parts =  node.nodeValue.split(/\s/);
    let text = $(node).text();
    const parent = node.parentElement;
    if(PARENT_BLOCKLIST.includes(parent.getAttribute('class'))) return;
    let changed = false;
    for (let i = 0; i < parts.length; i++) {
      // This includes  ` and . - which break a.j. green da`quan etc..
      //const token = parts[i].toLowerCase().replace(/[\.,\/#!$%\^&\*;:{}=\`~()]/g,'');
      const token = parts[i].toLowerCase().replace(/[,/#!$%^&*;:{}=~()?"]/g,'');
      let nextTokenLastName = parts[i + 1] ? parts[i + 1].toLowerCase().replace(/['’]s$/g, '') : '';
      nextTokenLastName = nextTokenLastName.replace(/[,/#!$%^&*;:{}=~()?."']/g,'');
      const nameHash = window['playerDict'][nextTokenLastName];
      // Is there a record for the first name and if the last name
      // has a record of the player id.
      const playerId = nameHash && nameHash[token] ? nameHash[token].id : '';
      if (nameHash && playerId) {
        if (nextTokenLastName === "dst") {
          text = addMarkupDST(text, parts[i], playerId);
        } else {
          text = addMarkup(text, token, nextTokenLastName, playerId);
        }
        // Optimization, just skip the next token.
        i++;
        changed = true;
        // Store the last name as one that has been found.
        foundLastNames[nextTokenLastName] = {playerId: playerId};
      // If we find another instance of a last name we looked up.
      } 
      // else if (foundLastNames[token]) {
      //   text = addMarkup(text, token, '', foundLastNames[token].playerId);
      //   changed = true;
      // }
    }
    const newtext = checkCustomMapping(text);
    if(newtext !== text) {
      text = newtext;
      changed = true;
    }
    if(changed === true) {
      const newNode = document.createElement('span');
      newNode.innerHTML = text;
      node.parentNode.insertBefore(newNode, node);
      node.parentNode.removeChild(node);
      //node.parentElement.innerHTML = text;
    }
  }

  function findTextNodes(index, node) {
    _findTextNodes(node);
  }

  function _findTextNodes(node) {
    // If this is a TEXT Node trim the whitespace and push.
    if (node.nodeType === 3 && node.nodeValue.trim()) {
      nodes.push(node);
    } else if (node.nodeName !== 'SCRIPT') {
      $(node).contents().each(findTextNodes);
    }
  }

  function postMarkupAddAvailability() {
    const playerIds = Array.from($(".ff-name[data-playerId]"));
    const playerIdArr = playerIds.filter(function(item, i){
      return playerIds.indexOf(item) === i; 
    }).map(function (currNode) {
      return $(currNode).data().playerid;
    });

    for (let i = playerIdArr.length - 1; i >= 0; i--) {
      const currPlayerId = playerIdArr[i];
      getPlayer(currPlayerId, function (player) {
        if (!player) {
          return;
        }

        const leagueStatusMap = {
          add: 0,
          drop: 0,
          trade: 0
        };
        if (player.leagueStatus !== undefined) {

          for (let i = player.leagueStatus.length - 1; i >= 0; i--) {
            const currLeagueStatus = player.leagueStatus[i];
            switch (currLeagueStatus.status) {
              case 1:
                leagueStatusMap.add++;
                break;
              case 2:
                leagueStatusMap.drop++;
                break;
              case 3:
                leagueStatusMap.trade++;
                break;
            }
          }
          $('.ff-name[data-playerid="' + player.id + '"]').each(function() {
            const found = $(this).find('.player-search-availability');
            if(found.length === 0) {
              $(this).append('<span id="inline-availability-marker"></span>');
              new InlineAvailability({
                propsData: {
                  player: player,
                  hoverEnabled: true
                }
              }).$mount('#inline-availability-marker');
            }
          });
        }
      });
    }
  }

  if (inNodes === undefined) {
    $(document.body).contents().each(findTextNodes);
  } else {
    inNodes.forEach(_findTextNodes);
  }

  for (let i = 0; i < nodes.length; ++i) {
    findName(nodes[i]);
  }

  if (addInlineAvailability) {
    postMarkupAddAvailability();
  }
}

/**
 * Ask the background script for a players information.
 */
function getPlayer(playerId, callback) {
  if (cachedResponses[playerId]) {
    callback(cachedResponses[playerId]);
    console.log('cache hit');
    return;
  }

  chrome.runtime.sendMessage(
    {method: 'getPlayerById', playerId: playerId},
    function(response) {
      cachedResponses[playerId] = response;
      callback(response);
    });
}

function evaluateUrl(callback) {
  chrome.extension.sendMessage({method: "getSettings"}, function(response) {
    const settingDefaults = {
      inline: true,
      popup_trigger: "hover",
      popup_position: "hovercard",
      globalAnnotations: true,
      rosterAnnotations: true
    };
    response = Object.assign(settingDefaults, response);


    let blacklist = [];
    // Cancel parsing if the user has explicitly turned off annotations.
    if (response.globalAnnotations === false) {
      return;
    }
    if (response.rosterAnnotations === false) {
      blacklist.push('espn.com/ffl');
      blacklist.push('football.fantasysports.yahoo.com/f1');
    }


    addInlineAvailability = !!response.inline;
    let proceed = true;
    blacklist = response.blacklist ? blacklist.concat(response.blacklist) : blacklist;

    for (let i = 0; i < blacklist.length; i++) {
      if (window.location.href.indexOf(blacklist[i]) > -1)  {
        proceed = false;
        break;
      }
    }

    if (proceed) {
      callback();
    }
  });
}

// Flush cached responses on page refresh
if(performance.navigation.type === 1) {
  cachedResponses = {};
}

evaluateUrl(function() {
  chrome.runtime.sendMessage({method: 'getDict'}, function(response) {
    window.playerDict = response;
    chrome.runtime.sendMessage({method: 'getCustomMapping'}, function(response) {
      window.customMappings = response;
      injectMarkup();
    });
  });
});

let timeout;
let observer = new MutationObserver(() => {
  if(timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    console.log('Injecting markup');
    injectMarkup();
  }, DEBOUNCE);
});

observer.observe(document.querySelector('body'), {
  childList: true,
  subtree: true, // and lower descendants too
});