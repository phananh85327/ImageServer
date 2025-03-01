class PhotoRequestResponse {
    constructor(photoID = -1, uploadedBy = '', imageBase64 = '', uploadDate = '', title = '', description = '', lastChanged = '', uploadedByUsername = '', count = 1, start = 0, end = 1, keyword = '', tagIDs = [], metadata = new MetadataRequestResponse(), n = 10, image = null) {
        this.photoID = photoID;
        this.uploadedBy = uploadedBy;
        this.imageBase64 = imageBase64;
        this.uploadDate = uploadDate;
        this.title = title;
        this.description = description;
        this.lastChanged = lastChanged;
        this.uploadedByUsername = uploadedByUsername;
        this.count = count;

        this.keyword = keyword;
        this.image = image;
        this.metadata = metadata;
        this.tagIDs = tagIDs;
        this.n = n;
        this.start = start;
        this.end = end;
    }

    static fromObject(obj) {
        return new PhotoRequestResponse(
            obj.photoID === undefined ? -1 : obj.photoID,
            obj.uploadedBy === undefined ? '' : obj.uploadedBy,
            obj.imageBase64 === undefined ? '' : obj.imageBase64,
            obj.uploadDate === undefined ? '' : obj.uploadDate,
            obj.title === undefined ? '' : obj.title,
            obj.description === undefined ? '' : obj.description,
            obj.lastChanged === undefined ? '' : obj.lastChanged,
            obj.uploadedByUsername === undefined ? '' : obj.uploadedByUsername,
            obj.count === undefined ? '' : obj.count,
        )
    }
}

class MetadataRequestResponse {
    constructor(cameraMake = '', cameraModel = '', exposureTime = '', aperture = '', ISO = '', focalLength = '', GPSLatitude = '', GPSLongitude = '', dateTaken = '') {
        this.cameraMake = cameraMake;
        this.cameraModel = cameraModel;
        this.exposureTime = exposureTime;
        this.aperture = aperture;
        this.ISO = ISO;
        this.focalLength = focalLength;
        this.GPSLatitude = GPSLatitude;
        this.GPSLongitude = GPSLongitude;
        this.dateTaken = dateTaken;
    }
}

export { PhotoRequestResponse, MetadataRequestResponse };