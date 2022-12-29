var express = require('express');
var router = express.Router();

let controller = require("../controller/dependencyParser.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("controller:"+controller.AppVersion)
  res.render('index', { title: 'Express' });
});

module.exports = router;
