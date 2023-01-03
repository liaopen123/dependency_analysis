var express = require('express');
var router = express.Router();
var dependencyParser = require("../controller/dependencyParser");

/* GET users listing. */
router.get('/', function(req, res, next) {
  let doTest = dependencyParser.doTest("");
  console.log("doTst:"+doTest);
  res.send('respond with a resource');
});
router.post('/sendDependencyTree', function(req, res, next) {
  let {data} = req.body;
  let doTest = dependencyParser.ParseAndSave2DB(data);
  res.send('respond with a resource');
});

module.exports = router;
