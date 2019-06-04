import { Observable } from "rxjs";
import { race, of } from "rxjs";
import {
  filter,
  map,
  catchError,
  delay,
  takeWhile,
  concatMap,
  tap
} from "rxjs/operators";
import { getUdpObservable } from "./udputils";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

const Op = {
  intro: 0xa0,
  roller: 0xa1,
  json: 0xa2
};

//{id:01, success:}
/**
 * 
 * @param {number} id 
 * @return {Observable} response obserable
 * example: 
 * race(teakRollerResponse(id), timeout$).subscribe(
    val => console.log("Res: ", val),
    err => console.log("Res err: ", err)
  );
 */
function teakRollerResponse(id, port = 5566) {
  return getUdpObservable(port).pipe(
    filter(v => {
      let buffer = Uint8Array.from(v.msg);
      let op = String.fromCharCode(...buffer.subarray(0, 2));
      return op !== "JS";
    }),
    map(v => {
      return v.msg;
    }),
    filter(v => v[1] === id)
  );
}

const timeout$ = of("timeout").pipe(
  delay(3000),
  map(_ => {
    throw "Time out";
  })
);

// roller package
// OP | MsgID | Flag1 | Flag2 | Roller Package ... |
function takeSendWithResponseObservable(message, ip, port = 5566) {
  return Observable.create(subscriber => {
    try {
      const client = dgram.createSocket({ type: "udp4", reuseAddr: true });
      // console.log("sendMessage created socket.");
      client.send(message, port, ip, err => {
        client.close();
        subscriber.next({ message, ip, port });
        if (err) {
          subscriber.error(err);
        }
      });
    } catch (err) {
      subscriber.error(err);
    }
  }).pipe(
    takeWhile(v => {
      return [0xa0, 0xa1].includes(v.message[0]);
    }),
    concatMap(v => {
      return race(teakRollerResponse(v.message[1], v.port), timeout$);
    })
  );
}

/**
 * @description Make package will send to Tene roller control card.
 * @param {object} settings {command:byte, rw: 0x00|0x01, data: Uint8Array}

 * @returns {Array} roller package array
 */
function makeRollerPackage(settings) {
  const { command = 0x00, rw = 0x01, data = new Uint8Array() } = settings;

  let length = data.length || 0;
  length += 2;
  let rawPackage = [0x55, length, command, rw];
  let checkSum = 0;
  data.forEach(v => {
    rawPackage.push(v);
    checkSum += v;
  });
  rawPackage.push(checkSum & 255);
  rawPackage.push(0x00);

  return rawPackage;
}

/**
 * @return {Uint8Array} message
 */
function makeIntroMessage() {
  let message = [0xa0, 0x00, 0x00, 0x00];
  message = message.concat(makeRollerPackage({}));
  return new Uint8Array(message);
}

function makeRollerMessage(data) {
  // console.log("makeRollerMessage: ", data);
  let id = data.messageNo || 0x00;
  let message = [0xa1, id, 0x00, 0x00];
  message = message.concat(makeRollerPackage({ ...data }));
  // console.log("makeRollerMessage: pkg - ", message);
  return new Uint8Array(message);
}

function makeMessage(op, data) {
  switch (op) {
    case Op.intro:
      return makeIntroMessage();

    case Op.roller:
      return makeRollerMessage(data);

    case Op.json:
      return data;

    default:
      return new Uint8Array([0x00, 0x00, 0x00, 0x00]);
  }
}

/** @description Sending message to udp://ip:port
 * @param {Uint8Array} message The content will send.
 */
function sendMessage(message, ip, port = 5566) {
  // console.log("sendMessage!");
  const client = dgram.createSocket({ type: "udp4", reuseAddr: true });
  // console.log("sendMessage created socket.");
  client.send(message, port, ip, err => {
    client.close();
    if (err) throw err;
  });
}

export { sendMessage, Op, makeMessage, takeSendWithResponseObservable };
