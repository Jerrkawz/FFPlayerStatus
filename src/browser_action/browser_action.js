import Vue from 'vue';
import BrowserAction from 'BrowserAction';

Vue.component('BrowserAction', BrowserAction);

new Vue(BrowserAction).$mount('#browserAction');
