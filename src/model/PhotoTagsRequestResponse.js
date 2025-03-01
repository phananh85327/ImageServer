class PhotoTagsRequestResponse {
    constructor(photoID = -1, tagID = -1) {
        this.photoID = photoID;
        this.tagID = tagID;
    }

    static fromObject(obj) {
        return new PhotoTagsRequestResponse(
            obj.photoID === undefined ? -1 : obj.photoID,
            obj.tagID === undefined ? -1 : obj.tagID
        )
    }
}

export default PhotoTagsRequestResponse;