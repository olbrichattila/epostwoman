const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const axios = require("axios");
const http = require("http");
const path = require("path");
// const isDev = require("electron-is-dev");
const fs = require("fs");

const isDev = false;

const settingsPath = path.join(app.getPath("userData"), "settings.json");
let mainWindow;
let servers = {};

app.disableHardwareAcceleration();
function convertHeader(headers) {
  return headers.reduce((prev, curr) => {
    if (curr.key !== "" && curr.value !== "") {
      prev[curr.key] = curr.value;
    }
    return prev;
  }, {});
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(app.getAppPath(), "build", "index.html")}`
  );

  if (isDev) {
   mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

// HTTP call:
ipcMain.on("http-request", (event, url, method, payload, headers) => {
  axios
    .request({
      method: method,
      url: url,
      data: payload,
      responseType: "text",
      headers: convertHeader(headers),
    })
    .then((response) => {
      const data = {
        headers: response.headers,
        data: response.data,
      };
      event.reply("http-response", data);
    })
    .catch((error) => {
      event.reply("http-response", {
        error: true,
        message: error.message,
        code: error.code,
      });
    });
});

// Start the web server
ipcMain.on("start-server", (event, port, responseBody, headers) => {
  let server = servers[port];
  if (server) {
    event.reply("server-response", "Server is already running.");
    return;
  }

  server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    for (let i = 0; i < headers.length; i++) {
      res.setHeader(headers[i].key, headers[i].value);
    }

    req.on("end", () => {
      mainWindow.webContents.send("request-received", {
        port: port,
        headers: req.headers,
        body: body,
        method: req.method,
        url: req.url,
      });

      res.end(responseBody);
    });
  });

  servers[port] = server;
  server.listen(port, () => {
    event.reply("server-response", `Server started on port ${port}`);
  });
});

// Stop the web server
ipcMain.on("stop-server", (event, port) => {
  let server = servers[port];
  if (!servers[port]) {
    event.reply("server-response", "Server is not running.");
    return;
  }

  server.close(() => {
    delete servers[port];
    event.reply("server-response", "Server stopped.");
  });
});

ipcMain.on("get-server-status", (event, port) => {
  event.reply("server-status", !!servers[port]);
});

// Stop the web server
ipcMain.on("save-state", (event, data) => {
  fs.writeFileSync(settingsPath, JSON.stringify(data));
});

ipcMain.on("load-state", (event) => {
  try {
    if (fs.existsSync) {
      const content = fs.readFileSync(settingsPath, "utf-8");
      const obj = JSON.parse(content);
      event.reply("load-response", obj);
      return
    }

    event.reply("load-response", {});
    
  } catch (error) {
    event.reply("load-response", {});
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  for (const port in servers) {
    servers[port].close();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
