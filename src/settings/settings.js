import Vue from 'vue';
import Settings from 'Settings';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faTimes, faSpinner);
Vue.component('settings', Settings);

new Vue(Settings).$mount('#app');
