import { Observable, Subject } from "rxjs";
import { useState, useEffect, useRef, useMemo } from "react";
import { filter, tap } from "rxjs/operators";

const electron = require("electron");
const dgram = electron.remote.require("dgram");
const net = electron.remote.require("net");

const Op = {
  intro: 0xa0,
  roller: 0xa1,
  json: 0xa2,
  atop_invite: 0x02
};

const ConnectStatus = {
  state: { notConnected: 0x01, connected: 0x02, connecting: 0x03, error: 0xff },
  text: {
    0x01: "Not connected!",
    0x02: "Connected!",
    0x03: "Connecting roller!",
    0xff: "Connect error!"
  },
  type: {
    0x01: "warning",
    0x02: "success",
    0x03: "info",
    0xff: "error"
  }
};

//TCP hook
const useTCPSocket = target => {
  const [status, setStatus] = useState(ConnectStatus.state.notConnected);
  const [receiveData, setReceiveData] = useState("");
  const socket = useRef(null);

  const validTarget = useMemo(() => {
    console.log("useTCPSocket useEffect valid target ");
    const port = target.port || undefined;
    const ip = target.ip || undefined;
    if (port && ip) {
      return target;
    } else return null;
  }, [target]);

  //const [client, setClient] = useState(new net.Socket());
  useEffect(() => {
    socket.current = new net.Socket();
    //socket.current.setTimeout(3000);
    console.log("useTCPSocket useEffect create socket ");
    if (validTarget) {
      try {
        socket.current.connect(validTarget.port, validTarget.ip, () => {
          setStatus(ConnectStatus.state.connected);
          socket.current.write("hello");
        });
      } catch (err) {
        setStatus(ConnectStatus.state.error);
        socket.current.destroy();
      }

      socket.current.on("data", rev => {
        console.log("tcp onData");
        setReceiveData(rev);
      });
      socket.current.on("close", () => {
        console.log("tcp onClose");
      });
      socket.current.on("error", () => {
        console.log("tcp onError");
        setStatus(ConnectStatus.state.error);
        socket.current.destroy();
      });
      socket.current.on("timeout", () => {
        console.log("tcp onTimeout");
        setStatus(ConnectStatus.state.error);
        socket.current.end();
      });
    }

    return () => {
      console.log("useTCPSocket clean up socket...");
      setStatus(ConnectStatus.state.notConnected);
      socket.current.end();
    };
  }, [validTarget]);

  function sendData(message) {
    console.log("useTCPSocket sendData: ", socket.current);
    if (status === ConnectStatus.state.connected) socket.current.write(message);
  }

  return [status, receiveData, sendData];
};

// UDP hook
// const [response] = useUDPLitsner(5566)
const useUDPLitsener = initPort => {
  const [response, setResponse] = useState({});
  //console.log("useUDPLitsener run......");
  useEffect(() => {
    console.log("useUDPLitsener useEffect......");
    const receiver$ = Observable.create(observer => {
      const client = dgram.createSocket({ type: "udp4", reuseAddr: true });
      console.log("response$ created bind port: ", initPort);
      client.bind(initPort);

      client.on("message", msg => {
        //console.log("response$ receive message  > ", msg);
        observer.next({ response: msg });
      });

      client.on("error", err => {
        client.close();
        observer.error(err);
      });

      client.on("close", () => {
        observer.complete();
      });

      return () => client.close();
    });

    const observer = receiver$.subscribe(
      v => {
        // console.log("udp reciever subsrube ", v);
        setResponse(v);
      },
      err => console.log("udp receiver err", err),
      () => console.log("udp receiver completet")
    );
    return () => {
      console.log("useUDPLitsener useEffect clean up...");
      observer.unsubscribe();
    };
  }, [initPort]);

  return response;
};

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

function makeRollerMessage(data, Left = true) {
  let id = data.messageNo || 0x00;
  let message = [0xa1, id, 0x00];
  message = message.concat(makeRollerPackage({ ...data }));

  return new Uint8Array(message);
}

//Return uint8Array (size=400)
function makeAtopInviteMessage() {
  const buffer = new Uint8Array(400);
  buffer[0] = 0x02;
  buffer.set([0x92, 0xda, 0x00, 0x00], 4);
  return buffer;
}

function makeMessage(op, data) {
  switch (op) {
    case Op.atop_invite:
      return makeAtopInviteMessage();
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

function test() {
  console.log("TEST");
  const subject = new Subject();
  const sender$ = subject.pipe(
    filter(v => v.ip && v.port && v.data),
    tap(v => {
      console.log("pass! ", v);
    })
  );

  sender$.subscribe(v => console.log(v));
  subject.next(1);
  subject.next({ ip: 111, data: 123, port: 456 });
}

// return true, false
function isRollerMessage(msg) {
  const isArr = msg instanceof Uint8Array || Array.isArray(msg);
  if (!isArr) {
    return false;
  }
  if (msg.length < 10) {
    return false;
  }
  if (msg[4] !== 0x55) {
    return false;
  }
  return true;
}

// msg = makeMessage(Op.roller,data);
// newMsg = assignRollerCommand(msg, command)
// if message is not valid roller message will return input msg
function assignRollerCommand(message, command) {
  if (!isRollerMessage(message)) {
    return message;
  }
  return (message[6] = command);
}

function isJSONMessage(message) {
  let buffer = Uint8Array.from(message);
  let op = String.fromCharCode(...buffer.subarray(0, 2));
  if (op === "JS") {
    try {
      let length = buffer.length - 4;
      let json = String.fromCharCode(...buffer.subarray(4, length + 4));
      JSON.parse(json);
      return json;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

const RollerParser = {
  isRollerMessage: msg => isRollerMessage(msg),
  isJSONMessage: msg => isJSONMessage(msg),
  parse: msg => {
    if (isRollerMessage(msg)) {
      return { type: "roller", message: msg };
    } else {
      const json = isJSONMessage(msg);
      if (json) {
        return { type: "json", message: json };
      } else {
        return { type: "undefined", message: {} };
      }
    }
  },
  valid: msg => isRollerMessage(msg) || isJSONMessage(msg)
};
export {
  sendMessage,
  Op,
  makeMessage,
  test,
  RollerParser,
  useUDPLitsener,
  useTCPSocket,
  ConnectStatus
};
