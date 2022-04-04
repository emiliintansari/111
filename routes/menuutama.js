var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var bodyParser = require('body-parser')
var session_store;
/* GET Customer page. */

router.get("/", function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokmobil",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("stokmobil/list", {
          title: "Menuutama",
          data: rows,
          session_store: req.session,
        });
      }
    );
  });
});

router.get("/cari/(:tipe)", function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokmobil where tipe_mobil= ?",req.params.tipe,
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("stokmobil/list", {
          title: "",
          data: rows,
          session_store: req.session,
        });
      }
    );
  });
});

router.delete("/delete/(:id)", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var stokmobilid = {
      id: req.params.id,
    };
    const nama_gambar = req.body.gambaran;
    var delete_sql = "delete from stokmobil where ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(delete_sql, stokmobilid, function (err, result) {
          if (err) {
            var errors_detail = ("Error Delete : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/menuutama");
          } else {
            const imagePath = `./public/images/upload/${nama_gambar}`;
            fs.unlinkSync(imagePath);
            req.flash("msg_info", "Data Berhasil Dihapus");
            res.redirect("/menuutama");
          }
        }
      );
    });
  });
});

router.get("/edit/(:id)", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokmobil where id=" + req.params.id,
      function (err, rows) {
        if (err) {
          var errornya = ("Error Selecting : %s ", err);
          req.flash("msg_error", errors_detail);
          res.redirect("/menuutama");
        } else {
          if (rows.length <= 0) {
            req.flash("msg_error", "Stok Mobil tidak ditemukan");
            res.redirect("/menuutama");
          } else {
            console.log(rows);
            res.render("stokmobil/edit", {
              title: "Edit Data",
              data: rows[0],
              session_store: req.session,
            });
          }
        }
      }
    );
  });
});

router.put("/edit/(:id)", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nama_mobil", "Isi Nama Mobil").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_mobil = req.sanitize("nama_mobil").escape().trim();
    v_jumlah = req.sanitize("jumlah_mobil").escape().trim();
    v_tipe = req.sanitize("tipe_mobil").escape().trim();
    v_harga = req.sanitize("harga_mobil").escape().trim();
    
    if (!req.files) {
      var stokmobilid = {
        nama_mobil: v_mobil,
        jumlah_mobil: v_jumlah,
        tipe_mobil: v_tipe,
        harga_mobil: v_harga
      };
    }else{
      var file = req.files.gambar_mobil;
      file.mimetype == "image/jpeg";
      file.mv("public/images/upload/" + file.name);

      var stokmobilid = {
        nama_mobil: v_mobil,
        jumlah_mobil: v_jumlah,
        tipe_mobil: v_tipe,
        harga_mobil: v_harga,
        gambar_mobil: file.name,
      };
    }
    
    var update_sql = "update stokmobil SET ? where id = " + req.params.id;
    req.getConnection(function (err, connection) {
      var query = connection.query(
        update_sql,
        stokmobilid,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Update : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("stokmobil/edit", {
              nama_mobil: req.param("nama_mobil"),
              jumlah_mobil: req.param("jumlah_mobil"),
              tipe_mobil: req.param("tipe_mobil"),
              harga_mobil: req.param("harga_mobil"),
              gambar_mobil: req.param("gambar_mobil"),
            });
          } else {
            req.flash("msg_info", "Mobil Berhasil diupdate");
            res.redirect("/menuutama");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Maaf ada Error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.redirect("/menuutama/edit/" + req.params.id);
  }
});

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("nama_mobil", "Please fill the name").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_mobil = req.sanitize("nama_mobil").escape().trim();
    v_jumlah = req.sanitize("jumlah_mobil").escape().trim();
    v_tipe = req.sanitize("tipe_mobil").escape().trim();
    v_harga = req.sanitize("harga_mobil").escape().trim();

    var file = req.files.gambar_mobil;
    file.mimetype == "image/jpeg";
    file.mv("public/images/upload/" + file.name);
    
    var stokmobilid = {
      nama_mobil: v_mobil,
      jumlah_mobil: v_jumlah,
      tipe_mobil: v_tipe,
      harga_mobil: v_harga,
      gambar_mobil: file.name,
    };

    var insert_sql = "INSERT INTO stokmobil SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        stokmobilid,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("stokmobil/add-stokmobil", {
              nama_mobil: req.param("nama_mobil"),
              jumlah_mobil: req.param("jumlah_mobil"),
              tipe_mobil: req.param("tipe_mobil"),
              harga_mobil: req.param("harga_mobil"),
              gambar_mobil: req.param("gambar_mobil"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Data  Berhasil ditambahkan");
            res.redirect("/menuutama");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Maaf ada Error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("stokmobil/add-stokmobil", {
      nama_mobil: req.param("nama_mobil"),
      jumlah_mobil: req.param("jumlah_mobil"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("stokmobil/add-stokmobil", {
    title: "Tambah ",
    nama_mobil: "",
    jumlah_mobil: "",
    tipe_mobil: "",
    harga_mobil: "",
    gambar_mobil: "",
    session_store: req.session,
  });
});

router.get("/deskripsi/(:id)", function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokmobil where id= "+req.params.id,
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("stokmobil/deskripsi_mobil", {
          title: "Deskripsi",
          data: rows[0],
          session_store: req.session,
        });
      }
    );
  });
});

router.get("/pencarian/", function (req, res, next) {
  req.getConnection(function (err, connection) {
    const query = connection.query(
      "SELECT * FROM stokmobil where nama_mobil LIKE '%"+req.query.hasil+"%'",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("stokmobil/list", {
          title: "Cari",
          data: rows,
          session_store: req.session,
        });
      }
    );
  });
});
module.exports = router;
