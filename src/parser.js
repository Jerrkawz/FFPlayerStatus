import $ from 'jquery';
import Vue from 'vue';
import inlineAvailability from 'InlineAvailability';

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
    if(parent.getAttribute('class') === "ff-name") return;
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
                  leagueStatus: player.leagueStatus,
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
 * Register hover handlers and position the popup next to the player's name.
 */
function registerHoverHandlers(popup) {
  let cancelId;

  const handlerIn = function(event) {
    const popupWidth = popup.width();
    clearTimeout(cancelId);
    popup.toggleClass('active', true);
    popup.toggleClass('arrow-right', false);

    const element = $(event.currentTarget);
    const position = element.offset();
    let popupLeft = position.left + $(element).width() + 20;

    if (popupLeft + popupWidth > $(window).width() - 50) {
      popupLeft = position.left - 50 - popupWidth;
      popup.toggleClass('arrow-right', true);
    }

    popup.css('left', popupLeft);
    popup.css('top', position.top - 50);
    fillPopup(element.data().playerid, handlerOut);

    // setTimeout(function () {
    //   if($("#ff-popup ins.adsbygoogle").html().length === 0) {
    //     $(".hidden-ad-trigger").click();
    //   }
    // }, 500)

  }.bind(window);

  const handlerOut = function() {
    // TODO: Cancel this timeout if a user makes interaction inside of the popup.
    cancelId = setTimeout(function() {
      popup.toggleClass('active', false);
    }, 500);
  };

  $('.ff-name').hover(handlerIn, handlerOut);
}

/**
 * Build popup.
 */
function buildPopup() {
  const popupHtml = '<div class="fantasy-finder"><div id="ff-popup"><div class="name"></div></div></div>';
  $(document.body).append(popupHtml);
}

/**
 * Render the popup with data, this is asynchronous because of the call to background.js
 */
function fillPopup(playerId) {
  getPlayer(playerId, function(player) {
    if (!player) {
      return;
    }

    const tempPlayer = $(Handlebars.templates.PopupTemplate(player));

    const tempPlayerImg = new Image();
    tempPlayerImg.src =  player.profileImage;
    tempPlayerImg.onload = function () {
      $("#ff-popup").find(".temp-default-player").replaceWith("<img src='" + player.profileImage + "'>");
    };

    $('#ff-popup').html(tempPlayer);
    $('#ff-popup .close').click(function(){
      $('#ff-popup').toggleClass('active', false);
    });

    let leagueId = 0;
    for (let i = 0; i < player.leagueStatus.length; i++) {
      const currLeague = player.leagueStatus[i];
      if(leagueId === undefined && currLeague.site === 'espn') {
        leagueId = currLeague.leagueId;
      }
      const leagueName = currLeague.status !== 1 ? currLeague.leagueName + ' ' + currLeague.ownedByTeamName : currLeague.leagueName;
      const leagueEntry = $(Handlebars.templates.LeagueAvailabilityRow({
        league: leagueName,
        leagueSite: currLeague.site,
        btnName: getTextForPlayerLeagueStatus(currLeague.status),
        btnClass: "status" + currLeague.status,
        btnLink: currLeague.actionUrl,
        iconClass: getIconClassForPlayerLeagueStatus(currLeague.status),
        playerId: player.id[currLeague.site],
        playerName: player.name
      }));
      $(leagueEntry).find('.league-name').prop('title', leagueName);

      $("#ff-popup .league-data").append(leagueEntry);
    }
    if (player.leagueStatus.length === 0) {
      $("#ff-popup .league-data").append('<br/><span class="not-available">' + player.name + '\'s position is not allowed in any of your leagues.</span>');
    }

    $('.ff-btn').click(function(event) {
      const data = $(event.currentTarget).data();
      chrome.runtime.sendMessage({method: 'logStuff', data: ['_trackEvent', 'PlayerAction', data.actionType, data.playerName + ':' + data.playerId, 1]});
      chrome.runtime.sendMessage({method: 'logStuff', data: ['_trackEvent', 'PlayerActionUrl', data.actionType, window.location.href]});

    });
    $(".player-section-header h2").click(function (event) {
      $(".player-section-header h2").removeClass("selected");
      const currHeader = $(event.currentTarget);
      const sectionTarget = currHeader.data().sectionRef;

      currHeader.addClass("selected");

      $("#ff-popup .player-data-section").removeClass("active");
      $("#ff-popup " + sectionTarget).addClass("active");
    });
    const year = new Date().getFullYear();
    //Add Stats
    // if(leagueId===0) {
    const espnURL = location.protocol + "//games.espn.com/ffl/format/playerpop/overview?leagueId=" + leagueId + "&playerId=" + /*player.otherIds['espn'] ? player.otherIds :*/ player.id + "&playerIdType=playerId&seasonId=" + year + "&xhr=1";
    $.ajax({
      url: espnURL,

      type: "GET",
      success: function (response) {
        const jqResp = $(response);
        jqResp.find("#overviewTabs #moreStatsView0 .pc").remove();
        jqResp.find("#overviewTabs #moreStatsView0 table").removeAttr("style");
        $("#ff-popup .player-stats").html(jqResp.find("#overviewTabs #moreStatsView0").html());
        // if ($("#ff-popup .player-profile-img .temp-default-player").length) {
        //   const img = jqResp.find('.mugshot img').attr('src');
        //   player.profileImage = img;
        //   $("#ff-popup").find("temp-default-player").replaceWith("<img src='" + player.profileImage + "'>");
        // }
      }
    });
    // } else {
    //   $.ajax({
    //     url: 
    //   });   
    // }

    $('.player-statistics').click(function() {
      chrome.runtime.sendMessage({method: 'logStuff', data: ['_trackEvent', 'PopUpStats', player.name + ':' + player.id]});
    });

    chrome.runtime.sendMessage({method: 'logStuff', data: ['_trackEvent', 'PopUp', player.name + ':' + player.id]});
  });
}

function getTextForPlayerLeagueStatus(status) {
  let statusText = "";
  switch (status) {
    case 1:
      statusText = "Add";
      break;
    case 2:
      statusText = "Drop";
      break;
    case 3:
      statusText = "Trade";
      break;
  }
  return statusText;
}

function getIconClassForPlayerLeagueStatus(status) {
  let iconClass = "";
  switch (status) {
    case 1:
      iconClass = "fa fa-plus";
      break;
    case 2:
      iconClass = "fa fa-remove";
      break;
    case 3:
      iconClass = "fa fa-random";
      break;
  }
  return iconClass;
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
      buildPopup();
      const popup = $('#ff-popup');
      injectMarkup();
      registerHoverHandlers(popup);
    });
  });
});