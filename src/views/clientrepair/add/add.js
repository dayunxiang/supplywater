import Vue from 'vue'
import init from 'assets/js/init.js'

Vue.use(init)

import App from './app.vue'
new Vue({
  render:h=>h(App)
}).$mount('#container')