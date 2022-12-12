require("dotenv").config(); // call configuration file
const { Client, LocalAuth } = require("whatsapp-web.js");
const socketIO = require("socket.io");
const express = require("express");
const { body, validationResult } = require("express-validator");
const http = require("http");
const qrcode = require("qrcode");
const fs = require("fs");
const { phoneNumberFormatter } = require("./helpers/formatter");
const { ask } = require("./ai.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const sessions = [];
const SESSIONS_FILE = "./whatsapp-sessions.json";

const createSessionsFileIfNotExists = function () {
  if (!fs.existsSync(SESSIONS_FILE)) {
    try {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
      console.log("Sessions file created successfully.");
    } catch (err) {
      console.log("Failed to create sessions file: ", err);
    }
  }
};

createSessionsFileIfNotExists();

const setSessionsFile = function (sessions) {
  fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions), function (err) {
    if (err) {
      console.log(err);
    }
  });
};

const getSessionsFile = function () {
  return JSON.parse(fs.readFileSync(SESSIONS_FILE));
};

// Check apakah nomer ini terdaftar di whatsapp?
const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
};

// Klien index.html
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

const createSession = (id) => {
  console.log("Creating session: " + id);
  // Sesi klien whatsapp
  const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", // <- this one doesn't works in Windows
        "--disable-gpu",
      ],
    },
    authStrategy: new LocalAuth({
      clientId: id,
    }),
  });

  // Initialize client whatsapp
  client.initialize();

  // Send QR ke cient
  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      io.emit("qr", { id: id, src: url });
      io.emit("message", { id: id, text: "QR Code received, scan please!" });
    });
  });

  //   Test
  client.on("message", async (message) => {
    // if (message.body === "p") {
    //   client.sendMessage(message.from, "pong");
    //   console.log(`Nomor ${message.from} mengirim pesan WA ke ${id}`);
    // }
    const prompt = message.body;
    const answer = await ask(prompt);
    const number = phoneNumberFormatter(message.from);
    if (prompt.includes("#ai")) {
      console.log(`Nomor ${message.from} menanyakan ${prompt}`);
      console.log(`AI menjawab ${answer}`);
      client.sendMessage(number, answer);
    } else {
      client.sendMessage(
        number,
        "gunakan #ai didepan pertanyaan untuk memanggil ai"
      );
    }
  });

  // On Ready id
  client.on("ready", () => {
    io.emit("ready", { id: id });
    io.emit("message", { id: id, text: "Whatsapp is ready!" });

    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    savedSessions[sessionIndex].ready = true;
    setSessionsFile(savedSessions);
  });

  //   On Authenticated
  client.on("authenticated", () => {
    io.emit("authenticated", { id: id, text: "Whatsapp is Authenticated!" });
    io.emit("message", { id: id, text: "Whatsapp is Authenticated!" });
    console.log(id, "AUTHENTICATED");
  });

  //   Auth fail messgae
  client.on("auth_failure", function (session) {
    io.emit("message", { id: id, text: "Auth failure, restarting..." });
  });

  //   DIsconnect id message
  client.on("disconnected", (reason) => {
    io.emit("message", { id: id, text: "Whatsapp is disconnected!" });
    client.destroy();
    client.initialize();

    // Menghapus pada file sessions
    const savedSessions = getSessionsFile();
    const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
    savedSessions.splice(sessionIndex, 1);
    setSessionsFile(savedSessions);

    io.emit("remove-session", id);
  });

  // Tambahkan client ke sessions
  sessions.push({
    id: id,
    client: client,
  });

  // Menambahkan session ke file
  const savedSessions = getSessionsFile();
  const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);

  if (sessionIndex == -1) {
    savedSessions.push({
      id: id,
      ready: false,
    });
    setSessionsFile(savedSessions);
  }
};

const init = function (socket) {
  const savedSessions = getSessionsFile();

  if (savedSessions.length > 0) {
    if (socket) {
      /**
       * At the first time of running (e.g. restarting the server), our client is not ready yet!
       * It will need several time to authenticating.
       *
       * So to make people not confused for the 'ready' status
       * We need to make it as FALSE for this condition
       */
      savedSessions.forEach((e, i, arr) => {
        arr[i].ready = false;
      });

      socket.emit("init", savedSessions);
    } else {
      savedSessions.forEach((sess) => {
        createSession(sess.id);
      });
    }
  }
};

init();

// Koneksi Socket
io.on("connection", function (socket) {
  init(socket);

  socket.on("create-session", (data) => {
    console.log("Create session : " + data.id);
    createSession(data.id);
  });
});

// Error Socket LOG
io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
  createSession(data.id, io);
});

// Send Message by id API
app.post("/send-message", async (req, res) => {
  console.log(req);

  const sender = req.body.sender;
  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const client = sessions.find((sess) => sess.id == sender)?.client;

  // Make sure the sender is exists & ready
  if (!client) {
    return res.status(422).json({
      status: false,
      message: `The sender: ${sender} is not found!`,
    });
  }

  /**
   * Check if the number is already registered
   * Copied from app.js
   *
   * Please check app.js for more validations example
   * You can add the same here!
   */
  const isRegisteredNumber = await client.isRegisteredUser(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: "The number is not registered",
    });
  }

  client
    .sendMessage(number, message)
    .then((response) => {
      res.status(200).json({
        status: true,
        response: response,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        response: err,
      });
    });
});

server.listen(8080, function () {
  console.log("App running on" + 8080);
});
