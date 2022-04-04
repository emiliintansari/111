var express = require("express");
var router = express.Router();
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Customer page. */

router.get("/",authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM customer",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("customer/list", {
          title: "Pelanggan",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var customer = {
        id: req.params.id,
      };

      var delete_sql = "delete from customer where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/customers#custom");
            } else {
              req.flash("msg_info", "Data Pembeli berhasil dihapus");
              res.redirect("/customers#custom");
            }
          }
        );
      });
    });
  }
);

router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM customer where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/customers");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Pembeli tidak ditemukan");
              res.redirect("/customers");
            } else {
              console.log(rows);
              res.render("customer/edit", {
                title: "Edit pelanggan",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);

router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    var errors = req.validationErrors();
    if (!errors) {
      v_name = req.sanitize("name").escape().trim();
      v_email = req.sanitize("email").escape().trim();
      v_address = req.sanitize("address").escape().trim();
      v_phone = req.sanitize("phone").escape();
      v_tanggal_pembelian = req.sanitize("tanggal_pembelian");
      v_pilihan_beli = req.sanitize("pilihan_beli");

      var customer = {
        name: v_name,
        address: v_address,
        email: v_email,
        phone: v_phone,
        tanggal_pembelian: v_tanggal_pembelian,
        pilihan_beli: v_pilihan_beli,
      };

      var update_sql = "update customer SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("customer/edit", {
                name: req.param("name"),
                address: req.param("address"),
                email: req.param("email"),
                phone: req.param("phone"),
                tanggal_pembelian: req.param("tanggal_pembelian"),
                pilihan_beli: req.param("pilihan_beli"),
              });
            } else {
              req.flash("msg_info", "Update Pembeli berhasil");
              res.redirect("/customers");
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
      res.redirect("/customers/edit/" + req.params.id);
    }
  }
);

router.post("/add", function (req, res, next) {
  var errors = req.validationErrors();
  if (!errors) {
    v_name = req.sanitize("name").escape().trim();
    v_email = req.sanitize("email").escape().trim();
    v_address = req.sanitize("address").escape().trim();
    v_phone = req.sanitize("phone").escape();
    v_tanggal_pembelian = req.sanitize("tanggal_pembelian");
    v_pilihan_beli = req.sanitize("pilihan_beli");

    var customer = {
      name: v_name,
      address: v_address,
      email: v_email,
      phone: v_phone,
      tanggal_pembelian: v_tanggal_pembelian,
      pilihan_beli: v_pilihan_beli,
    };

    var insert_sql = "INSERT INTO customer SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        customer,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("customer/add-customer", {
              name: req.param("name"),
              address: req.param("address"),
              email: req.param("email"),
              phone: req.param("phone"),
              tanggal_pembelian: req.param("tanggal_pembelian"),
              pilihan_beli: req.param("pilihan_beli"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Pesanan berhasil disubmit");
            res.redirect("/customers/berhasil");
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
    res.render("customer/add-customer", {
      name: req.param("name"),
      address: req.param("address"),
      session_store: req.session,
    });
  }
});

// router.get("/add", authentication_mdl.is_login, function (req, res, next) {
//   res.render("customer/add-customer", {
//     title: "Add New Customer",
//     name: "",
//     email: "",
//     phone: "",
//     address: "",
//     session_store: req.session,
//   });
// });

router.get("/beli/(:id)", function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokmobil where id=" + req.params.id,
      function (err, rows) {
        if (err) {
          var errornya = ("Error Selecting : %s ", err);
          req.flash("msg_error", errors_detail);
          res.redirect("/mainpage");
        } else {
          if (rows.length <= 0) {
            req.flash("msg_error", "Pembeli tidak ditemukan");
            res.redirect("/mainpage");
          } else {
            console.log(rows);
            res.render("customer/add-customer", {
              title: "pesan",
              data: rows[0],
              session_store: req.session,
              idelva:req.params.id,
            });
          }
        }
      }
    );
  });
});

router.get("/tambah", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM stokmobil",
      function (err, rows) {
        if (err) {
          var errornya = ("Error Selecting : %s ", err);
          req.flash("msg_error", errors_detail);
          res.redirect("/menuutama");
        } else {
          if (rows.length <= 0) {
            req.flash("msg_error", "Pembeli tidak ditemukan");
            res.redirect("/menuutama");
          } else {
            console.log(rows);
            res.render("customer/add-customer", {
              title: "Tambah Pembeli",
              data: rows,
              session_store: req.session,
              idelva:req.params.id,
            });
          }
        }
      }
    );
  });
});

router.get("/deskripsi/(:id)", function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM customer where id= "+req.params.id,
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("customer/deskripsi_customer", {
          title: "Deskripsi ",
          data: rows[0],
          session_store: req.session,
        });
      }
    );
  });
});

router.get("/pencarian/", function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM customer where name LIKE '%"+req.query.hasil+"%'",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("customer/list", {
          title: "Pelanggan",
          data: rows,
          session_store: req.session,
        });
      }
    );
  });
});

router.get('/berhasil', function(req, res, next) {
	res.render("customer/berhasil",{title: "Berhasil"});
});

module.exports = router;
