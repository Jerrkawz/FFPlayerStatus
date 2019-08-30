import Vue from 'vue';
import BrowserAction from 'BrowserAction';
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.component('BrowserAction', BrowserAction);

new Vue(BrowserAction).$mount('#browserAction');
