import React, { useState, useEffect } from 'react'
import { PhotoRequestResponse, MetadataRequestResponse } from '../model/PhotoRequestResponse'
import TagRequestResponse from '../model/TagRequestResponse'
import FetchData from '../api/FetchData'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/Main.css'

const Main = () => {
    const [tagLoading, setTagLoading] = useState(true);
    const [tags, setTags] = useState([]);
    const [tagEdit, setTagEdit] = useState(false);
    const [tagAdd, setTagAdd] = useState(false);
    const [tagUpdate, setTagUpdate] = useState(null);
    const [tagDelete, setTagDelete] = useState(null);
    const [tagError, setTagError] = useState('');
    const [tagsSearch, setTagsSearch] = useState([]);

    const [photoLoading, setPhotoLoading] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [photoAdd, setPhotoAdd] = useState(false);
    const [photoDelete, setPhotoDelete] = useState(null);
    const [photoUpload, setPhotoUpload] = useState(null);
    const [photoTags, setPhotoTags] = useState([]);
    const [photoError, setPhotoError] = useState('');

    const [itemAdvanceSearch, setItemAdvanceSearch] = useState(false);
    const [addPhoto, setAddPhoto] = useState(false);
    const [maxPage, setMaxPage] = useState(1);
    const [page, setPage] = useState(1);

    const navigate = useNavigate();

    if (sessionStorage.getItem(FetchData.loginUser) === null) {
        navigate('/login');
    }

    const user = JSON.parse(sessionStorage.getItem(FetchData.loginUser));

    // Tags effect
    useEffect(() => {
        const url = new URL(FetchData.tagUrl);
        const fetchTagsGet = async () => {
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setTagLoading(false);
                navigate('/error');
                return;
            }
            setTags(Object.values(result).map(tag => TagRequestResponse.fromObject(tag)));
            setTagLoading(false);
        }
        const fetchTagPost = async () => {
            const addTag = document.getElementById('tbTagAddName');
            if ((addTag === null) || (addTag.value === '')) {
                setTagError('Invalid tag name');
            } else {
                setTagError('');
                const newTag = new TagRequestResponse('', addTag.value);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, newTag);
                if (result === null) {
                    setTagLoading(false);
                    navigate('/error');
                    return;
                }
                setTags([...tags, TagRequestResponse.fromObject(result)]);
            }
            setTagEdit(false);
            setTagAdd(false);
            setTagLoading(false);
        }
        const fetchTagPut = async (index) => {
            const updateTag = tags.find((_, i) => i === index);
            const tag = document.getElementById(`tbTagName${index}`);
            if (updateTag === undefined) {
                setTagError('Invalid tag');
            } else if ((tag === null) || (tag.value === '')) {
                setTagError('Invalid tag name');
            } else if (tag.value === tag.defaultValue) {
                setTagError('');
                updateTag.updateName = false;
            } else {
                setTagError('');
                updateTag.tagName = tag.value;
                updateTag.updateName = false;
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, updateTag);
                if (result === null) {
                    setTagLoading(false);
                    navigate('/error');
                    return;
                }
                setTags(tags.map((tag, i) => i === index ? updateTag : tag));
            }
            setTagUpdate(null);
            setTagLoading(false);
        }
        const fetchTagDelete = async (index) => {
            const deleteTag = tags.find((_, i) => i === index);
            if (deleteTag === undefined) {
                setTagError('Invalid tag');
            } else {
                setTagError('');
                url.searchParams.set('tagID', deleteTag.tagID);
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete);
                if (result === null) {
                    setTagLoading(false);
                    navigate('/error');
                    return;
                }
                setTags(tags.filter((_, i) => i !== index));
            }
            setTagDelete(null);
            setTagLoading(false);
        }
        if (tagLoading) {
            if (tagDelete !== null) {
                fetchTagDelete(tagDelete);
            } else if (tagUpdate !== null) {
                fetchTagPut(tagUpdate);
            } else if (tagAdd === true) {
                fetchTagPost();
            } else {
                fetchTagsGet();
            }
        }
    }, [tagLoading]);

    // Photo effect
    useEffect(() => {
        const url = new URL(FetchData.photUrl);
        const fetchPhotosGet = async () => {
            const search = document.getElementById('tbSearch');
            const cameraMake = document.getElementById('tbCameraMake');
            const cameraModel = document.getElementById('tbCameraModel');
            const exposureTime = document.getElementById('tbExposureTime');
            const aperture = document.getElementById('tbAperture');
            const ISO = document.getElementById('tbISO');
            const focalLength = document.getElementById('tbFocalLength');
            const GPSLatitude = document.getElementById('tbGPSLatitude');
            const GPSLongitude = document.getElementById('tbGPSLongitude');
            const dateTaken = document.getElementById('tbDateTaken');
            if (search === undefined || cameraMake === undefined || cameraModel === undefined || exposureTime === undefined || aperture === undefined || ISO === undefined || focalLength === undefined || GPSLatitude === undefined || GPSLongitude === undefined || dateTaken === undefined) {
                console.log('Invalid elements');
            } else {
                const metadata = new MetadataRequestResponse(cameraMake.value, cameraModel.value, exposureTime.value, aperture.value, ISO.value, focalLength.value, GPSLatitude.value, GPSLongitude.value, dateTaken.value);
                const photo = new PhotoRequestResponse();
                photo.keyword = search.value;
                photo.metadata = metadata;
                photo.tagIDs = tagsSearch;
                photo.start = (page - 1) * FetchData.pageRows;
                photo.end = page * FetchData.pageRows;
                const result = await FetchData.sendRequest(url.href, FetchData.httpGet, photo);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                setPhotos(Object.values(result).map(photo => PhotoRequestResponse.fromObject(photo)));
            }
            setPhotoLoading(false);
        }
        const fetchPhotosPost = async () => {
            const title = document.getElementById('tbTtile');
            const description = document.getElementById('tbDescription');
            if (title === undefined || title.value === '') {
                console.log('Invalid title');
                setPhotoError('Invalid title');
            } else if (description === undefined || description.value === '') {
                console.log('Invalid description');
                setPhotoError('Invalid description');
            } else if (photoUpload === null) {
                console.log('Invalid photo');
                setPhotoError('Invalid photo');
            } else {
                url.searchParams.set('userID', user.userID);
                const newPhoto = new PhotoRequestResponse();
                newPhoto.title = title.value;
                newPhoto.description = description.value;
                newPhoto.image = photoUpload;
                newPhoto.tagIDs = photoTags;
                const result = await FetchData.sendRequest(url.href, FetchData.httpGet, newPhoto);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                setPhotos([...photos, PhotoRequestResponse.fromObject(newPhoto)]);
                setAddPhoto(false);
            }
            setPhotoAdd(false);
            setPhotoUpload(null);
            setPhotoTags([]);
            setPhotoLoading(false);
        }
        const fetchPhotosDelete = async (index) => {
            const deletePhoto = photos.find((_, i) => i === index);
            if (deletePhoto === undefined) {
                console.log('Invalid photo');
                setPhotoError('Invalid photo');
            } else {
                url.searchParams.set('photoID', deletePhoto.photoID);
                const result = await FetchData.sendRequest(url.href, FetchData.httpDelete);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                setPhotoDelete(null);
            }
            setPhotoLoading(false);
        }
        if (photoLoading) {
            if (photoDelete) {
                fetchPhotosDelete(photoDelete);
            } else if (photoAdd) {
                fetchPhotosPost();
            } else {
                fetchPhotosGet();
            }
        }
    }, [photoLoading]);

    // Search handle
    const handleNavigateLoginUpdate = () => {
        if (user.role === 'Admin') {
            navigate('/admin');
        } else {
            sessionStorage.setItem(FetchData.loginUser, null);
            navigate('/login')
        }
    }

    const handleItemSearch = () => {
        setPhotoLoading(true);
    }

    const handleItemAdvanceSearch = () => {
        setItemAdvanceSearch(itemAdvanceSearch === false);
    }

    const handleAddSearchTag = () => {
        const tag = document.getElementById('tbSearchTag');
        if ((tag === null) || (tags.includes(tag.value) && !tagsSearch.includes(tag.value))) {
            setTagsSearch.push(tag.value)
        } else {
            console.log('Invalid tag');
        }
    }

    const handleDisplayTagsSearch = () => {
        return (
            tagsSearch.map((tag, index) => (
                <>
                    <button className='general-button' onClick={() => handleDeleteTagSearch(index)}>{tag}</button>
                </>
            ))
        )
    }

    const handleDeleteTagSearch = (index) => {
        setTagsSearch(tagsSearch.filter((_, i) => i !== index));
    }

    // Tags handle
    const handleTagUpdateName = (index) => {
        setTagUpdate(index);
        setTagLoading(true);
    }

    const handleTagDeleteName = (index) => {
        setTagDelete(index);
        setTagLoading(true);
    }

    const handleTagEditName = (index) => {
        setTags(tags.map((tag, i) => i === index ? { ...tag, updateName: true } : tag));
    }

    const handleTagAdd = () => {
        setTagAdd(true);
        setTagLoading(true);
    }

    const handleTagEdit = () => {
        setTagEdit(tagEdit === false);
    }

    const handleAddPhoto = () => {
        setPhotoAdd(true);
    }

    const handleCloseAddPhoto = () => {
        setAddPhoto(addPhoto === false);
    }
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > FetchData.fileSize) {
                e.target.value = ''
                console.log('Invalid size');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUpload(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleAddPhotoTag = () => {
        const tag = document.getElementById('tbAddTag');
        if ((tag === null) || (tags.includes(tag.value) && !photoTags.includes(tag.value))) {
            setPhotoTags.push(tag.value)
        } else {
            console.log('Invalid tag');
        }
    }
    
    const handleDisplayPhotoTags = () => {
        return (
            photoTags.map((tag, index) => (
                <>
                    <button className='general-button' onClick={() => handleDeletePhotoTag(index)}>{tag}</button>
                </>
            ))
        )
    }

    const handleDeletePhotoTag = (index) => {
        setPhotoTags(photoTags.filter((_, i) => i !== index));
    }

    const handleDisplayMaxPage = () => {
        const max = photos.length === 0 ? 0 : (photos[0].count / FetchData.pageRows) + (photos[0].count % FetchData.pageRows);
        setMaxPage(max);
        return (
            max === 0 ? (
                <label>No photos</label>
            ) : (
                <label>{max}</label>
            )
        )
    }

    const handleNavigatePhotoDetail = (index) => {
        if (0 <= index && index < photos.length) {
            sessionStorage.setItem(FetchData.photoDetail, photos[index]);
            navigate('/detail');
        } else {
            console.log('Invalid photo');
        }
    }

    const handleDeletePhoto = (index) => {
        setPhotoDelete(index);
        setPhotoLoading(true);
    }

    const handleSelectPage = (newPage) => {
        if (1 <= newPage && newPage <= maxPage) {
            setPage(newPage);
            setPhotoLoading(true);
        }
    }

    return (
        <div className='body'>
            <div className='header'>
                <label>Photo management</label>
                <div onClick={handleNavigateLoginUpdate}>
                    {
                        user.role === 'Admin' ? (
                            <label>{user.role} | {user.username}</label>
                        ) : (
                            <label>{user.username} | Logout</label>
                        )
                    }
                </div>
            </div>
            <div className='search-container'>
                <input id='tbSearch' className='search-input' placeholder='Photo title || descriptiondescription' type='text' />
                <button className='search-button' onClick={handleItemSearch}>Search</button>
                <button className='advance-search-button' onClick={handleItemAdvanceSearch}>Advance search</button>
                {
                    itemAdvanceSearch && (
                        <>
                            <label className='search-label'>Camera maker: </label>
                            <input id='tbCameraMake' className='search-input' type='text' />
                            <label className='search-label'>Camera model: </label>
                            <input id='tbCameraModel' className='search-input' type='text' />
                            <label className='search-label'>Exposure time: </label>
                            <input id='tbExposureTime' className='search-input' type='number' step="any" />
                            <label className='search-label'>Aperture: </label>
                            <input id='tbAperture' className='search-input' type='number' step="any" />
                            <label className='search-label'>ISO: </label>
                            <input id='tbISO' className='search-input' type='number' />
                            <label className='search-label'>Focal length: </label>
                            <input id='tbFocalLength' className='search-input' type='number' step="any" />
                            <label className='search-label'>GPS latitude: </label>
                            <input id='tbGPSLatitude' className='search-input' type='number' step="any" />
                            <label className='search-label'>GPS longitude: </label>
                            <input id='tbGPSLongitude' className='search-input' type='number' step="any" />
                            <label className='search-label'>Date taken: </label>
                            <input id='tbDateTaken' className='search-input' type='datetime-local' />
                            <label className='search-label'>Tag: </label>
                            <input id='tbSearchTag' className='search-input' type='text' />
                            <button className='general-button' onClick={handleAddSearchTag}>Add tag</button>
                            {
                                handleDisplayTagsSearch()
                            }
                        </>
                    )
                }
            </div>
            <div className='tag-centered-box'>
                <label className='general-label-error'>{tagError}</label>
                {
                    tags.map((tag, index) => (
                        <React.Fragment key={index}>
                            {
                                tag.updateName ? (
                                    <>
                                        <input id={`tbTagName${index}`} className='tag-input' defaultValue={tag.tagName} type='text' />
                                        <button className='general-button' onClick={() => handleTagUpdateName(index)}>Update</button>
                                        <button className='general-button' onClick={() => handleTagDeleteName(index)}>Delete</button>
                                    </>
                                ) : (
                                    <button className='general-button' disabled={user.role !== 'Admin'} onClick={() => handleTagEditName(index)}>{tag.tagName}</button>
                                )
                            }
                        </React.Fragment>
                    ))
                }
                {
                    user.role === 'Admin' && tagEdit ? (
                        <>
                            <input id='tbTagAddName' className='tag-input' type='text' />
                            <button className='general-button' onClick={handleTagAdd}>Add</button>
                            <button className='general-button' onClick={handleTagEdit}>Cancel</button>
                        </>
                    ) : (
                        <button className='general-button' onClick={handleTagEdit}>+</button>
                    )
                }
            </div>
            {
                addPhoto ? (
                    <div className='centered-box'>
                        <label className='general-label-error'>{photoError}</label>
                        <label className='general-label'>Photo: </label>
                        <input type="file" accept=".png, .jpg, .jpeg, .gif" onChange={(e) => handleFileChange(e)} />
                        <label className='general-label-error'>Title: </label>
                        <input id='tbTtile' className='general-input' type='text' />
                        <label className='general-label'>Description: </label>
                        <textarea id='tbDescription' className='item-textarea' />
                        <label className='general-label'>Tag: </label>
                        <input id='tbAddTag' className='general-input' type='text' />
                        <button className='general-button' onClick={handleAddPhotoTag}>Add tag</button>
                        {
                            handleDisplayPhotoTags()
                        }
                        <button className='general-button' onClick={handleAddPhoto}>Upload photo</button>
                        <button className='general-button' onClick={handleCloseAddPhoto}>Cancel</button>
                    </div>
                ) : (
                    <div className='centered-box'>
                        <button className='general-button' onClick={handleCloseAddPhoto}>Upload photo</button>
                    </div>
                )
            }
            <div className='centered-box'>
                {
                    handleDisplayMaxPage()
                }
                {
                    photos.map((item, index) => (
                        <div key={index} className='item-row'>
                            <div className='item-header' onClick={() => handleNavigatePhotoDetail(index)}>
                                <img id={`imgHeader${index}`} className='item-image' src={item.imageBase64 === null || item.imageBase64 === '' ? null : item.imageBase64} alt="No image" />
                                <button className='general-button' onClick={() => handleDeletePhoto(index)}>Delete photo</button>
                                <label className='general-label-header'>{item.title}</label>
                            </div>
                        </div>
                    ))
                }
                {
                    maxPage > 0 && (
                        <>
                            {
                                <button onClick={() => handleSelectPage(page - 1)}>Previous</button>
                            }
                            {
                                page - 1 >= 1 && (
                                    <button onClick={() => handleSelectPage(page - 1)}>{page - 1}</button>
                                )
                            }
                            <button disabled={true}>{page}</button>
                            {
                                page + 2 <= maxPage && (
                                    <button disabled={true}>...</button>
                                )
                            }
                            {
                                page + 1 <= maxPage && (
                                    <button onClick={() => handleSelectPage(page + 1)}>{page + 1}</button>
                                )
                            }
                            {
                                <button onClick={() => handleSelectPage(page + 1)}>Next</button>
                            }
                        </>
                    )
                }
            </div>
            {
                (tagLoading || photoLoading) && (
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