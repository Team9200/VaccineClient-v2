import Vue from 'vue'
import axios from 'axios'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import 'babel-polyfill'

import App from './App'
import router from './router'
import store from './store'

import colors from 'vuetify/es5/util/colors'

import VueWebsocket from "vue-websocket";

Vue.use(Vuetify, {theme: {
  primary: colors.green.darken1
}});

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
