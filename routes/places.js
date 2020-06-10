var ocdkey      = process.env.OCD_API_KEY;
var express = require("express");
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'opencage',
  httpAdapter: 'https',
  apiKey: ocdkey,
  formatter:null
};

var geocoder = NodeGeocoder(options);

router.get("/", function(req, res){
	Place.find({}, function (err, allPlaces) {
		if (err){
			//console.log(err);
		}else {
			res.render("places/index", {places: allPlaces, currentUser: req.user});
		}
	});
});

//CREATE - add new place to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to places array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var location = req.body.location;
  //console.log("loc"+location);
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
    	//console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formatted_address;
    var newPlace = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng, price: price};
    // Create a new place and save to DB
    Place.create(newPlace, function(err, newlyCreated){
        if(err){
            //console.log(err);
        } else {
            //redirect back to places page
            //console.log(data);
            //console.log(location);
            //console.log(data[0].formatted_address);
			req.flash("success", "Successfully Added!");
            res.redirect("/places");
        }
    });
  });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("places/new");
});



router.get("/:id", function(req, res) {
	Place.findById(req.params.id).populate("comments").exec(function (err, place) {
		if (err || !place){
			//console.log(err);
			req.flash("error", "Data not found");
			res.redirect("back");
		}else {
			res.render("places/show", {place: place});
		}
	});
});

//EDIT
router.get("/:id/edit",  middleware.checkOwnership, function (req, res) {
	Place.findById(req.params.id, function (err, place) {
		res.render("places/edit",{place: place});
	});
});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        //console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.place.lat = data[0].latitude;
    req.body.place.lng = data[0].longitude;
    req.body.place.location = data[0].formatted_address;

    Place.findByIdAndUpdate(req.params.id, req.body.place, function(err, place){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            //console.log("loac " + location);
            req.flash("success","Successfully Updated!");
            res.redirect("/places/" + place._id);
        }
    });
  });
});

// DELETE
router.delete("/:id",  middleware.checkOwnership, function (req, res) {
	Place.findByIdAndRemove(req.params.id, function (err) {
		if(err){
			res.redirect("/places");
		}else{
			req.flash("success", "Successfully Deleted!");
			res.redirect("/places");
		}
	})
});

module.exports = router;