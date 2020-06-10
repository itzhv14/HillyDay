var Place = require("../models/place");
var Comment = require("../models/comment");

// all middle ware goes here

var middlewareObj = {};

middlewareObj.checkOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Place.findById(req.params.id, function (err, place) {
			if(err || !place){
				console.log(err);
				req.flash("error", "Data not found");
				res.redirect("back")
			}else{
				// does the user own the CG?
				// .equal coz C.A.ID is object and R.U.ID is string and hence cannot be compared by == or ===
				if(place.author.id.equals( req.user._id)){
					next();
				}else {
					req.flash("error", "You dont have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else {
		req.flash("error", "You need to be logged in!");
		res.redirect("back")
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function (err, comment) {
			if(err || !comment){
				req.flash("error", "Data not found");
				res.redirect("back")
			}else{
				// does the user own the Comment?
				// .equal coz C.A.ID is object and R.U.ID is string and hence cannot be compared by == or ===
				if(comment.author.id.equals( req.user._id)){
					next();
				}else {
					req.flash("error", "You dont have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else {
		req.flash("error", "You need to be logged in!");
		res.redirect("back")
	}
};


//middleware
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in!");
	res.redirect("/login");
};

module.exports = middlewareObj;