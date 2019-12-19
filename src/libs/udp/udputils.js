import { Observable } from "rxjs";
import { filter, map, catchError } from "rxjs/operators";
import {
  MessageParser,
  makeMessage,
  DEFAULT_UDP_BROADCASTING_PORT,
  Op
} from "libs/roller/rollerutils";

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
  console.log("sendMessage!", ip, port);
  const client = dgram.createSocket({ type: "udp4", reuseAddr: true });

  client.send(message, port, ip, err => {
    client.close();
    if (err) console.log(err);
  });
}

function fetchRollers(): Promise<any> {



  const client = dgram.createSocket({ type: "udp4", reuseAddr: true });

  return new Promise((resolve, reject) => {
    const responses = [];
    try {
      client.bind(55954);
      const message = makeMessage(Op.atop_invite);
      //console.log("scan :", message);
      require("electron").ipcRenderer.send("broadcasting", {
        message,
        port: DEFAULT_UDP_BROADCASTING_PORT
      });
    } catch (err) {
      reject(err);
    }
    client.on("error", err => {
      reject(err);
    });

    setTimeout(() => {
      //resolve(responses);
      reject(new Error("Time out!"))
      client.close();
    }, 5000);

    client.on("message", data => {

      if (!MessageParser.valid(data)) return;

      const msg = MessageParser.parse(data);

      switch (msg.type) {
        case "json":
          const resItem = JSON.parse(msg.message);
          if ("mac" in resItem) {
            responses.push(resItem);
            resolve(responses)
          }
          break;
        case "roller":
          break;
        default:
          break;
      }
    });
  });


}

export { getUdpObservable, jsonResponse, sendUDPMessage, fetchRollers };
