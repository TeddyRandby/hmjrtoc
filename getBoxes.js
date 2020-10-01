import {
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
} from "@apollo/client";
import path from "path";
import getJSON from "./parser";
import fs from "fs";
import fetch from "cross-fetch";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    uri: "http://localhost:4000",
    fetch,
  }),
});

var data = getJSON(path.join(__dirname, "ids.json"));
var responseData = {};
let pages = data["ids"];
// Process the data in 5-page chunks.
const chunk = 5;
// Allow the server 1 min to garbage collect.
//  - This is needed because a new graph is built
//    for every call to predict.
const delay = 500;
const cap = pages.length;

async function predictChunk(start, chunk) {
  console.log("Processing chunk " + start / chunk);
  console.log(pages.slice(start, start + chunk));
  let responses = await Promise.all(
    pages.slice(start, start + chunk).map((id) => {
      return client.query({
        query: gql`
          query($id: String!) {
            explodeBoxes(BoxID: $id) {
              left
              top
              width
              height
            }
          }
        `,
        variables: { id },
      });
    })
  );
  console.log(responses);
  console.log(((start + chunk) * 100) / cap + "% done.");
  for (let i = 0; i < chunk; i++) {
    responseData[pages[start + i]] = responses[i].data;
  }
  if (start + chunk + chunk <= cap) {
    setTimeout(() => {
      predictChunk(start + chunk, chunk);
    }, delay);
  } else {
    console.log(Object.keys(pages).length);
    fs.writeFileSync("boxes.json", JSON.stringify(responseData));
  }
}

predictChunk(0, chunk);
