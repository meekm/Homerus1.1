<template>
  <div class="Gauge">
    <div>
      <!--button @click="pressed()">update</button-->
      <canvas :id="this.id" style="width: 120px; height: 120px" />
    </div>
  </div>
</template>

<script>
import Chart from "chart.js";
import "chartjs-gauge";
export default {
  name: "Gauge",
  props: {
    title: String,
    ranges: String,
  },
  data() {
    return {
      myGauge: Chart,
      id: "_" + Math.random().toString(36).substr(2, 9),
      displayValue: 0
    };
  },
  methods: {
    //pressed() {
    //  this.myGauge.data.datasets[0].value++;
    //  this.myGauge.update();
    //},
    setValue(val) {
      this.displayValue = val
      let max = this.myGauge.data.datasets[0].data[2]
      if(val > max )
         this.myGauge.data.datasets[0].value = max
      else
         this.myGauge.data.datasets[0].value = val;
      this.myGauge.update();
    },
  },

  mounted() {
    this.myGauge = new Chart(this.id, {
      type: "gauge",
      data: {
        labels: ["goed", "matig", "slecht"],
        legend: { display: false },
        datasets: [
          {
            data: this.ranges.split(","),
            value: 0,
            /*backgroundColor: [
              "rgb(61,204,91)",
              "rgb(239,214,19)",
              "rgb(255,84,84)",
            ], */
            backgroundColor: ["#0a0", "#cd0", "#c00"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        title: {
          display: true,
          text: this.title,
          fontSize: 14,
        },
        tooltips: { enabled: true },
        layout: {
          padding: {
            bottom: 30,
          },
        },
        needle: {
          radiusPercentage: 0, // Needle circle radius as the percentage
          widthPercentage: 3, // Needle width as the percentage
          lengthPercentage: 120, // Needle length as the percentage
          //color: 'grey' // color of the needle
        },
        cutoutPercentage: 65,
        valueLabel: {
          display: true,
          fontSize: 14,
          color: "black",
          backgroundColor: "#f0f0f0",
          borderRadius: 20,

          // eslint-disable-next-line no-unused-vars
          formatter: (val) => {
            //return Math.round(value * 10) / 10 + " µ/m³";
            return parseFloat(this.displayValue).toFixed(1);
          },
        },
      },
    });

    //this.pm10Chart.update();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style/>

