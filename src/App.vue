<template>
  <div id="app">
    <Header @meterIdChanged="meterIdChanged" ref="childHeader" />

    <div class="w3-row">
      <div class="w3-third w3-container" style="min-width: 320px">
        <ActualEnergy
          title="Actueel verbruik/opwek"
          class="w3-panel w3-light-grey"
          ref="childActualEnergy"
        />
        <Weather
          title="Weer"
          class="w3-panel w3-light-grey"
          ref="childWeather"
        />
        <Dust title="Fijnstof" class="w3-panel w3-light-grey" ref="childDust" />
      </div>
      <div class="w3-third w3-container w3-margin-top" style="min-width: 320px">
        <Energy
          title="Energie"
          class="w3-container w3-light-grey"
          ref="childEnergy"
        />
      </div>
      <div class="w3-third w3-container w3-margin-top" style="min-width: 320px">
        <Sensor
          title="Sensoren"
          class="w3-container w3-light-grey"
          ref="childSensor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import ActualEnergy from "./components/ActualEnergy.vue";
import Weather from "./components/Weather.vue";
import Energy from "./components/Energy.vue";
import Sensor from "./components/Sensor.vue";
import Dust from "./components/Dust.vue";

export default {
  name: "App",
  components: {
    Header,
    ActualEnergy,
    Energy,
    Weather,
    Dust,
    Sensor,
  },
  data() {
    return {
      count: 0,
      timer: "",
    };
  },
  methods: {
    meterIdChanged: function () {
      this.$refs.childEnergy.updateContent();
    },
    async fetchData() {
      this.$refs.childHeader.updateContent(); // update every minute
      this.$refs.childActualEnergy.updateContent(); // update every minute
      if (this.count > 10) {
        // update every 10 minutes
        this.$refs.childSensor.updateContent();
        this.$refs.childEnergy.updateContent();
        this.$refs.childDust.updateContent();
        this.$refs.childWeather.updateContent();
        this.count = 0;
      }
      this.count += 1;
    },
    /* cancelAutoUpdate() {
      clearInterval(this.timer);
    }, */
  },
  mounted() {
    this.fetchData();
    this.timer = setInterval(this.fetchData, 60000);
  },
};
</script>

<style>
</style>
