import path from "path";
import getJSON from "./parser";

var data = getJSON(path.join(__dirname, "boxes.json"));
var keys = Object.keys(data);

let calls = 0;
keys.forEach((key) => {
  calls += data[key].explodeBoxes.length;
});

console.log(calls + " boxes from " + keys.length + " pages.");
