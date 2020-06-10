var express = require("express");
var router  = express.Router({mergeParams: true});
var Place = require("../models/place");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new",  middleware.isLoggedIn, function(req, res){
    // find place by id
    console.log(req.params.id);
    Place.findById(req.params.id, function(err, place){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {place: place});
        }
    })
});

//Comments Create
router.post("/",  middleware.isLoggedIn,function(req, res){
   //lookup place using ID
   Place.findById(req.params.id, function(err, place){
       if(err){
           console.log(err);
           res.redirect("/places");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
               req.flash("error", "Something went wrong!");
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               place.comments.push(comment);
               place.save();
               req.flash("success", "Successfully added your comment!");
               res.redirect('/places/' + place._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit",  middleware.checkCommentOwnership,function(req, res){
    Place.findById(req.params.id, function (err, place) {
        if (err || !place) {
            req.flash("error", "Data not found");
            return res.redirect("back")
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
             } else {
                res.render("comments/edit", {place_id: req.params.id, comment: foundComment});
            }
        });
    });
});


// COMMENT UPDATE
router.put("/:comment_id", function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
      	console.log(err);
          res.redirect("back");
      } else {
          req.flash("success", "Successfully edited your comment!");
          res.redirect("/places/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id",  middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Successfully deleted your comment!");
           res.redirect("/places/" + req.params.id);
       }
    });
});


module.exports = router;