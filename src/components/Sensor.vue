<template>
  <div class="Sensor">
    <h3>{{ title }}</h3>

    <select
      class="w3-select"
      style="width: 150px"
      v-model="sensorid"
      @change="sensorChange"
    >
      <option
        v-for="sensorid in sensorids"
        v-bind:key="sensorid.label"
        v-bind:value="sensorid.val"
      >
        {{ sensorid.label }}
      </option>
    </select>
    &nbsp;
    <select
      class="w3-select w3-cell"
      style="width: 150px"
      v-model="days"
      @change="periodChange"
    >
      <option
        v-for="period in periods"
        v-bind:key="period.label"
        v-bind:value="period.val"
      >
        {{ period.label }}
      </option>
    </select>

    <div>
      <canvas id="tempChart" style="width: 100%; height: 300px"></canvas>
    </div>
    <div>
      <canvas id="dustChart" style="width: 100%; height: 320px"></canvas>
    </div>
    <p>Locaties sensoren:</p>
    <img src="Homerusmap1.png" alt="locaties sensoren" style="width: 100%" />
    <p>
      <a href="/">Dit dashboard</a> is een initiatief van bewoners van de
      Homerusstraat, het Kadaster en de gemeente Apeldoorn, en wordt onderhouden
      door <img src="IOTApeldoornLogo_Transparent.png" width="200" />
    </p>
  </div>
</template>

<script>
import Chart from "chart.js";

export default {
  name: "Sensor",
  props: {
    title: String,
  },
  data() {
    return {
      tempChart: Chart,
      dustChart: Chart,
      sensorid: "all",
      days: 7,
      periods: [
        { label: "laatste 24 uur", val: 1 },
        { label: "laatste 48 uur", val: 2 },
        { label: "laatste week", val: 7 },
        { label: "laatste maand", val: 28 },
        { label: "laatste jaar", val: 800 },
      ],
      sensorids: [
        { label: "alle sensoren", val: "all" },
        { label: "ananas", val: "101" },
        { label: "tomaat", val: "102" },
        { label: "meloen", val: "103" },
        { label: "banaan", val: "104" },
        { label: "kiwi", val: "105" },
        { label: "kersen", val: "106" },
      ],
    };
  },
  methods: {
    updateContent: function () {
      this.getSensorData(this);
    },
    periodChange: function () {
      this.getSensorData(this);
    },
    sensorChange: function () {
      this.getSensorData(this);
    },

    getSensorData: function (me) {
      const months = [
        "jan",
        "feb",
        "mar",
        "apr",
        "mei",
        "jun",
        "jul",
        "aug",
        "sep",
        "okt",
        "nov",
        "dec",
      ];
      var query = { topic: "sensor", sensorid: me.sensorid, days: me.days };

      var ws = new WebSocket(this.$root.urlWebSocket);
      ws.onopen = function () {
        ws.send(JSON.stringify(query));
      };
      ws.onmessage = function (event) {
        //console.log("ws.onmessage");
        var json = JSON.parse(event.data);
        //console.log(json);

        if (
          json === undefined ||
          json.topic !== "sensor" ||
          json.stamps.length === 0
        ) {
          console.log("invalid sensor message");
          return;
        }
        //console.log(json);

        me.dustChart.data.labels = [];
        me.dustChart.data.datasets[0].data = [];
        me.dustChart.data.datasets[1].data = [];
        me.tempChart.data.labels = [];
        me.tempChart.data.datasets[0].data = [];

        // convert stamps
        json.stamps.forEach((s) => {
          var d = new Date(s);
          if (me.days < 3)
            me.dustChart.data.labels.push(d.getHours().toString());
          //("0" + d.getHours().toString()).slice(-2)
          else if (me.days < 90)
            me.dustChart.data.labels.push(
              d.getDate().toString() + " " + months[d.getMonth()]
            );
          else {
            me.dustChart.data.labels.push(
              d.getFullYear().toString() + " " + months[d.getMonth()]
            );
            //console.log( d.getFullYear().toString() + "-" + ("0" + (d.getMonth()+1).toString()).slice(-2) )
          }
        });

        me.dustChart.data.datasets[0].data = json.pm25s;
        me.dustChart.data.datasets[1].data = json.pm10s;
        me.tempChart.data.datasets[0].data = json.temps;

        var label;
        me.sensorids.forEach((option) => {
          if (option.val === me.sensorid) label = option.label;
        });

        me.dustChart.options.title.text = "Fijnstof " + label;
        me.tempChart.data.labels = me.dustChart.data.labels;
        me.tempChart.options.title.text = "Temperatuur " + label;
        me.dustChart.update();
        me.tempChart.update();
      }; // end onmessage
    },
  },

  created() {},
  mounted() {
    this.tempChart = new Chart("tempChart", {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: "Temperatuur",
            borderColor: "#1f77b4",
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          fontSize: 16,
        },
        //spanGaps: true
      },
    });
    this.dustChart = new Chart("dustChart", {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: "PM 2.5",
            borderColor: "#1f77b4",
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
          },
          {
            data: [],
            label: "PM 10",
            borderColor: "#ff7f0e",
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          fontSize: 16,
        },
        //spanGaps: true
      },
    });
    this.getSensorData(this);
  },
  updated() {},
  destroyed() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
