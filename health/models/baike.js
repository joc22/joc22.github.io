const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var BaikeSchema = new Schema({
    title:{
      type: String,
      required: true
    },
    kind:{
      type: String,
      required: true
    },
    details:{
      type: String,
      required: true
    },
    date:{
       type:Date,
       default:Date.now
   }
  });

module.exports = Baike = mongoose.model("baikes", BaikeSchema);