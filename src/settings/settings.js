import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Settings from 'Settings';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

Vue.use(BootstrapVue);

library.add(faTimes, faSpinner);
Vue.component('settings', Settings);

new Vue(Settings).$mount('#app');
