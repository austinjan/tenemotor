import { EventEmitter } from "events";
import { EEXIST } from "constants";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

const SINGLETON_KEY = Symbol.for("tenemotor-dgram");

class UDPAgent {
  constructor(
    socket = dgram.createSocket({ type: "udp4", reuseAddr: true }),
    ee = new EventEmitter()
  ) {
    this.socket = socket;
    this.ee = ee;
  }

  send = (buffer, port, url) => {
    this.socket.send(buffer, port, url, err => {
      if (err) {
        this.ee.emit("error", err);
      }
      this.socket.close();
    });
  };
}

if (!global[SINGLETON_KEY]) {
  console.log("Init udp agent...");
  global[SINGLETON_KEY] = new UDPAgent();
}

export default global[SINGLETON_KEY];
// function litsen(port, cbMessage, cbError) {

// }
