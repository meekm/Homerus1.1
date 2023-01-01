import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;

new Vue({
  data: {
    //urlWebSocket: "wss://vmi612554.contaboserver.net/nodered/ws/homerus",
    urlWebSocket: "wss://meek.ddns.net/nodered/ws/homerus",
    cookieMeterid: ""
  },
  render: (h) => h(App)
}).$mount("#app");
