const electron = require("electron");
const dgram = electron.remote.require("dgram");

// -> Socket EventEmitter
// function listen(port) {
//   const server = dgram.createSocket("udp4");
//   server.bind(port);
// }

// class UDPAgent {
//   constructor() {
//     this.client = dgram.createSocket("udp4");
//   }

//   emit = data => {
//     this.client.send(data, 58375, "192.168.33.182", err => {
//       console.log(err);
//       this.client.close();
//     });
//   };
// }
