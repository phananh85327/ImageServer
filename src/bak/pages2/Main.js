import React, { useState, useEffect } from 'react'
import { ListRequestResponse, ListItemRequestResponse } from '../api/ListRequestResponse'
import CategoryRequestResponse from '../api/CategoryRequestResponse'
import UserRequestResponse from '../api/UserRequestResponse'
import ItemRequestResponse from '../api/ItemRequestResponse'
import CustomerRequestResponse from '../api/CustomerRequestResponse'
import MailRequestResponse from '../api/MailRequestResponse'
import FetchData from '../api/FetchData'
import Footer from '../models/Footer'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/View.css'

const Main = () => {
    // Lists data
    const [listLoading, setListLoading] = useState(true);
    const [listsVisible, setListsVisible] = useState(false);
    const [lists, setLists] = useState([]);
    const [listAdd, setListAdd] = useState(null);
    const [listItemAdd, setListItemAdd] = useState(null);
    const [listUpdate, setListUpdate] = useState(null);
    const [listItemUpdate, setListItemUpdate] = useState([]);
    const [listDelete, setListDelete] = useState(null);
    const [listItemDelete, setListItemDelete] = useState([]);
    const [listWarning, setListWarning] = useState(false);

    // Categories data
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [categorySelect, setCategorySelect] = useState(true);
    const [categoryEdit, setCategoryEdit] = useState(false);
    const [categoryAdd, setCategoryAdd] = useState(false);
    const [categoryUpdate, setCategoryUpdate] = useState(null);
    const [categoryDelete, setCategoryDelete] = useState(null);
    const [categoryError, setCategoryError] = useState('');

    // User data
    const [userLoading, setUserLoading] = useState(true);
    const [users, setUsers] = useState([]);

    // Item data
    const [itemLoading, setItemLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [itemHeaders, setItemHeaders] = useState([]);
    const [itemAdvanceSearch, setItemAdvanceSearch] = useState(false);
    const [itemCategory, setItemCategory] = useState('');
    const [itemAdd, setItemAdd] = useState(null);
    const [itemDownload, setItemDownload] = useState(null);
    const [itemHeaderUpdate, setItemHeaderUpdate] = useState(null);
    const [itemNoUpdate, setItemNoUpdate] = useState(null);
    const [itemNoSplitUpdate, setItemNoSplitUpdate] = useState(null);
    const [itemNotificationUpdate, setItemNotificationUpdate] = useState(null);
    const [itemDelete, setItemDelete] = useState(null);
    const [itemNoDelete, setItemNoDelete] = useState(null);
    const [itemNotificationDelete, setItemNotificationDelete] = useState(null);

    // Customer data
    const [customerLoading, setCustomerLoading] = useState(true);
    const [customers, setCustomers] = useState([]);

    // Mail data
    const [mailLoading, setMailLoading] = useState(true);
    const [mails, setMails] = useState([]);

    if ((sessionStorage.getItem(FetchData.accessToken) === null)
        || (sessionStorage.getItem(FetchData.refreshToken) === null)
        || (sessionStorage.getItem(FetchData.loginUser) === null)) {
        navigate('/login');
    }

    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem(FetchData.loginUser));

    // List effect
    useEffect(() => {
        const url = new URL(FetchData.listUrl);
        const fetchListsGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setListLoading(false);
                navigate('/error');
                return;
            }
            setLists(Object.values(result).map(list => ListRequestResponse.fromObject(list)));
            setListLoading(false);
        }
        const fetchListPost = async (index) => {
            const addList = lists.find((_, i) => i === index);
            const list = document.getElementById(`tbListName${index}`);
            if (addList === undefined) {
                console.log('Invalid list');
            } else if ((list === null) || (list.value === '')) {
                addList.error = 'Invalid list name';
            } else if (addList.items.length === 0) {
                addList.error = 'Must have 1 list item';
            } else {
                addList.listName = list.value;
                addList.error = '';
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), ListRequestResponse.toRequest(addList), navigate);
                if (result === null) {
                    setListLoading(false);
                    navigate('/error');
                    return;
                }
                const newLists = lists.filter((_, i) => i !== index);
                setLists([...newLists, ListRequestResponse.fromObject(result)]);
            }
            setListAdd(null);
            setListLoading(false);
        }
        const fetchListPut = async (index) => {
            const updateList = lists.find((_, i) => i === index);
            const list = document.getElementById(`tbListName${index}`);
            if (updateList === undefined) {
                console.log('Invalid list');
            } else if ((list === null) || (list.value === '')) {
                updateList.updateName = false;
                updateList.error = 'Invalid list name';
            } else if (list.value === list.defaultValue) {
                updateList.updateName = false;
                updateList.error = '';
            } else {
                updateList.listName = list.value;
                updateList.updateName = false;
                updateList.error = '';
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), ListRequestResponse.toRequest(updateList), navigate);
                if (result === null) {
                    setListLoading(false);
                    navigate('/error');
                    return;
                }
            }
            setLists(lists.map((list, i) => i === index ? updateList : list));
            setListUpdate(null);
            setListLoading(false);
        }
        const fetchListItemPutInsert = async (index) => {
            const updateList = lists.find((_, i) => i === index);
            if (updateList === undefined) {
                console.log('Invalid list');
            } else {
                const listItem = document.getElementById('tbListItemAddValue');
                if ((listItem === null) || (listItem.value === '') || (listItem.value.includes(FetchData.itemSeparator))) {
                    updateList.addItemValue = false;
                    updateList.error = 'Invalid list item';
                } else {
                    updateList.items = [...updateList.items, new ListItemRequestResponse(listItem.value)];
                    updateList.addItemValue = false;
                    updateList.error = '';
                    if (updateList.listID !== '') {
                        const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), ListRequestResponse.toRequest(updateList), navigate);
                        if (result === null) {
                            setListLoading(false);
                            navigate('/error');
                            return;
                        }
                    }
                }
                setLists(lists.map((list, i) => i === index ? updateList : list));
            }
            setListItemAdd(null);
            setListLoading(false);
        }
        const fetchListItemPutUpdate = async (listIndex, itemIndex) => {
            const updateList = lists.find((_, i) => i === listIndex);
            if (updateList === undefined) {
                console.log('Invalid list');
            } else {
                const updateListItem = updateList.items.find((_, i) => i === itemIndex);
                const listItem = document.getElementById(`tbListItemValue${listIndex}-${itemIndex}`);
                if (updateListItem === undefined) {
                    console.log('Invalid list item');
                } else if ((listItem === null) || (listItem.value === '')) {
                    updateListItem.updateValue = false;
                    updateList.error = 'Invalid list item value';
                } else if (listItem.value === listItem.defaultValue) {
                    updateListItem.updateValue = false;
                    updateList.error = '';
                } else {
                    updateListItem.value = listItem.value;
                    updateListItem.updateValue = false;
                    updateList.error = '';
                    if (updateList.listID !== '') {
                        const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), ListRequestResponse.toRequest(updateList), navigate);
                        if (result === null) {
                            setListLoading(false);
                            navigate('/error');
                            return;
                        }
                    }
                }
            }
            setLists(lists.map((list, i) => i === listIndex ? updateList : list));
            setListItemUpdate([]);
            setListLoading(false);
        }
        const fetchListItemPutDelete = async (listIndex, itemIndex) => {
            const deleteList = lists.find((_, i) => i === listIndex);
            if (deleteList === undefined) {
                console.log('Invalid list');
            } else {
                const deleteListItem = deleteList.items.find((_, i) => i === itemIndex);
                if (deleteListItem === undefined) {
                    console.log('Invalid list item');
                } else if (deleteList.items.length === 1) {
                    deleteListItem.updateValue = false;
                    deleteList.error = 'Must have at least 1 list item';
                } else {
                    deleteList.items = deleteList.items.filter((_, j) => j !== itemIndex);
                    deleteList.error = '';
                    if (deleteList.listID !== '') {
                        const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), ListRequestResponse.toRequest(deleteList), navigate);
                        if (result === null) {
                            setListLoading(false);
                            navigate('/error');
                            return;
                        }
                        if (listWarning === false) {
                            setListWarning(true);
                        }
                    }
                    setItems(items.map(item => (item.listID === deleteList.listID) && (item.listItem >= deleteList.items.length) ? { ...item, listItem: 0 } : item));
                }
                setLists(lists.map((list, i) => i === listIndex ? deleteList : list));
            }
            setListItemDelete([]);
            setListLoading(false);
        }
        const fetchListDelete = async (index) => {
            const deleteList = lists.find((_, i) => i === index);
            if (deleteList === undefined) {
                console.log('Invalid list');
            } else {
                url.searchParams.set('listID', deleteList.listID);
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                if (result === null) {
                    setListLoading(false);
                    navigate('/error');
                    return;
                }
                if (listWarning === false) {
                    setListWarning(true);
                }
                setItems(items.map(item => item.listID === deleteList.listID ? { ...item, listID: null, listItem: null } : item));
                setLists(lists.filter((_, i) => i !== index));
            }
            setListDelete(null);
            setListLoading(false);
        }
        if (listLoading) {
            if (listDelete !== null) {
                fetchListDelete(listDelete)
            } else if (listItemDelete.length === 2) {
                fetchListItemPutDelete(listItemDelete[0], listItemDelete[1]);
            } else if (listUpdate !== null) {
                fetchListPut(listUpdate);
            } else if (listItemUpdate.length === 2) {
                fetchListItemPutUpdate(listItemUpdate[0], listItemUpdate[1]);
            } else if (listItemAdd !== null) {
                fetchListItemPutInsert(listItemAdd);
            } else if (listAdd !== null) {
                fetchListPost(listAdd);
            } else {
                fetchListsGet();
            }
        }
    }, [listLoading]);

    // Category effect
    useEffect(() => {
        const url = new URL(FetchData.categoryUrl);
        const fetchCategoriesGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setCategoryLoading(false);
                navigate('/error');
                return;
            }
            const newCategories = Object.values(result).map(category => CategoryRequestResponse.fromObject(category));
            if (newCategories.length > 0) {
                setItemCategory(newCategories[0].categoryID);
            }
            setCategories(newCategories);
            setCategoryLoading(false);
        }
        const fetchCategoryPost = async () => {
            const addCategory = document.getElementById('tbCategoryAddName');
            if ((addCategory === null) || (addCategory.value === '')) {
                setCategoryError('Invalid category name');
            } else {
                setCategoryError('');
                const newCategory = new CategoryRequestResponse('', addCategory.value, false, '');
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), newCategory, navigate);
                if (result === null) {
                    setCategoryLoading(false);
                    navigate('/error');
                    return;
                }
                setCategories([...categories, CategoryRequestResponse.fromObject(result)]);
            }
            setCategoryEdit(false);
            setCategoryAdd(false);
            setCategoryLoading(false);
        }
        const fetchCategoryPacth = async (index) => {
            const updateCategory = categories.find((_, i) => i === index);
            const category = document.getElementById(`tbCategoryName${index}`);
            if (updateCategory === undefined) {
                setCategoryError('Invalid category');
            } else if ((category === null) || (category.value === '')) {
                setCategoryError('Invalid category name');
            } else if (category.value === category.defaultValue) {
                setCategoryError('');
                updateCategory.updateName = false;
            } else {
                setCategoryError('');
                updateCategory.categoryName = category.value;
                updateCategory.updateName = false;
                const result = await FetchData.sendRequest(url.href, FetchData.httpPatch, sessionStorage.getItem(FetchData.accessToken), updateCategory, navigate);
                if (result === null) {
                    setCategoryLoading(false);
                    navigate('/error');
                    return;
                }
            }
            setCategories(categories.map((category, i) => i === index ? updateCategory : category));
            setCategoryUpdate(null);
            setCategoryLoading(false);
        }
        const fetchCategoryDelete = async (index) => {
            const deleteCategory = categories.find((_, i) => i === index);
            if (deleteCategory === undefined) {
                setCategoryError('Invalid category');
            } else {
                setCategoryError('');
                url.searchParams.set('categoryID', deleteCategory.categoryID);
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                if (result === null) {
                    setCategoryLoading(false);
                    navigate('/error');
                    return;
                }
                const newCategories = categories.filter((_, i) => i !== index);
                if (deleteCategory.categoryID === itemCategory) {
                    setItemCategory(newCategories.length === 0 ? '' : newCategories[0].categoryID);
                    setItemAdd(null);
                    setItemDownload(null);
                    setItemHeaderUpdate(null);
                    setItemNoUpdate(null);
                    setItemNoSplitUpdate(null);
                    setItemDelete(null);
                    setItemNoDelete(null);
                    setItemLoading(true);
                }
                setCategories(newCategories);
            }
            setCategoryDelete(null);
            setCategoryLoading(false);
        }
        if (categoryLoading) {
            if (categoryDelete !== null) {
                fetchCategoryDelete(categoryDelete);
            } else if (categoryUpdate !== null) {
                fetchCategoryPacth(categoryUpdate);
            } else if (categoryAdd) {
                fetchCategoryPost();
            } else {
                fetchCategoriesGet();
            }
        }
    }, [categoryLoading]);

    // User effect
    useEffect(() => {
        const url = new URL(FetchData.userUrl);
        const fetchUserGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setUserLoading(false);
                navigate('/error');
                return;
            }
            setUsers(Object.values(result).map(admin => UserRequestResponse.fromObject(admin)));
            setUserLoading(false);
        }
        if (userLoading) {
            fetchUserGet();
        }
    });

    // Item effect
    useEffect(() => {
        let url = new URL(FetchData.itemUrl);
        const fetchItemsGet = async () => {
            url.searchParams.set('categoryID', itemCategory === '' ? "''" : itemCategory);
            const itemSearch = document.getElementById('tbSearch');
            if ((itemSearch !== null) && (itemSearch.value !== '')) {
                url.searchParams.set('itemName', itemSearch.value);
            }
            const itemDue = document.getElementById('dtDue');
            if ((itemDue !== null) && (itemDue.value !== '')) {
                url.searchParams.set('endTime', itemDue.value);
            }
            const itemCondition = document.getElementById('tbCondition');
            if ((itemCondition !== null) && (itemCondition.value !== '')) {
                url.searchParams.set('listItem', itemCondition.value);
            }
            const customerName = document.getElementById('tbCustomerName');
            if ((customerName !== null) && (customerName.value !== '')) {
                url.searchParams.set('customerName', customerName.value);
            }
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setItemLoading(false);
                navigate('/error');
                return;
            }
            const getItems = Object.values(result).map(item => ItemRequestResponse.fromObject(item));
            setItems(getItems);
            let itemHeaders = []
            getItems.forEach(item => {
                const itemHeader = itemHeaders.find(itemHeader => itemHeader.itemID === item.itemID);
                if (itemHeader === undefined) {
                    itemHeaders.push(new ItemRequestResponse(item.itemID, 0, item.itemName, item.imageUrl, item.categoryID));
                }
            });
            setItemHeaders(itemHeaders);
            setItemLoading(false);
        }
        const fetchItemPost = async (index) => {
            const addItem = items.find((_, i) => i === index);
            if (addItem === undefined) {
                console.log('Invalid item');
                return;
            }
            let callAPI = false;
            let updateError = false;
            if (addItem.digitalFlg) {
                const itemMemo = document.getElementById(`tbAddMemo${index}`);
                if (itemMemo === null) {
                    console.log('Invalid memo');
                } else {
                    addItem.digitalFlg = true;
                    addItem.digitalFile = addItem.newFile;
                    addItem.memo = itemMemo;
                    callAPI = true;
                }
            } else {
                const itemLocation = document.getElementById(`tbLocation${index}`);
                const itemQuantity = document.getElementById(`tbQuantity${index}`);
                const itemMemo = document.getElementById(`tbMemo${index}`);
                if (itemLocation === null) {
                    console.log('Invalid location');
                } else if ((itemQuantity === null) || (itemQuantity.value < 1)) {
                    addItem.error = 'Invalid quantity';
                    itemQuantity.value = addItem.quantity;
                    updateError = true;
                } else if (itemMemo === null) {
                    console.log('Invalid memo');
                } else {
                    addItem.digitalFlg = false;
                    addItem.location = itemLocation.value;
                    addItem.quantity = parseInt(itemQuantity.value);
                    addItem.memo = itemMemo.value;
                    callAPI = true;
                }
            }
            addItem.createdBy = user.userID;
            addItem.lastChange = user.userID;
            if (callAPI) {
                if (addItem.itemID === '') {
                    const indexHeader = itemHeaders.findIndex(item => item.itemID === addItem.itemID);
                    const itemName = document.getElementById(`tbName${indexHeader}`);
                    if ((itemName === null) || (itemName.value === '')) {
                        addItem.error = 'Invalid name';
                        updateError = true;
                    } else {
                        addItem.itemName = itemName.value;
                        addItem.imageUrl = addItem.newImage;
                    }
                } else {
                    url.searchParams.set('itemID', addItem.itemID);
                }
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), addItem, navigate);
                if (result === null) {
                    setItemLoading(false);
                    navigate('/error');
                    return;
                }
                const newItem = ItemRequestResponse.fromObject(result);
                if (addItem.itemID === '') {
                    setItems([...items.filter(item => item.itemID !== addItem.itemID), newItem]);
                    setItemHeaders(itemHeaders.map(item => item.itemID === '' ? newItem : item));
                } else {
                    setItems([...items.filter(item => ((item.itemID === addItem.itemID) && (item.itemNo === addItem.itemNo)) === false), newItem]);
                    setItemHeaders(itemHeaders.map(item => item.itemID === addItem.itemID ? { ...item, updateItem: true, addItem: false } : item));
                }
            }
            if (updateError) {
                setItems(items.map((item, i) => i === index ? addItem : item));
            }
            setItemAdd(null);
            setItemLoading(false);
        }
        const fetchItemDownload = async (index) => {
            const downloadItem = items.find((_, i) => i === index);
            if (downloadItem === undefined) {
                console.log('Invalid item');
            } else if (downloadItem.newFile !== null) {
                const byteCharacters = atob(downloadItem.newFile);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = FetchData.defaultFileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
            }
            setItemDownload(null);
            setItemLoading(false);
        }
        const fetchItemHeaderPut = async (index) => {
            const headerItem = itemHeaders.find((_, i) => i === index);
            const itemName = document.getElementById(`tbName${index}`);
            if (headerItem === undefined) {
                console.log('Invalid item');
            } else if ((itemName === null) || (itemName.value === '')) {
                headerItem.updateHeader = false;
                headerItem.error = 'Invalid item name';
            } else {
                headerItem.itemName = itemName.value;
                headerItem.imageUrl = headerItem.newImage;
                headerItem.updateHeader = false;
                headerItem.lastChange = user.userID;
                headerItem.error = '';
                url.searchParams.set('itemID', headerItem.itemID);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), headerItem, navigate);
                if (result === null) {
                    setItemLoading(false);
                    navigate('/error');
                    return;
                }
            }
            setItemHeaders(itemHeaders.map((item, i) => i === index ? headerItem : item));
            setItemHeaderUpdate(null);
            setItemLoading(false);
        }
        const fetchItemNoPut = async (index) => {
            const updateItem = items.find((_, i) => i === index);
            let callAPI = false;
            if (updateItem === undefined) {
                console.log('Invalid item');
            } else if (updateItem.digitalFlg) {
                const itemFile = document.getElementById(`fiFile${index}`);
                const itemMemo = document.getElementById(`tbMemo${index}`);
                if (itemFile === null) {
                    updateItem.error = 'Invalid file';
                } else if (itemMemo === null) {
                    updateItem.error = 'Invalid memo';
                } else {
                    itemFile.value = '';
                    updateItem.digitalFile = updateItem.newFile;
                    updateItem.memo = itemMemo.value;
                    updateItem.error = '';
                    callAPI = true;
                }
            } else {
                const itemLocation = document.getElementById(`tbLocation${index}`);
                const itemQuantity = document.getElementById(`tbQuantity${index}`);
                const itemMemo = document.getElementById(`tbMemo${index}`);
                if (itemLocation === null) {
                    updateItem.error = 'Invalid location';
                } else if ((itemQuantity === null) || (itemQuantity.value < 1)) {
                    updateItem.error = 'Invalid quantity';
                    itemQuantity.value = updateItem.quantity;
                } else if (itemMemo === null) {
                    updateItem.error = 'Invalid memo';
                } else {
                    updateItem.location = itemLocation.value;
                    updateItem.quantity = parseInt(itemQuantity.value);
                    updateItem.memo = itemMemo.value;
                    updateItem.error = '';
                    callAPI = true;
                }
            }
            updateItem.lastChange = user.userID;
            if (callAPI) {
                url.searchParams.set('itemID', updateItem.itemID);
                url.searchParams.set('itemNo', updateItem.itemNo);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), updateItem, navigate);
                if (result === null) {
                    setItemLoading(false);
                    navigate('/error');
                    return;
                }
            }
            setItems(items.map((item, i) => i === index ? updateItem : item));
            setItemNoUpdate(null);
            setItemLoading(false);
        }
        const fetchItemNoSplit = async (index) => {
            const updateItem = items.find((_, i) => i === index);
            const itemQuantity = document.getElementById(`tbQuantity${index}`);
            if (updateItem === undefined) {
                console.log('Invalid item');
            } else if (itemQuantity === null) {
                console.log('Invalid quantity');
            } else {
                if (updateItem.quantity === 1) {
                    updateItem.error = 'Invalid quantity';
                    itemQuantity.value = 1;
                    setItems(items.map((item, i) => i === index ? updateItem : item));
                } else {
                    url.searchParams.set('itemID', updateItem.itemID);
                    url.searchParams.set('itemNo', updateItem.itemNo);
                    updateItem.quantity = parseInt(updateItem.quantity) - 1;
                    updateItem.error = '';
                    const resultPut = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), updateItem, navigate);
                    if (resultPut === null) {
                        setItemLoading(null);
                        return;
                    }
                    itemQuantity.value = parseInt(updateItem.quantity);
                    const newItem = { ...updateItem };
                    newItem.quantity = 1;
                    const resultPost = await FetchData.sendRequest(url.href, FetchData.httpPost, sessionStorage.getItem(FetchData.accessToken), newItem, navigate);
                    if (resultPost === null) {
                        setItemLoading(null);
                        return;
                    }
                    setItems([...items, ItemRequestResponse.fromObject(resultPost)]);
                }
            }
            setItemNoSplitUpdate(null);
            setItemLoading(false);
        }
        const fetchItemNotificationPut = async (index) => {
            const updateItem = items.find((_, i) => i === index);
            const itemStart = document.getElementById(`dtStart${index}`);
            const itemEnd = document.getElementById(`dtEnd${index}`);
            const itemCustomer = document.getElementById(`tbCustomer${index}`);
            const itemSend = document.getElementById(`dtSend${index}`);
            const itemSubject = document.getElementById(`tbSubject${index}`);
            const itemBody = document.getElementById(`tbBody${index}`);
            const customer = customers.find(customer => (itemCustomer !== null) && (customer.email === itemCustomer.value));
            if (updateItem === undefined) {
                console.log('Invalid item');
            } else if ((itemStart === null) || (itemEnd === null) || (itemCustomer === null) || (itemStart === null) || (itemSend === null) || (itemSubject === null) || (itemBody === null)) {
                console.log('Invalid element');
            } else if (itemStart.value === '') {
                updateItem.error = 'Invalid start time';
            } else if ((itemEnd.value === '') || (new Date(itemEnd.value) <= new Date())) {
                updateItem.error = 'Invalid end time';
            } else if (new Date(itemStart.value) >= new Date(itemEnd.value)) {
                updateItem.error = 'Invalid time period';
            } else if ((customer === undefined) || (customer.feePaid === false) || (customer.lateFee > 0)) {
                updateItem.error = 'Invalid customer';
            } else if ((itemSend.value === '') || (new Date(itemStart.value) >= new Date(itemSend.value)) || (new Date(itemSend.value) >= new Date(itemEnd.value))) {
                updateItem.error = 'Invalid due notification time';
            } else if (itemSubject.value === '') {
                updateItem.error = 'Invalid subject';
            } else if (itemBody.value === '') {
                updateItem.error = 'Invalid body';
            } else {
                url = new URL(FetchData.notificationUrl);
                updateItem.startTime = itemStart.value;
                updateItem.endTime = itemEnd.value;
                updateItem.customerID = customer.customerID;
                updateItem.notificationTime = itemSend.value;
                updateItem.notificationSubject = itemSubject.value;
                updateItem.notificationBody = itemBody.value;
                updateItem.updateNotification = false;
                updateItem.error = '';
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, sessionStorage.getItem(FetchData.accessToken), updateItem, navigate);
                if (result === null) {
                    setItemLoading(false);
                    navigate('/error');
                    return;
                }
            }
            setItems(items.map((item, i) => i === index ? updateItem : item));
            setItemNotificationUpdate(null);
            setItemLoading(false);
        }
        const fetchItemDelete = async (index) => {
            const deleteItem = itemHeaders.find((_, i) => i === index);
            if (deleteItem === undefined) {
                console.log('Invalid item');
            } else {
                if (deleteItem.itemNo !== null) {
                    url.searchParams.set('itemID', deleteItem.itemID);
                    const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                    if (result === null) {
                        setItemLoading(false);
                        navigate('/error');
                        return;
                    }
                }
                setItemHeaders(itemHeaders.filter(item => item.itemID !== deleteItem.itemID));
                setItems(items.filter(item => item.itemID !== deleteItem.itemID));
            }
            setItemDelete(null);
            setItemLoading(false);
        }
        const fetchItemNoDelete = async (index) => {
            const deleteItem = items.find((_, i) => i === index);
            if (deleteItem === undefined) {
                console.log('Invalid item');
            } else {
                if (deleteItem.itemNo !== null) {
                    url.searchParams.set('itemID', deleteItem.itemID);
                    url.searchParams.set('itemNo', deleteItem.itemNo);
                    const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                    if (result === null) {
                        setItemLoading(false);
                        navigate('/error');
                        return;
                    }
                }
                const newItems = items.filter(item => (item.itemID === deleteItem.itemID && item.itemNo === deleteItem.itemNo) === false);
                if (newItems.filter(item => item.itemID === deleteItem.itemID).length === 0) {
                    setItemHeaders(itemHeaders.filter(item => item.itemID !== deleteItem.itemID));
                } else {
                    setItemHeaders(itemHeaders.map(item => item.itemID === deleteItem.itemID ? { ...item, updateItem: false } : item));
                }
                setItems(newItems);
            }
            setItemNoDelete(null);
            setItemLoading(false);
        }
        const fetchItemNotificationDelete = async (index) => {
            const deleteItem = items.find((_, i) => i === index);
            if (deleteItem === undefined) {
                console.log('Invalid item');
            } else {
                url = new URL(FetchData.notificationUrl);
                url.searchParams.set('itemID', deleteItem.itemID);
                url.searchParams.set('itemNo', deleteItem.itemNo);
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete, sessionStorage.getItem(FetchData.accessToken), null, navigate);
                if (result === null) {
                    setItemLoading(false);
                    navigate('/error');
                    return;
                }
                deleteItem.startTime = null;
                deleteItem.endTime = null;
                deleteItem.customerID = '';
                deleteItem.notificationTime = null;
                deleteItem.notificationSubject = '';
                deleteItem.notificationBody = '';
                deleteItem.updateNotification = false;
                deleteItem.error = '';
            }
            setItems(items.map((item, i) => i === index ? deleteItem : item));
            setItemNotificationDelete(null);
            setItemLoading(false);
        }
        if ((categoryLoading === false) && (userLoading === false) && itemLoading) {
            if (itemNotificationDelete !== null) {
                fetchItemNotificationDelete(itemNotificationDelete);
            } else if (itemNoDelete !== null) {
                fetchItemNoDelete(itemNoDelete);
            } else if (itemDelete !== null) {
                fetchItemDelete(itemDelete);
            } else if (itemNotificationUpdate !== null) {
                fetchItemNotificationPut(itemNotificationUpdate);
            } else if (itemNoSplitUpdate !== null) {
                fetchItemNoSplit(itemNoSplitUpdate);
            } else if (itemNoUpdate !== null) {
                fetchItemNoPut(itemNoUpdate);
            } else if (itemHeaderUpdate !== null) {
                fetchItemHeaderPut(itemHeaderUpdate);
            } else if (itemDownload !== null) {
                fetchItemDownload(itemDownload);
            } else if (itemAdd !== null) {
                fetchItemPost(itemAdd);
            } else {
                fetchItemsGet();
            }
        }
    }, [categoryLoading, userLoading, itemLoading]);

    // Customer effect
    useEffect(() => {
        const url = new URL(FetchData.customerUrl);
        const fetchCustomerGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setCustomerLoading(false);
                navigate('/error');
                return;
            }
            setCustomers(Object.values(result).map(customer => CustomerRequestResponse.fromObject(customer)));
            setCustomerLoading(false);
        }
        if (customerLoading) {
            fetchCustomerGet();
        }
    }, [customerLoading]);

    // Mail effect
    useEffect(() => {
        const url = new URL(FetchData.mailUrl);
        const fetchMailGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet, sessionStorage.getItem(FetchData.accessToken), null, navigate);
            if (result === null) {
                setMailLoading(false);
                navigate('/error');
                return;
            }
            setMails(Object.values(result).map(mail => MailRequestResponse.fromObject(mail)));
            setMailLoading(false);
        }
        if (mailLoading) {
            fetchMailGet();
        }
    }, [mailLoading]);

    // User handle
    const handleNavigateLoginUpdate = () => {
        if ((sessionStorage.getItem(FetchData.accessToken) === null)
            || (sessionStorage.getItem(FetchData.refreshToken) === null)
            || (sessionStorage.getItem(FetchData.loginUser) === null)) {
            navigate('/login');
        } else {
            navigate('/update');
        }
    }

    // List handle
    const HandleListsVisible = () => {
        if (listsVisible) {
            lists.forEach(list => {
                list.updateName = false;
                list.items = list.items.map(item => ({
                    ...item,
                    updateValue: false
                }));
            });
        }
        setLists(lists.filter(list => list.listID !== ''));
        setListsVisible(listsVisible === false);
    }

    const handleListUpdateName = (index) => {
        setListUpdate(index);
        setListLoading(true);
    }

    const handleListEditName = (index) => {
        setLists(lists.map((list, i) => i === index ? { ...list, updateName: list.updateName === false } : list));
    }

    const handleClosePopup = () => {
        setListWarning(null);
    }

    const handleListItemUpdateValue = (listIndex, itemIndex) => {
        setListItemUpdate([listIndex, itemIndex]);
        setListLoading(true);
    }

    const handleListItemDeleteValue = (listIndex, itemIndex) => {
        setListItemDelete([listIndex, itemIndex]);
        setListLoading(true);
    }

    const handleListItemEditValue = (listIndex, itemIndex) => {
        setLists(lists.map((list, i) => i === listIndex ? { ...list, items: list.items.map((item, j) => j === itemIndex ? { ...item, updateValue: true } : item) } : list));
    }

    const handleListItemAdd = (index) => {
        setListItemAdd(index);
        setListLoading(true);
    }

    const handleListItemEdit = (index) => {
        setLists(lists.map((list, i) => i === index ? { ...list, addItemValue: list.addItemValue === false } : list));
    }

    const handleListAdd = (index) => {
        setListAdd(index);
        setListLoading(true);
    }

    const handleListEdit = () => {
        if (lists.find(list => list.listID === '') === undefined) {
            const newList = new ListRequestResponse();
            newList.updateName = true;
            setLists([...lists, newList]);
        } else {
            setLists(lists.filter(list => list.listID !== ''));
        }
    }

    const handleListDelete = (index) => {
        setListDelete(index);
        setListLoading(true);
    }

    // Categories handle
    const handleCategorySelect = () => {
        if (categorySelect === false) {
            categories.forEach(category => {
                category.updateName = false;
            });
        }
        setCategoryError('');
        setCategoryEdit(false);
        setCategoryAdd(false);
        setCategoryUpdate(null);
        setCategoryDelete(null);
        setCategorySelect(categorySelect === false);
    }

    const handleCategoryChange = (index) => {
        const category = categories.find((_, i) => i === index);
        if (category === undefined) {
            console.log('Invalid category');
        } else {
            setItemCategory(category.categoryID);
            setItemAdd(null);
            setItemDownload(null);
            setItemHeaderUpdate(null);
            setItemNoUpdate(null);
            setItemNoSplitUpdate(null);
            setItemDelete(null);
            setItemNoDelete(null);
            setItemLoading(true);
        }
    }

    const handleCategoryUpdateName = (index) => {
        setCategoryUpdate(index);
        setCategoryLoading(true);
    }

    const handleCategoryDeleteName = (index) => {
        setCategoryDelete(index);
        setCategoryLoading(true);
    }

    const handleCategoryEditName = (index) => {
        setCategories(categories.map((category, i) => i === index ? { ...category, updateName: true } : category));
    }

    const handleCategoryAdd = () => {
        setCategoryAdd(true);
        setCategoryLoading(true);
    }

    const handleCategoryEdit = () => {
        setCategoryEdit(categoryEdit === false);
    }

    // Item handle
    const handleItemSearch = () => {
        setItemAdd(null);
        setItemDownload(null);
        setItemHeaderUpdate(null);
        setItemNoUpdate(null);
        setItemNoSplitUpdate(null);
        setItemDelete(null);
        setItemNoDelete(null);
        setItemLoading(true);
    }

    const handleItemAdvanceSearch = () => {
        if (itemAdvanceSearch) {
            const itemDue = document.getElementById('dtDue');
            const itemCondition = document.getElementById('tbCondition');
            const customerName = document.getElementById('tbCustomerName');
            if ((itemDue === null) || (itemCondition === null) || (customerName === null)) {
                console.log('Invalid element');
            } else {
                itemDue.value = '';
                itemCondition.value = '';
                customerName.value = '';
            }
        }
        setItemAdvanceSearch(itemAdvanceSearch === false);
    }

    const handleImageChange = (e, index) => {
        const image = e.target.files[0];
        if (image) {
            if (image.size > FetchData.fileSize) {
                e.target.value = '';
                setItems((item, i) => i === index ? { ...item, error: 'Invalid size' } : item);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const image = document.getElementById(`imgHeader${index}`);
                if (image === null) {
                    console.log('Invalid image');
                } else {
                    image.src = reader.result;
                }
                setItemHeaders(itemHeaders.map((item, i) => i === index ? { ...item, newImage: reader.result.split(',')[1] } : item));
            };
            reader.readAsDataURL(image);
        }
    }

    const handleImageClear = (index) => {
        const image = document.getElementById(`imgHeader${index}`);
        const itemImage = document.getElementById(`flImage${index}`);
        if (image === null) {
            console.log('Invalid image')
        } else if (itemImage === null) {
            console.log('Invalid file');
        } else {
            image.src = null;
            itemImage.value = '';
            setItemHeaders(itemHeaders.map((item, i) => i === index ? { ...item, newImage: null } : item));
        }
    }
    
    const handleHeaderUpdate = (index) => {
        setItemHeaderUpdate(index);
        setItemLoading(true);
    }

    const handleHeaderEdit = (index) => {
        const itemEdit = itemHeaders.find((_, i) => i === index);
        const itemImage = document.getElementById(`imgHeader${index}`);
        if (itemEdit === undefined) {
            console.log('Invalid item');
        } else if (itemImage === null) {
            itemEdit.error = 'Invalid image';
        } else {
            itemImage.src = itemEdit.imageUrl === null ? null : 'data:image/jpeg;base64,' + itemEdit.imageUrl;
            setItemHeaders(itemHeaders.map((item, i) => i === index ? { ...item, newImage: itemEdit.imageUrl === null ? null : itemEdit.imageUrl } : item));
            itemEdit.updateHeader = itemEdit.updateHeader === false;
        }
        setItemHeaders(itemHeaders.map((item, i) => i === index ? itemEdit : item));
    }

    const handleItemDelete = (index) => {
        setItemDelete(index);
        setItemLoading(true);
    }

    const handleItemNoEdit = (index) => {
        setItemHeaders(itemHeaders.map((item, i) => i === index ? { ...item, updateItem: item.updateItem === false } : item));
    }

    const handleItemNoDisplay = (itemNo, indexNo) => {
        let count = 1;
        for (var i = 0; i < indexNo; i++) {
            if (items[i].itemID === itemNo.itemID) count++;
        }
        return (
            <>
                <label className='header'>Book no {count}</label>
                <label className='general-label-error'>{itemNo.error}</label>
                <label className='general-label'>Item management list: </label>
                <div className='general-custom-select'>
                    <select value={itemNo.listID === null ? '' : itemNo.listID} onChange={(e) => handleItemNoListChange(e, indexNo)}>
                        <option key='' value='' />
                        {
                            lists.map(list =>
                                <option key={list.listID} value={list.listID}>
                                    {list.listName}
                                </option>
                            )
                        }
                    </select>
                </div>
                <label className='general-label'>: </label>
                {
                    handleItemNoListDisplay(indexNo)
                }
                <br />
                <label className='general-label'>Digital item: </label>
                <input className='general-input-checkbox' type="checkbox" checked={itemNo.digitalFlg} onChange={() => handleDigitalChange(indexNo)} />
                <label className='general-label'>True</label>
                <br />
                {
                    itemNo.digitalFlg ? (
                        <>
                            {
                                ((itemNo.digitalFile === null) || (itemNo.newFile === null)) ? (
                                    <>
                                        <label className='general-label'>No file available</label>
                                        {
                                            (itemNo.digitalFile !== null) && (
                                                <button className='general-button' onClick={() => handleFileEdit(indexNo)}>Restore</button>
                                            )
                                        }
                                    </>
                                ) : (
                                    <>
                                        <button className='general-button' onClick={() => handleFileDownload(indexNo)}>Download file</button>
                                        <button className='general-button' onClick={() => handleFileEdit(indexNo)}>Clear file</button>
                                    </>
                                )
                            }
                            <br />
                            <input id={`fiFile${indexNo}`} className='general-file-input' type="file" accept=".pdf" onChange={(e) => handleFileChange(e, indexNo)} />
                        </>
                    ) : (
                        <>
                            <label className='general-label'>Item physical location: </label>
                            <input id={`tbLocation${indexNo}`} className='general-input' defaultValue={itemNo.location} type='text' />
                            <br />
                            <label className='general-label'>Item quantity: </label>
                            <input id={`tbQuantity${indexNo}`} className='general-input' defaultValue={itemNo.quantity} type='number' />
                        </>
                    )
                }
                <br />
                <label className='general-label'>Item memo: </label>
                <input id={`tbMemo${indexNo}`} className='general-input' defaultValue={itemNo.memo} type='text' />
                {
                    handleItemBorrowedBy(indexNo)
                }
                {
                    handleItemCreateChangeBy(indexNo)
                }
                <br />
                {
                    itemNo.itemNo === null ? (
                        <>
                            <button className='general-button' onClick={() => handleItemNoInsert(indexNo)}>Add</button>
                            <button className='general-button' onClick={() => handleItemEdit(itemNo.itemID)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button className='general-button' onClick={() => handleItemNoUpdate(indexNo)}>Update</button>
                            {
                                (itemNo.digitalFlg === false) && (
                                    <button className='general-button' onClick={() => handleItemNoSplit(indexNo)}>Split</button>
                                )
                            }
                            <button className='general-button' onClick={() => handleItemNoDelete(indexNo)}>Remove</button>
                            <button className='general-button' onClick={() => handleItemNoNotificationEdit(indexNo)}>Notification</button>
                            {
                                itemNo.updateNotification && (
                                    <div className='popup-overlay'>
                                        <Popup open={true} position="center" closeOnDocumentClick={false}>
                                            <div className='popup-container'>
                                                <label className='general-label-error'>{itemNo.error}</label>
                                                <label className='general-label'>Start time: </label>
                                                <input id={`dtStart${indexNo}`} className='general-datetime-input' defaultValue={itemNo.startTime} type='datetime-local' />
                                                <br />
                                                <label className='general-label'>End time: </label>
                                                <input id={`dtEnd${indexNo}`} className='general-datetime-input' defaultValue={itemNo.endTime} type='datetime-local' />
                                                <br />
                                                <label className='general-label'>Customer email: </label>
                                                {
                                                    handleCustomerDisplay(indexNo)
                                                }
                                                <br />
                                                <label className='general-label'>Due notification time: </label>
                                                <input id={`dtSend${indexNo}`} className='general-datetime-input' defaultValue={itemNo.notificationTime} type='datetime-local' />
                                                <br />
                                                <label className='general-label'>Mail template</label>
                                                <div className='general-custom-select'>
                                                    <select defaultValue={''} onChange={(e) => handleMailChange(e, indexNo)}>
                                                        <option key='' value='' />
                                                        {
                                                            mails.map(mail =>
                                                                <option key={mail.mailID} value={mail.mailID}>
                                                                    {mail.mailTitle}
                                                                </option>
                                                            )
                                                        }
                                                    </select>
                                                </div>
                                                <br />
                                                <label className='general-label'>Subject: </label>
                                                <input id={`tbSubject${indexNo}`} className='general-input' defaultValue={itemNo.notificationSubject} type='text' />
                                                <br />
                                                <label className='general-label'>Body: </label>
                                                <textarea id={`tbBody${indexNo}`} className='item-textarea' defaultValue={itemNo.notificationBody} />
                                                <br />
                                                <button className='general-button' onClick={() => handleItemNoNotificationEdit(indexNo)}>Close</button>
                                                <button className='general-button' onClick={() => handleItemNoNotificationDelete(indexNo)}>Clear notification</button>
                                                <button className='general-button' onClick={() => handleItemNoNotificationUpdate(indexNo)}>Update notification</button>
                                            </div>
                                        </Popup>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </>
        )
    }

    const handleItemNoListChange = (e, index) => {
        setItems(items.map((item, i) => i === index ? { ...item, listID: e.target.value, listItem: 0 } : item));
    }

    const handleItemNoListDisplay = (index) => {
        const item = items.find((_, i) => i === index);
        if (item === undefined) {
            return null;
        } else {
            const list = lists.find(list => list.listID === item.listID);
            if (list === undefined) {
                return null;
            } else {
                return (
                    <>
                        <br />
                        {
                            list.items.map((itemList, itemIndex) => (
                                <button key={itemIndex} className='general-button' disabled={itemIndex === item.listItem} onClick={() => handleItemNoListItemChange(index, itemIndex, itemAdd)}>{itemList.value}</button>
                            ))
                        }
                    </>
                )
            }
        }
    }

    const handleItemNoListItemChange = (index, listItem) => {
        setItems(items.map((item, i) => i === index ? { ...item, listItem: listItem } : item));
    }

    const handleDigitalChange = (index) => {
        setItems(items.map((item, i) => i === index ? { ...item, digitalFlg: item.digitalFlg === false } : item));
    }

    const handleFileEdit = (index) => {
        const itemFile = items.find((_, i) => i === index);
        if (itemFile === undefined) {
            console.log('Invalid item');
        } else {
            setItems(items.map((item, i) => i === index ? { ...item, newFile: item.newFile === null ? itemFile.digitalFile : null } : item));
        }
    }

    const handleFileDownload = (index) => {
        setItemDownload(index);
        setItemLoading(true);
    }

    const handleFileChange = (e, index, itemAdd = false) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > FetchData.fileSize) {
                e.target.value = ''
                setItems(items.map((item, i) => i === index ? { ...item, error: 'Invalid size' } : item));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setItems(items.map((item, i) => i === index ? { ...item, newFile: reader.result.split(',')[1] } : item));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleInputChange = (index, value) => {
        if (!isNaN(value) && value.trim() !== "") {
          // Update your state or perform other actions here
          console.log(`Updated index ${index} with value ${value}`);
        } else {
          // Prevent invalid input
          const inputElement = document.getElementById(`tbQuantity${index}`);
          inputElement.value = inputElement.defaultValue;
          console.log(`Invalid input ignored: ${value}`);
        }
    }

    const handleItemNoUpdate = (index) => {
        setItemNoUpdate(index);
        setItemLoading(true);
    }

    const handleItemNoSplit = (index) => {
        setItemNoSplitUpdate(index);
        setItemLoading(true);
    }

    const handleItemNoDelete = (index) => {
        setItemNoDelete(index);
        setItemLoading(true);
    }

    const handleCustomerDisplay = (index) => {
        let customerEmail = '';
        let customerName = '';
        let customerWarning = '';
        const item = items.find((_, i) => i === index);
        if (item !== undefined) {
            const customer = customers.find(customer => customer.customerID === item.customerID);
            if (customer !== undefined) {
                customerEmail = customer.email;
                customerName = 'Customer name: ' + customer.customerName;
                if ((customer.feePaid === false) && (customer.lateFee > 0)) {
                    customerWarning = ' (Invalid membership with ' + customer.lateFee + ' late fee)';
                } else if (customer.feePaid === false) {
                    customerWarning = ' (Invalid membership)';
                } else if (customer.lateFee > 0) {
                    customerWarning = ' (' + customer.lateFee + ' late fee)';
                }
            }
        }
        return (
            <>
                <label id={`lbCustomer${index}`} className='general-label'>{customerName}</label>
                <label id={`lbCustomerWarning${index}`} className='general-label-warning' style={{ visibility: customerWarning === '' ? 'hidden' : 'visible' }}>{customerWarning}</label>
                <input id={`tbCustomer${index}`} className='general-input' defaultValue={customerEmail} type='email' onChange={(e) => handleCustomerChange(e, index)} />
            </>
        )
    }

    const handleCustomerChange = (e, index) => {
        const customerName = document.getElementById(`lbCustomer${index}`);
        const customerWarning = document.getElementById(`lbCustomerWarning${index}`);
        if (customerName === undefined) {
            console.log('Invalid customer');
        } else {
            const customer = customers.find(customer => customer.email === e.target.value);
            if (customer === undefined) {
                customerName.textContent = '';
                customerWarning.style.visibility = 'hidden';
            } else {
                customerName.textContent = 'Customer name: ' + customer.customerName;
                let warningText = '';
                if ((customer.feePaid === false) && (customer.lateFee > 0)) {
                    warningText = ' (Invalid membership with ' + customer.lateFee + ' late fee)';
                } else if (customer.feePaid === false) {
                    warningText = ' (Invalid membership)';
                } else if (customer.lateFee > 0) {
                    warningText = ' (' + customer.lateFee + ' late fee)';
                }
                customerWarning.style.visibility = warningText === '' ? 'hidden' : 'visible';
                customerWarning.textContent = warningText;
            }
        }
    }

    const handleMailChange = (e, index) => {
        const mail = mails.find(mail => mail.mailID === e.target.value);
        if (mail === undefined) {
            console.log('Invalid mail');
        } else {
            const subject = document.getElementById(`tbSubject${index}`);
            const body = document.getElementById(`tbBody${index}`);
            if ((subject === undefined) || (body === undefined)) {
                console.log('Invalid mail');
            } else {
                subject.value = mail.mailTitle;
                body.value = mail.mailBody;
            }
        }
    }

    const handleItemNoNotificationEdit = (index) => {
        setItems(items.map((item, i) => i === index ? { ...item, updateNotification: item.updateNotification === false, error: '' } : item));
    }
    
    const handleItemNoNotificationDelete = (index) => {
        setItemNotificationDelete(index);
        setItemLoading(true);
    }
    
    const handleItemNoNotificationUpdate = (index) => {
        setItemNotificationUpdate(index);
        setItemLoading(true);
    }

    const handleItemBorrowedBy = (index) => {
        const item = items.find((_, i) => i === index);
        if (item === undefined) {
            console.log('Invalid item');
            return null;
        }
        const customer = customers.find(customer => customer.customerID === item.customerID);
        if (customer === undefined) {
            console.log('Invalid customer');
            return null;
        }
        return (
            <>
                <br />
                <label className='general-label'>Borrowed by: {customer.customerName} - {customer.email}</label>
            </>
        );
    }

    const handleItemCreateChangeBy = (index) => {
        const item = items.find((_, i) => i === index);
        if (item === undefined) {
            console.log('Invalid item');
            return null;
        }
        const userCreate = users.find(user => user.userID === item.createdBy);
        const userChange = users.find(user => user.userID === item.lastChange);
        const display = [];
        if (userCreate !== undefined) {
            display.push(<label className='general-label'>Created by: {userCreate.email}</label>);
        }
        if (userChange !== undefined) {
            display.push(<label className='general-label'>Last update: {userChange.email}</label>);
        }
        return display.length === 0 ? null : (<>{display.map((user, index) => (<React.Fragment key={index}><br />{user}</React.Fragment>))}</>)
    }

    const handleItemNoInsert = (index) => {
        setItemAdd(index);
        setItemLoading(true);
    }

    const handleItemEdit = (itemID = '') => {
        const itemHeader = itemHeaders.find(item => item.itemID === itemID);
        if (itemHeader === undefined) {
            const newItem = new ItemRequestResponse();
            newItem.categoryID = itemCategory;
            setItems([...items, newItem]);
            newItem.updateHeader = true;
            newItem.updateItem = true;
            newItem.addItem = true;
            if (itemHeaders.length >= FetchData.itemMaxDisplay) {
                const headers = [...itemHeaders];
                headers.splice(FetchData.itemMaxDisplay - 1, 0, newItem);
                setItemHeaders(headers);
            } else {
                setItemHeaders([...itemHeaders, newItem]);
            }
        } else if (itemID === '') {
            setItemHeaders(itemHeaders.filter(item => item.itemID !== itemID));
            setItems(items.filter(item => item.itemID !== itemID));
        } else if (itemHeader.addItem) {
            setItemHeaders(itemHeaders.map(item => item.itemID === itemID ? { ...item, addItem: false } : item));
            setItems(items.filter(item => ((item.itemID === itemID) && (item.itemNo === null)) === false));
        } else {
            setItemHeaders(itemHeaders.map(item => item.itemID === itemID ? { ...item, addItem: true } : item));
            setItems([...items, new ItemRequestResponse(itemID, null, itemHeader.itemName, itemHeader.imageUrl, itemHeader.categoryID)]);
        }
    }

    const handleFooterDisplay = () => {
        let footerUrlsImages = [];
        for (var i = 0; i < Footer.urls.length; i++) {
            footerUrlsImages.push(<a href={Footer.urls[i]}><img src={Footer.images[i]} alt="No image" className="footer-image" /></a>);
        }
        return (
            <footer className="footer">
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
        <div className='body'>
            <div className='header'>
                <label>Library management</label>
                <div onClick={handleNavigateLoginUpdate}>
                    <label>{user.userRole} | {user.userName}</label>
                </div>
            </div>
            <div className='search-container'>
                <input id='tbSearch' className='search-input' placeholder='Book name' type='text' />
                <button className='search-button' onClick={handleItemSearch}>Search</button>
                <button className='advance-search-button' onClick={handleItemAdvanceSearch}>Advance search</button>
                {
                    itemAdvanceSearch && (
                        <>
                            <label className='search-label'>Overdue date: </label>
                            <input id='dtDue' className='search-input' type='datetime-local' />
                            <label className='search-label'>Item condition: </label>
                            <input id='tbCondition' className='search-input' type='text' />
                            <label className='search-label'>Customer name: </label>
                            <input id='tbCustomerName' className='search-input' type='text' />
                        </>
                    )
                }
            </div>
            <div className='list-container'>
                <button className='general-button' onClick={HandleListsVisible}>
                    {
                        listsVisible ? (
                            <>Close list item</>
                        ) : (
                            <>Manage list item</>
                        )
                    }
                </button>
            </div>
            <div className='list-container'>
                {
                    listsVisible && (
                        <>
                            {
                                lists.map((list, listIndex) => (
                                    <div key={listIndex} className='list-centered-box'>
                                        <label className='general-label-header'>List name: </label>
                                        {
                                            list.updateName ? (
                                                <>
                                                    <input id={`tbListName${listIndex}`} className='list-input' defaultValue={list.listName} type='text' />
                                                    {
                                                        list.listID === '' ? null : (
                                                            <>
                                                                <button className='general-button' onClick={() => handleListUpdateName(listIndex)}>Update</button>
                                                                <button className='general-button' onClick={() => handleListEditName(listIndex)}>Cancel</button>
                                                            </>
                                                        )
                                                    }
                                                </>
                                            ) : (
                                                <>
                                                    <button className='general-button' onClick={() => handleListEditName(listIndex)}>{list.listName}</button>
                                                </>
                                            )
                                        }
                                        <label className='general-label-error'>{list.error}</label>
                                        {
                                            listWarning && (
                                                <div className='popup-overlay'>
                                                    <Popup open={true} onClose={handleClosePopup} position='center'>
                                                        <div className='list-popup-container'>
                                                            <label className='list-label-error'>
                                                                Deleted list or item in list will also affect item that had selected that list or item in that list
                                                            </label>
                                                        </div>
                                                    </Popup>
                                                </div>
                                            )

                                        }
                                        {
                                            list.items.map((listItem, itemIndex) => (
                                                <React.Fragment key={itemIndex}>
                                                    {
                                                        listItem.updateValue ? (
                                                            <>
                                                                <input id={`tbListItemValue${listIndex}-${itemIndex}`} className='list-input' defaultValue={listItem.value} type='text' />
                                                                <button className='general-button' onClick={() => handleListItemUpdateValue(listIndex, itemIndex)}>Update</button>
                                                                <button className='general-button' onClick={() => handleListItemDeleteValue(listIndex, itemIndex)}>Delete</button>
                                                            </>
                                                        ) : (
                                                            <button className='general-button' onClick={() => handleListItemEditValue(listIndex, itemIndex)}>{listItem.value}</button>
                                                        )
                                                    }
                                                </React.Fragment>
                                            ))
                                        }
                                        {
                                            list.addItemValue ? (
                                                <>
                                                    <input id='tbListItemAddValue' className='list-input' type='text' />
                                                    <button className='general-button' onClick={() => handleListItemAdd(listIndex)}>Add</button>
                                                    <button className='general-button' onClick={() => handleListItemEdit(listIndex)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className='general-button' onClick={() => handleListItemEdit(listIndex)}>+</button>
                                                </>
                                            )
                                        }
                                        <br />
                                        {
                                            list.listID === '' ? (
                                                <>
                                                    <button className='general-button' onClick={() => handleListAdd(listIndex)}>Add</button>
                                                    <button className='general-button' onClick={handleListEdit}>Cancel</button>
                                                </>
                                            ) : (
                                                <button className='general-button' onClick={() => handleListDelete(listIndex)}>Delete list</button>
                                            )
                                        }
                                    </div>
                                ))
                            }
                            {
                                lists.find(list => list.listID === '') === undefined && (
                                    <button className='general-button' onClick={handleListEdit}>Add new list</button>
                                )
                            }
                        </>
                    )
                }
            </div>
            <div className='category-container'>
                <button className='general-button' onClick={handleCategorySelect}>
                    {
                        categorySelect ? (
                            <>Add / update category</>
                        ) : (
                            <>Close add / update category</>
                        )
                    }
                </button>
            </div>
            {
                categorySelect ? (
                    <>
                        <div className='category-container'>
                            {
                                categories.map((category, index) => (
                                    <button key={index} className='general-button' disabled={category.categoryID === itemCategory} onClick={() => handleCategoryChange(index)}>{category.categoryName}</button>
                                ))
                            }
                        </div>
                    </>
                ) : (
                    <>
                        <div className='category-centered-box'>
                            <label className='general-label-error'>{categoryError}</label>
                            {
                                categories.map((category, index) => (
                                    <React.Fragment key={index}>
                                        {
                                            category.updateName ? (
                                                <>
                                                    <input id={`tbCategoryName${index}`} className='category-input' defaultValue={category.categoryName} type='text' />
                                                    <button className='general-button' onClick={() => handleCategoryUpdateName(index)}>Update</button>
                                                    <button className='general-button' onClick={() => handleCategoryDeleteName(index)}>Delete</button>
                                                </>
                                            ) : (
                                                <button className='general-button' onClick={() => handleCategoryEditName(index)}>{category.categoryName}</button>
                                            )
                                        }
                                    </React.Fragment>
                                ))
                            }
                            {
                                categoryEdit ? (
                                    <>
                                        <input id='tbCategoryAddName' className='category-input' type='text' />
                                        <button className='general-button' onClick={handleCategoryAdd}>Add</button>
                                        <button className='general-button' onClick={handleCategoryEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <button className='general-button' onClick={handleCategoryEdit}>+</button>
                                )
                            }
                        </div>
                    </>
                )
            }
            <div className='centered-box'>
                {
                    itemHeaders.map((item, index) => (index < FetchData.itemMaxDisplay) && (
                        <div key={index} className='item-row'>
                            <div className='item-header'>
                                <img id={`imgHeader${index}`} className='item-image' src={item.imageUrl === null ? null : 'data:image/jpeg;base64,' + item.imageUrl} alt="No image" />
                                {
                                    item.updateHeader ? (
                                        <>
                                            <input id={`flImage${index}`} className='general-file-input' type="file" accept=".jpeg, .jpg" onChange={(e) => handleImageChange(e, index)} />
                                            <button className='general-button' onClick={() => handleImageClear(index)}>Clear image</button>
                                            <input id={`tbName${index}`} className='general-input' placeholder='Item name' defaultValue={item.itemName} type='text' />
                                            {
                                                (item.itemNo !== null) && (
                                                    <>
                                                        <button className='general-button' onClick={() => handleHeaderUpdate(index)}>Update</button>
                                                        <button className='general-button' onClick={() => handleHeaderEdit(index)}>Cancel</button>
                                                    </>
                                                )
                                            }
                                        </>
                                    ) : (
                                        <>
                                            <label className='general-label-header'>{item.itemName}</label>
                                            <button className='general-button' onClick={() => handleHeaderEdit(index)}>Change</button>
                                            <button className='general-button' onClick={() => handleItemDelete(index)}>Delete</button>
                                            <button className='general-button' onClick={() => handleItemNoEdit(index)}>
                                                {
                                                    item.updateItem ? (
                                                        <span className='arrow-up' />
                                                    ) : (
                                                        <span className='arrow-down' />
                                                    )
                                                }
                                            </button>
                                        </>
                                    )
                                }
                            </div>
                            <div className='item-left-box'>
                                {
                                    item.updateItem && (
                                        <>
                                            {
                                                items.map((itemNo, indexNo) => (itemNo.itemID === item.itemID) && (
                                                    <React.Fragment key={indexNo}>
                                                        {
                                                            handleItemNoDisplay(itemNo, indexNo)
                                                        }
                                                    </React.Fragment>)
                                                )
                                            }
                                            <br />
                                            {
                                                item.addItem === false && (
                                                    <button className='general-button' onClick={() => handleItemEdit(item.itemID)}>Add child item</button>
                                                )
                                            }
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
                {
                    itemHeaders.find(item => item.itemID === '') === undefined && (
                        <button className='general-button' onClick={handleItemEdit}>Add new item</button>
                    )
                }
                {
                    (itemHeaders.length > FetchData.itemMaxDisplay) && (
                        <>
                            <br />
                            <label className='general-label-warning'>Maximum item display reached please use search function for specific item</label>
                        </>
                    )
                }
            </div>
            {
                handleFooterDisplay()
            }
            {
                (listLoading || categoryLoading || userLoading || itemLoading || customerLoading || mailLoading) && (
                    <Popup open={true} position="center" closeOnDocumentClick={false}>
                        <div className='loading-container'>
                            <label className='general-label-warning'>Loading data please wait...</label>
                        </div>
                    </Popup>
                )
            }
        </div>
    );
}

export default Main;