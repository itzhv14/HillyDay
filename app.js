require('dotenv').config();
var express    = require("express"),
	app        = express(),
	bodyParser = require("body-parser"),
	mongoose   = require("mongoose"),
	flash      = require("connect-flash"),
	passport   = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Place = require("./models/place"),
	Comment    = require("./models/comment"),
	User       = require("./models/user"),
	seedDB     = require("./seeds");

var commentRoutes = require("./routes/comments"),
	placesRoutes = require("./routes/places"),
	indexRoutes = require("./routes/index")


mongoose.connect("mongodb://localhost:27017/yelpcamp", { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Sada Kaam Nahi Apla",
	resave: false,
	saveUninitialized: false
}));

// seed database
//seedDB();

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/places", placesRoutes);
app.use("/places/:id/comments", commentRoutes);

app.listen(3000, function(){
	console.log("YelpCamp has started. Server listening on port 3000");
});