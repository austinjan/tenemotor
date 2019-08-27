import React from "react";
import { Button } from "antd";
import map from "ramda/src/map";

const ConnectSocket = React.memo(
  ({ rollers, connecting, connect, disconnect }) => {
    const Sockets =
      rollers.length > 0 ? (
        map(roller => {
          const { ip, port = 5566 } = roller;
          return (
            <div className="ui__bar" key={ip}>
              <span className="bar_anchor">
                {ip || "undefined ip"}: {port || "undefined port"}{" "}
              </span>
              {connecting ? (
                <Button type="danger" onClick={disconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    connect({ ip, port });
                  }}
                >
                  Connect
                </Button>
              )}
            </div>
          );
        }, rollers)
      ) : (
        <div className="ui__bar">
          {" "}
          <span>No roller</span>
        </div>
      );
    return <div>{Sockets}</div>;
  }
);

ConnectSocket.defaultProps = {
  rollers: [],
  connecting: false,
  connect: () => {},
  disconnect: () => {}
};

export default ConnectSocket;
