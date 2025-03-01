class ItemRequestResponse {
    constructor(
        itemID = '',
        itemNo = null,
        itemName = '',
        imageUrl = null,
        categoryID = '',
        listID = null,
        listItem = null,
        digitalFlg = false,
        digitalFile = null,
        location = '',
        quantity = 1,
        memo = '',
        startTime = null,
        endTime = null,
        customerID = '',
        notificationTime = null,
        notificationSubject = '',
        notificationBody = '',
        sendFlg = false,
        createdBy = '',
        lastChange = '',
        addItem = false,
        updateHeader = false,
        newImage = null,
        newFile = null,
        updateItem = false,
        updateDigital = false,
        updateNotification = false,
        error = '') {
        this.itemID = itemID;
        this.itemNo = itemNo;
        this.itemName = itemName;
        this.imageUrl = imageUrl;
        this.categoryID = categoryID;
        this.listID = listID;
        this.listItem = listItem;
        this.digitalFlg = digitalFlg;
        this.digitalFile = digitalFile;
        this.location = location;
        this.quantity = quantity;
        this.memo = memo;
        this.startTime = startTime;
        this.endTime = endTime;
        this.customerID = customerID;
        this.notificationTime = notificationTime;
        this.notificationSubject = notificationSubject;
        this.notificationBody = notificationBody;
        this.sendFlg = sendFlg;
        this.createdBy = createdBy;
        this.lastChange = lastChange;

        this.addItem = addItem;
        this.updateHeader = updateHeader;
        this.newImage = newImage;
        this.newFile = newFile;
        this.updateItem = updateItem;
        this.updateDigital = updateDigital;
        this.updateNotification = updateNotification;
        this.error = error;
    }

    static fromObject(obj) {
        const item = new ItemRequestResponse(
           obj.itemID === undefined ? '' : obj.itemID,
           obj.itemNo === undefined ? null :  parseInt(obj.itemNo),
           obj.itemName === undefined ? '' :  obj.itemName,
           obj.imageUrl === undefined ? null :  obj.imageUrl,
           obj.categoryID === undefined ? '' :  obj.categoryID,
           obj.listID === undefined ? null :  obj.listID,
           obj.listItem === undefined ? null :  obj.listItem === null ? null : parseInt(obj.listItem),
           obj.digitalFlg === undefined ? false :  obj.digitalFlg,
           obj.digitalFile === undefined ? null : obj.digitalFile,
           obj.location === undefined ? '' : obj.location,
           obj.quantity === undefined ? 1 : parseInt(obj.quantity),
           obj.memo === undefined ? '' : obj.memo,
           obj.startTime === undefined ? null : obj.startTime,
           obj.endTime === undefined ? null : obj.endTime,
           obj.customerID === undefined ? '' : obj.customerID,
           obj.notificationTime === undefined ? '' : obj.notificationTime,
           obj.notificationSubject === undefined ? '' : obj.notificationSubject,
           obj.notificationBody === undefined ? '' : obj.notificationBody,
           obj.sendFlg === undefined ? false : obj.sendFlg,
           obj.createdBy === undefined ? '' : obj.createdBy,
           obj.lastChange === undefined ? false : obj.lastChange
        );
        item.newFile = item.digitalFile;
        return item;
    }
}

export default ItemRequestResponse;