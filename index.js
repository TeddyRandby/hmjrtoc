var request = require("request"); // install request module by - 'npm install request'
var querystring = require("querystring");
const BoxSDK = require("box-node-sdk");

// Initialize the SDK with your app credentials
var sdk = new BoxSDK({
  clientID: "uve8miwkcbfeavh8mm1fn4ylcyr8m65k",
  clientSecret: "ab6Xjsqz0iFi55YiH2Cv8iORxWj6yEti",
});

// Create a basic API client, which does not automatically refresh the access token
var client = sdk.getBasicClient("rlQ96K89aNTjV1CnvU4QKepYwNW2KWlC");

var urls = [];
var lim = 10;
var chunk = 5;

client.folders
  .getItems("116491174022", { fields: "entries", limit: lim })
  .then((TOCEntries) => parseEntries(TOCEntries))
  .catch((err) => console.log("Got an error!", err));

const parseEntries = (TOCEntries) => {
  let entries = TOCEntries.entries;
  for (entry of entries) {
    client.files
      .getDownloadURL(entry.id)
      .then((url) => parseDownloadURL(url, urls))
      .catch((err) => console.log("Got an error!", err));
  }
};

const parseDownloadURL = (downloadURL, urls) => {
    urls.push(downloadURL);
    if (urls.length >= chunk) {
        const form_data = {
            urls: urls,
          };

          const options = {
            url:
              "https://app.nanonets.com/api/v2/OCR/Model/0767da44-03bd-414b-b864-b4c9781dea10/LabelUrls/",
            body: querystring.stringify(form_data),
            headers: {
              Authorization:
                "Basic " +
                Buffer.from("aiSkeln2Q24-dvmmRbckLHLzmISGggdp" + ":").toString("base64"),
              "Content-Type": "application/x-www-form-urlencoded",
            },
          };

          request.post(options, function (err, httpResponse, body) {
            console.log(body);
          });
          urls = [];

    }
};


