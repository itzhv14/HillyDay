var express = require("express");
var router = express.Router();
var passport = require("passport");
var User =  require("../models/user");
var Place = require("../models/place");

// root route
router.get("/", function(req, res){
	res.render("landing");
});

// register
router.get("/register", function (req,res) {
	res.render("register");
});

router.post("/register", function (req, res) {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
	});
	User.register(newUser, req.body.password, function (err, user) {
		if (err){
			req.flash("error", err.message);
			return res.redirect("register");
		}
		passport.authenticate("local")(req, res, function () {
			req.flash("success", "Registered Successfully. Welcome " + user.username + "!");
			res.redirect("/places");
		});
	});
});

// logon

router.get("/login", function (req,res) {
	res.render("login");
});

module.expoerts = router;


//app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", {
	successRedirect: "/places",
	failureRedirect: "/login"
	}), function (req, res,) {
});

router.get("/logout", function (req, res) {
	req.logout();
	req.flash("success", "Logged out successfully.");
	res.redirect("/places");
});

//profile

router.get("/users/:id", function (req, res) {
	User.findById(req.params.id, function (err, foundUser) {
		if (err){
			console.log(err);
			req.flash("error", "Something went wrong!");
			res.redirect("/");
		}
		Place.find().where('author.id').equals(foundUser._id).exec(function (err, places) {
			if (err){
			console.log(err);
			req.flash("error", "Something went wrong!");
			res.redirect("/");
		}
			res.render("users/show", {user: foundUser, places: places});
		});

	});
});

module.exports = router;