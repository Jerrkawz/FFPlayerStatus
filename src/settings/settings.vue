<template>
  <div>
    <div class="settings">
      <h1>Settings</h1>
      <h3>Your Leagues</h3>
      <div id="teamlist_ctnr">
        <div class="form-group">
          <!-- <label class="form-control-label" for="teamlist_input">League URL</label> -->
          <input type="text" id="teamlist_input" class="form-control" placeholder="Enter URL">
          <span class="input-group-btn" id="teamlist-btn-span">
            <button type="submit" class="btn btn-primary" id="teamlist_add_btn">Add</button>
          </span>
          <!-- <div class="form-control-feedback">Feedback</div> -->
          <small class="form-text text-muted">Paste the URL of your ESPN or Yahoo "My Team" page</small>
        </div>
        <table class="table table-striped table-bordered" id="teamlist_tbl">
          <tbody></tbody>
        </table>
      </div>
      <h3>Annotations</h3>
      <ul>
        <li>
          <h4>All Websites</h4>
          <div class="settings-caption-text">
            Removes annotations from all pages, and removes the hovercard. Turns the extension into search only.
          </div>
          <div class="global-annotations-settings-enable">
            <div class="btn btn-primary ff-btn">
              <div class="state-text state1">Enabled</div>
              <div class="state-text state2">Disabled</div>
            </div>
          </div>
        </li>
        <li id="league-annotations">
          <H4>League and Roster Pages</h4>
          <div class="settings-caption-text">
            Show Annontations on your league and roster pages
          </div>
          <div class="roster-annotations-settings-enable">
            <div class="btn btn-primary ff-btn">
              <div class="state-text state1">Enabled</div>
              <div class="state-text state2">Disabled</div>
            </div>
          </div>
        </li>
      </ul>
      <h3>Inline Availability</h3>
      <div class="settings-caption-text">
        Show availability next to name.
      </div>
      <div class="inline-availability-settings-enable">
        <div class="btn btn-primary ff-btn">
          <div class="state-text state1">Enabled</div>
          <div class="state-text state2">Disabled</div>
        </div>
      </div>
      <li style="display:none;">
        <h3>Popup</h3>
        <ul>
          <li class="popup-trigger">
            <div>Trigger:</div>
            <div class="popup-trigger-settings">

            </div>
          </li>
          <li>
            <div>Position:</div>
            <div class="popup-position-settings">

            </div>
          </li>
        </ul>
      </li>
    </div>
    <div class="blacklist">
      <h1>URL Blacklist</h1>
      The terms below will prevent the plugin from running on certain pages. If a term is found within the page's URL, the plugin
      will not work on that page.
      <div id="blacklist-input-grp" class="form-group">
        <input type="text" class="form-control" placeholder="Enter URL" id="blacklist_input">
        <span class="input-group-btn" id="blacklist_btn_span">
          <button type="submit" class="btn btn-primary" id="blacklist_add_btn">Submit</button>
        </span>
      </div>
      <table class="table table-striped table-bordered" id="blacklist_tbl">
        <tbody></tbody>
      </table>
    </div>
    <div class="custom-mapping">
      <h1>Custom Mappings</h1>
      'Cuz we all love nicknames
      <div id="custom-mapping-body">
        <button type="submit" class="btn btn-primary" id="cm_add_btn">Add+</button>
        <table class="table table-striped table-bordered" id="custom-mapping-table">
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>


<style scoped>
</style>
