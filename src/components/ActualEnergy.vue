<template>
  <div class="ActualEnergy">
    <h3>Energie uit Zonlicht</h3>

    <table>
      <!-- icons see https://materializecss.com/icons.html  -->
      <tr>
        <td>
          <i class="material-icons" style="font-size: 24px; color: orange"
            >wb_sunny</i
          >
        </td>
        <td>nu</td>
        <td>{{ parseFloat(actuals.terug).toFixed(2) }} kWh</td>
      </tr>
      <tr>
        <td>
          <i class="material-icons" style="font-size: 24px; color: blue"
            >stacked_line_chart</i
          >
        </td>
        <td>vandaag</td>
        <td>{{ parseFloat(todayvalues.terug).toFixed(2) }} kWh</td>
      </tr>
      <tr>
        <td>
          <i class="material-icons" style="font-size: 24px; color: green"
            >park</i
          >
        </td>
        <td>CO2 besparing</td>
        <td>{{ parseFloat(0.649 * todayvalues.terug).toFixed(2) }} kg</td>
      </tr>
    </table>
    <table>
      <tr>
        <td></td>
        <td style="text-align: right">
          <i class="w3-button w3-circle w3-small" @click="expand">
            <i class="material-icons" style="color: blue">{{ btnIcon }}</i></i
          >
        </td>
      </tr>
    </table>
    <div v-if="showVerbruik">
      <h3>Energie verbruik</h3>
      <table>
        <tr>
          <td>
            <i class="material-icons" style="font-size: 24px; color: blue"
              >power</i
            >
          </td>
          <td>nu</td>
          <td>{{ parseFloat(actuals.verbruik).toFixed(2) }} kWh</td>
        </tr>
        <tr>
          <td>
            <i class="material-icons" style="font-size: 24px; color: blue"
              >stacked_line_chart</i
            >
          </td>
          <td>vandaag</td>
          <td>{{ parseFloat(todayvalues.verbruik).toFixed(2) }} kWh</td>
        </tr>
        <tr>
          <td>
            <i class="material-icons" style="font-size: 24px; color: purple"
              >local_fire_department</i
            >
          </td>
          <td>gas nu</td>
          <td>{{ parseFloat(actuals.gas).toFixed(2) }} m³/uur</td>
        </tr>
        <tr>
          <td>
            <i class="material-icons" style="font-size: 24px; color: purple"
              >stacked_line_chart</i
            >
          </td>
          <td>gas vandaag</td>
          <td>{{ parseFloat(todayvalues.gas).toFixed(2) }} m³</td>
        </tr>
        <tr>
          <td>
            <i class="material-icons" style="font-size: 24px; color: black"
              >park</i
            >
          </td>
          <td>CO2 uitstoot</td>
          <td>
            {{
              parseFloat(
                0.649 * todayvalues.verbruik + 1.78 * todayvalues.gas
              ).toFixed(2)
            }}
            kg
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "ActualEnergy",
  props: {
    title: String,
  },
  data() {
    return {
      actuals: {},
      todayvalues: {},
      //lastUpdate: "",
      btnIcon: "keyboard_double_arrow_down",
      showVerbruik: false,
    };
  },
  methods: {
    updateContent: function () {
      //console.log( "ActualEnergy updateContent");
      this.getActualEnergy(this);
    },
    expand: function () {
      if (this.btnIcon === "keyboard_double_arrow_down") {
        this.showVerbruik = true;
        this.btnIcon = "keyboard_double_arrow_up";
      } else {
        this.btnIcon = "keyboard_double_arrow_down";
        this.showVerbruik = false;
      }
    },
    getActualEnergy: function (me) {
      var q = { topic: "actualEnergy" };
      var ws = new WebSocket(this.$root.urlWebSocket);
      ws.onmessage = function (event) {
        var json = JSON.parse(event.data);

        if (json === undefined || json.topic !== "actualEnergy") {
          console.log("invalid ActualEnergy message");
          return;
        }
        me.actuals = json.actuals;
        me.todayvalues = json.todayvalues;
      };
      ws.onopen = function () {
        ws.send(JSON.stringify(q));
      };
    },
  },
  mounted() {
    this.getActualEnergy(this);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
  width: 100%;
}
table,
td,
th {
  border: 0px solid black;
  border-collapse: collapse;
}

th,
td {
  text-align: left;
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 10px;
}
</style>

