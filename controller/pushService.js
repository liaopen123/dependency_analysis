const request = require('request');
const dependenceUtils = require('../utils/dependenceUtils');
module.exports = {
    //新增依赖
    pushVersionAdd: (originalArtifact) => {
        const title = "# 新添加依赖 \n"
        const content ="## "+ originalArtifact.name
        pushMessage(title, content)
    },
    pushCodeModify: (originalArtifact, ModifyArtifact) => {
      let {dependence,version} =   dependenceUtils.getGroupIdAndArtifactId(originalArtifact.dependenceName);
      let {newVersion} =   dependenceUtils.getGroupIdAndArtifactId(ModifyArtifact.name);
        const title = "# 依赖发生变动 \n"
        const content ="## "+ dependence + "\n 版本发生修改:\n > " + version + "---->" + newVersion
        pushMessage(title, content)
    },
    pushVersionDeleted: (originalArtifact) => {
        const title = "# 依赖被删除 \n"
        const content ="## "+ originalArtifact.dependenceName
        pushMessage(title, content)
    },
    pushNewVersion: (artifact) => {
        const title = "# 依赖发现新版本 \n"
        const content ="## "+ artifact.dependenceName + "\n 发现新版本,最新的版本号为 > " + artifact.latestVersion;
        pushMessage(title, content)
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
        "https://oapi.dingtalk.com/robot/send?access_token=88202a51f4dbe77c2394a12f20bbe7f6ddeaa194f233f23dc08778174e525e79",
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
