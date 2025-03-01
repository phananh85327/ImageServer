class CustomerRequestResponse {
    constructor(customerID = '', customerName = '', email = '', phone = '', address = '', items = '', feePaid = false, membershipValidUntil = null, lateFee = 0, updateCustomer = false, error = '') {
        this.customerID = customerID;
        this.customerName = customerName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.items = items;
        this.feePaid = feePaid;
        this.membershipValidUntil = membershipValidUntil;
        this.lateFee = lateFee;

        this.updateCustomer = updateCustomer;
        this.error = error;
    }

    static fromObject(obj) {
        return new CustomerRequestResponse(
            obj.customerID === undefined ? '' : obj.customerID,
            obj.customerName === undefined ? '' : obj.customerName,
            obj.email === undefined ? '' : obj.email,
            obj.phone === undefined ? '' : obj.phone,
            obj.address === undefined ? '' : obj.address,
            obj.items === undefined ? '' : obj.items,
            obj.feePaid === undefined ? '' : obj.feePaid,
            obj.membershipValidUntil === undefined ? '' : obj.membershipValidUntil,
            obj.lateFee === undefined ? '' : obj.lateFee,
            false,
            obj.error === undefined ? '' : obj.error
        )
    }
}

export default CustomerRequestResponse;