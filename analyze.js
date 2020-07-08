import { process } from "./postprocess";
import fs from "fs";
var count = 0;
var data = process();
// var stream = fs.createWriteStream("trainingData.csv", {flags:'a'});
var stored = [];
Object.keys(data).forEach((key) => {
  data[key].result.forEach((card) => {
    // var headerData = "";
    // var contentData = "";
    // var dateData = "";
    // var indexData = "";
    // var cnt = card.parsed;
    // if (cnt.header.length > 0)
    //   headerData +=
    //     " " + cnt.header.reduce((acc, val) => (acc += " " + val.replace(/,/g, '').replace(/(\r\n|\n|\r|\t)/g, ' ')), "");
    // if (cnt.content.length > 0)
    //   contentData +=
    //     " " + cnt.content.reduce((acc, val) => (acc += " " + val.replace(/,/g, '').replace(/(\r\n|\n|\r|\t)/g, ' ')), "");
    // if (cnt.dates.length > 0)
    //   dateData +=
    //     " " +
    //     cnt.dates.reduce(
    //       (acc, val) =>
    //         (acc +=
    //           " " + Object.keys(val).reduce((acc, val) => (acc += " " + val.replace(/,/g, '').replace(/(\r\n|\n|\r|\t)/g, ' ')), "")),
    //       ""
    //     );
    // if (cnt.indexes.length > 0)
    //   indexData +=
    //     " " +
    //     cnt.indexes.reduce(
    //       (acc, val) =>
    //         (acc +=
    //           " " + Object.keys(val).reduce((acc, val) => (acc += " " + val.replace(/,/g, '').replace(/(\r\n|\n|\r|\t)/g, ' ')), "")),
    //       ""
    //     );
    // if (headerData.length > 0 && !stored.includes(headerData)){
    //   stream.write(headerData + ",Header\n");
    //   stored.push(headerData);
    // }
    // if (contentData.length > 0 && !stored.includes(contentData)){
    //  stream.write(contentData + ",Content\n");
    //  stored.push(contentData);
    // }
    // if (dateData.length > 0 && !stored.includes(dateData)){
    //   stream.write(dateData + ",Date\n");
    //   stored.push(dateData);
    // }
    // if (indexData.length > 0 && !stored.includes(indexData)){
    //  stream.write(indexData + ",Index\n");
    //  stored.push(indexData);
    // }
    card.parsed.entries.forEach(entry=>{
      count += 1;
      console.log({
        header: entry.header,
        content: entry.content,
        pages: entry.pages,
        dates: entry.dates,
      });
      console.log("------------------------------");
    })

  });
});

// stream.end();

