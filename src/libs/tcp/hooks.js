// @flow
import React, { useEffect, useState, useRef } from "react";

const net = require("electron").remote.require("net");

type APIs = {
  connect: (ip: string, port: number | string) => void,
  disconnect: () => void,
  send: (msg: string | Uint8Array) => void
};

type OnDataFunc = (data: Uint8Array) => void;
type Return = { api: APIs, connecting: boolean };

/**
 * Connect to socket
 * const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);
 * @param target {ip,port=5566}
 * @param {string} target.ip  IP address of target
 * @param {number} [target.port=5566]
 * @returns {api, connecting}
 *  - api {connect, disconnect, send}
 *  - connecting: boolean connecting state.
 *  - sendData() : sendData()
 */
const useTCPSocket = ({
  onData,
  onError
}: {
  onData?: OnDataFunc,
  onError?: (err: mixed) => void
}): Return => {
  const [connecting, setConnecting] = useState(false);
  const [destSocket, setDestSocket] = useState({ ip: "", port: 5566 });

  const socket = useRef(new net.Socket());

  const cleanUp = () => {
    console.log("xxxxx useTCPSocket close socket xxxxxx");
    socket.current.removeAllListeners("data", () => {});
    socket.current.removeAllListeners("error", () => {});
    socket.current.removeAllListeners("close", () => {});
    socket.current.destroy();
    setConnecting(false);
  };

  const listenSocktEvent = () => {
    socket.current.on("data", data => {
      if (typeof onData === "function") {
        onData(data);
      }
    });

    socket.current.on("error", err => {
      console.log("useTCPSoket error :", err);
      if (typeof onError === "function") {
        onError(err);
      }
    });
    socket.current.on("close", () => {
      console.log("socket close");

      // cleanUp();
    });
  };

  const doConnect = (dest?: { ip: string, port: number | string }) => {
    const { ip, port } = dest || destSocket;
    console.log(`doConnect ${ip}:${port}`);

    try {
      socket.current.connect(port, ip, () => {
        setConnecting(true);
        listenSocktEvent();
        setDestSocket({ ip, port });
      });
    } catch (err) {
      socket.current.destroy();
      if (typeof onError === "function") {
        onError(err);
      }
    }
  };

  const connect = (ip: string, port: number | string = 5566): void => {
    if (connecting) {
      disconnect();
      setTimeout(() => doConnect(), 1000);
    }
    doConnect({ ip, port });
  };

  function send(message: string | Uint8Array) {
    try {
      socket.current.write(message);
    } catch (err) {
      console.log("useTCPSocket send() error: ", err);
    }
  }

  const disconnect = () => {
    console.log("useTCPSocket disconnect ");
    if (!connecting) return;

    cleanUp();
  };

  return {
    api: {
      send,
      connect,
      disconnect
    },
    connecting
  };
};

type Option = {
  ip: string,
  port: number,
  interval: number,
  onData: Function,
  onError: Function
};

/**
 * polling roller status
 * @param opt options
 * @param {string} opt.ip roller IP address.
 * @param {number} [opt.port=5566] roller listen port
 * @param {number} [opt.interval=1000] interval ms
 * @param {Function} opt.onData callback function when receive roller response
 * @param {Function} [opt.onError] callback function when error happen.
 * @param {string | Uint8Array} message data want to sent
 * const [start,stop, polling ] = usePolling(opt:{
 *  ip:"192.168.33.111",
 *  port:5566 //option,
 *  interval = 1000, //default 1000ms
 *  onData = callback when response,
 *  onError = callback when error happen.
 * },[
 * Uint8Array.from([0xA1,ID,0x00,0x00,0x55,0x02,0x01,0x01,0x02,0x00]),
 * Uint8Array.form([0xA1,ID,0x00,0x00,0x55,0x02,0x02,0x01,0x03,0x00]),
 * Uint8Array.form([0xA1,ID,0x00,0x00,0x55, 0x2, 0x3, 0x1, 0x4 ,0x0])
 * ])
 */
const usePolling = (opt: Option, message: Array<string | Uint8Array>) => {
  const { ip, port = 5566, interval = 1000, onData, onError = err => {} } = opt;
  // const version = React.version.split("-");
  // if (version[0] < "16.7.0") {
  //   throw new Error(
  //     "Hooks are only supported in React 16.7.0-alpha release or above"
  //   );
  // }

  const [isPolling, setPolling] = useState(false);

  const socket = useRef(new net.Socket());
  const connecting = useRef(false);
  const timerID = useRef();

  useEffect(() => {
    try {
      socket.current.connect(port, ip);
      console.log("usePolling connected ", ip);

      connecting.current = true;
    } catch (err) {
      onError(err);
      connecting.current = false;
      socket.current.destroy();
    }
    return () => {
      console.log("usePolling clean up socket...");

      socket.current.destroy();
      socket.current.removeAllListeners("data", () => {});
      socket.current.removeAllListeners("error", () => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ip, port]);

  socket.current.on("data", data => onData(data));
  socket.current.on("error", err => {
    onError(err);
    connecting.current = false;
    socket.current.destroy();
  });

  const stopPolling = () => {
    if (!isPolling) return;
    if (connecting.current) {
      if (timerID.current) {
        clearInterval(timerID.current);
        timerID.current = null;
      }
      setPolling(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    runPolling();
  };

  const runPolling = () => {
    if (connecting.current) {
      const timeoutID = setInterval(() => {
        message.forEach((msg, index) => {
          setTimeout(() => {
            try {
              socket.current.write(msg);
              console.log("usePolling sending ", msg);
            } catch (err) {
              console.log("usePolling send err ", err);
            }
          }, 500 * index);
        });
      }, interval);
      timerID.current = timeoutID;
    }
  };

  return [startPolling, stopPolling, isPolling];
};

export { useTCPSocket, usePolling };
