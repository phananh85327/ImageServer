class UserRequestResponse {
    constructor(userID = -1, username = '', email = '', role = '') {
        this.userID = userID;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    static fromObject(obj) {
        return new UserRequestResponse(
            obj.userID === undefined ? -1 : obj.userID,
            obj.username === undefined ? '' : obj.username,
            obj.email === undefined ? '' : obj.email,
            obj.role === undefined ? '' : obj.role
        )
    }
}

export default UserRequestResponse;