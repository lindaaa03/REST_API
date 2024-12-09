const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("./config/Database.js");
const app = express();
const PORT = process.env.PORT || 3000;

// Set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Insert data
app.post("/api/latihanrestapi", (req, res) => {
  const data = { ...req.body };
  const querySql = "INSERT INTO latihanrestapi SET ?";

  koneksi.query(querySql, data, (err, rows) => {
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

//delete data
app.delete("/api/latihanrestapi/:id", (req, res) => {
  //buat query sql untuk mencari data dan hapus
  const querySeacrh = "SELECT * FROM latihanrestapi WHERE id = ? ";
  const queryDelete = "DELETE FROM latihanrestapi WHERE id = ?";

  // jalankan query untuk melakukan pencarian data
  koneksi.query(querySeacrh, req.params.id, (err, rows, field) => {
    // error handling
    if (err) {
      return res.status(500).json({ message: "Ada kesalahan", error: err });
    }
    //jika id yang dimasukkan sesuai dengan data yang ada di db
    if (rows.length) {
      // jalankan query delete
      koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
          return res.status(500).json({ message: "Ada kesalahan", error: err });
        }
        //jika delete berhasil
        res.status(200).json({ succes: true, message: "Berhasil hapus data!" });
      });
    } else {
      return res
        .status(404)
        .json({ message: "Data tidak ditemukan!", succes: false });
    }
  });
});

// Jalankan server
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
