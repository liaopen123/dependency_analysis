const stream = require('stream');
const readline = require('readline');
const dependenceDB = require('../db/dependence');


const rootDependence = {"name":"app","level":-1,"subNodeList":[],"moduleName":"app"};
const MODULE_PREFIX = "project :";
/**
 *把接收到的dependencyTree 转换成 层级结构： {"name":"app","level":-1,"subNodeList":[],"moduleName":"app"};
 * @param dependenceContent  字符串 的 dependencyTree
 */
function parseData(dependenceContent){

    const buf = new Buffer(dependenceContent);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buf);

    var rl = readline.createInterface({
        input: bufferStream,
    });

    rl.on('line', function (line) {
        // console.log('this is ' + (++count) + ' line, content = ' + line);
        if (line.includes('---')&&line.indexOf('---')!==0) {
            // console.log(line);
            var index = line.indexOf('---');
            var nodeLevel = (index-1)/5;
            var moduleName = "";

            if(nodeLevel==0){
                moduleName = rootDependence.name;
                rootDependence.subNodeList.push({"name":formatLineInfo(line),"level":nodeLevel,"subNodeList":[],"moduleName":moduleName})
            }else{
                let fatherNode = findLastParentNode(nodeLevel-1)
                if(fatherNode!=null){
                    if (!isModuleWithLine(line)) {
                        //如果是lib  看父类 是不是 moudle
                        if (isModuleWithLine(fatherNode.name)) {
                             moduleName = fatherNode.name.replace(MODULE_PREFIX,"");
                        }else{
                            moduleName = ""  //lib的子lib
                        }

                    }else{
                        //如果是module   module的father一定是 module 不可能是 lib 所以:
                        moduleName = fatherNode.name.replace(MODULE_PREFIX,"");
                    }
                    fatherNode.subNodeList.push({"name":formatLineInfo(line),"level":nodeLevel,"subNodeList":[],"moduleName":moduleName})
                }
            }
        }
    });


    console.log('最后得到的list:'+rootDependence);

    return rootDependence;

}


module.exports.ParseAndSave2DB= function ParseAndSave2DB(rawStringContent){


    let dependenceNode = parseData(rawStringContent);
    analysisDependenceNodeAndSave2DB(dependenceNode)

}

/**
 * 把遍历的每个子节点保存到数据库
 * @param itemBean
 */
function saveNodeInDB(itemBean) {
    if (itemBean.moduleName.trim().length!=0) {
        const currentAppInfo = {dependenceName: itemBean.name, subDependence: JSON.stringify(itemBean.subNodeList), moduleName: itemBean.moduleName, tag: [], mark:""};
        let dependenceBean = new dependenceDB(currentAppInfo)
        dependenceBean.save(function (err, data) {
            if (err) {
                console.log(err);
                return {status: 500, message: '系统错误,请稍后再试'};
            } else {
                console.log("AppInfo保存成功");
                console.log(data);
                return {status: 200, message: 'AppInfo保存成功'};
            }
        });
    }

}

/**
 *遍历  找到所有 有所属module的依赖(说明是一级依赖  我们关注的也就是一级依赖) 保存数据库
 * @param dependenceNode 已经通过RawString转好的实体
 */
function analysisDependenceNodeAndSave2DB(dependenceNode){
    if (dependenceNode.subNodeList!=null&&dependenceNode.subNodeList.length>0) {
        dependenceNode.subNodeList.forEach((item , index ) => {
            if (!item.name.startsWith("project :")) { //过滤掉  project的依赖
                saveNodeInDB(item)
            }
            if (item.subNodeList!=null&&item.subNodeList.length>0) {
                analysisDependenceNodeAndSave2DB(item);
            }
        })
    }


}


module.exports.getFlatDependenceLibWithBean= function getFlatDependenceLibWithBean(dependenceBean){
    return "";

}

/**
 *
 * @param dependenceContent  原始的
 */
module.exports.getFlatDependenceLibWithRawString= function getFlatDependenceLibWithRawString(dependenceContent){
    let RawDataBean = doTest(dependenceContent);
    let flatDependenceLibWithBean = getFlatDependenceLibWithBean(RawDataBean);

}


/**
 *
 * @param line
 * @returns {string}
 */
function formatLineInfo(line){
    line = line.substring(line.indexOf("---")+4)
    line = line.replace("(*)","")
    if (line.indexOf("->")!=-1) {
        line = line.split("->")[0]
    }
    return line.trim();
}

function isModuleWithLine(line){
    return formatLineInfo(line).startsWith(MODULE_PREFIX)||line.indexOf(".")==-1;

}


var mCurrentNode=null;
/**
 * @param {*} parentNodeLevel  父节点的level
 * @returns 父节点
 */
function findLastParentNode(parentNodeLevel){
    mCurrentNode =null;
    doWhileNode(rootDependence,parentNodeLevel)
    return mCurrentNode;
}

function doWhileNode(currentNode,parentNodeLevel){
    var currentParentNode = currentNode.subNodeList[currentNode.subNodeList.length-1];
    if(currentParentNode.level==parentNodeLevel){
        mCurrentNode = currentParentNode;
    }else{
        doWhileNode(currentParentNode,parentNodeLevel)
    }
}