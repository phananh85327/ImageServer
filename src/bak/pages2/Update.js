import React, { useState, useEffect } from 'react'
import UserRequestResponse from '../api/UserRequestResponse'
import ItemRequestResponse from '../api/ItemRequestResponse'
import CustomerRequestResponse from '../api/CustomerRequestResponse'
import MailRequestResponse from '../api/MailRequestResponse'
import FetchData from '../api/FetchData'
import Footer from '../models/Footer'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/Update.css'

const Update = () => {
    // Update data
    const [updateTab, setUpdateTab] = useState(0);

    // Item data
    const [itemLoading, setItemLoading] = useState(true);
    const [items, setItems] = useState([]);

    // Customer data
    const [customerLoading, setCustomerLoading] = useState(true);
    const [customerEdit, setCustomerEdit] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [customerAdd, setCustomerAdd] = useState(false);
    const [customerUpdate, setCustomerUpdate] = useState(null);
    const [customerDelete, setCustomerDelete] = useState(null);

    // Mail data
    const [mailLoading, setMailLoading] = useState(true);
    const [mailEdit, setMailEdit] = useState(false);
    const [mails, setMails] = useState([]);
    const [mailAdd, setMailAdd] = useState(false);
    const [mailUpdate, setMailUpdate] = useState(null);
    const [mailDelete, setMailDelete] = useState(null);

    // Admin data
    const [adminLoading, setAdminLoading] = useState(true);
    const [adminEdit, setAdminEdit] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [adminAdd, setAdminAdd] = useState(false);
    const [adminUpdate, setAdminUpdate] = useState(null);
    const [adminChangePass, setAdminChangePass] = useState(null);
    const [adminLogout, setAdminLogout] = useState(false);
    const [adminIsLocked, setAdminIsLocked] = useState(false);

    if ((sessionStorage.getItem(FetchData.accessToken) === null)
        || (sessionStorage.getItem(FetchData.refreshToken) === null)
        || (sessionStorage.getItem(FetchData.loginUser) === null)) {
        navigate('/login');
    }

    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem(FetchData.loginUser));
    const validEmail = new RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$');
    const validPhone = new RegExp('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$');

    // Item effect
    useEffect(() => {
        const url = new URL(FetchData.itemUrl);
        const fetchItemsGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setItemLoading(false);
                navigate('/error');
                return;
            }
            setItems(Object.values(result).map(item => ItemRequestResponse.fromObject(item)));
            setItemLoading(false);
        }
        if (itemLoading) {
            fetchItemsGet();
        }
    }, [itemLoading]);

    // Customer effect
    useEffect(() => {
        const url = new URL(FetchData.customerUrl);
        const fetchCustomerGet = async () => {
            const customerEmailPhone = document.getElementById('tbEmailPhone');
            if ((customerEmailPhone !== null) && (customerEmailPhone.value !== '')) {
                url.searchParams.set('keyword', customerEmailPhone.value);
            }
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setCustomerLoading(false);
                navigate('/error');
                return;
            }
            setCustomers(Object.values(result).map(customer => CustomerRequestResponse.fromObject(customer)));
            setCustomerLoading(false);
        }
        const fetchCustomerPost = async () => {
            const customerError = document.getElementById('lbCustomerAddError'); 
            const customerName = document.getElementById('tbCustomerAddName');
            const customerEmail = document.getElementById('tbCustomerAddEmail');
            const customerPhone = document.getElementById('tbCustomerAddPhone');
            const customerAddress = document.getElementById('tbCustomerAddAddress');
            if (customerError === null) {
                console.log('Invalid customer');
            } else if ((customerName === null) || (customerEmail === null) || (customerPhone === null) || (customerAddress === null)) {
                customerError.textContent = 'Invalid element';
            } else if (customerName.value === '') {
                customerError.textContent = 'Invalid name';
            } else if (validEmail.test(customerEmail.value) === false) {
                customerError.textContent = 'Invalid email';
            } else if (validPhone.test(customerPhone.value) === false) {
                customerError.textContent = 'Invalid phone';
            } else if (customerAddress.value === '') {
                customerError.textContent = 'Invalid address';
            } else {
                const postCustomer = new CustomerRequestResponse('', customerName.value, customerEmail.value, customerPhone.value, customerAddress.value);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), postCustomer, navigate);
                if (result === null) {
                    setCustomerLoading(false);
                    navigate('/error');
                    return;
                }
                const newCustomer = CustomerRequestResponse.fromObject(result);
                if (newCustomer.error === '') {
                    setCustomers([newCustomer, ...customers]);
                    setCustomerEdit(false);
                } else {
                    customerError.textContent = newCustomer.error;
                }
            }
            setCustomerAdd(false);
            setCustomerLoading(false);
        }
        const fetchCustomerPut = async (index) => {
            const updateCustomer = customers.find((_, i) => i === index);
            const customerName = document.getElementById(`tbCustomerName${index}`);
            const customerEmail = document.getElementById(`tbCustomerEmail${index}`);
            const customerPhone = document.getElementById(`tbCustomerPhone${index}`);
            const customerAddress = document.getElementById(`tbCustomerAddress${index}`);
            const customerMembership = document.getElementById(`dtCustomerMembership${index}`);
            const customerLateFee = document.getElementById(`tbCustomerLateFee${index}`);
            if (updateCustomer === undefined) {
                console.log('Invalid customer');
            } else if ((customerName === null) || (customerEmail === null) || (customerPhone === null) || (customerAddress === null) || (customerMembership === null) || (customerLateFee === null)) {
                updateCustomer.error = 'Invalid element';
            } else if (customerName.value === '') {
                updateCustomer.error = 'Invalid name';
            } else if (validEmail.test(customerEmail.value) === false) {
                updateCustomer.error = 'Invalid email';
            } else if (validPhone.test(customerPhone.value) === false) {
                updateCustomer.error = 'Invalid phone';
            } else if (customerAddress.value === '') {
                updateCustomer.error = 'Invalid address';
            } else if ((customerMembership.value !== '') && (new Date(customerMembership.value) > new Date())) {
                updateCustomer.error = 'Invalid start date bigger than current date';
            } else if ((customerLateFee.value === '') || (customerLateFee.value < 0)) {
                updateCustomer.error = 'Invalid late fee';
            } else {
                updateCustomer.customerName = customerName.value;
                updateCustomer.email = customerEmail.value;
                updateCustomer.phone = customerPhone.value;
                updateCustomer.address = customerAddress.value;
                updateCustomer.membershipValidUntil = customerMembership.value === '' ? null : customerMembership.value;
                updateCustomer.lateFee = customerLateFee.value;
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), updateCustomer, navigate);
                if (result === null) {
                    setCustomerLoading(false);
                    navigate('/error');
                    return;
                }
                updateCustomer.error = result.error;
                if (updateCustomer.error === '') {
                    updateCustomer.updateCustomer = false;
                }
            }
            setCustomers(customers.map((customer, i) => i === index ? updateCustomer : customer));
            setCustomerUpdate(null);
            setCustomerLoading(false);
        }
        const fetchCustomerDelete = async (index) => {
            const deleteCustomer = customers.find((_, i) => i === index);
            if (deleteCustomer === undefined) {
                console.log('Invalid customer');
            } else {
                url.searchParams.set('customerID', deleteCustomer.customerID)
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                if (result === null) {
                    setCustomerLoading(false);
                    navigate('/error');
                    return;
                }
                setCustomers(customers.filter((_, i) => i !== index));
            }
            setCustomerDelete(null);
            setCustomerLoading(false);
        }
        if (customerLoading) {
            if (customerDelete !== null) {
                fetchCustomerDelete(customerDelete);
            } else if (customerUpdate !== null) {
                fetchCustomerPut(customerUpdate);
            } else if (customerAdd) {
                fetchCustomerPost();
            } else {
                fetchCustomerGet();
            }
        }
    }, [customerLoading]);

    useEffect(() => {
        const url = new URL(FetchData.mailUrl);
        const fetchMailGet = async () => {
            const mailTitle = document.getElementById('tbMailTitle');
            if ((mailTitle !== null) && (mailTitle.value !== '')) {
                url.searchParams.set('title', mailTitle.value);
            }
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setMailLoading(false);
                navigate('/error');
                return;
            }
            setMails(Object.values(result).map(mail => MailRequestResponse.fromObject(mail)));
            setMailLoading(false);
        }
        const fetchMailPost = async () => {
            const mailError = document.getElementById('lbMailAddError'); 
            const mailTitle = document.getElementById('tbMailAddTitle');
            const mailBody = document.getElementById('tbMailAddBody');
            if (mailError === null) {
                console.log('Invalid element');
            } else if ((mailTitle === null) || (mailTitle.value === '')) {
                mailError.textContent = 'Invalid title';
            } else if ((mailBody === null) || (mailBody.value === '')) {
                mailError.textContent = 'Invalid body';
            } else {
                const newMail = new MailRequestResponse('', mailTitle.value, mailBody.value);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), newMail, navigate);
                if (result === null) {
                    setMailLoading(false);
                    navigate('/error');
                    return;
                }
                setMails([MailRequestResponse.fromObject(result), ...mails]);
            }
            setMailEdit(false);
            setMailAdd(false);
            setMailLoading(false);
        }
        const fetchMailPut = async (index) => {
            const updateMail = mails.find((_, i) => i === index);
            const mailTitle = document.getElementById(`tbMailTitle${index}`);
            const mailBody = document.getElementById(`tbMailBody${index}`);
            if (updateMail === null) {
                console.log('Invalid element');
            } else if ((mailTitle === null) || (mailTitle.value === '')) {
                updateMail.error = 'Invalid title';
            } else if ((mailBody === null) || (mailBody.value === '')) {
                updateMail.error = 'Invalid body';
            } else if ((mailTitle.value === mailTitle.defaultValue) && (mailBody.value === mailBody.defaultValue)) {
                updateMail.updateMail = false;
            } else {
                updateMail.mailTitle = mailTitle.value;
                updateMail.mailBody = mailBody.value;
                updateMail.updateMail = false;
                updateMail.error = '';
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), updateMail, navigate);
                if (result === null) {
                    setMailLoading(false);
                    navigate('/error');
                    return;
                }
            }
            setMails(mails.map((mail, i) => i === index ? updateMail : mail));
            setMailUpdate(null);
            setMailLoading(false);
        }
        const fetchMailDelete = async (index) => {
            const deleteMail = mails.find((_, i) => i === index);
            if (deleteMail === undefined) {
                console.log('Invalid mail');
            } else {
                url.searchParams.set('mailID', deleteMail.mailID);
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                if (result === null) {
                    setMailLoading(false);
                    navigate('/error');
                    return;
                }
                setMails(mails.filter((_, i) => i !== index));
            }
            setMailDelete(null);
            setMailLoading(false);
        }
        if (mailLoading) {
            if (mailDelete !== null) {
                fetchMailDelete(mailDelete);
            } else if (mailUpdate !== null) {
                fetchMailPut(mailUpdate);
            } else if (mailAdd) {
                fetchMailPost();
            } else {
                fetchMailGet();
            }
        }
    }, [mailLoading]);

    useEffect(() => {
        let url = new URL(FetchData.userUrl);
        const fetchAdminGet = async () => {
            const amdinKeyword = document.getElementById('tbAdminKeyword');
            if ((amdinKeyword !== null) && (amdinKeyword.value !== '')) {
                url.searchParams.set('keyword', amdinKeyword.value);
            }
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setAdminLoading(false);
                navigate('/error');
                return;
            }
            setAdmins(Object.values(result).map(admin => UserRequestResponse.fromObject(admin)));
            setAdminLoading(false);
        }
        const fetchAdminPost = async () => {
            const userError = document.getElementById('lbAdminAddError');
            const userName = document.getElementById('tbAmdinAddName');
            const userEmail = document.getElementById('tbAmdinAddEmail');
            const userPhone = document.getElementById('tbAmdinAddPhone');
            const userPass = document.getElementById('tbAmdinAddPass');
            const userPassConfirm = document.getElementById('tbAmdinAddPassConfirm');
            if (userError === null) {
                console.log('Invalid element');
            } else if ((userName === null) || (userName.value === '')) {
                userError.textContent = 'Invalid name';
            } else if ((userEmail === null) || (userEmail.value === '')) {
                userError.textContent = 'Invalid email';
            } else if ((userPhone === null) || (userPhone.value === '')) {
                userError.textContent = 'Invalid phone';
            } else if ((userPass === null) || (userPassConfirm === null)) {
                userError.textContent = 'Invalid pass';
            } else if (userPass.value !== userPassConfirm.value) {
                userError.textContent = 'Invalid confirm pass';
            } else {
                const postAdmin = new UserRequestResponse('', userName.value, userEmail.value, userPhone.value, '', await encryptPassword(userPass.value));
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), postAdmin, navigate);
                if (result === null) {
                    setAdminLoading(false);
                    navigate('/error');
                    return;
                }
                const newAdmin = UserRequestResponse.fromObject(result);
                if (newAdmin.error === '') {
                    setAdmins([newAdmin, ...admins]);
                    setAdminEdit(false);
                } else {
                    userError.textContent = newAdmin.error;
                }
            }
            setAdminAdd(false);
            setAdminLoading(false);
        }
        const fetchAdminPut = async (index) => {
            const updateAdmin = admins.find((_, i) => i === index);
            const userName = document.getElementById(`tbAmdinName${index}`);
            const userEmail = document.getElementById(`tbAmdinEmail${index}`);
            const userPhone = document.getElementById(`tbAmdinPhone${index}`);
            const userIsLocked = document.getElementById(`cbAdminIsLocked${index}`);
            if (updateAdmin === undefined) {
                console.log('Invalid admin');
            }  else if ((userName === null) || (userName.value === '')) {
                updateAdmin.error = 'Invalid name';
            } else if ((userEmail === null) || (userEmail.value === '')) {
                updateAdmin.error = 'Invalid email';
            } else if ((userPhone === null) || (userPhone.value === '')) {
                updateAdmin.error = 'Invalid phone';
            } else if (userIsLocked === null) {
                updateAdmin.error = 'Invalid check user is locked';
            } else if ((userName.value === userName.defaultValue)
                && (userEmail.value === userEmail.defaultValue)
                && (userPhone.value === userPhone.defaultValue)
                && (userIsLocked.checked === userIsLocked.defaultChecked)) {
                updateAdmin.updateUser = false;
            } else {
                updateAdmin.userName = userName.value;
                updateAdmin.email = userEmail.value;
                updateAdmin.phone = userPhone.value;
                updateAdmin.isLocked = userIsLocked.checked;
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), updateAdmin, navigate);
                if (result === null) {
                    setAdminLoading(false);
                    navigate('/error');
                    return;
                }
                updateAdmin.error = result.error;
                if (updateAdmin.error === '') {
                    updateAdmin.updateUser = false;
                }
            }
            setAdmins(admins.map((admin, i) => i === index ? updateAdmin : admin));
            setAdminUpdate(null);
            setAdminLoading(false);
        }
        const fetchAdminChangePass = async (index) => {
            const updateAdmin = admins.find((_, i) => i === index);
            const userOldPass = document.getElementById(`tbAmdinOldPass${index}`);
            const userNewPass = document.getElementById(`tbAmdinNewPass${index}`);
            const userNewPassConfirm = document.getElementById(`tbAmdinNewPassConfirm${index}`);
            if (updateAdmin === undefined) {
                console.log('Invalid admin');
            } else if ((userOldPass === null) || (userNewPass === null) || (userNewPassConfirm === null)) {
                updateAdmin.error = '';
            } else if ((userOldPass.value.length < FetchData.userPassLength) || (userNewPass.value.length < FetchData.userPassLength)) {
                updateAdmin.error = 'Minimum pass length is ' + FetchData.userPassLength;
            } else if (userOldPass.value === userNewPass.value) {
                updateAdmin.error = 'Invalid old pass equal to new pass';
            } else if (userNewPass.value !== userNewPassConfirm.value) {
                updateAdmin.error = 'Invalid confirm pass';
            } else {
                url = new URL(FetchData.changePassUrl);
                updateAdmin.oldPass = await encryptPassword(userOldPass.value);
                updateAdmin.pass = await encryptPassword(userNewPass.value);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), updateAdmin, navigate);
                if (result === null) {
                    setAdminLoading(false);
                    navigate('/error');
                    return;
                }
                updateAdmin.error = result.error;
                if (updateAdmin.error === '') {
                    updateAdmin.updateUser = false;
                }
            }
            setAdmins(admins.map((admin, i) => i === index ? updateAdmin : admin));
            setAdminChangePass(null);
            setAdminLoading(false);
        }
        async function encryptPassword(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array
                .from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        const fetchAdminLogout = async () => {
            url = new URL(FetchData.logoutUrl);
            url.searchParams.set('userID', user.userID);
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setAdminLoading(false);
                navigate('/error');
                return;
            }
            sessionStorage.setItem(FetchData.accessToken, null);
            sessionStorage.setItem(FetchData.refreshToken, null);
            sessionStorage.setItem(FetchData.loginUser, null);
            setAdminLogout(false);
            setAdminLoading(false);
            navigate('/login');
        }
        if (adminLoading) {
            if (adminLogout) {
                fetchAdminLogout();
            } else if (adminChangePass !== null) {
                fetchAdminChangePass(adminChangePass);
            } else if (adminUpdate !== null) {
                fetchAdminPut(adminUpdate);
            } else if (adminAdd) {
                fetchAdminPost();
            } else {
                fetchAdminGet();
            }
        }
    }, [adminLoading])

    // General handle
    const handleMainNavigate = () => {
        navigate('/main');
    }

    const handleUpdateTab = (index) => {
        if (updateTab !== index) {
            customers.forEach(customer => {
                customer.updateCustomer = false;
                customer.error = '';
            });
            mails.forEach(mail => {
                mail.updateMail = false;
                mail.error = '';
            });
            admins.forEach(admin => {
                admin.updateUser = false;
                admin.error = '';
            });
            setCustomerEdit(false);
            setMailEdit(false);
            setMailEdit(false);
            setUpdateTab(index);
        }
    }

    const handleLogout = () => {
        setAdminLogout(true);
        setAdminLoading(true);
    }

    // Customer handle
    const handleCustomerSearch = () => {
        setCustomerDelete(null);
        setCustomerUpdate(null);
        setCustomerAdd(false);
        setCustomerLoading(true);
    }

    const handleCustomerAdd = () => {
        setCustomerAdd(true);
        setCustomerLoading(true);
    }

    const handleCustomerAddEdit = () => {
        setCustomerEdit(customerEdit === false);
    }

    const handleCustomerUpdate = (index) => {
        setCustomerUpdate(index);
        setCustomerLoading(true);
    }
    
    const handleCustomerEdit = (index) => {
        setCustomers(customers.map((customer, i) => i === index ? { ...customer, updateCustomer: customer.updateCustomer === false, error: '' } : customer));
    }

    const handleCustomerDelete = (index) => {
        setCustomerDelete(index);
        setCustomerLoading(true);
    }

    const handleBorrowedDisplay = (index) => {
        const customer = customers.find((_, i) => i === index);
        if (customer === undefined) {
            return null;
        } else {
            const borrowedItems = [];
            const customerItems = customer.items.split(FetchData.itemSeparator);
            customerItems.forEach(customerItem => {
                const itemData = customerItem.split(FetchData.itemNoSeparator);
                if (itemData.length === 2) {
                    const item = items.find(item => (item.itemID === itemData[0]) && (item.itemNo == itemData[1]));
                    if (item !== undefined) {
                        borrowedItems.push('- ' + item.itemName + ': ' + item.startTime + ' - ' + item.endTime + ' (' + (item.sendFlg ? 'mail sended)' : 'mail not sended)'));
                    }
                }
            });
            return (
                <>
                    {
                        (borrowedItems.length > 0) && (
                            <>
                                <br />
                                <br />
                                <label className='update-general-label'>Borrowed items: </label>
                                {
                                    borrowedItems.map((item, index) =>
                                        <div key={index}>
                                            <label className='update-general-label'>{item}</label>
                                        </div>
                                    )
                                }
                            </>
                        )
                    }
                </>
            )
        }
    }

    // Mail handle
    const handleMailSearch = () => {
        setMailDelete(null);
        setMailUpdate(null);
        setMailAdd(false);
        setMailLoading(true);
    }

    const handleMailAdd = () => {
        setMailAdd(true);
        setMailLoading(true);
    }

    const handleMailAddEdit = () => {
        setMailEdit(mailEdit === false);
    }

    const handleMailUpdate = (index) => {
        setMailUpdate(index);
        setMailLoading(true);
    }
    
    const handleMailEdit = (index) => {
        setMails(mails.map((mail, i) => i === index ? { ...mail, updateMail: mail.updateMail === false, error: '' } : mail));
    }

    const handleMailDelete = (index) => {
        setMailDelete(index);
        setMailLoading(true);
    }

    // Admin handle
    const handleAdminSearch = () => {
        setAdminUpdate(null);
        setAdminAdd(false);
        setAdminIsLocked(false);
        setAdminLoading(true);
    }

    const handleAdminIsLocked = () => {
        setAdminIsLocked(adminIsLocked === false);
    }

    const handleAdminAdd = () => {
        setAdminAdd(true);
        setAdminLoading(true);
    }

    const handleAdminAddEdit = () => {
        setAdminEdit(adminEdit === false);
    }

    const handleAdminDisplay = (index) => {
        if ((adminIsLocked && (admins[index].isLocked === false))
            || (((adminIsLocked === false) && admins[index].isLocked))) return false;

        let count = 0;
        for (var i = 0; i < index; i++) {
            count += ((adminIsLocked && admins[i].isLocked) || (((adminIsLocked === false) && (admins[i].isLocked === false)))) ? 1 : 0
        }
        return count < FetchData.userMaxDisplay;
    }

    const handleAdminUpdate = (index) => {
        setAdminUpdate(index);
        setAdminLoading(true);
    }

    const handleAdminChangePass = (index) => {
        setAdminChangePass(index);
        setAdminLoading(true);
    }
    
    const handleAdminEdit = (index) => {
        setAdmins(admins.map((admin, i) => i === index ? { ...admin, updateUser: admin.updateUser === false, error: '' } : admin));
    }

    const handleFooterDisplay = () => {
        let footerUrlsImages = [];
        for (var i = 0; i < Footer.urls.length; i++) {
            footerUrlsImages.push(<a href={Footer.urls[i]}><img src={Footer.images[i]} alt="No image" className="update-footer-image" /></a>);
        }
        return (
            <footer className="update-footer">
                <div>
                    <label>Address: {Footer.address}</label>
                    <br />
                    <label>Phone: {Footer.phone}</label>
                </div>
                <div>
                    {
                        footerUrlsImages.map((footerUrlImage, index) => <React.Fragment key={index}>{footerUrlImage}</React.Fragment>)
                    }
                </div>
            </footer>
        );
    }

    return (
        <div className='update-body'>
            <div className='update-header'>
                <div onClick={handleMainNavigate}>
                    <label>Library management</label>
                </div>
                <div onClick={handleLogout}>
                    <label>Logout</label>
                </div>
            </div>
            <button className='update-general-button' onClick={() => handleUpdateTab(0)}>Add / Update customer</button>
            <button className='update-general-button' onClick={() => handleUpdateTab(1)}>Add / Update mail template</button>
            {
                user.userRole === FetchData.superAdmin && (
                    <>
                        <button className='update-general-button' onClick={() => handleUpdateTab(2)}>Add / Update admin</button>
                    </>
                )
            }
            <>
                {
                    updateTab === 0 && (
                        <>
                            <div className='update-search-container'>
                                <input id='tbEmailPhone' className='update-search-input' placeholder='Enter name, email or phone' type='text' />
                                <button className='update-search-button' onClick={handleCustomerSearch}>Search</button>
                            </div>
                            <div className='update-container'>
                                <button className='update-general-button' onClick={handleCustomerAddEdit}>Add new customer</button>
                            </div>
                            {
                                customerEdit && (
                                    <div className='update-centered-box'>
                                        <input id='tbCustomerAddName' className='update-general-input' placeholder='Name' type='text' />
                                        <br />
                                        <input id='tbCustomerAddEmail' className='update-general-input' placeholder='Email' type='email' />
                                        <br />
                                        <input id='tbCustomerAddPhone' className='update-general-input' placeholder='Phone' type='number' />
                                        <br />
                                        <input id='tbCustomerAddAddress' className='update-general-input' placeholder='Address' type='text' />
                                        <br />
                                        <button className='update-general-button' onClick={handleCustomerAdd}>Add</button>
                                        <button className='update-general-button' onClick={handleCustomerAddEdit}>Cancel</button>
                                        <label id='lbCustomerAddError' className='update-general-label' />
                                        <br />
                                    </div>
                                )
                            }
                            {
                                customers.map((customer, index) => index < FetchData.customerMaxDisplay && (
                                    <div key={index} className='update-centered-box'>
                                        {
                                            customer.updateCustomer ? (
                                                <>
                                                    <label className='update-general-label'>Name:</label>
                                                    <input id={`tbCustomerName${index}`} className='update-general-input' defaultValue={customer.customerName} type='text' />
                                                    <br />
                                                    <label className='update-general-label'>Email:</label>
                                                    <input id={`tbCustomerEmail${index}`} className='update-general-input' defaultValue={customer.email} type='email' />
                                                    <br />
                                                    <label className='update-general-label'>Phone:</label>
                                                    <input id={`tbCustomerPhone${index}`} className='update-general-input' defaultValue={customer.phone} type='number' />
                                                    <br />
                                                    <label className='update-general-label'>Address:</label>
                                                    <input id={`tbCustomerAddress${index}`} className='update-general-input' defaultValue={customer.address} type='text' />
                                                    <br />
                                                    <label className='update-general-label'>Membership start date: </label>
                                                    <input id={`dtCustomerMembership${index}`} className='update-general-input' type='datetime-local' />
                                                    <br />
                                                    <label className='update-general-label'>Late fee: </label>
                                                    <input id={`tbCustomerLateFee${index}`} className='update-general-input' defaultValue={customer.lateFee} type='number' />
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleCustomerUpdate(index)}>Update</button>
                                                    <button className='update-general-button' onClick={() => handleCustomerEdit(index)}>Cancel</button>
                                                    <label className='update-general-label-error'>{customer.error}</label>
                                                </>
                                            ) : (
                                                <>
                                                    <label className='update-general-label'>Name: {customer.customerName}</label>
                                                    <br />
                                                    <label className='update-general-label'>Email: {customer.email}</label>
                                                    <br />
                                                    <label className='update-general-label'>Phone: {customer.phone}</label>
                                                    <br />
                                                    <label className='update-general-label'>Address: {customer.address}</label>
                                                    <br />
                                                    <label className='update-general-label'>
                                                    {
                                                        customer.feePaid ? (
                                                            <>
                                                                Membership valid until: {customer.membershipValidUntil}
                                                            </>
                                                        ) : (
                                                            <>
                                                                Not a membership yet
                                                            </>
                                                        )
                                                    }
                                                    </label>
                                                    <br />
                                                    <label className='update-general-label'>Late fee: {customer.lateFee}</label>
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleCustomerEdit(index)}>Update</button>
                                                    <button className='update-general-button' onClick={() => handleCustomerDelete(index)}>Delete</button>
                                                </>
                                            )
                                        }
                                        {
                                            handleBorrowedDisplay(index)
                                        }
                                    </div>
                                ))
                            }
                            {
                                (customers.length > FetchData.customerMaxDisplay) && (
                                    <div className='update-centered-box'>
                                        <label className='general-label-warning'>Maximum customer display reached please use search function for specific customer</label>
                                    </div>
                                )
                            }
                        </>
                    )
                }
                {
                    updateTab === 1 && (
                        <>
                            <div className='update-search-container'>
                                <input id='tbMailTitle' className='update-search-input' placeholder='Enter title' type='text' />
                                <button className='update-search-button' onClick={handleMailSearch}>Search</button>
                            </div>
                            <div className='update-container'>
                                <button className='update-general-button' onClick={handleMailAddEdit}>Add new mail</button>
                            </div>
                            {
                                mailEdit && (
                                    <div className='update-centered-box'>
                                        <input id='tbMailAddTitle' className='update-general-input' placeholder='Title' type='text' />
                                        <br />
                                        <input id='tbMailAddBody' className='update-general-input' placeholder='Body' type='text' />
                                        <br />
                                        <button className='update-general-button' onClick={handleMailAdd}>Add</button>
                                        <button className='update-general-button' onClick={handleMailAddEdit}>Cancel</button>
                                        <label id='lbMailAddError' className='update-general-label' />
                                        <br />
                                    </div>
                                )
                            }
                            {
                                mails.map((mail, index) => index < FetchData.mailMaxDisplay && (
                                    <div key={index} className='update-centered-box'>
                                        {
                                            mail.updateMail ? (
                                                <>
                                                    <label className='update-general-label'>Title:</label>
                                                    <input id={`tbMailTitle${index}`} className='update-general-input' defaultValue={mail.mailTitle} type='text' />
                                                    <br />
                                                    <label className='update-general-label'>Body:</label>
                                                    <input id={`tbMailBody${index}`} className='update-general-input' defaultValue={mail.mailBody} type='text' />
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleMailUpdate(index)}>Update</button>
                                                    <button className='update-general-button' onClick={() => handleMailEdit(index)}>Cancel</button>
                                                    <label className='update-general-label-error'>{mail.error}</label>
                                                </>
                                            ) : (
                                                <>
                                                    <label className='update-general-label'>Title: {mail.mailTitle}</label>
                                                    <br />
                                                    <label className='update-general-label'>Body: {mail.mailBody}</label>
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleMailEdit(index)}>Update</button>
                                                    <button className='update-general-button' onClick={() => handleMailDelete(index)}>Delete</button>
                                                </>
                                            )
                                        }
                                        <br />
                                    </div>
                                ))
                            }
                            {
                                (mails.length > FetchData.mailMaxDisplay) && (
                                    <div className='update-centered-box'>
                                        <label className='general-label-warning'>Maximum mail display reached please use search function for specific mail</label>
                                    </div>
                                )
                            }
                        </>
                    )
                }
                {
                    updateTab === 2 && (
                        <>
                            <div className='update-search-container'>
                                <input id='tbAdminKeyword' className='update-search-input' placeholder='Enter name, email or phone' type='text' />
                                <button className='update-search-button' onClick={handleAdminSearch}>Search</button>
                                <button className='update-search-button' onClick={handleAdminIsLocked}>
                                    {
                                        adminIsLocked ? (
                                            <>
                                                Show available admin
                                            </>
                                        ) : (
                                            <>
                                                Show locked admin
                                            </>
                                        )
                                    }
                                </button>
                            </div>
                            {
                                (adminIsLocked === false) && (
                                    <div className='update-container'>
                                        <button className='update-general-button' onClick={handleAdminAddEdit}>Add new admin</button>
                                    </div>
                                )
                            }
                            {
                                adminEdit && (
                                    <div className='update-centered-box'>
                                        <input id='tbAmdinAddName' className='update-general-input' placeholder='Name' type='text' />
                                        <br />
                                        <input id='tbAmdinAddEmail' className='update-general-input' placeholder='Email' type='text' />
                                        <br />
                                        <input id='tbAmdinAddPhone' className='update-general-input' placeholder='Phone' type='number' />
                                        <br />
                                        <input id='tbAmdinAddPass' className='update-general-input' placeholder='Pass' type='password' />
                                        <br />
                                        <input id='tbAmdinAddPassConfirm' className='update-general-input' placeholder='Pass' type='password' />
                                        <br />
                                        <button className='update-general-button' onClick={handleAdminAdd}>Add</button>
                                        <button className='update-general-button' onClick={handleAdminAddEdit}>Cancel</button>
                                        <label id='lbAdminAddError' className='update-general-label' />
                                        <br />
                                    </div>
                                )
                            }
                            {
                                admins.map((admin, index) => handleAdminDisplay(index) && (
                                    <div key={index} className='update-centered-box'>
                                        {
                                            admin.updateUser ? (
                                                <>
                                                    <label className='update-general-label'>Name:</label>
                                                    <input id={`tbAmdinName${index}`} className='update-general-input' defaultValue={admin.userName} type='text' />
                                                    <br />
                                                    <label className='update-general-label'>Email:</label>
                                                    <input id={`tbAmdinEmail${index}`} className='update-general-input' defaultValue={admin.email} type='text' />
                                                    <br />
                                                    <label className='update-general-label'>Phone:</label>
                                                    <input id={`tbAmdinPhone${index}`} className='update-general-input' defaultValue={admin.phone} type='number' />
                                                    <br />
                                                    <label className='update-general-label'>Account is locked:</label>
                                                    <input id={`cbAdminIsLocked${index}`} className='general-input-checkbox' defaultChecked={admin.isLocked} type='checkbox' />
                                                    <label className='update-general-label'>True</label>
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleAdminUpdate(index)}>Update</button>
                                                    <br />
                                                    <label className='update-general-label'>Change password</label>
                                                    <br />
                                                    <label className='update-general-label'>Old pass:</label>
                                                    <input id={`tbAmdinOldPass${index}`} className='update-general-input' placeholder='Old password' type='password' />
                                                    <br />
                                                    <label className='update-general-label'>New pass:</label>
                                                    <input id={`tbAmdinNewPass${index}`} className='update-general-input' placeholder='New password' type='password' />
                                                    <br />
                                                    <label className='update-general-label'>Confirm pass:</label>
                                                    <input id={`tbAmdinNewPassConfirm${index}`} className='update-general-input' placeholder='New confirm password' type='password' />
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleAdminChangePass(index)}>Change pass</button>
                                                    <button className='update-general-button' onClick={() => handleAdminEdit(index)}>Cancel</button>
                                                    <label className='update-general-label-error'>{admin.error}</label>
                                                </>
                                            ) : (
                                                <>
                                                    <label className='update-general-label'>Name: {admin.userName}</label>
                                                    <br />
                                                    <label className='update-general-label'>Email: {admin.email}</label>
                                                    <br />
                                                    <label className='update-general-label'>Phone: {admin.phone}</label>
                                                    <br />
                                                    <button className='update-general-button' onClick={() => handleAdminEdit(index)}>Update</button>
                                                </>
                                            )
                                        }
                                        <br />
                                    </div>
                                ))
                            }
                            {
                                (admins.length > FetchData.userMaxDisplay) && (
                                    <div className='update-centered-box'>
                                        <label className='general-label-warning'>Maximum amdin display reached please use search function for specific amdin</label>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </>
            {
                handleFooterDisplay()
            }
            {
                (itemLoading || customerLoading || mailLoading || adminLoading) && (
                    <Popup open={true} position="center" closeOnDocumentClick={false}>
                        <div className='update-loading-container'>
                            <label className='general-label-warning'>Loading data please wait...</label>
                        </div>
                    </Popup>
                )
            }
        </div>
    );
}

export default Update;
