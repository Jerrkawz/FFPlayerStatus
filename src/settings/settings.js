import Vue from 'vue';
import Settings from 'Settings';

Vue.component('settings', Settings);

new Vue(Settings).$mount('#app');
