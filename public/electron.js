// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const ipc = require("electron").ipcMain;
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require("electron-devtools-installer");

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
    },
    icon: path.join(__dirname, "../public/AppIcon.icns"),
  });

  installExtension(REACT_DEVELOPER_TOOLS)
    .then(name => console.log(`Added Extension:  ${name}`))
    .catch(err => console.log("An error occurred: ", err));

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
  mainWindow.on("closed", function () {
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
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
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

  const client = dgram.createSocket({ type: "udp4", reuseAddr: true });




  client.bind(() => {
    client.setBroadcast(true);
    console.log("broadcasting ", "255.255.255.255", port, message);
    client.send(message, port, "255.255.255.255", err => {

      if (err) {
        client.close();
        console.log("err:", err);
      }
    });
  })


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
    event.sender.send("set_settings_done", arg);
  });
});
