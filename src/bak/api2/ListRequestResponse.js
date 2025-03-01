import FetchData from "./FetchData";

class ListRequestResponse {
    constructor(listID = '', listName = '', items = [], updateName = false, addItemValue = false, error = '') {
        this.listID = listID;
        this.listName = listName;
        this.items = items;

        this.updateName = updateName;
        this.addItemValue = addItemValue;
        this.error = error;
    }

    static fromObject(obj) {
        return new ListRequestResponse(
            obj.listID === undefined ? '' : obj.listID,
            obj.listName === undefined ? '' : obj.listName,
            obj.items === undefined ? [] : obj.items.split(FetchData.itemSeparator).map(item => new ListItemRequestResponse(item))
        );
    }

    static toRequest(list) {
        return {
            listID: list.listID,
            listName: list.listName,
            items: list.items.map(item => item.value).join(FetchData.itemSeparator)
        };
    }
}

class ListItemRequestResponse {
    constructor(value = '', updateValue = false) {
        this.value = value;

        this.updateValue = updateValue;
    }
}

export { ListRequestResponse, ListItemRequestResponse };