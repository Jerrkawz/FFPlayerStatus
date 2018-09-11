<template>
  <span class="player-search-availability">
    <span class="inline-availability-marker">
      <span v-if="availableCount" class="availability-type add-leagues">
        <i class="fa fa-plus"></i>
        <span class="inline-availability-txt">{{availableCount}}</span>
      </span>
      <span v-if="ownedCount" class="availability-type drop-leagues ">
        <i class="fa fa-remove"></i>
        <span class="inline-availability-txt">{{ownedCount}}</span>
      </span>
      <span v-if="takenCount" class="availability-type trade-leagues ">
        <i class="fa fa-random"></i>
        <span class="inline-availability-txt">{{takenCount}}</span>
      </span>
    </span>
  </span>
</template>

<script>
export default {
  name: 'InlineAvailability',
  computed: {
    availableCount () {
      return this.leagueStatus.filter(status => status.status === 1).length;
    },
    ownedCount () {
      return this.leagueStatus.filter(status => status.status === 2).length;
    },
    takenCount () {
      return this.leagueStatus.filter(status => status.status === 3).length;
    }
  },
  props: {
    leagueStatus: Array
  }
}
</script>

<style scoped>
.inline-availability-marker {
  color: white;
  position: relative;
  white-space: normal;
  font-size: 12px;
  display: inline-block;
  vertical-align: top;
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
