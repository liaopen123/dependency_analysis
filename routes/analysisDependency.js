var express = require('express');
var router = express.Router();
var dependencyParser = require("../controller/dependencyParser");

/* GET users listing. */
router.get('/', function (req, res, next) {
    let doTest = dependencyParser.doTest("");
    console.log("doTst:" + doTest);
    res.send('respond with a resource');
});
router.post('/sendDependencyTree', async (req, res, next) => {
    let {data} = req.body;
    await dependencyParser.ParseAndSave2DB(data);
    res.send('respond with a resource');
})


router.post('/modifyTag', async (req, res, next) => {
    let {dependence, tags,} = req.body;
    await dependencyParser.modifyTag(dependence,tags);
    res.send({code: 200, message: "success"});
});


router.post('/saveRemark', async (req, res, next) => {
    let {   dependence, remark, rating,} = req.body;
    console.log("dependence:" + dependence + ",,,rating:" + rating+",,,remark:" + remark)
    await dependencyParser.saveRemark(dependence,remark,rating);
    res.send({code: 200, message: "success"});
});


router.get('/getDependencyTree', function (req, res, next) {
    dependencyParser.getAllDependence(function (err, result) {
        if (err) throw  err;
        result.forEach((item, index) => {
            item.subDependence = JSON.parse(item.subDependence) //数据库存的json  转成 实体 ;
        });
        let response = {"data": result};
        res.send(response);
    });

});
router.get('/allTags', function (req, res, next) {
    dependencyParser.getAllTag(function (err, result) {
        if (err) throw  err;
        let response = {"data": result};
        res.send(response);
    });
});

router.get('/addTag', function (req, res, next) {
    let {tag} = req.query
    console.log("get:得到的参数:" + tag)
    if (tag!=null&&tag.length>0) {
        dependencyParser.addTag(tag,function (err, result) {
            if (err) {
                console.log(err);
                res.send( {status: 500, message: '系统错误,请稍后再试'});
            } else {
                res.send(  {status: 200, message: '用户创建成功', data: result});
            }
        });
    }else{
        res.send({code: 200, message: "tag参数为空"});
    }


});

router.post('/saveRating', async (req, res, next) => {
    let {dependence, rating,} = req.body
    console.log("dependence:" + dependence + ",,,rating:" + rating)
    dependencyParser.saveRating(dependence, rating);
    res.send({code: 200, message: "success"});
})

module.exports = router;
