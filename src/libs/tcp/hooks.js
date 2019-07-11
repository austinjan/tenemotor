import { useEffect, useState, useRef, useMemo } from "react";
const net = require("electron").remote.require("net");

//TCP hook
// return [status, response, sendData]
// status = {message, type}
const useTCPSocket = target => {
  const [status, setStatus] = useState({ message: "", type: "info" });
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
          setStatus(pre => ({
            ...pre,
            type: "info",
            message: `Connect to ${validTarget.ip}:${validTarget.port} success!`
          }));
          socket.current.write("hello");
        });
      } catch (err) {
        setStatus(pre => ({ ...pre, type: "error", message: `Error ${err}` }));
        socket.current.destroy();
      }

      socket.current.on("data", rev => {
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
          message: `Socket closed !`
        }));
      });

      socket.current.on("error", err => {
        console.log("tcp onError");
        setStatus(pre => ({ ...pre, type: "error", message: `Error ${err}` }));
        socket.current.destroy();
      });

      socket.current.on("timeout", () => {
        console.log("tcp onTimeout");
        setStatus(pre => ({
          ...pre,
          type: "error",
          message: `Timeout when connect to ${validTarget.ip}:${
            validTarget.port
          }`
        }));
        socket.current.end();
      });
    }

    return () => {
      console.log("useTCPSocket clean up socket...");
      setStatus(pre => ({ ...pre, type: "info", message: "" }));
      socket.current.end();
    };
  }, [validTarget]);

  function sendData(message) {
    console.log("useTCPSocket sendData: ", socket.current);
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
