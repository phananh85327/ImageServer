class CategoryRequestResponse {
    constructor(categoryID = '', categoryName = '', updateName = false, error = '') {
        this.categoryID = categoryID;
        this.categoryName = categoryName;

        this.updateName = updateName;
        this.error = error;
    }

    static fromObject(obj) {
        return new CategoryRequestResponse(
            obj.categoryID === undefined ? '' : obj.categoryID,
            obj.categoryName === undefined ? '' : obj.categoryName
        )
    }
}

export default CategoryRequestResponse;