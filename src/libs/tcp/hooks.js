// @flow
import React, { useEffect, useState, useRef, useMemo } from "react";
import mergeLeft from "ramda/src/mergeLeft";
import { string } from "postcss-selector-parser";

const net = require("electron").remote.require("net");

/**
 * Connect to socket
 * const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);
 * @param target {ip,port=5566}
 * @param {string} target.ip  IP address of target
 * @param {number} [target.port=5566]
 * @returns [status, receiveData, sendData];
 *  - status {message, type} can pass to <ConnectionAlert>  ex: <ConnectAlert {...status} />
 *  - rereceiveData: response from remote tcp socket.
 *  - sendData() : sendData()
 */
const useTCPSocket = (
  target: { ip: string, port?: number } | {}
): [mixed, mixed, Function] => {
  const [status, setStatus] = useState({
    message: "",
    type: "info",
    connected: false
  });
  const [receiveData, setReceiveData] = useState([]);
  const socket = useRef(new net.Socket());

  const validTarget = useMemo(() => {
    const _t = mergeLeft(target, { port: 5566 });
    console.log("useTCPSocket useEffect valid target ", _t);

    const ip = target.ip || undefined;
    if (ip) {
      return _t;
    } else return null;
  }, [target]);

  useEffect(() => {
    // socket.current = new net.Socket();
    //socket.current.setTimeout(3000);
    console.log("useTCPSocket useEffect create socket ");
    if (validTarget) {
      try {
        socket.current.connect(validTarget.port, validTarget.ip, () => {
          setStatus(pre => ({
            ...pre,
            type: "info",
            message: `Connect to ${validTarget.ip}:${
              validTarget.port
            } success!`,
            connected: true
          }));
          socket.current.write("hello");
        });
      } catch (err) {
        setStatus(pre => ({
          ...pre,
          type: "error",
          message: `Error ${err}`,
          connected: false
        }));
        socket.current.destroy();
      }

      socket.current.on("data", rev => {
        if (rev[0] === 82) return;
        console.log("tcp onData : ", rev);
        const hexString = rev.reduce(
          (memo, i) => memo + " 0x" + ("0" + i.toString(16)).slice(-2),
          ""
        );
        setStatus(pre => ({
          ...pre,
          type: "info",
          message: `Socket recev data: ${hexString}`
        }));
        setReceiveData(rev);
      });

      socket.current.on("close", () => {
        console.log("tcp onClose");
        setStatus(pre => ({
          ...pre,
          type: "warning",
          message: `Socket closed !`,
          connected: false
        }));
      });

      socket.current.on("error", err => {
        console.log("tcp onError", err);
        setStatus(pre => ({
          ...pre,
          type: "error",
          message: `Error ${err}`,
          connected: false
        }));
        socket.current.destroy();
      });

      socket.current.on("timeout", () => {
        console.log("tcp onTimeout");
        setStatus(pre => ({
          ...pre,
          type: "error",
          message: `Timeout when connect to ${validTarget.ip}:${
            validTarget.port
          }`,
          connected: false
        }));
        socket.current.end();
      });
    }

    return () => {
      console.log("useTCPSocket clean up socket...");
      setStatus(pre => ({ ...pre, type: "info", message: "" }));
      socket.current.end();
      socket.current.removeAllListeners("data", () => {});
      socket.current.removeAllListeners("error", () => {});
      socket.current.removeAllListeners("close", () => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
      socket.current.removeAllListeners("timeout", () => {});
    };
  }, [validTarget]);

  /**
   *
   * @param String|Uint8Array message
   */
  function sendData(message) {
    if (!validTarget) throw Error("Target lost ip property.");
    try {
      const success = socket.current.write(message);
      const { ip = "0.0.0.0", port = "0000" } = validTarget;
      if (success)
        setStatus(pre => ({
          ...pre,
          type: "success",
          message: `Write data to ${ip}:${port} success!!`
        }));
    } catch (err) {
      setStatus(pre => ({
        ...pre,
        type: "error",
        message: `Send data error ${err}`
      }));
    }
  }

  return [status, receiveData, sendData];
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
 */
const usePolling = (opt: Option, message: Array<string | Uint8Array>) => {
  const { ip, port = 5566, interval = 1000, onData, onError = err => {} } = opt;
  const version = React.version.split("-");
  if (version[0] < "16.7.0") {
    throw new Error(
      "Hooks are only supported in React 16.7.0-alpha release or above"
    );
  }

  const [isPolling, setPolling] = useState(false);

  const socket = useRef(new net.Socket());
  const connecting = useRef(false);
  const timerID = useRef();

  useEffect(() => {
    try {
      socket.current.connect(port, ip);
      connecting.current = true;
    } catch (err) {
      onError(err);
      connecting.current = false;
      socket.current.destroy();
    }
    return () => {
      console.log("usePolling clean up socket...");

      socket.current.end();
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
    if (connecting.current) {
      if (timerID.current) {
        clearTimeout(timerID.current);
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
      const timeoutID = setTimeout(() => {}, interval);
      timerID.current = timeoutID;
    }
  };
};

export { useTCPSocket, usePolling };
