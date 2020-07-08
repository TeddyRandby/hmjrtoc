
import fs from "fs"

function GetFileEncodingHeader(filePath) {
    const readStream = fs.openSync(filePath, 'r');
    const bufferSize = 2;
    const buffer = new Buffer(bufferSize);
    let readBytes = 0;

    if (readBytes = fs.readSync(readStream, buffer, 0, bufferSize, 0)) {
        return buffer.slice(0, readBytes).toString("hex");
    }   

    return "";
}

function ReadFileSyncUtf8(filePath) {
    const fileEncoding = GetFileEncodingHeader(filePath);
    let content = null;

    if (fileEncoding === "fffe" || fileEncoding === "utf16le") {
        content = fs.readFileSync(filePath, "ucs2"); // utf-16 Little Endian
    } else if (fileEncoding === "feff" || fileEncoding === "utf16be") {
        content = fs.readFileSync(filePath, "uts2").swap16(); // utf-16 Big Endian
    } else {
        content = fs.readFileSync(filePath, "utf8");
    }

    // trim removes the header...but there may be a better way!
    return content.toString("utf8").trimStart();
}

export default function getJSON(filePath) {
    const jsonContents = ReadFileSyncUtf8(filePath);
    return JSON.parse(jsonContents);
}

