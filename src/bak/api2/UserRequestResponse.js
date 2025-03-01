class UserRequestResponse {
    constructor(userID = '', userName = '', email = '', phone = '', oldPass = '', pass = '', userRole = '', isLocked = false, updateUser = false, error = '') {
        this.userID = userID;
        this.userName = userName;
        this.email = email;
        this.phone = phone;
        this.oldPass = oldPass;
        this.password = pass;
        this.userRole = userRole;
        this.isLocked = isLocked;

        this.updateUser = updateUser;
        this.error = error;
    }

    static fromObject(obj) {
        return new UserRequestResponse(
            obj.userID === undefined ? '': obj.userID,
            obj.userName === undefined ? '' : obj.userName,
            obj.email === undefined ? '' : obj.email,
            obj.phone === undefined ? '' : obj.phone,
            '',
            '',
            obj.userRole === undefined ? '' : obj.userRole,
            obj.isLocked === undefined ? '' : obj.isLocked,
            false,
            obj.error === undefined ? '' : obj.error
        );
    }
}

export default UserRequestResponse;