var express = require('express');
var router = express.Router();
var session_store;
/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/menuutama');
});

router.get('/', function(req, res, next) {
	res.redirect('/customers');
});

router.get('/gate',function(req,res,next){
	if(req.session.email) {
		res.redirect('/menuutama');
	}
	else if(!req.session.email){
		res.render('main/login',{title:"Login "});
	}
});

router.get('/register',function(req,res,next){
	if(req.session.email) {
		res.redirect('/menuutama');
	}
	else if(!req.session.email){
		res.render('main/register',{title:"Register"});
	}
});

router.post("/register", function (req, res, next) {
  req.assert("name", "Mohon Isi kolom Nama").notEmpty();
	req.assert("email", "Mohon Isi kolom Email").notEmpty();
	req.assert("phone", "Mohon Isi kolom Nomor HP").notEmpty();
	req.assert("password", "Mohon Isi kolom Password").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_name = req.sanitize("name").escape().trim();
    v_email = req.sanitize("email").escape().trim();
    v_password = req.sanitize("password").escape().trim();
    v_phone = req.sanitize("phone").escape();

    var user = {
      name: v_name,
      password: v_password,
      email: v_email,
      phone: v_phone,
    };

    var insert_sql = "INSERT INTO user SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        user,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("main/register", {
              name: req.param("name"),
              password: req.param("password"),
              email: req.param("email"),
              phone: req.param("phone"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "User baru berhasil dibuat");
            res.redirect("/gate");
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
    res.render("main/register", {
      name: req.param("name"),
      password: req.param("password"),
      session_store: req.session,
    });
  }
});

router.post('/gate',function(req,res,next){
	session_store=req.session;
	req.assert('email', 'Mohon Isi Kolom Email').notEmpty();
	req.assert('email', 'Email Tidak Valid').isEmail();
	req.assert('password', 'Mohon Isi Kolom Password').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		req.getConnection(function(err,connection){
			pass = req.body.password; 
			email = req.body.email;
			
			var query = connection.query('select * from user where email="'+email+'" and password="'+pass+'"',function(err,rows)
			{
				if(err)
				{
					var errornya  = ("Error Selecting : %s ",err.code );  
					console.log(err.code);
					req.flash('msg_error', errornya); 
					res.redirect('/gate'); 
				}else
				{
					if(rows.length <=0)
					{

						req.flash('msg_error', "Email atau Password salah."); 
						res.redirect('/gate');
					}
					else
					{	
						session_store.is_login = true;
						session_store.email = req.body.email;
						res.redirect('/menuutama');
					}
				}

			});
		});
	}
	else
	{
		errors_detail = "<p>Maaf ada Error</p><ul>";
		for (i in errors) 
		{ 
			error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		console.log(errors_detail);
		req.flash('msg_error', errors_detail); 
		res.redirect('/gate'); 
	}
});

router.get('/logout', function(req, res)
{ 
	req.session.destroy(function(err)
	{ 
		if(err)
		{ 
			console.log(err); 
		} 
		else
		{ 
			res.redirect('/menuutama'); 
		} 
	}); 
});
module.exports = router;
