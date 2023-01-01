<template>
  <div class="Energy">
    <h3>{{ title }}</h3>

    <select
      class="w3-select"
      style="width: 150px"
      v-model="selected"
      @change="updateDate(0)"
    >
      <option v-for="p in periods" v-bind:key="p.label" v-bind:value="p.idx">
        {{ p.label }}
      </option>
    </select>

    <div
      class="w3-button w3-circle w3-blue w3-right material-icons"
      @click="download"
    >
      file_download
    </div>

    <div class="w3-bar">
      <button
        class="w3-button material-icons"
        :disabled="btnDownDisabled"
        @click="updateDate(-1)"
      >
        fast_rewind
      </button>
      <span> {{ displayDate }} </span>
      <button
        class="w3-button material-icons"
        :disabled="btnUpDisabled"
        @click="updateDate(1)"
      >
        fast_forward
      </button>
    </div>

    <div>
      <canvas id="eChart" style="width: 100%; height: 400px"></canvas>
    </div>
    <div>
      <canvas id="gChart" style="width: 100%; height: 380px"></canvas>
    </div>
    <small>Gemiddelde verbruik van {{ count }} woningen</small>
  </div>
</template>

<script>
import Chart from "chart.js";
//import { getEnergyData } from "./EnergyData.js";
import { getEnergyData } from "./EnergyData.js";

export default {
  name: "Energy",
  props: {
    title: String,
  },
  data() {
    return {
      lastData: {},
      eChart: Chart,
      gChart: Chart,
      devid: "",
      selected: 0,
      btnUpDisabled: true,
      btnDownDisabled: true,
      displayDate: "",
      currDate: null,
      startDate: null,
      endDate: null,
      step: "h",
      count: 0,
      requestBusy: false,
      periods: [
        { idx: 0, label: "dag" },
        { idx: 1, label: "week" },
        { idx: 2, label: "maand" },
        { idx: 3, label: "jaar" },
      ],
      viewVerbruik: {
        data: [],
        label: "gemiddeld verbruik Homerus",
        backgroundColor: "#1f77b4",
      },
      viewTerug: {
        data: [],
        label: "gemiddeld teruglevering Homerus",
        backgroundColor: "#ff7f0e",
      },
      viewGas: {
        data: [],
        label: "gemiddeld verbruik Homerus",
        backgroundColor: "#2ca02c",
      },
      viewMijnVerbruik: {
        type: "line",
        borderWidth: 1,
        pointRadius: 2,
        fill: false,
        data: [],
        label: "verbruik eigen meter",
        borderColor: "#038",
      },
      viewMijnTerug: {
        type: "line",
        borderWidth: 1,
        pointRadius: 2,
        fill: false,
        data: [],
        label: "teruglevering eigen meter",
        borderColor: "#c30",
      },
      viewMijnGas: {
        type: "line",
        borderWidth: 1,
        pointRadius: 2,
        fill: false,
        data: [],
        label: "verbruik eigen meter",
        borderColor: "#151",
        //backgroundColor: "#161",
      },
    };
  },
  methods: {
    updateDate: function (dir) {
      setTimeInterval(this, dir);
      this.devid = this.$root.cookieMeterid;
      //if( dir === 0)
      getEnergyData(this, this.updateCharts);
    },
    updateContent: function () {
      this.devid = this.$root.cookieMeterid;
      getEnergyData(this, this.updateCharts);
    },
    updateCharts: function (json) {
      // callback
      this.lastData = json;
      this.checkViews();
      this.gChart.data.labels = json.chartStamps;
      this.eChart.data.labels = json.chartStamps;

      this.viewVerbruik.data = json.verbruik;
      this.viewTerug.data = json.terug;
      this.viewGas.data = json.gas;
      this.viewMijnVerbruik.data = json.mijnverbruik;
      this.viewMijnTerug.data = json.mijnterug;
      this.viewMijnGas.data = json.mijngas;

      // bereken aantalwoningen (geheel getal)
      this.count = 0;
      for (let x = 0; x < json.count.length; x++) this.count += json.count[x];
      // for (let x = 0; x < json.count.length; x++)
      //  if( this.count < json.count[x])
      //    this.count = json.count[x];
      this.count /= json.count.length;
      this.count = Math.round(this.count + 0.5);

      this.eChart.update();
      this.gChart.update();
    },

    createCharts: function () {
      this.eChart = new Chart("eChart", {
        type: "bar",
        data: {
          labels: [],
          datasets: [this.viewVerbruik, this.viewTerug],
        },
        options: {
          legend: {
            display: true,
          },
          title: {
            display: true,
            fontSize: 16,
            text: "Electriciteit [kWh]",
          },
        },
      });
      this.gChart = new Chart("gChart", {
        type: "bar",
        data: {
          labels: [],
          datasets: [this.viewGas],
        },
        options: {
          legend: {
            display: true,
          },
          title: {
            display: true,
            fontSize: 16,
            text: "Gas [m3]",
          },
        },
      });
    },

    checkViews: function () {
      if (this.devid !== "") {
        // add own meter views
        if (this.eChart.data.datasets.length === 2) {
          this.eChart.data.datasets.unshift(
            this.viewMijnVerbruik,
            this.viewMijnTerug
          );
        }
        if (this.gChart.data.datasets.length === 1) {
          this.gChart.data.datasets.unshift(this.viewMijnGas);
        }
      } else {
        // remove own meter views
        if (this.eChart.data.datasets.length === 4) {
          this.eChart.data.datasets.shift();
          this.eChart.data.datasets.shift();
        }
        if (this.gChart.data.datasets.length === 2) {
          this.gChart.data.datasets.shift();
        }
      }
      //getEnergyData(this, this.updateCharts);
    },
    download: function () {
      // credit: https://www.bitdegree.org/learn/javascript-download
      //let text = JSON.stringify(this.lastData);
      let text =
        "datum;aantal woningen;homerus verbruik;homerus terug;homerus gas;eigen verbruik;eigen terug;eigen gas\n";
      for (let i = 0; i < this.lastData.stamps.length; i++) {
        text +=
          toCSVDateTime(this.lastData.stamps[i], this.days > 3) +
          ";" +
          this.lastData.count[i] +
          ";" +
          toCSV(this.lastData.verbruik[i]) +
          ";" +
          toCSV(this.lastData.terug[i]) +
          ";" +
          toCSV(this.lastData.gas[i]) +
          ";" +
          toCSV(this.lastData.mijnverbruik[i]) +
          ";" +
          toCSV(this.lastData.mijnterug[i]) +
          ";" +
          toCSV(this.lastData.mijngas[i]) +
          "\n";
      }

      let filename = "energy.csv";
      let element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:application/json;charset=utf-8," + encodeURIComponent(text)
      );
      element.setAttribute("download", filename);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);
    },
  },
  mounted() {
    this.devid = this.$root.cookieMeterid;
    this.currDate = new Date();
    this.displayDate = this.currDate.toISOString().slice(0, 10);

    //this.step = "h"
    //this.displayDate = this.currDate.toISOString().slice(0, 10);
    this.createCharts();
    this.updateDate(0);
    //getEnergyData2(this, this.updateCharts); // note: result comes via callback updateCharts
  },

  /* cancelAutoUpdate() {
      clearInterval(this.timer);
    }, 
  },
  mounted() {
    this.fetchData();
    this.timer = setInterval(this.fetchData, 60000);

*/

  updated() {},
  destroyed() {},
};

function toCSVDateTime(datetime, dateonly) {
  let d = new Date(datetime);
  if (dateonly)
    return (
      d.getFullYear() + "-" + to2d(d.getMonth() + 1) + "-" + to2d(d.getDate())
    );
  else
    return (
      d.getFullYear() +
      "-" +
      to2d(d.getMonth() + 1) +
      "-" +
      to2d(d.getDate()) +
      " " +
      to2d(d.getHours()) +
      ":" +
      to2d(d.getMinutes())
    );
}

function to2d(x) {
  return ("00" + x).slice(-2);
}

function toCSV(val) {
  return val.toFixed(3).replace(".", ",");
}

function setTimeInterval(me, direction) {
  let d = me.currDate;
  let period = me.periods[me.selected].label;
  if (period === "dag") {
    d.setUTCDate(d.getUTCDate() + direction);
    me.startDate = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );
    me.displayDate = me.startDate.toISOString().slice(0, 10);
    me.endDate = new Date(me.startDate);
    me.endDate.setUTCDate(me.endDate.getUTCDate() + 1);
    me.step = "h";
  } else if (period === "maand") {
    d.setUTCMonth(d.getUTCMonth() + direction);
    me.startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()));
    me.displayDate = me.startDate.toISOString().slice(0, 7);
    me.endDate = new Date(me.startDate);
    me.endDate.setUTCMonth(me.endDate.getUTCMonth() + 1);
    me.step = "d";
  } else if (period === "jaar") {
    d.setUTCFullYear(d.getUTCFullYear() + direction);
    me.startDate = new Date(Date.UTC(d.getUTCFullYear()));
    me.displayDate = me.startDate.toISOString().slice(0, 4);
    me.endDate = new Date(me.startDate);
    me.endDate.setUTCFullYear(me.endDate.getUTCFullYear() + 1);
    me.step = "m";
  } else if (period === "week") {
    d.setUTCDate(d.getUTCDate() + direction * 7);
    // startday of a the week is preveous Monday
    me.startDate = new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate() - ((d.getUTCDay() + 6) % 7)
      )
    );
    // get week nummer
    let week = getWeekNumber(d);
    me.displayDate = week[0] + " week " + week[1];
    me.endDate = new Date(me.startDate);
    me.endDate.setUTCDate(me.endDate.getUTCDate() + 7);
    me.step = "d";
  }
  if (me.endDate > Date.now()) {
    me.btnUpDisabled = true;
  } else {
    me.btnUpDisabled = false;
  }
  if (me.startDate < new Date(2020, 8, 10)) {
    //database starts at 10 sept 2020
    me.btnDownDisabled = true;
  } else {
    me.btnDownDisabled = false;
  }
}

function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}

/*
function invertList(list) {
  for(let i=0; i<list.length; i++)
    list[i] = -list[i]
  return list;
}*/
/*
devids: [
        { label: "meter-id geen", val: "" },
        { label: "meter-id 039012210", val: "039012210" },
        { label: "meter-id 031920210", val: "031920210" },
        { label: "meter-id 031912410", val: "031912410" },
        { label: "meter-id 617357320", val: "617357320" },
        { label: "meter-id 149037213", val: "149037213" },
        { label: "meter-id 574938114", val: "574938114" },
        { label: "meter-id 860344517", val: "860344517" },
        { label: "meter-id 039028010", val: "039028010" },
        { label: "meter-id 825275117", val: "825275117" },
        { label: "meter-id 039027310", val: "039027310" },
        { label: "meter-id 128532115", val: "128532115" },
        { label: "meter-id 888174417", val: "888174417" }
      ],
*/
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
