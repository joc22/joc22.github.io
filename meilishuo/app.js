var express = require('express')
var bodyParser = require('body-parser')

var app = express()

app.use(express.static('wwwroot'))
app.use(bodyParser.urlencoded({ extended: true }))



app.listen(3000, function (req, res) {
    console.log('服务器在端口3000打开')
})