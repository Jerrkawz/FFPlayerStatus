<template>
<span>
<span v-if="!showStats">
  <div class="search-player" @click="showStats = !showStats">
    <div class="player-img">
      <img :src="player.profileImage">
    </div>
    <div class="player-search-name"><a target="_blank" :href="player.playerProfileUrl">{{player.name}}</a>
      <div class="player-positions">{{player.positions}}</div>
    </div>
    <InlineAvailability class="inline-availability" :player="player"></InlineAvailability>
    <div class="player-search-expand">
      <span class="expand-icon">
        <!-- <FontAwesomeIcon icon='chevron-right'></FontAwesomeIcon> -->
      </span>
    </div>
    </span>
    <div v-if="showStats" class="player-card-wrapper">
      <StatsCard :player="player" @click.native="showStats = !showStats" class="player-card"></StatsCard>
    </div>
  </span>
</template>
<script>
import StatsCard from 'StatsCard';
import InlineAvailability from 'InlineAvailability';

export default {
  name: 'SearchPlayer',
  components: {
    InlineAvailability,
    StatsCard
  },
  data() {
    return {
      showStats: false
    }
  },
  props: {
    player: {}
  }
}
</script>
<style scoped>
.search-player {
  text-align: left;
  display: flex;
  font-size: 14px;
}

.search-player .player-img {
  display: flex;
  align-items: center;
}

.search-player .player-img img {
  height: 40px;
  width: 55px;
}

.search-player .player-search-name {
  display: inline-block;
  vertical-align: top;
  padding: 15px 5px 15px 10px;
  max-width: 125px;
}

.search-player .player-search-name a {
  font-weight: bold;
  color: black;
  text-decoration: none;
}

.search-player .player-search-name a:hover {
  text-decoration: underline;
  color: blue;
}

.search-player .player-search-name .player-positions {
  font-size: 12px;
}

.search-player:nth-child(odd) {
  background: #f9f9f9;
}

.search-player:nth-child(odd).current {
  background: #c6c6c6;
}

.search-player:nth-child(even) {
  background: rgba(15, 91, 26, 0.1);
}

.search-player:nth-child(even).current {
  background: #c6c6c6;
}

.inline-availability {
  padding-top: 15px;
  flex-grow: 1;
}

.player-search-expand {
  display: flex;
  align-items: center;
}

.expand-icon {
  margin-right: 5px;
  padding: 10px;
  border-radius: 5px;
  font-size: 18px;
}

.player-card-wrapper {
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3);
    margin: 10px 5px;
    padding: 0px 5px 5px 5px;
    font-size: 14px;
}
</style>
