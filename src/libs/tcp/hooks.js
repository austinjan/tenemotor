import { useEffect, useState, useRef, useMemo } from "react";
import mergeLeft from "ramda/src/mergeLeft";
const net = require("electron").remote.require("net");

/**
 * Connect to socket
 * const [currentStatus, tcpResponse, sendData] = useTCPSocket(destination);
 * @param {*} target {ip,port=5566}
 * @returns [status, receiveData, sendData];
 *  - status {message, type} can pass to <ConnectionAlert>  ex: <ConnectAlert {...status} />
 *  - rereceiveData: response from remote tcp socket.
 *  - sendData() : sendData()
 */
const useTCPSocket = target => {
  const [status, setStatus] = useState({
    message: "",
    type: "info",
    connected: false
  });
  const [receiveData, setReceiveData] = useState([]);
  const socket = useRef(null);

  const validTarget = useMemo(() => {
    const _t = mergeLeft(target, { port: 5566 });
    console.log("useTCPSocket useEffect valid target ", _t);

    const ip = target.ip || undefined;
    if (ip) {
      return _t;
    } else return null;
  }, [target]);

  useEffect(() => {
    socket.current = new net.Socket();
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
      socket.current.removeAllListeners("timeout", () => {});
    };
  }, [validTarget]);

  /**
   *
   * @param String|Uint8Array message
   */
  function sendData(message) {
    try {
      const success = socket.current.write(message);
      if (success)
        setStatus(pre => ({
          ...pre,
          type: "success",
          message: `Write data to ${validTarget.ip}:${
            validTarget.port
          } success!!`
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

export { useTCPSocket };
