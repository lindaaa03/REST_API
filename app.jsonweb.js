const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/Database.js");
const app = express();
const PORT = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const secretKey = "your_secret_key"; // Ganti dengan kunci rahasia yang lebih aman
const validTokens = new Set(); // Menyimpan token yang valid
const revokedTokens = new Set(); // Menyimpan token yang tidak berlaku

// Set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 // batas 100 permintaan per IP
});

// Middleware untuk mencatat akses
const accessLogger = (req, res, next) => {
  console.log(`Akses ke ${req.originalUrl} oleh ${req.ip}`);
  next();
};

// Gunakan middleware
app.use(limiter);
app.use(accessLogger);

// Endpoint untuk login dan mendapatkan token
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  // Validasi username dan password (ganti dengan logika autentikasi Anda)
  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
    validTokens.add(token);
    return res.status(200).json({ token });
  }
  return res.status(401).json({ message: "Username atau password salah" });
});

// Middleware untuk memvalidasi token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token || revokedTokens.has(token)) return res.sendStatus(403);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Endpoint untuk mengakses data yang dilindungi
app.get("/api/protected", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Data yang dilindungi", user: req.user });
});

// Endpoint untuk merevoke token
app.post("/api/revoke", (req, res) => {
  const { token } = req.body;
  if (validTokens.has(token)) {
    validTokens.delete(token);
    revokedTokens.add(token);
    return res.status(200).json({ message: "Token berhasil direvoke" });
  }
  return res.status(400).json({ message: "Token tidak valid" });
});

// Insert data
app.post("/api/latihanrestapi", (req, res) => {
  const data = { ...req.body };
  const querySql = "INSERT INTO latihanrestapi SET ?";

  koneksi.query(querySql, data, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "GAGAL Insert data!", error: err });
    }
    res.status(201).json({ success: true, message: "Berhasil insert data" });
  });
});

// Read data / get data
app.get("/api/latihanrestapi", (req, res) => {
  const querySql = "SELECT * FROM latihanrestapi";

  koneksi.query(querySql, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    res.status(200).json({ success: true, data: rows });
  });
});

// Update data
app.put("/api/latihanrestapi/:id", (req, res) => {
  const data = { ...req.body };
  const querySearch = "SELECT * FROM latihanrestapi WHERE id = ?";
  const queryUpdate = "UPDATE latihanrestapi SET ? WHERE id = ?";

  koneksi.query(querySearch, req.params.id, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }

    // Pastikan data ditemukan
    if (rows.length) {
      koneksi.query(queryUpdate, [data, req.params.id], (err) => {
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }
        res
          .status(200)
          .json({ success: true, message: "Berhasil update data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});

// Delete data
app.delete("/api/latihanrestapi/:id", (req, res) => {
  const querySearch = "SELECT * FROM latihanrestapi WHERE id = ?";
  const queryDelete = "DELETE FROM latihanrestapi WHERE id = ?";

  koneksi.query(querySearch, req.params.id, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    if (rows.length) {
      koneksi.query(queryDelete, req.params.id, (err) => {
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }
        res.status(200).json({ success: true, message: "Berhasil hapus data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", success: false });
    }
  });
});

// Jalankan server
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));