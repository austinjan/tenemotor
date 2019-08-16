// @flow
import { makeMessage, Op } from "libs/roller";

const net = require("electron").remote.require("net");

/**
 * Fetch roller settings.
 * @param {string} ip Roller ip address.
 * @returns {Promise} Response
 */
function fetchSettings(ip: string): Promise<any> {
  const socket = new net.Socket();
  socket.connect(5566, ip, () => {
    console.log(`Client connected to: ${ip} :  5566`);
  });

  return new Promise((resolve, reject) => {
    const message = makeMessage(Op.get_settings);
    socket.write(message);

    socket.on("data", data => {
      if (data[0] === 82) return;
      resolve(data);
      socket.destroy();
    });

    socket.on("error", err => {
      reject(err);
    });
  });
}

/**
 * Send msg to ip by tcp socket
 * @param {string} ip ip4 address
 * @param {string} msg message want to send
 * @returns {Promise} Response
 */
function sendTo(ip: string, msg: Uint8Array): Promise<any> {
  const socket = new net.Socket();
  socket.connect(5566, ip, () => {
    console.log(`Client connected to: ${ip} :  5566`);
  });

  return new Promise((resolve, reject) => {
    if (!socket.write(msg)) {
      socket.once("drain", () => {
        reject("Socket write buffer full!");
      });
    }

    socket.on("data", data => {
      if (data[0] === 82) return;
      socket.destroy();
      resolve(data);
    });

    socket.on("error", err => {
      socket.destroy();
      reject(err);
    });
  });
}

export { fetchSettings, sendTo };
