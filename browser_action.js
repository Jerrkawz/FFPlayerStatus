import $ from 'jquery';

function searchInput(event) {
  const value = $(event.target).val().trim().toLowerCase();
  $('#player-results').empty();
  if (value.length < 3) {
    return;
  }

  $('#player-results').append('<div class="loading-spinner icon-refresh icon-spin icon-large"></div>');

  chrome.extension.sendMessage({method: 'playerSearch', query: value}, function(response) {
    const container = $('#player-results');
    container.empty();

    response.results = response.results.sort((result1, result2) => {
      if (result1.name < result2.name) return -1;
      if (result1.name > result2.name) return 1;
      return 0;
    });

    response.results.forEach(player => {

      const tempPlayer = $('<div class="search-player" data-player-id="' + player.id + '"><div class="player-img"><img class="fix-error" src="' + player.profileImage + '"></div><div class="player-search-name"><a target="_blank" href="' + player.playerProfileUrl + '">' + player.name + '</a><div class="player-positions">' + player.positions + '</div></div><div class="player-search-availability"></div><div class="player-search-expand" data-player-id="' + player.id + '"><span class="expand-icon icon-chevron-sign-right"></span></div><div class="player-details"><div class="player-details-header"><h2 class="selected" data-section-ref=".player-details-availability" data-player-id="' + player.id + '">Availability</h2><h2 data-section-ref=".player-details-stats" data-player-id="' + player.id + '">Stats</h2></div><div class="player-details-availability active player-details-section"></div><div class="player-details-stats player-details-section"><div class="loading-spinner icon-refresh icon-spin icon-large"></div></div></div></div>');

      tempPlayer.find(".fix-error").on("error", function (event) {
        $(event.currentTarget).attr("src", "images/default_profile.png");
      });

      const leagueStatusMap = {
        add: 0,
        drop: 0,
        trade: 0
      };

      if (player.leagueStatus) {
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

          // const leagueEntry = $(Handlebars.templates.LeagueAvailabilityRow({
          //   league: currLeagueStatus.leagueName,
          //   leagueSite: currLeagueStatus.site,
          //   btnName: getTextForPlayerLeagueStatus(currLeagueStatus.status),
          //   btnClass: "status" + currLeagueStatus.status,
          //   btnLink: currLeagueStatus.actionUrl,
          //   iconClass: getIconClassForPlayerLeagueStatus(currLeagueStatus.status),
          //   playerId: player.id,
          //   playerName: player.name
          // }));
          const leagueEntry = '';

          $(tempPlayer).find(".player-details-availability").append(leagueEntry);
        }

        // tempPlayer.find(".player-search-availability").append(Handlebars.templates.InlineAvailability(leagueStatusMap));
      }

      container.append(tempPlayer);
    });

    if (response.results.length === 0) {
      container.append('<div class="no-search-results">No players found.</div>');
    }

    $(".search-player").on("click", function (event) {
      const playerId = $(event.currentTarget).data().playerId;
      $('.search-player[data-player-id="' + playerId + '"]').toggleClass("open");
      $('.search-player[data-player-id="' + playerId + '"] .expand-icon').toggleClass("icon-rotate-90");
    });

    $(".player-details-header h2").click(function (event) {
      const currTarget = $(event.currentTarget);
      const playerId = currTarget.data().playerId;
      currTarget.parent().find("h2").removeClass("selected");
      currTarget.addClass("selected");

      const ref = currTarget.data().sectionRef;
      $(".search-player[data-player-id='" + playerId + "'] .player-details-section").removeClass("active");
      $(".search-player[data-player-id='" + playerId + "'] .player-details-section" + ref).addClass("active");

      $.ajax({
        url: location.protocol + "//games.espn.go.com/ffl/format/playerpop/overview?playerId=" + playerId + "&playerIdType=playerId&seasonId=2013&xhr=1",
        type: "GET",
        success: function (response) {
          const jqResp = $(response);
          jqResp.find("#overviewTabs #moreStatsView0 .pc").remove();
          jqResp.find("#overviewTabs #moreStatsView0 table").removeAttr("style");
          $(".search-player[data-player-id='" + playerId + "'] .player-details-stats").html(jqResp.find("#overviewTabs #moreStatsView0").html());
        }
      });
      event.preventDefault();
      event.stopPropagation();
      return false;

    });
  });
}

function keydownHandler(event) {
  const rows = $(".search-player");
  const numRows = rows.length;
  if (event.which === 13) { // enter
    if ($(".search-player.current").length > 0) {
      $(".search-player.current").click();
      event.stopPropagation();
      event.preventDefault();
    }
  } else if (event.which === 38) { // up arrow
    const nothingSelectedUp = rows.forEach(function (row, key) {
      if ($(row).hasClass("current")) {
        $(row).removeClass("current");
        if (key > 0) {
          $(rows[key - 1]).addClass("current");
          scrollToPlayer($(rows[key - 1]));
        }
        return false;
      }
      return true;
    });
    if (nothingSelectedUp) {
      $(rows[numRows - 1]).addClass("current");
      scrollToPlayer($(rows[numRows - 1]));
    }
  } else if (event.which === 40) { // down arrow
    const nothingSelectedDown = rows.forEach(function (row, key) {
      if ($(row).hasClass("current")) {
        $(row).removeClass("current");
        if (key < numRows) {
          $(rows[key + 1]).addClass("current").focus();
          scrollToPlayer($(rows[key + 1]));
        }
        return false;
      }
      return true;
    });
    if (nothingSelectedDown) {
      $(rows[0]).addClass("current");
      scrollToPlayer($(rows[0]));
    }
  }
}

function scrollToPlayer(playerElement) {
  playerElement[0].scrollIntoView(true);
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

function loadSettings(event) {
  chrome.extension.sendMessage({method: "getSettings"}, function (response) {
    const inlineDom = $('<div class=""><label><input id="inline-availability-check" type="checkbox" name="inline-availability" value="inline" />Show availability next to name.</label></div>');
    if (!response || response.inline === true) {
      $(inlineDom).find("#inline-availability-check").attr("checked", "checked");
    }
    $("#inline-availability-check").change(function (event) {
      const value = {
        inline: $(event.currentTarget).is(":checked")
      };
      chrome.extension.sendMessage({method: 'changeSetting', query: value});
    });
  });
}


function init() {
  document.addEventListener('DOMContentLoaded', function () {
    $('#search').on("keydown", keydownHandler);
    $('#search').on('search', searchInput);
    $("#settings-btn").click(function () {
      window.open(chrome.extension.getURL("settings.html"), "_blank");
    });
    $("#refresh-btn").click(function () {
      location.reload();
    });
    loadSettings();
  });
}

init();