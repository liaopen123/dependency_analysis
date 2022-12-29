let version  = 100002;

exports.AppVersion = version;


function doTest(){
    console.log(`开始`);
    var startTime = Date.now()
    // const allFile = fs.readFileSync("/Users/liaopenghui/Documents/haohaozhu/HhzAndroid/dependencies.txt",'utf-8');
    // allFile.split(/\r?\n/).forEach(line =>  {
    //     console.log(`每一行: ${line}`);
    //   });
    const rl = readline("/Users/liaopenghui/Documents/haohaozhu/HhzAndroid/dependencies.txt");
    rl.on('line', function (line, lineCount, byteCount) {

        // console.log(lineCount);  // this is not zero-based

        // do something with the  of text
        // line = line.substr(3).substr(0, 9); or whatever
        /**
         * 想法  找到最后的一个节点的最后一个父节点  靠就完事了
         */
        if (line.includes('---')&&line.indexOf('---')!=0) {
            // console.log(line);
            var index = line.indexOf('---');
            var nodeLevel = (index-1)/5;
            if(nodeLevel==0){
                rootDependence.subNodeList.push({"name":line,"level":nodeLevel,"subNodeList":[]})
            }else{
                var fatherNode = findLastParentNode(nodeLevel-1)
                if(fatherNode!=null){
                    fatherNode.subNodeList.push({"name":line,"level":nodeLevel,"subNodeList":[]})
                }
            }
        }
    });

    rl.on('error', function(e) {
        // something went wrong
    });
    var end = Date.now()-startTime;
    console.log('耗时:'+end);
    console.log('最后得到的list:'+rootDependence);

}


function DependenceNode(name, level) {
    this.name = name;
    this.level = level;
    this.subNodeList = [];
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