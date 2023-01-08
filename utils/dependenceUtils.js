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
}


}