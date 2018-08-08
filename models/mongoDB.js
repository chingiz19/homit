let pub = {};
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/homit', { useNewUrlParser: true }).then(function (result) {
    console.log("Connection to Mongo DB established");
}, function (err) {
    throw new Error('Error connecting to Mongo DB');
});

let productSchema = new Schema({     //sample schema implementation
    name:String,
    brand:String,    
    category: String,
    subcategory: String,
    image: String,
    image: String,
    details: [{ country: String, description: Date, soldBy: String, country: String, }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    }
});

module.exports = pub;
