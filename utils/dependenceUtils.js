module.exports = {

    getGroupIdAndArtifactId: (realDependence) =>{
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
},


    /**
     * 比较两个版本号的大小
     * @param {string} v1
     * @param {string} v2
     * @returns {0|1|-1} 0表示v1 = v2，1表示v1 > v2，-1表示v1 < v2
     *
     * compareVersion('1.1.0', '1.1.0');      // => 0
     * compareVersion('1.20.0', '1.2.20');    // => 1
     * compareVersion('v2.0.30', 'v1.9.10');  // => 1
     * compareVersion('v1.1.40', 'v1.2.0');   // => -1
     */
    isNetVersionLatestThanLocalVersionCode :(netVersionCode,localVersionCode)=>{

        if (netVersionCode==="?") {
            return  -1;
        }
        if (localVersionCode==="?"&&netVersionCode!=="?") {
            return  1;
        }
        if (localVersionCode==null) {
            return  1;
        }
        if (localVersionCode=="") {
            return  1;
        }

        let cpResult;
        let i = 0;
        const arr1 = netVersionCode.replace(/[^0-9.]/, '').split('.');
        const arr2 = localVersionCode.replace(/[^0-9.]/, '').split('.');
        while (true) {
            const s1 = arr1[i];
            const s2 = arr2[i++];
            if (s1 === undefined || s2 === undefined) {
                cpResult = arr1.length - arr2.length;
                break;
            }
            if (s1 === s2) continue;
            cpResult = s1 - s2;
            break;
        }
        // eslint-disable-next-line
        return cpResult > 0 ? 1 : cpResult === 0 ? 0 : -1;
    }
}




