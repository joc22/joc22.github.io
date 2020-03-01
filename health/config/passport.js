const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // console.log(email);
      // console.log(password);
      //查询数据
      User.findOne({ email:email }).then(user => {
        if (!user) {
          return done(null,false,{message:'用户不存在！'});
        }
        //密码验证
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null,false,{ message: "密码错误！" });
          }
        });
      });
    })
  );

    //序列化和反序列化
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
        done(err, user);
        });
    });
};
