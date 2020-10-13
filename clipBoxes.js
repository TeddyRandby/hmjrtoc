import {
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
} from "@apollo/client";
import path from "path";
import getJSON from "./parser";
import fetch from "cross-fetch";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    uri: "http://localhost:4000",
    fetch,
  }),
});

var data = getJSON(path.join(__dirname, "cloudboxes.json"));
var responseData = {};
let pages = Object.keys(data);
// Process the data in 5-page chunks.
const chunk = 5;
// Allow the server 1 min to garbage collect.
//  - This is needed because a new graph is built
//    for every call to predict.
const chunkNumber = 791;
const chunkStart = chunkNumber * chunk;
const delay = 500;
const cap = pages.length;

async function predictChunk(start, chunk) {
  console.log("Processing chunk " + start / chunk);
  console.log(pages.slice(start, start + chunk));
  let responses = await Promise.all(
    pages.slice(start, start + chunk).map((boxID) => {
      const page = {
        boxID: boxID,
        boundingBoxes: data[boxID].cloudExplodeBoxes.map((preBox) => {
          return {
            top: preBox.top,
            left: preBox.left,
            width: preBox.width,
            height: preBox.height,
          };
        }),
      };
      if (page.boundingBoxes.length < 1) {
        return new Promise((resolve, reject) => {
          resolve("no data");
        });
      }
      return client
        .query({
          query: gql`
            query($page: GQLClipBox!) {
              clipBoxes(GQLClipBox: $page)
            }
          `,
          variables: { page },
        })
        .catch((err) => console.log("Page already clipped."));
    })
  );
  console.log(((start + chunk) * 100) / cap + "% done.");
  for (let i = 0; i < responses.length; i++) {
    if (responses[i]) {
      if (responses[i].data) {
        responseData[pages[start + i]] = responses[i].data;
      }
    }
  }
  if (start + chunk + chunk <= cap) {
    setTimeout(() => {
      predictChunk(start + chunk, chunk);
    }, delay);
  } else {
    console.log(Object.keys(pages).length);
  }
}

predictChunk(chunkStart, chunk);
