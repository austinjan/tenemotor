import { EventEmitter } from "events";
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
}

if (!global[SINGLETON_KEY]) {
  console.log("Init udp agent...");
  global[SINGLETON_KEY] = new UDPAgent();
}

export default global[SINGLETON_KEY];
// function litsen(port, cbMessage, cbError) {

// }
