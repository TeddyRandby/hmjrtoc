let BoxSDK = require("box-node-sdk");
// var request = require("request");
let fs = require("fs");
const path = require("path");

// Initialize the SDK with your app credentials
let sdk = new BoxSDK({
  clientID: "uve8miwkcbfeavh8mm1fn4ylcyr8m65k",
  clientSecret: "ab6Xjsqz0iFi55YiH2Cv8iORxWj6yEti",
});

// Create a basic API client, which does not automatically refresh the access token
let client = sdk.getBasicClient("ZEeriXJuwvdqJ2Cdhhc52TcuTjpIWODP");

const fbstream = fs.createWriteStream("./fbdata.json", 'utf8');

let data = {};
data["ids"] = [];
data["idx"] = 0;
data["busy"] = [];
let lim = 50;

client.folders
  .getItems("116338627657", { fields: "entries", limit: lim })
  .then((tree) => parseTreeInfo(tree))
  .catch((err) => console.log("Got an error!", err))

const parseTreeInfo = (tree) => {
  processEntries(0, tree.entries);
};

const processEntries = (idx, entries) => {
  if (idx < entries.length) {
    getVolume(entries[idx].id, ()=>{
      processEntries(idx+1,entries);
    })
  }
}

const getVolume = (id, cb) => {
  client.folders
  .getItems(id, { fields: "entries,name" })
  .then((vol) => parseVolItem(vol, cb))
  .catch((err) =>{
    if (err.statusCode == 429){
      console.log("delaying.");
      setTimeout(()=>{
        getVolume(id)
      },180000);
    } else {
      throw err;
    }
  });
}

const parseVolItem = (vol, cb) => {
  for (entry of vol.entries) {
    if (entry.type == "file" && entry.name.endsWith(".jpg")) {
      const name = entry.name;
      const id = entry.id;
      addTOC(name, id);
    }
  }
  cb();
};

const addTOC = (name, id) => {
  client.files.getDownloadURL(id).then((url)=>{
    data[id] = {
        url: url,
        name: name
    }
    data.ids.push(id);
    if (Object.keys(data).length >= lim*3) {
        fs.writeFileSync("./fbdata.json", JSON.stringify(data), {"flags":"w"});
    }
  })
}
