const stream = require('stream');
const dependenceDB = require('../db/dependence');
const tagDB = require('../db/tags');
const pushService = require('../controller/pushService')

const rootDependence = {"name": "app", "level": -1, "subNodeList": [], "moduleName": "app"};
const MODULE_PREFIX = "project :";

/**
 * 判断是不是第一次 往数据库存数据 如果是第一次 就全保存，如果之前就有，就得bsdiff了。
 * @returns {boolean}  true 第一次  false 不是第一次
 */
function isFirstTime2SaveInfo() {
    return dependenceDB.find().count() === 0;
}

//com.android.tools.build:gradle:3.0.1  转化成 实体 存放在数据库
function generateDependenceBean(realDependence) {
    const dependenceArray = realDependence.split(":")
    if (dependenceArray.length >= 3) {
        const groupId = dependenceArray[0]
        const artifactId = dependenceArray[1]
        const version = dependenceArray[2]

        const artifact = {
            dependence: groupId + ":" + artifactId,
            groupId: groupId,
            artifactId: artifactId,
            version: version,
        }
        return artifact
    } else {
        return null
    }
}

function compareWithDB(allDependence, itemBean) {
    if (itemBean.moduleName.trim().length !== 0) {
        //先精细化匹配
        let dependenceEntity = allDependence.find(item => item.dependenceName === itemBean.name)
        if (dependenceEntity == null) {
            let {dependence} = generateDependenceBean(itemBean.name)
            let dependenceEntity1 = allDependence.find(item => item.dependenceName.indexOf(dependence) != -1)
            if (dependenceEntity1 != null) {
                //版本号 发生变化
                allDependence.splice(allDependence.indexOf(dependenceEntity1), 1)  //移除掉
                //修改数据库
                pushService.pushCodeModify(dependenceEntity1,itemBean)
                dependenceDB.updateOne({"_id": dependenceEntity1._id}, {"dependenceName": itemBean.name}).then(result => console.log(result));
                console.log("更新:" + JSON.stringify(itemBean));
            } else {
                // 新增
                pushService.pushVersionAdd(itemBean)
                const currentAppInfo = {
                    dependenceName: itemBean.name,
                    subDependence: JSON.stringify(itemBean.subNodeList),
                    moduleName: itemBean.moduleName,
                    tag: [],
                    mark: "",
                    latestVersion: "",
                    latestVersionUrl: ""
                };
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
        } else {
            allDependence.splice(allDependence.indexOf(dependenceEntity), 1)  //移除掉
        }
    }
}

/**
 * 一次性 从数据库 取出所有的依赖   然后 和 最新的比较
 */
let allDependence = null;

async function getDifferent(dependenceNode) {
    allDependence = await dependenceDB.find().lean();
    bsDiff(allDependence, dependenceNode)
    if (allDependence.length > 0) {
        //有删除掉的
        console.log("有删除掉的：" + JSON.stringify(allDependence));
        allDependence.forEach((item, index) => {
            pushService.pushVersionDeleted(item)
            dependenceDB.findOneAndDelete({'_id': item._id}).then(result => console.log("删除成功"));
        })
    }
}

/**
 * 拿最新的依赖 去 数据库 查询有没有发生改动，如果改动 就修改数据。
 *用module名称去取依赖，如果存在且相等 则说明没有变化，如果存在但不相同，则说明版本发生了变化，如果不存在，则表示新增。

 */
function bsDiff(allDependence, dependenceNode) {
    if (dependenceNode.subNodeList != null && dependenceNode.subNodeList.length > 0) {
        dependenceNode.subNodeList.forEach((item, index) => {
            if (!item.name.startsWith("project :")) { //过滤掉  project的依赖
                compareWithDB(allDependence, item)
            }
            if (item.subNodeList != null && item.subNodeList.length > 0) {
                bsDiff(allDependence, item);
            }
        })
    }
}

/**
 *把接收到的dependencyTree 转换成 层级结构： {"name":"app","level":-1,"subNodeList":[],"moduleName":"app"};
 * @param dependenceContent  字符串 的 dependencyTree
 */
function parseData(dependenceContent) {
    rootDependence.subNodeList = [];
    const buf = new Buffer(dependenceContent);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buf);
    let split = dependenceContent.split("\n");
    split.forEach((line, index) => {
        if (line.includes('---') && line.indexOf('---') !== 0) {
            var index = line.indexOf('---');
            var nodeLevel = (index - 1) / 5;
            var moduleName = "";

            if (nodeLevel == 0) {
                moduleName = rootDependence.name;
                rootDependence.subNodeList.push({
                    "name": formatLineInfo(line),
                    "level": nodeLevel,
                    "subNodeList": [],
                    "moduleName": moduleName
                })
            } else {
                let fatherNode = findLastParentNode(nodeLevel - 1)
                if (fatherNode != null) {
                    if (!isModuleWithLine(line)) {
                        //如果是lib  看父类 是不是 moudle
                        if (isModuleWithLine(fatherNode.name)) {
                            moduleName = fatherNode.name.replace(MODULE_PREFIX, "");
                        } else {
                            moduleName = ""  //lib的子lib
                        }

                    } else {
                        //如果是module   module的father一定是 module 不可能是 lib 所以:
                        moduleName = fatherNode.name.replace(MODULE_PREFIX, "");
                    }
                    fatherNode.subNodeList.push({
                        "name": formatLineInfo(line),
                        "level": nodeLevel,
                        "subNodeList": [],
                        "moduleName": moduleName
                    })
                }
            }
        }
    });


    console.log('最后得到的list:' + rootDependence);

    return rootDependence;

}


module.exports.modifyTag = async function modifyTag(dependence,tags) {
    dependenceDB.updateOne({dependenceName: dependence}, {tag: tags}, function (err, raw) {
        if (err) {
            console.log(err);
        }else{
            console.log(raw);
        }
    });
}

module.exports.saveRemark = async function saveRemark(dependence,remark,rating) {
    dependenceDB.updateOne({dependenceName: dependence}, {mark: remark, rating: rating}, function (err, raw) {
        if (err) {
            console.log(err);
        }else{
            console.log(raw);
        }
    });
}

module.exports.ParseAndSave2DB = async function ParseAndSave2DB(rawStringContent) {
    let dependenceNode = parseData(rawStringContent);
    if (isFirstTime2SaveInfo()) {
        analysisDependenceNodeAndSave2DB(dependenceNode)
    } else {
        await getDifferent(dependenceNode)
    }
}


module.exports.saveRating =  function saveRating(dependence,rating) {
    dependenceDB.updateOne({dependenceName: dependence}, {rating: rating}, function (err, raw) {
        if (err) {
            console.log(err);
        }else{
            console.log(raw);
        }
        //{ n: 1, nModified: 1, ok: 1 }
    });


}

module.exports.getAllDependence = function getDependence(callback) {
    dependenceDB.find().lean().exec(callback);
}
module.exports.getAllTag = function getAllTag(callback) {
    tagDB.find().lean().exec(callback);
}
module.exports.addTag = function addTag(tag,callback) {
    let mTags = new tagDB({tag:tag});
    mTags.save(callback);
}

/**
 * 把遍历的每个子节点保存到数据库
 * @param itemBean
 */
function saveNodeInDB(itemBean) {
    if (itemBean.moduleName.trim().length != 0) {
        const currentAppInfo = {
            dependenceName: itemBean.name,
            subDependence: JSON.stringify(itemBean.subNodeList),
            moduleName: itemBean.moduleName,
            tag: [],
            mark: "",
            latestVersion: "",
            latestVersionUrl: ""
        };
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
function analysisDependenceNodeAndSave2DB(dependenceNode) {
    if (dependenceNode.subNodeList != null && dependenceNode.subNodeList.length > 0) {
        dependenceNode.subNodeList.forEach((item, index) => {
            if (!item.name.startsWith("project :")) { //过滤掉  project的依赖
                saveNodeInDB(item)
                pushService.pushVersionAdd(item)
            }
            if (item.subNodeList != null && item.subNodeList.length > 0) {
                analysisDependenceNodeAndSave2DB(item);
            }
        })
    }


}


module.exports.getFlatDependenceLibWithBean = function getFlatDependenceLibWithBean(dependenceBean) {
    return "";

}

/**
 *
 * @param dependenceContent  原始的
 */
module.exports.getFlatDependenceLibWithRawString = function getFlatDependenceLibWithRawString(dependenceContent) {
    let RawDataBean = doTest(dependenceContent);
    let flatDependenceLibWithBean = getFlatDependenceLibWithBean(RawDataBean);

}


/**
 *
 * @param line
 * @returns {string}
 */
function formatLineInfo(line) {
    line = line.substring(line.indexOf("---") + 4)
    line = line.replace("(*)", "")
    line = line.replace("(c)", "")
    if (line.indexOf("->") != -1) {
        line = line.split("->")[0]
    }
    return line.trim();
}

function isModuleWithLine(line) {
    return formatLineInfo(line).startsWith(MODULE_PREFIX) || line.indexOf(".") == -1;

}


var mCurrentNode = null;

/**
 * @param {*} parentNodeLevel  父节点的level
 * @returns 父节点
 */
function findLastParentNode(parentNodeLevel) {
    mCurrentNode = null;
    doWhileNode(rootDependence, parentNodeLevel)
    return mCurrentNode;
}

function doWhileNode(currentNode, parentNodeLevel) {
    var currentParentNode = currentNode.subNodeList[currentNode.subNodeList.length - 1];
    if (currentParentNode.level == parentNodeLevel) {
        mCurrentNode = currentParentNode;
    } else {
        doWhileNode(currentParentNode, parentNodeLevel)
    }
}