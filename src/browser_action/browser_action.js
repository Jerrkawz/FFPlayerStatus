import Vue from 'vue';
import BrowserAction from 'BrowserAction';
import BootstrapVue from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTimes, faRandom, faSync, faCog, faChevronRight } from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faTimes, faRandom, faSync, faCog, faChevronRight);
Vue.use(BootstrapVue);
Vue.component('BrowserAction', BrowserAction);

new Vue(BrowserAction).$mount('#browserAction');
