// For each TOC in box
//  Download the TOC
//  Send the TOC to google to get entries
//  Crop the downloaded image, write it to a local file
//  Send the local file to Box entries
//  Delete local cropped entries and local TOC

const BoxSDK = require("box-node-sdk");
// const { PredictionServiceClient } = require("@google-cloud/automl").v1;
const Clipper = require("image-clipper");
const Canvas = require("canvas");
var sizeOf = require("image-size");
// var request = require("request");
const fs = require("fs");
const path = require("path");
// const gclient = new PredictionServiceClient();
Clipper.configure({
  canvas: Canvas,
});

// Initialize the SDK with your app credentials
var sdk = new BoxSDK({
  clientID: "uve8miwkcbfeavh8mm1fn4ylcyr8m65k",
  clientSecret: "ab6Xjsqz0iFi55YiH2Cv8iORxWj6yEti",
});

// Create a basic API client, which does not automatically refresh the access token
var client = sdk.getBasicClient("zXtBpUI64lj1V5xt0gSG4o2mGIB6PTJ9");

var stream = fs.createWriteStream("batch.csv");

client.folders
  .getItems("116338627657", { fields: "entries", limit: 852 })
  .then((tree) => parseTreeInfo(tree))
  .catch((err) => console.log("Got an error!", err));

const parseTreeInfo = (tree) => {
  let entries = tree.entries;
  let total = entries.length;
  processVolItems(entries, 0, total);
};

const processVolItems = (entries, curr, total) => {
  entry = entries[curr];
  if (curr < total) {
    getFolderItems(entry.id, function () {
      processVolItems(entries, curr + 1, total);
    });
  }
};

const parseVolItem = (vol, callback) => {
  for (entry of vol.entries) {
    if (entry.type == "file" && entry.name.endsWith(".jpg")) {
      const id = entry.id;
      getAndWriteURL(id, callback);
    } else {
      callback();
    }
  }
};

const getAndWriteURL = (id, callback) => {
  client.files
    .getDownloadURL(id)
    .then((url) => {
      stream.write(url + "/n");
      callback();
    })
    .catch((err) => {
      if (err.statusCode == 429) {
        setTimeout(function () {
          getAndWriteURL(id, callback);
        }, 120000);
      } else {
        console.log("Got an error!", err.message);
      }
    });
};

const getFolderItems = (id, callback) => {
  client.folders
    .getItems(id, { fields: "entries,name" })
    .then((vol) => parseVolItem(vol, callback))
    .catch((err) => {
      if (err.statusCode == 429) {
        getFolderItems(id, callback);
      } else {
        console.log("Got an error!", err.message);
      }
    });
};
