var BoxSDK = require("box-node-sdk");
// var request = require("request");
var fs = require("fs");
const path = require("path");
// Imports the Google Cloud client library
const { Storage } = require("@google-cloud/storage");

// Initialize the SDK with your app credentials
var sdk = new BoxSDK({
  clientID: "uve8miwkcbfeavh8mm1fn4ylcyr8m65k",
  clientSecret: "ab6Xjsqz0iFi55YiH2Cv8iORxWj6yEti",
});

// Create a basic API client, which does not automatically refresh the access token
var client = sdk.getBasicClient("Ir92FJjie7cfRKBuBixAX0t1HuFmsotn");

var csvStream = fs.createWriteStream("batch.csv");

client.folders
  .getItems("116338627657", { fields: "entries", limit: 850 })
  .then((tree) => parseTreeInfo(tree))
  .catch((err) => console.log("Got an error!", err));

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
      const filePath = path.join(__dirname, "TOCs", name);
      getAndWriteTOC(filePath, name, id);
    }
  }
  cb();
};

const getAndWriteTOC = (filePath, name, id) => {
  client.files.getReadStream(id, null, function (error, stream) {
    if (error) {
      console.log(error);
    }
    // write the file to disk
    var output = fs.createWriteStream(filePath, {
      flags: "w",
    });
    output.on("open", () => {
      stream.pipe(output);
    });
    output.on("close", () => {
      const bucketName = "hmjri-280502-vcm";

      // Creates a client
      const storage = new Storage();

      async function uploadFile() {
        // Uploads a local file to the bucket
        await storage.bucket(bucketName).upload(filePath, {
          // Support for HTTP requests made with `Accept-Encoding: gzip`
          gzip: true,
          // By setting the option `destination`, you can change the name of the
          // object you are uploading to a bucket.
          metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: "public, max-age=31536000",
          },
        });
        console.log(`${filePath} uploaded to ${bucketName}.`);
      }
      uploadFile().then(()=>{
        csvStream.write("gs://hmjri-280502-vcm/" + name + "\n",(err)=>{
          if (err) { throw err }
          fs.unlink(filePath, (err)=>{if (err) {throw err}});
        });
      }).catch(console.error);
    });
  }).catch((err)=>{
    if (err.statusCode == 429){
      console.log("delaying call.")
      setTimeout(function(){
        getAndWriteTOC(filePath, name, id);
      }, 180000)
    } else {
      throw err
    }
  });
}
