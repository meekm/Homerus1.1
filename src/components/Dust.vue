<template>
  <div class="Dust">
    <h3>{{ title }}</h3>
    <div class="w3-cell-row">
      <div class="w3-border-0 w3-cell" style="width: 50%">
        <Gauge title="PM2.5 laatste 24 uur" ranges="5,20,30" ref="pm25day" />
      </div>
      <div class="w3-border-0 w3-cell">
        <Gauge title="PM10 laatste 24 uur" ranges="15,40,60" ref="pm10day" />
      </div>
    </div>
    <div class="w3-cell-row">
      <div class="w3-border-0 w3-cell" style="width: 50%">
        <Gauge title="PM2.5 laatste 4 weken" ranges="5,20,30" ref="pm25month" />
      </div>
      <div class="w3-border-0 w3-cell">
        <Gauge title="PM10 laatste 4 weken" ranges="15,40,60" ref="pm10month" />
      </div>
    </div>

    <table>
        <tr>
        <td>Advieswaarden</td>
        <td style="text-align:right;"><i class="w3-button w3-circle w3-small" @click="expand">   
        <i class="material-icons" style="color:blue">{{btnIcon}}</i></i>
        </td>
        </tr>
    </table >

    <div v-if="showVerbruik" style="font-size: 0.8em">
    Fijnstof gemiddeld per dag:

    <table>
      <tr>
        <th></th>
        <th>PM 2,5</th>
        <th>PM 10</th>
      </tr>
      <tr>
        <td>WHO</td>
        <td>5 µ/m³</td>
        <td>15 µ/m³</td>
      </tr>
      <tr>
        <td>EU</td>
        <td>20 µ/m³</td>
        <td>40 µ/m³</td>
      </tr>
    </table>
    <ul>
      <li>onder grenswaarde WHO: groen</li>
      <li>tussen grenswaarden WHO en EU: geel</li>
      <li>boven grenswaarde EU: rood</li>
    </ul>
    </div>
    </div>

</template>

<script>
import Gauge from "./Gauge";

export default {
  name: "Dust",
  components: {
    Gauge,
  },
  props: {
    title: String,
  },
  data() {
    return {
      btnIcon: "keyboard_double_arrow_down",
      showVerbruik: false,
    };
  },
  methods: {
    updateContent: function() {
      this.getDust( this);
    },
    expand: function() {
      if( this.btnIcon == "keyboard_double_arrow_down" ) {
        this.showVerbruik = true;
        this.btnIcon = "keyboard_double_arrow_up"; 
      }
      else {
        this.btnIcon = "keyboard_double_arrow_down";
        this.showVerbruik = false;
      } 
    },  
    getDust: function (me) {
      var q = { topic: "dust" };
      var ws = new WebSocket(me.$root.urlWebSocket);
      ws.onopen = function () {
        ws.send(JSON.stringify(q));
      };
      ws.onmessage = function (event) {
        var json = JSON.parse(event.data);
        //console.log(json);

        if (json === undefined || json.topic !== "dust") {
          console.log("invalid dust message");
          return;
        }
        me.$refs.pm25day.setValue(json.pm25Day);
        me.$refs.pm10day.setValue(json.pm10Day);
        me.$refs.pm25month.setValue(json.pm25Month);
        me.$refs.pm10month.setValue(json.pm10Month);
      };
    },
  },
  mounted() {
    this.getDust(this);
  },
};
</script>
<style scoped>
table {
  width: 100%;
}
table, td, th {
  border: 0px solid black;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
}

</style>
