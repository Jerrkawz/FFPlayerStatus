import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Settings from 'Settings';

Vue.use(BootstrapVue);

Vue.component('settings', Settings);

new Vue(Settings).$mount('#app');
