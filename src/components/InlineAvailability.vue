<template>
  <div class="player-search-availability">
    <span :id="'marker-'+player.id" class="inline-availability-marker" @mouseover="hoverIn" @mouseout="hoverOut">
      <span v-if="availableCount" class="availability-type add-leagues">
        <img class="inline-icon" :src="addImage"/>
        <span class="inline-availability-txt">{{availableCount}}</span>
      </span>
      <span v-if="ownedCount" class="availability-type drop-leagues ">
        <img class="inline-icon" :src="dropImage"/>
        <span class="inline-availability-txt">{{ownedCount}}</span>
      </span>
      <span v-if="takenCount" class="availability-type trade-leagues ">
        <img class="inline-icon" :src="tradeImage"/>
        <span class="inline-availability-txt">{{takenCount}}</span>
      </span>
    </span>
    <span :id="'container-'+player.id" @mouseover="hoverIn" @mouseout="hoverOut">
      <div v-if="showPopover" class="popover bs-popover-bottom">
        <div class="arrow" style="left: 124px;"></div>
        <div class="popover-body">
          <StatsCard :player="player"></StatsCard>
        </div>
      </div>
    </span>
  </div>
</template>

<script>
import StatsCard from 'StatsCard'

export default {
  name: 'InlineAvailability',
  components: {
    StatsCard
  },
  props: {
    player: {},
    hoverEnabled: false
  },
  computed: {
    availableCount () {
      return this.player.leagueStatus.filter(status => status.status === 1).length;
    },
    addImage() {
      return chrome.runtime.getURL('images/add-white.svg');
    },
    dropImage() {
      return chrome.runtime.getURL('images/times-white.svg');
    },
    tradeImage() {
      return chrome.runtime.getURL('images/random-white.svg');
    },
    ownedCount () {
      return this.player.leagueStatus.filter(status => status.status === 2).length;
    },
    takenCount () {
      return this.player.leagueStatus.filter(status => status.status === 3).length;
    }
  },
  methods: {
    hoverIn() {
      if (this.hoverEnabled) {
        window.clearInterval(this.hoverTimer);
        this.showPopover = true;
      }
    },
    hoverOut(e) {
      if (this.hoverEnabled) {
        this.hoverTimer = setInterval(() => {
          this.showPopover = false;
        }, 500);
      }
    }
  },
  data() {
    return {
      showPopover: false,
      hoverTimer: 0
    }
  }
}
</script>

<style scoped>
.player-search-availability {
  display: inline-block;
}

.inline-availability-marker {
  color: white;
  position: relative;
  white-space: normal;
  display: inline-block;
  vertical-align: middle;
}

.availability-type {
  display: flex;
  align-items: center;
}

.availability-type [class*="icon-"] {
  font-size: 80%;
}

.availability-type.add-leagues {
  background: #5cb85c;
}

.availability-type.drop-leagues {
  background: #d9534f;
}

.availability-type.trade-leagues {
  background: #f0ad4e;
}

.inline-availability-marker span {
  display: inline;
  padding: 0 2px;
  color: white;
}

.inline-icon {
  height: 1em;
}

/* Popover styles */
.popover {
  position: absolute;
  z-index: 9999;
  width: 300px;
  margin-left: -120px;
  margin-top: 5px;
  background-color: white;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.2);
  border-radius: .3rem;

  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-style: normal;
  font-weight: 400;
  line-height: 1.5;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  white-space: normal;
  line-break: auto;
  font-size: 1rem;
}

.popover-body {
  padding: .5rem .75rem;
  color: #212529;
}

.popover .arrow {
    top: calc((.5rem + 1px) * -1);
    position: absolute;
    display: block;
    width: 1rem;
    height: .5rem;
    margin: 0 .3rem;
}

.arrow {
  position: absolute;
  display: block;
}

.arrow::before {
  top: 0;
  border-bottom-color: rgba(0,0,0,.25) !important;
}

.arrow::after {
    top: 1px;
    border-bottom-color: #fff !important;
}

.arrow::before,
.arrow::after {
    position: absolute;
    display: block;
    content: "";
    border-color: transparent;
    border-style: solid;
    border-width: 0 .5rem .5rem .5rem;
    box-sizing: border-box;
}
</style>
