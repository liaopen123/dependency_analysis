var express = require('express');
var router = express.Router();
var dependencyParser = require("../controller/dependencyParser");

/* GET users listing. */
router.get('/', function(req, res, next) {
  let doTest = dependencyParser.doTest("");
  console.log("doTst:"+doTest);
  res.send('respond with a resource');
});
router.post('/sendDependencyTree',  async(req, res, next)=> {
  let {data} = req.body;
 await dependencyParser.ParseAndSave2DB(data);
  res.send('respond with a resource');
})
;router.get('/getDependencyTree', function(req, res, next) {
dependencyParser.getAllDependence(function (err, result) {
    if(err) throw  err;
    result.forEach((item , index ) => {
       item.subDependence =JSON.parse(item.subDependence) //数据库存的json  转成 实体 ;
   });
    let response = {"data":result};
    let result2 = JSON.stringify(response)
    res.send(response);
  });

});

module.exports = router;
