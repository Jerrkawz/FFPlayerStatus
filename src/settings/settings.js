import Vue from 'vue';
import settings from './settings.vue';

Vue.component('settings', settings);

new Vue(settings).$mount('#app');
