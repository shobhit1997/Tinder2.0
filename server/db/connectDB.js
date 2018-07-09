const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Tinder2');
module.exports=mongoose;