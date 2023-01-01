<template>
  <div id="Header">
    <div class="w3-bar w3-blue">
      <div class="w3-bar-item">
        <div class="w3-xlarge">HomerusEnergiek</div>
        <div class="w3-small">last update {{ lastUpdate }}</div>
      </div>

      <div class="w3-bar-block w3-right">
        <a
          href="http://homerusenergiek.nl"
          class="w3-bar-item w3-button material-icons"
          >home</a
        >

        <div class="w3-bar-item w3-button material-icons" @click="show">
          speed
        </div>
      </div>
    </div>

    <!--div class="w3-bar w3-white">
      <div class="w3-bar-item w3-button">Dashboard</div>
      <div class="w3-bar-item w3-button">Energie</div>
      <div class="w3-bar-item w3-button">Fijnstof</div>
    </div-->

    <div class="w3-modal" ref="id01">
      <div class="w3-modal-content" style="width: 280px">
        <div class="w3-container w3-blue">
          <span class="w3-button w3-display-topright" @click="cancel">
            <i class="material-icons" style="font-size: 24px; color: white"
              >close</i
            ></span
          >

          <h4>Slimmemeter nummer</h4>
        </div>
        <div class="w3-container w3-light-grey">
          <p>
            Om je eigen verbruik te kunnen zien, voer de laatste 9 cijfers van
            je meter in:
          </p>

          <div class="w3-bar">
            <input
              class="w3-bar-item w3-input w3-border w3-round-large w3-margin"
              style="width: 120px"
              type="text"
              v-model="inputTxt"
            />
            <button
              class="w3-bar-item w3-button w3-blue w3-round-large w3-margin"
              :disabled="disableBtn"
              @click="ok"
            >
              ok
            </button>
          </div>
          <p style="color: red">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "Header",
  props: {
    title: String,
  },
  data() {
    return {
      inputTxt: "",
      btnDisabled: true,
      error: "",
      lastUpdate: "",
    };
  },
  computed: {
    disableBtn: function () {
      //this.error = "";
      let pattern = /^\d{9}$/;
      return !pattern.test(this.inputTxt);
    },
  },
  methods: {
    updateContent: function () {
      //console.log( "ActualEnergy updateContent");
      //this.getActualEnergy(this);
      this.lastUpdate = new Date()
        .toLocaleString("nl-NL")
        .slice(-8)
        .slice(0, 5);
    },
    show: function () {
      this.error = "";
      this.$refs.id01.style.display = "block";
    },
    ok: function () {
      this.getMeterId(this);
    },
    cancel: function () {
      this.inputTxt = "";
      this.$refs.id01.style.display = "none";
    },
    getMeterId: function (me) {
      var query = { topic: "meterid", meterid: me.inputTxt };
      var ws = new WebSocket(this.$root.urlWebSocket);
      ws.onopen = function () {
        ws.send(JSON.stringify(query));
      };
      ws.onmessage = function (event) {
        var json = JSON.parse(event.data);
        //console.log("meterid data:");
        //console.log(json);

        if (json === undefined || json.topic !== "meterid") {
          console.log("invalid meterid message");
          return;
        }

        me.setCookie("meterid", json.meterid, 365);
        /*me.inputTxt =*/ me.$root.cookieMeterid = json.meterid;
        me.$emit("meterIdChanged", json.meterid); // fire event to parent
        if (json.meterid !== "") {
          me.$refs.id01.style.display = "none"; // remove popup
        } else {
          me.error = "nummer is onbekend in het systeem";
        }
      }; // end onmessage
    },
    setCookie: function (cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: function (cname) {
      let regex = cname + "=(\\w+)";
      let cookies = decodeURIComponent(document.cookie);
      let found = cookies.match(new RegExp(regex));
      //console.log(found);
      return found !== null ? found[1] : "";
    },
  },
  mounted() {
    // check cookie
    this.inputTxt = this.$root.cookieMeterid = this.getCookie("meterid");
    //this.setCookie("marcel meek", "test123", 3);
  },
};
</script>

<style scoped>
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: dimgrey;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  top: 70%;
  left: -50%;
  margin-left: -60px;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>