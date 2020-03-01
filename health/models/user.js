const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: "http://127.0.0.1:5000/public/images/moren.png"
    },
    date: {
      type: Date,
      default: Date.now
    }
  });

module.exports = User = mongoose.model("users", UserSchema);
