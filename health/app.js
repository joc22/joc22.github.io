const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
// 编辑删除方法
const methodOverride = require("method-override");
// 信息提醒
const session = require("express-session");
const flash = require("connect-flash");
//登录验证
const passport = require("passport");
require('./config/passport')(passport)

const app = express();

app.use("/public", express.static("public")); //将文件设置成静态
// app.use("/public",express.static(path.join(__dirname, "public")));


//handlebars middleware
const handlebars = require('express-handlebars')
.create({defaultLayout: "index",extname : 'html' })
 //设置模板引擎文件默认后缀为.hbs
app.engine("html", handlebars.engine); //将Express的模板引擎设置为handlebars
app.set('view engine', 'html');



// mongoose
const db = require("./config/database").mongodbURL;
mongoose
  .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//session & flash  middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  }));

  app.use(passport.initialize());
  app.use(passport.session());

app.use(flash());

//method-override middleware
app.use(methodOverride("_method"));

//配置全局变量
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//配置路由
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/home", (req, res) => {
  res.render("home");
});

// load routes();
const myhealths = require("./routes/myhealths");
const tools = require("./routes/tools");
const baikes = require("./routes/baikes");
const reports = require("./routes/reports");
const users = require("./routes/users");
const backStages = require("./routes/backStages");

// 使用routes
app.use("/myhealths", myhealths);
app.use("/tools", tools);
app.use("/baikes", baikes);
app.use("/reports", reports);
app.use("/users", users);
app.use("/backStages", backStages);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
