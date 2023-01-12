const request = require('request');
const dependenceUtils = require('../utils/dependenceUtils');
module.exports = {
    //新增依赖
    pushVersionAdd: (originalArtifact) => {
        const title = "# 新添加依赖 \n"
        const content ="## "+ originalArtifact.dependenceName
        pushMessage(title, content)
    },
    pushCodeModify: (originalArtifact, ModifyArtifact) => {
      let {dependence,version} =   dependenceUtils.getGroupIdAndArtifactId(originalArtifact.dependenceName);
      let {newVersion} =   dependenceUtils.getGroupIdAndArtifactId(ModifyArtifact.dependenceName);
        const title = "# 依赖发生变动 \n"
        const content ="## "+ dependence + "\n 版本发生修改:\n > " + version + "---->" + newVersion+"\n  ######  [控制台](http://172.16.9.11:8092) \n"
        pushMessage(title, content)
    },
    pushVersionDeleted: (originalArtifact) => {
        const title = "# 依赖被删除 \n"
        const content ="## "+ originalArtifact.dependenceName+"\n  ######  [控制台](http://172.16.9.11:8092) \n"
        pushMessage(title, content)
    },
    pushNewVersion: (artifact) => {
        let {version} = dependenceUtils.getGroupIdAndArtifactId(artifact.dependenceName)
        if(version!==artifact.latestVersion){   //如果新版本 和  当前使用的版本号 相同 就没必要通知
            const title = "# 依赖发现新版本 \n"
            const content ="## "+ artifact.dependenceName + "\n 发现新版本,最新的版本号为: " + artifact.latestVersion+"\n  ######  [控制台](http://172.16.9.11:8092) \n";
            pushMessage(title, content)
        }

    },


}


function pushMessage(title, content) {
    let data = {
        "msgtype": "markdown",
        "markdown": {
            "title": title,
            "text": title+content
        },
    }

    // let data = {
    //     "msgtype": "markdown",
    //     "markdown": {
    //         "title":"杭州天气",
    //         "text": "#### 杭州天气 @150XXXXXXXX \n > 9度，西北风笨笨1级，空气良89，相对温度73%\n > ![screenshot](https://img.alicdn.com/tfs/TB1NwmBEL9TBuNjy1zbXXXpepXa-2400-1218.png)\n > ###### 10点20分发布 [天气](https://www.dingtalk.com) \n"
    //     },
    //     "at": {
    //         "atMobiles": [
    //             "150XXXXXXXX"
    //         ],
    //         "atUserIds": [
    //             "user123"
    //         ],
    //         "isAtAll": false
    //     }
    // }
    request.post(//发送post
        "https://oapi.dingtalk.com/robot/send?access_token=94a9ec9283ac78e4cb532aea424577a4e3a746b59080645f6396afffb806b28f",
        {
            json: data,
            encoding: "utf-8",
            headers: {
                'Content-Type': 'application/json'
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body)//成功返回
            }
        }
    );

}
