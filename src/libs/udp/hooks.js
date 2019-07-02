import { useState, useEffect } from "react";
import { Observable } from "rxjs";
const electron = require("electron");
const dgram = electron.remote.require("dgram");

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

export { useUDPLitsener };
