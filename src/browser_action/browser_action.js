import Vue from 'vue';
import BrowserAction from 'BrowserAction';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faTimes, faRandom, faSync, faCog } from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faTimes, faRandom, faSync, faCog);

Vue.component('BrowserAction', BrowserAction);

new Vue(BrowserAction).$mount('#browserAction');
