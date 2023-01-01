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
  "dec"
];

const days = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export function getEnergyData(me, updateFunc) {
  if (me.requestBusy) return;

  me.requestBusy = true;
  var ws = new WebSocket(me.$root.urlWebSocket);

  ws.onopen = function () {
    var query = {
      topic: "energy",
      devid: me.devid,
      start: me.startDate,
      end: me.endDate,
      step: me.step
    };
    ws.send(JSON.stringify(query));
  };

  // message received
  ws.onmessage = function (event) {
    //console.log("ws.onmessage");
    var json = JSON.parse(event.data);
    //console.log(json);

    if (json === undefined || json.topic !== "energy") {
      console.log("invalid energy message");
      me.requestBusy = false;
      return;
    }
    //jsonToCSV( json);

    // convert stamps suitable for chart
    var tmp = [];
    let period = me.periods[me.selected].label;

    // generate timeaxis, suitable for choosen period

    json.stamps.forEach((s) => {
      var d = new Date(s);
      if (period === "dag") tmp.push(("00" + d.getHours()).slice(-2) + ":00");
      else if (period === "week")
        tmp.push(
          days[d.getUTCDay()] +
            " " +
            d.getDate().toString() +
            " " +
            months[d.getMonth()]
        );
      else if (period === "maand")
        tmp.push(d.getDate().toString() + " " + months[d.getMonth()]);
      else if (period === "jaar") {
        tmp.push(d.getFullYear().toString() + " " + months[d.getMonth()]);
        //console.log( d.getFullYear().toString() + "-" + ("0" + (d.getMonth()+1).toString()).slice(-2) )
      }
    });
    json.chartStamps = tmp;

    updateFunc(json);
    me.requestBusy = false;
  }; // end onmessage
}
