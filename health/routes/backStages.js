const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const moment = require("moment");
const multiparty = require("multiparty");
const path = require("path");
const fs = require("fs");
const {ensureAuthenticated} = require('../helpers/auth')

// 引入数据模型
const Baike = require("../models/baike");

const router = express.Router();

// body-parser middleware
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//首页页面路由
router.get("/", ensureAuthenticated,(req, res) => {

  if(req.user.name != "admin"){
    req.flash('error_msg','对不起，您没有权限访问！')
    res.redirect('/')
  }else{
    res.render("backStages/users");
  }
});

router.get("/users",ensureAuthenticated,(req, res) => {
  res.render("backStages/users");
});

//百科添加页面路由
router.get("/baikes/add", ensureAuthenticated, (req, res) => {
  res.render("backStages/add");
});

//百科编辑页面路由
router.get("/baikes/edit/:id", ensureAuthenticated, (req, res) => {
  Baike.findOne({ _id: req.params.id }).then(baike => {
    res.render("backStages/edit", { baike: baike });
  });
});

// 百科管理页面api
router.get("/baikes", ensureAuthenticated, (req, res) => {
  // console.log(req.query.page);
  var page = req.query.page || 1;
  var data = {
    sum: 0,
    total: 0, //总共多少页
    curPage: page, //当前页
    baikes: [] //当前页中的文章
  };
  var pageSize = 10;
  //查找所有内容
  Baike.find({}).then(baikes => {
    //查找每一页的对应内容
    Baike.find({})
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ date: "desc" })
      .then(baikes2 => {
        if (baikes2.length == 0) {
          res.redirect("./?page=" + (page - 1 || 1));
        } else {
          baikes2.map((ele, index) => {
            ele["time"] = moment(ele.date).format("YYYY-MM-DD HH:mm:ss");
            ele["index"] = index + 1;
          }),
            (data.total = Math.ceil(baikes.length / pageSize));
          var totals = [];
          for (i = 1; i <= data.total; i++) {
            totals.push(`${i}`);
          }
          // console.log(totals);
          data.sum = baikes.length;
          data.baikes = baikes2;
          res.render("backStages/baikes", { data: data, totals: totals });
        }
      });
  });
});

//百科详情页面路由
router.get("/baikes/details", ensureAuthenticated, (req, res) => {
  Baike.findOne({ _id: req.query.id }).then(baikes3 => {
    baikes3["time"] = moment(baikes3.date).format("YYYY-MM-DD HH:mm:ss");
    res.render("backStages/details", { baikes3: baikes3 });
  });
});

// 百科增删改查
// 添加api
router.post("/baikes/add/submit", urlencodedParser, (req, res) => {
  // console.log(req.body);
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "请输入标题！" });
  }

  if (!req.body.details) {
    errors.push({ text: "请输入详情！" });
  }

  if (errors.length > 0) {
    res.render("backStages/add", {
      errors: errors,
      title: req.body.title,
      kind: req.body.kind,
      details: req.body.details
    });
  } else {
    const newBaike = {
      title: req.body.title,
      kind: req.body.kind,
      details: req.body.details
    };

    new Baike(newBaike).save().then(baike => {
      req.flash("success_msg", "数据添加成功！");
      res.redirect("/backStages/baikes");
    });
  }
});

//百科查找api
router.get("/baikes/search", ensureAuthenticated, (req, res) => {
  data = {
    sum: 0,
    baikes: []
  };
  Baike.find({
    $or: [{ title: { $regex: req.query.title } }, { kind: req.query.kind }]
  })
    .sort({ date: "desc" })
    .then(baikes4 => {
      // console.log(baikes4);
      baikes4.map((ele, index) => {
        ele["time"] = moment(ele.date).format("YYYY-MM-DD HH:mm:ss");
        ele["index"] = index + 1;
      }),
        (data.sum = baikes4.length);
      data.baikes = baikes4;
      res.render("backStages/search", { data: data });
    });
});

//百科编辑api
router.put("/baikes/edit/submit/:id", urlencodedParser, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "标题不能为空，请重新编辑！" });
  }

  if (!req.body.details) {
    errors.push({ text: "详情不能为空，请重新编辑！" });
  }

  if (errors.length > 0) {
    Baike.findOne({
      _id: req.params.id
    }).then(baike => {
      res.render("backStages/edit", { baike: baike, errors: errors });
    });
  } else {
    Baike.findOne({
      _id: req.params.id
    }).then(baike => {
      baike.title = req.body.title;
      baike.kind = req.body.kind;
      baike.details = req.body.details;
      baike.save().then(baike => {
        req.flash("success_msg", "数据编辑成功！");
        res.redirect("/backStages/baikes");
      });
    });
  }
});

//百科删除
router.get("/baikes/delete", ensureAuthenticated, function(req, res) {
  // 通过指定id删除指定数据
  Baike.deleteOne({ _id: req.query.id }).then(() => {
    req.flash("success_msg", "数据删除成功！");
    res.redirect("./?page=" + req.query.page);
  });
});

// 图片上传
// var upload = multer({
//   dest: "uploads/"
// }); //当前目录下建立文件夹uploads

router.post("/baikes/add/upload", (req, res, next) => {
  // console.log(req.file); //上传的路径../public/images/ue/
  // var des_file = path.join(__dirname,"../public/images/baike/" + req.file.originalname );
  // console.log(des_file);
  // fs.readFile(req.file.path, function(err, data) {
  //   fs.writeFile(des_file, data, function(err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //     //   user.avatar =
  //     //     "localhost:5000/public/images/baike/" +
  //     //     req.file.originalname;
  //     //   ModelUser.update(
  //     //     {
  //     //       _id: user._id
  //     //     },
  //     //     {
  //     //       avatar: user.avatar
  //     //     },
  //     //     function(err, raw) {
  //     //       if (err) return handleError(err);
  //     //       console.log("The raw response from Mongo was ", raw);
  //     //     }
  //     //   );

  //     res.render("./backStages/add", {
  //       imgUrl: "localhost:5000/public/images/baike/" + req.file.originalname
  //     });

  //     }
  //   });
  // });

  var form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log("上传失败", err);
    } else {
      // console.log("文件列表", files);
      var file = files.filedata[0];

      var rs = fs.createReadStream(file.path);
      var newPath = "/uploads/" + file.originalFilename;
      var ws = fs.createWriteStream("./public" + newPath);
      rs.pipe(ws);
      ws.on("close", () => {
        // console.log("文件上传成功");
        res.send({ err: "", msg: "/public" + newPath });
      });
    }
  });
});

module.exports = router;
