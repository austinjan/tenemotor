const electron = require("electron");
const dgram = electron.remote.require("dgram");

class UDPAgent {
  constructor() {
    this.client = dgram.createSocket("udp4");
  }

  emit = data => {
    this.client.send(data, 58375, "192.168.33.182", err => {
      console.log(err);
      this.client.close();
    });
  };
}

export default UDPAgent;
