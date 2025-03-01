class TagRequestResponse {
    constructor(tagID = -1, tagName = '', updateName = false) {
        this.tagID = tagID;
        this.tagName = tagName;

        this.updateName = updateName;
    }

    static fromObject(obj) {
        return new TagRequestResponse(
            obj.tagID === undefined ? -1 : obj.tagID,
            obj.tagName === undefined ? '' : obj.tagName
        )
    }
}

export default TagRequestResponse;