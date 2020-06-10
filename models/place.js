var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
});

module.exports = mongoose.model("Place", placeSchema);