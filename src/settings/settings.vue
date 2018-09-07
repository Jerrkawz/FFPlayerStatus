<template>
  <div>
    <div class="card">
      <h5 class="card-header">Settings</h5>
      <div class="card-body">
        <h5 class="card-title">Your Leagues</h5>
        <div id="teamlist_ctnr">
          <div class="form-group">
            <!-- <label class="form-control-label" for="teamlist_input">League URL</label> -->
            <input type="text" id="teamlist_input" class="form-control settings-input" placeholder="Enter URL">
            <span class="input-group-btn" id="teamlist-btn-span">
              <button type="submit" class="btn btn-primary settings-button" id="teamlist_add_btn">Add</button>
            </span>
            <!-- <div class="form-control-feedback">Feedback</div> -->
            <small class="form-text text-muted">Paste the URL of your ESPN or Yahoo "My Team" page</small>
          </div>
          <table class="table table-striped table-bordered" id="teamlist_tbl">
            <tbody></tbody>
          </table>
        </div>
        <h5 class="card-title">Annotations</h5>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="defaultCheck1">
          <label class="form-check-label" for="defaultCheck1">
            All Websites
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="defaultCheck2">
          <label class="form-check-label" for="defaultCheck2">
            League and Roster
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="defaultCheck2">
          <label class="form-check-label" for="defaultCheck2">
            Inline Availability
          </label>
        </div>
      </div>
    </div>
    <div class="card">
      <h5 class="card-header">URL Blacklist</h5>
      <div class="card-body">
        The terms below will prevent the plugin from running on certain pages. If a term is found within the
        page's URL, the plugin
        will not work on that page.
        <div id="blacklist-input-grp" class="form-group">
          <input type="text" class="form-control settings-input" placeholder="Enter URL" id="blacklist_input">
          <span class="input-group-btn" id="blacklist_btn_span">
            <button type="submit" class="btn btn-primary settings-button" id="blacklist_add_btn">Submit</button>
          </span>
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
export default {};
</script>


<style scoped>
.settings-input {
  display: inline-block;
  width: 500px;
}

.settings-button {
  vertical-align: top;
}
</style>
