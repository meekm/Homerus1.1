<template>
  <div class="Weather">
    <h3>{{ title }}</h3> 
    <table class="w3-table" style="line-height: 0.5">
      <tr v-for="item in items" :key="item.key">
        <td v-html="item.key" />
        <td v-html="item.val" />
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: "Weather",
  props: {
    title: String,
  },
  data() {
    return {
      x: "01d",
      icon: "",
      items: [],
    };
  },
  methods: {
    updateContent: function() {
      this.getWeather( this);
    },
    getWeather: function (me) {
      var q = { topic: "weather" };
      var ws = new WebSocket(this.$root.urlWebSocket);
      ws.onmessage = function (event) {
        var json = JSON.parse(event.data);
        const windDir = ["N","NNO","NO","ONO","O","OZO","ZO","ZZO","Z","ZZW","ZW","WZW","W","WNW","NW","NNW","N"];

        if (json === undefined || json.topic !== "weather") {
          console.log("invalid weather message");
          return;
        }
        
        me.icon = '<i class="wi wi-owm-' + json.icon + ' wi-2x" style="color:orange;"></i>';
          
        //var up = '<i class="wi wi-direction"></i>';
        //var down = '<i class="wi wi-direction wi-rotate-180"></i>';

        var up = '<i class="material-icons" style="font-size:16px">north</i>';
        var down = '<i class="material-icons" style="font-size:16px">south</i>';

        var wind = windDir[Math.round(json.wind / 22.5)] + "  " + json.speed.toFixed(1) + " m/s";
        var temp = json.temp.toFixed(1) + " C&deg;";
        var hum = json.hum + " %";
        var press = json.press + " hPa";
        var sun = json.sunrise + up + " " + json.sunset + down;
        var stookalert = (json.stookalert) ? '<span style="color:red">alarm</span>' : '<span style="color:green">geen</span>';
        
        me.items = [];
        me.items.push({ key: me.icon, val: temp });
        me.items.push({ key: "Wind", val: wind });
        me.items.push({ key: "Luchtdruk", val: press });
        me.items.push({ key: "Vochtigheid", val: hum });
        me.items.push({ key: "Stookalert", val: stookalert });
        me.items.push({ key: "Zon", val: sun });
      
      };
      ws.onopen = function () {
        ws.send(JSON.stringify(q));
      };
    },
  },
  mounted() {
    this.getWeather(this);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
