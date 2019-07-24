// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const ipc = require("electron").ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
      // nodeIntegrationInWorker: false,
      // preload: "./preload.js"
    }
  });

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipc.on("broadcasting", (event, arg) => {
  //console.log("broadcasting.....", event, arg);
  const { message, port } = arg;
  const dgram = require("dgram");
  //const broadcastAddress = require("broadcast-address");
  const client = dgram.createSocket({ type: "udp4", reuseAddr: true });
  //const ip = broadcastAddress();
  //client.setBroadcast(true);
  client.bind(() => {
    client.setBroadcast(true);
    console.log("broadcasting ", "255.255.255.255", port, message);
    client.send(message, port, "255.255.255.255", err => {
      client.close();
      if (err) console.log("err:", err);
    });
  });
});

ipc.on("getSettings", (event, arg) => {
  const pws = process.cwd();
  const settingsFilePath = require("path").join(pws, "settings.json");
  const fs = require("fs");
  fs.readFile(settingsFilePath, (err, buffer) => {
    if (err) {
      event.sender.send("settings_err", err);
      return;
    }

    event.sender.send("response_settings", buffer.toString("utf8"));
  });
});

ipc.on("setSettings", (event, arg) => {
  const pws = process.cwd();
  const settingsFilePath = require("path").join(pws, "settings.json");
  const fs = require("fs");
  fs.writeFile(settingsFilePath, arg, err => {
    if (err) {
      event.sender.send("settings_err", err);
      return;
    }
    event.sender.send("response_settings", arg);
  });
});
