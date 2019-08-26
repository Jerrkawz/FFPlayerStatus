<template>
  <span class="player-search-availability">
    <span :id="'marker-'+player.id" class="inline-availability-marker" @mouseover="hoverIn" @mouseout="hoverOut">
      <span v-if="availableCount" class="availability-type add-leagues">
        <FontAwesomeIcon icon="plus"></FontAwesomeIcon>
        <span class="inline-availability-txt">{{availableCount}}</span>
      </span>
      <span v-if="ownedCount" class="availability-type drop-leagues ">
        <FontAwesomeIcon icon="times"></FontAwesomeIcon>
        <span class="inline-availability-txt">{{ownedCount}}</span>
      </span>
      <span v-if="takenCount" class="availability-type trade-leagues ">
        <FontAwesomeIcon icon="random"></FontAwesomeIcon>
        <span class="inline-availability-txt">{{takenCount}}</span>
      </span>
    </span>
    <span :id="'container-'+player.id" @mouseover="hoverIn" @mouseout="hoverOut">
      <span :target="'marker-'+player.id"
        class="id-hover-card"
        placement="right"
        :show="showPopover"
        :container="'container-'+player.id">
        <StatsCard :player="player"></StatsCard>
      </span>
    </span>
  </span>
</template>

<script>
import StatsCard from 'StatsCard'
import  FontAwesomeIconLib from '@fortawesome/vue-fontawesome'
const { FontAwesomeIcon } = FontAwesomeIconLib;


export default {
  name: 'InlineAvailability',
  components: {
    FontAwesomeIcon,
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
.inline-availability-marker {
  color: white;
  position: relative;
  white-space: normal;
  display: inline-block;
  vertical-align: middle;
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
</style>
