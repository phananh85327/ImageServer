class MailRequestResponse {
    constructor(mailID = '', mailTitle = '', mailBody = '', updateMail = false, error = '') {
        this.mailID = mailID;
        this.mailTitle = mailTitle;
        this.mailBody = mailBody;

        this.updateMail = updateMail;
        this.error = error;
    }

    static fromObject(obj) {
        return new MailRequestResponse(
            obj.mailID === undefined ? '' : obj.mailID,
            obj.mailTitle === undefined ? '' : obj.mailTitle,
            obj.mailBody === undefined ? '' : obj.mailBody
        )
    }
}

export default MailRequestResponse;