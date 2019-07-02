import { Observable } from "rxjs";
import { filter, map, catchError } from "rxjs/operators";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

// => Observable
// sample let listen$ = udplisten(5566)
function getUdpObservable(port) {
  return new Observable(subscribe => {
    //console.log("observerable be subscribed.");
    let udp = dgram.createSocket({ type: "udp4", reuseAddr: true });
    try {
      udp.bind(port);
    } catch (err) {
      subscribe.error(err);
      udp.close();
    }

    udp.on("message", (msg, rinfo) => {
      subscribe.next({ msg, rinfo });
    });

    udp.on("error", err => {
      subscribe.error(err);
      udp.close();
    });

    udp.on("listening", () => {
      console.log("udp observerable listen ", port);
    });

    return function unsubscribe() {
      udp.close();
    };
  });
}

function jsonResponse(udp$) {
  try {
    return udp$.pipe(
      filter(v => {
        let buffer = Uint8Array.from(v.msg);
        let op = String.fromCharCode(...buffer.subarray(0, 2));
        return op === "JS";
      }),
      map(v => {
        let buffer = v.msg && Uint8Array.from(v.msg);
        let length = buffer.length - 4;

        let json = String.fromCharCode(...buffer.subarray(4, length + 4));

        let response = JSON.parse(json);
        return response;
      }),
      catchError((err, source) => {
        console.log("udputils err ", err);
        return source;
      })
    );
  } catch (err) {
    console.log("Cant create json response observerble stream..");
  }
}

/** @description Sending udp message to udp://ip:port
 * @param {Uint8Array} message The content will send.
 */
function sendUDPMessage(message, ip, port = 5566) {
  // console.log("sendMessage!");
  const client = dgram.createSocket({ type: "udp4", reuseAddr: true });
  //client.setBroadcast(true);
  // client.bind(()=>{
  //   client.setBroadcast(true);
  // })

  // console.log("sendMessage created socket.");
  client.send(message, port, ip, err => {
    client.close();
    if (err) console.log(err);
  });
}

export { getUdpObservable, jsonResponse, sendUDPMessage };
