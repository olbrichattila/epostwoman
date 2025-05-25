const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const axios = require("axios");
const http = require("http");
const path = require("path");

const {
  OpenDatabase,
  CloseDatabase,
  GetCollections,
  SaveCollection,
  LoadCollection,
  DeleteCollection,
  RenameCollection,
} = require("./database");

// const isDev = require("electron-is-dev");
const fs = require("fs");

OpenDatabase();

const isDev = true;

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
      additionalArguments: [`--isDev=${isDev}`],
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

const getAllCollections = (event) => {
  GetCollections((err, data) => {
    if (!err) {
      event.reply("collection-response", data);
    }
  });
};

// HTTP call:
ipcMain.on("http-request", (event, url, method, payload, headers) => {
  headers = convertHeader(headers);
  if (!headers["User-Agent"]) {
    headers["User-Agent"] = "PostWoman/1.0";
  }
  axios
    .request({
      method: method,
      url: url,
      data: payload,
      responseType: "text",
      headers,
    })
    .then((response) => {
      const data = {
        headers: response.headers,
        data: response.data,
        status: response.status,
        statusText: response.statusText,
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
        url: req.url
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

ipcMain.on("get-collections", getAllCollections);

ipcMain.on("save-collection", (event, collectionName, data) => {
  SaveCollection(collectionName, JSON.stringify(data), () =>
    getAllCollections(event)
  );
});

ipcMain.on("delete-collection", (event, collectionName) => {
  DeleteCollection(collectionName, () => getAllCollections(event));
});

ipcMain.on("rename-collection", (event, oldName, newName) => {
  RenameCollection(oldName, newName, () => getAllCollections(event));
});

ipcMain.on("load-collection", (event, collectionName) => {
  LoadCollection(collectionName, (err, data) => {
    if (!err) {
      event.reply("load-response", JSON.parse(data["collection"]));
    }
  });
});

ipcMain.on('show-context-menu', (event, params) => {
  if (!isDev) {
    return
  }
  const win = BrowserWindow.fromWebContents(event.sender);
  const menu = Menu.buildFromTemplate([
    {
      label: 'Inspect Element',
      click: () => {
        win.webContents.inspectElement(params.x, params.y);
      },
    },
  ]);
  menu.popup({ window: win });
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  CloseDatabase();
  for (const port in servers) {
    servers[port].close();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
