/**
 * Class that describes the x-fantasy-filter header sent as part of the player fetching request
 * Admittedly I didn't do much research into what the various properties do, i just captured a default object
 * for the different types of player filters and added builder methods for the properties that change based on
 * the request
 */
export default class FantasyFilter {

  constructor(builder) {
    Object.assign(this, builder);
  }

  static get Builder() {
    class Builder {
      constructor() {
        this.players = {};
        this.players.limit = 50;
        this.players.offset = 0;
        this.players.filterStatus = {value: []};
        this.players.filterSlotIds = {value: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]};
      }

      /**
       * Player status values
       * @param  {...String} values Acceptable values are: FREEAGENT, WAIVERS, ONTEAM
       */
      withPlayerStatus(...values) {
        this.players.filterStatus.value = values;
        return this;
      }

      /**
       * Player limit to return
       * @param {Integer} limit Default value is 50 
       */
      withLimit(limit) {
        this.players.limit = limit;
        return this;
      }

      /**
       * Page offset
       * @param {Integer} offset page offset
       */
      withOffset(offset) {
        this.players.offset = offset;
        return this;
      }

      /**
       * Sort percetnage player owned
       * @param {Integer} sortPriority Not sure? I usually use 2
       * @param {Boolean} sortAsc Ascending or descending
       */
      withSortPercOwned(sortPriority, sortAsc) {
        this.players.sortPercOwned = {
          sortPriority,
          sortAsc
        };
        
        return this;
      }

      build() {
        return new FantasyFilter(this);
      }
    }
    return Builder;
  }
}