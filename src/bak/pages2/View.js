import React, { useState, useEffect } from 'react';
import { ListRequestResponse } from '../api/ListRequestResponse'
import CategoryRequestResponse from '../api/CategoryRequestResponse'
import ItemRequestResponse from '../api/ItemRequestResponse'
import FetchData from '../api/FetchData'
import Footer from '../models/Footer'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/View.css'

const View = () => {
    // Lists data
    const [listLoading, setListLoading] = useState(true);
    const [lists, setLists] = useState([]);

    // Categories data
    const [categoryLoading, setCategoryLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Item data
    const [itemLoading, setItemLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [itemHeaders, setItemHeaders] = useState([]);
    const [itemAdvanceSearch, setItemAdvanceSearch] = useState(false);
    const [itemCategory, setItemCategory] = useState('');
    const [itemDownload, setItemDownload] = useState(null);

    const navigate = useNavigate();

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
        if (listLoading) {
            fetchListsGet();
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
        if (categoryLoading) {
            fetchCategoriesGet();
        }
    }, [categoryLoading]);

    // Item effect
    useEffect(() => {
        const url = new URL(FetchData.itemUrl);
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
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setItemLoading(false);
                navigate('/error');
                return;
            }
            const getItems = Object.values(result).map(item => ItemRequestResponse.fromObject(item));
            setItems(getItems);
            let itemHeaders = [];
            getItems.forEach(item => {
                const itemHeader = itemHeaders.find(itemHeader => itemHeader.itemID === item.itemID);
                if (itemHeader === undefined) {
                    itemHeaders.push(new ItemRequestResponse(item.itemID, 0, item.itemName, item.imageUrl, item.categoryID));
                }
            });
            setItemHeaders(itemHeaders);
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
        if ((categoryLoading === false) && itemLoading) {
            if (itemDownload !== null) {
                fetchItemDownload(itemDownload);
            } else {
                fetchItemsGet();
            }
        }
    }, [categoryLoading, itemLoading]);

    // User handle
    const handleLoginNavigate = () => {
        navigate('/login');
    }

    // Categories handle
    const handleCategoryChange = (index) => {
        const category = categories.find((_, i) => i === index);
        if (category === undefined) {
            console.log('Invalid category');
        } else {
            setItemCategory(category.categoryID);
            setItemDownload(null);
            setItemLoading(true);
        }
    }

    // Item handle
    const handleItemSearch = () => {
        setItemDownload(null);
        setItemLoading(true);
    }
    
    const handleItemAdvanceSearch = () => {
        if (itemAdvanceSearch) {
            const itemDue = document.getElementById('dtDue');
            const itemCondition = document.getElementById('tbCondition');
            if ((itemDue === null) || (itemCondition === null)) {
                console.log('Invalid element');
            } else {
                itemDue.value = '';
                itemCondition.value = '';
            }
        }
        setItemAdvanceSearch(itemAdvanceSearch === false);
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
                <label className='general-label'>Book condition: </label>
                {
                    handleItemNoListDisplay(indexNo)
                }
                <br />
                {
                    itemNo.digitalFlg ? (
                        <>
                            {
                                (itemNo.digitalFile === null) ? (
                                    <>
                                        <label className='general-label'>No file available</label>
                                    </>
                                ) : (
                                    <>
                                        <button className='general-button' onClick={() => handleFileDownload(indexNo)}>Download file</button>
                                    </>
                                )
                            }
                        </>
                    ) : (
                        <>
                            <label className='general-label'>Book physical location: {itemNo.location}</label>
                            <br />
                            <label className='general-label'>Book quantity: {itemNo.quantity}</label>
                        </>
                    )
                }
                <br />
                <label className='general-label'>Book memo: {itemNo.memo}</label>
            </>
        )
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
                const itemList = list.items.find((_, itemIndex) => itemIndex === item.listItem);
                if (itemList === undefined) {
                    return null;
                } else {
                    return (
                        <>
                            <label className='general-label'>{itemList.value}</label>
                        </>
                    )
                }
            }
        }
    }

    const handleFileDownload = (index) => {
        setItemDownload(index);
        setItemLoading(true);
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
                <div onClick={handleLoginNavigate}>
                    <label>Login</label>
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
                            <label className='search-label'>Book condition: </label>
                            <input id='tbCondition' className='search-input' type='text' />
                        </>
                    )
                }
            </div>
            <br />
            <div className='category-container'>
                {
                    categories.map((category, index) => (
                        <button key={index} className='general-button' disabled={category.categoryID === itemCategory} onClick={() => handleCategoryChange(index)}>{category.categoryName}</button>
                    ))
                }
            </div>
            <div className='centered-box'>
                {
                    itemHeaders.map((item, index) => (index < FetchData.itemMaxDisplay) && (
                        <div key={index} className='item-row'>
                            <div className='item-header'>
                                <img id={`imgHeader${index}`} className='item-image' src={item.imageUrl === null ? null : 'data:image/jpeg;base64,' + item.imageUrl} alt="No image" />
                                <label className='general-label-header'>{item.itemName}</label>
                                <button className='general-button' onClick={() => handleItemNoEdit(index)}>
                                    {
                                        item.updateItem ? (
                                            <span className='arrow-up' />
                                        ) : (
                                            <span className='arrow-down' />
                                        )
                                    }
                                </button>
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
                                                    </React.Fragment>
                                                ))
                                            }
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
                {
                    (itemHeaders.length > FetchData.itemMaxDisplay) && (
                        <>
                            <label className='general-label-warning'>Maximum book display reached please use search function for specific item</label>
                        </>
                    )
                }
            </div>
            {
                handleFooterDisplay()
            }
            {
                (listLoading || categoryLoading || itemLoading) && (
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

export default View;