const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const morgan = require("morgan");


require("dotenv").config();

const io = new Server(server,{
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
  },
});

const fs = require("fs");
const path = require("path");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))

mongoose.connect(process.env.mongodb2);

// routes

const complainRoute = require("./routers/complaint");
const kelasRoutes = require("./routers/kelas");
const materiRoutes = require("./routers/materi");
const userRoutes = require("./routers/user");
const tugasRoutes = require("./routers/tugas");
const sertifikatRoutes = require("./routers/sertifikat");
const kategoriRoutes = require("./routers/kategori");
// routes

app.use("/complaint/", complainRoute);
app.use("/kelas/", kelasRoutes);
app.use("/materi/", materiRoutes);
app.use("/user/", userRoutes);
app.use("/tugas/", tugasRoutes);
app.use("/sertifikat/", sertifikatRoutes);
app.use("/kategori/", kategoriRoutes);

const uploadsDirectory = path.join(__dirname, "upload");

app.use("/upload", express.static(uploadsDirectory));

app.get("/", (req, res) => {
  res.send("bismillah hirrohman nirrohim");
});

io.on('connection', (socket) => {
  console.log('User connected to socket!');
});

server.listen(process.env.local_port, () => {
  console.log(`Server dimulai pada server ${process.env.local_port}`);
});
