const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    name: String,
    index: String,
    url:String

})
module.exports = mongoose.model("Character", characterSchema);