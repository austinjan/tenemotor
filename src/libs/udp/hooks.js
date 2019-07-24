import { useState, useEffect, useReducer, useCallback } from "react";
import { Observable } from "rxjs";
import {
  MessageParser,
  makeMessage,
  DEFAULT_UDP_BROADCASTING_PORT,
  Op
} from "libs/roller/rollerutils";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

// UDP hook
// const [response] = useUDPLitsner(5566)
const useUDPLitsener = initPort => {
  const [response, setResponse] = useState({});
  useEffect(() => {
    // console.log("useUDPLitsener useEffect......");
    const receiver$ = Observable.create(observer => {
      const client = dgram.createSocket({ type: "udp4", reuseAddr: true });
      // console.log("response$ created bind port: ", initPort);
      client.bind(initPort);

      client.on("message", msg => {
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
      // console.log("useUDPLitsener useEffect clean up...");
      observer.unsubscribe();
    };
  }, [initPort]);

  return response;
};

function rollerReducer(rollers, action) {
  switch (action.type) {
    case "INVITE":
      const roller = action.payload;
      const index = rollers.findIndex(item => {
        return item.mac === roller.mac;
      });
      if (rollers[index] === roller) return rollers;
      if (index >= 0) {
        rollers.splice(index, 1, roller);
      } else {
        rollers.push(roller);
      }
      return [...rollers];
    default:
      return rollers;
  }
}

// use to process atop monitor protocol
/**
 * const [rollers, Scan] = useAtopUDPMonitor(55954);
 * @param {*} initPort port number
 * return [rollers, Scan]
 */
const useAtopUDPMonitor = initPort => {
  const response = useUDPLitsener(initPort);

  const [rollers, dispatchRollers] = useReducer(rollerReducer, []);
  useEffect(() => {
    const real_response = response.response || response;
    if (!MessageParser.valid(real_response)) return;

    const msg = MessageParser.parse(real_response);

    switch (msg.type) {
      case "json":
        const resItem = JSON.parse(msg.message);
        if ("mac" in resItem) {
          resItem.key = resItem.mac;
          dispatchRollers({ type: "INVITE", payload: resItem });
        }
        break;
      case "roller":
        break;
      default:
        break;
    }
  }, [response]);

  const scan = useCallback(() => {
    const message = makeMessage(Op.atop_invite);
    //console.log("scan :", message);
    require("electron").ipcRenderer.send("broadcasting", {
      message,
      port: DEFAULT_UDP_BROADCASTING_PORT
    });
  }, []);
  return [rollers, scan];
};

export { useUDPLitsener, useAtopUDPMonitor };
