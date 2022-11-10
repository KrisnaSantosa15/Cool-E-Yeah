const { Client } = require("whatsapp-web.js");
const express = require("express");
const socketIO = require("socket.io");
const qrcode = require("qrcode");
const http = require("http");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

const client = new Client();

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED", session);
});

client.on("message", async (msg) => {
  if (msg.body === "!everyone") {
    const chat = await msg.getChat();

    let text = "";
    let mentions = [];

    for (let participant of chat.participants) {
      const contact = await client.getContactById(participant.id._serialized);

      mentions.push(contact);
      text += `@${participant.id.user}`;
    }

    chat.sendMessage(text + " *ATTENTION PLEASE* ", { mentions });
  } else if (msg.body === "!jadwal") {
    const chat = await msg.getChat();
    chat.sendMessage(
      `			*Jadwal Kuliah RPL 1B*
			*Senin*
			09.30 - 12.00 | PRPL
			13.00 - 15.30 | Inggris	

			*Selasa*
			13.00 - 14.40 | Kalkulus
			14.40 - 16.20 | PAI

			*Rabu*
			09.30 - 12.00 | Daspro
			14.40 - 16.20 | PKN			

			*Kamis*
			10.20 - 12.00 | PMM			
			13.00 - 14.40 | Indonesia	
			`
    );
  } else if (msg.body == "!dosen") {
    const chat = await msg.getChat();
    chat.sendMessage(
      `			*Dosen RPL 1B*
			-------------------------------
			*Asep Rudi Nurjaman, M.Pd.I.* | PAI		
			*Dian Anggraini, MT.* | PRPL		
			*Fully Rakhmayanti, M.Pd.* | Indonesia		
			*Hendriyana, M.Kom.* | PMM		
			*Indira Syawanodya, M.Kom.* | Daspro		
			*Raditya Muhammad, MT* | Kalkulus		
			*Yayang Furi Furnamasari, M.Pd.* | PKN		
			*Winti Ananthia, M.Ed.* | Inggris
			`
    );
  } else if (msg.body.startsWith("!absen")) {
    const chat = await msg.getChat();
    if (msg.body.slice(7)) {
      let siswa = [
        "Data Tidak Ditemukan",
        "AGUNG FATHUL MUHTADIN",
        "AKMAL HADI SYAPUTRA",
        "AKWAN CAKRA TAJIMALELA",
        "ALFIA APRIL RIANI",
        "ALY RACHMAN HIDAYAT",
        "ANGGO MAULANA PUTRA",
        "BAGOES ELDINE SADEWA",
        "BILLDAN SATRIANA ROSEANDREE",
        "CHANDRA MUKTI GIMNASTIYAR",
        "DAVIN GHANI ANANTA KUSUMA",
        "DEYAN LAUDZA PASHA",
        "DHOWY ANJA ALHUSNA",
        "DIMAS ADISTA PERDANA",
        "DWI GUMARANG SHAKTI",
        "FARHAN ANGGA RIYANTO",
        "HENDRATA DEWABRATA ICHWAN",
        "IVAN JAELANI BESTI",
        "KRISNA SANTOSA",
        "LUSI ALIFATUL LAILA",
        "MAS MOHAMAD RAFI NOUVAL FADIL",
        "MOCHAMMAD FULVIAN DAFA PRANAJA",
        "MOCHAMMAD RAKANDIYA S G",
        "MOHAMMAD RAYA SATRIATAMA",
        "MUHAMMAD AKBAR PERMANAATMAJA",
        "MUHAMMAD AYUB PUTRA FERDIAN",
        "MUHAMMAD FAYYADH RABBANI",
        "MUHAMMAD RAFIF AIMAN",
        "NADIA AQMARINA GHAISANY",
        "NAUVAL GYMNASTI",
        "RAFA GYIZA RASHIEKA",
        "RAFLY IVAN KHALFANI",
        "RAIHAN NURAZHAR BUDI SATRIA",
        "RAKA INDRA RAHMAWAN",
        "RAMANDHA PUTRA SURYAHADI",
        "RAYMICO FUJI",
        "RIFDAH HANSYA ROFIFAH",
        "RIZKA ALFADILLA",
        "SAUQI AKBAR MUBAROK",
        "SOFIATU ZAHRA KHALIFAH",
        "ZIDAN DWI PERMANA",
      ];
      chat.sendMessage(siswa[msg.body.slice(7)]);
    } else {
      chat.sendMessage("Tidak ada data");
    }
  } else if (msg.body.startsWith("!subject ")) {
    // Ganti title grup
    let chat = await msg.getChat();
    if (chat.isGroup) {
      //cara mengetahui apakah mereka admin atau bukan
      const authorId = msg.author;
      for (let participant of chat.participants) {
        if (participant.id._serialized === authorId && !participant.isAdmin) {
          // Kasih tau mereka bahwa mereka bukan admin
          chat.sendMessage(
            `Perintah ini hanya bisa digunakan untuk admin grup!.`
          );
          break;
        } else {
          //mereka adalah admin
          let newSubject = msg.body.slice(9);
          chat.setSubject(newSubject);
        }
      }
    } else {
      chat.sendMessage("Perintah ini hanya bisa digunakan di dalam grup!");
    }
  } else if (msg.body.startsWith("!desc ")) {
    // Ganti deskripsi grup
    let chat = await msg.getChat();
    if (chat.isGroup) {
      const authorId = msg.author;
      for (let participant of chat.participants) {
        if (participant.id._serialized === authorId && !participant.isAdmin) {
          // Kasih tau mereka bahwa mereka bukan admin
          chat.sendMessage(
            `Perintah ini hanya bisa digunakan untuk admin grup!`
          );
          break;
        } else {
          // mereka adalah admin
          let newDescription = msg.body.slice(6);
          chat.setDescription(newDescription);
          break;
        }
      }
    } else {
      chat.sendMessage("Perintah ini hanya bisa digunakan di dalam grup!");
    }
  } else if (msg.body == "!help") {
    const chat = await msg.getChat();
    chat.sendMessage(
      `			*HELPER*
			-------------------------------
			*!desc isiDeskripsi* | Mengganti deskripsi			
			*!everyone* | Mention semua member			
			*!jadwal* | Jadwal Kuliah			
			*!dosen* | Daftar Dosen			
			*!subject namaGrup* | ganti nama grup		
				
			~ Krisna-Bot
			`
    );
  }
});

client.initialize();

//koneksi socket io
io.on("connection", function (socket) {
  socket.emit("message", "connecting...");

  client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit("message", "Qrcode Siap,silahkan scan");
    });
  });

  client.on("ready", () => {
    socket.emit("message", "Siap digunakan");
  });
});

server.listen(port, function () {
  console.log("app running on port*:" + port);
});
