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
    const [tagsSearchError, setTagsSearchError] = useState('');

    const [photoLoading, setPhotoLoading] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [photoAdd, setPhotoAdd] = useState(false);
    const [photoDelete, setPhotoDelete] = useState(null);
    const [photoUpload, setPhotoUpload] = useState(null);
    const [photoTags, setPhotoTags] = useState([]);
    const [photoError, setPhotoError] = useState('');

    const [itemAdvanceSearch, setItemAdvanceSearch] = useState(false);
    const [maxPage, setMaxPage] = useState(1);
    const [page, setPage] = useState(1);

    const navigate = useNavigate();

    if (sessionStorage.getItem(FetchData.loginUser) === null) {
        navigate('/login');
    }

    const user = JSON.parse(sessionStorage.getItem(FetchData.loginUser));

    // Tags effect
    useEffect(() => {
        let url = new URL(FetchData.tagUrl);
        const fetchTagsGet = async () => {
            url = new URL(FetchData.tagsUrl);
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
            if ((addTag === null) || (addTag.value === '') || (tags.map(tag => tag.tagName).includes(addTag.value))) {
                setTagError('Invalid tag name');
            } else {
                setTagError('');
                url.searchParams.set('userID', user.userID);
                url.searchParams.set('tagName', addTag.value);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost);
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
                url.searchParams.set('userID', user.userID);
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
                url.searchParams.set('userID', user.userID);
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
        let url = new URL(FetchData.photoUrl);
        const fetchPhotosGet = async () => {
            url = new URL(FetchData.photosUrl);
            const search = document.getElementById('tbSearch');
            if (search === null) {
                console.log('Invalid elements');
            } else {
                if (itemAdvanceSearch) {
                    const cameraMake = document.getElementById('tbCameraMake');
                    const cameraModel = document.getElementById('tbCameraModel');
                    const exposureTime = document.getElementById('tbExposureTime');
                    const aperture = document.getElementById('tbAperture');
                    const ISO = document.getElementById('tbISO');
                    const focalLength = document.getElementById('tbFocalLength');
                    const GPSLatitude = document.getElementById('tbGPSLatitude');
                    const GPSLongitude = document.getElementById('tbGPSLongitude');
                    const dateTaken = document.getElementById('tbDateTaken');
                    if ((cameraMake === null) || (cameraModel === null) || (exposureTime === null) || (aperture === null) || (ISO === null) || (focalLength === null) || (GPSLatitude === null) || (GPSLongitude === null) || (dateTaken === null)) {
                        console.log('Invalid elements');
                    } else {
                        if (cameraMake.value !== '') {
                            url.searchParams.set('metadata.cameraMake', cameraMake.value);
                        }
                        if (cameraModel.value !== '') {
                            url.searchParams.set('metadata.cameraModel', cameraModel.value);
                        }
                        if (exposureTime.value !== '') {
                            url.searchParams.set('metadata.exposureTime', exposureTime.value);
                        }
                        if (aperture.value !== '') {
                            url.searchParams.set('metadata.aperture', aperture.value);
                        }
                        if (ISO.value !== '') {
                            url.searchParams.set('metadata.ISO', ISO.value);
                        }
                        if (focalLength.value !== '') {
                            url.searchParams.set('metadata.focalLength', focalLength.value);
                        }
                        if (GPSLatitude.value !== '') {
                            url.searchParams.set('metadata.GPSLatitude', GPSLatitude.value);
                        }
                        if (GPSLongitude.value !== '') {
                            url.searchParams.set('metadata.GPSLongitude', GPSLongitude.value);
                        }
                        if (dateTaken.value !== '') {
                            url.searchParams.set('metadata.dateTaken', dateTaken.value);
                        }
                    }
                }
                if (search.value !== '') {
                    url.searchParams.set('keyword', search.value);
                }
                if (tagsSearch.length > 0) {
                    for (let i = 0; i < tagsSearch.length; i++) {
                        url.searchParams.append('tagIDs', tagsSearch[i]);
                    }
                }
                url.searchParams.set('start', (page - 1) * FetchData.pageRows);
                url.searchParams.set('end', page * FetchData.pageRows);
                const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                const photos = Object.values(result).map(photo => PhotoRequestResponse.fromObject(photo));
                const max = photos.length === 0 ? 0 : Math.floor(photos[0].count / FetchData.pageRows) + (photos[0].count % FetchData.pageRows ? 1 : 0);
                setMaxPage(max);
                setPhotos(photos);
            }
            setPhotoLoading(false);
        }
        const fetchPhotoPost = async () => {
            const title = document.getElementById('tbTtile');
            const description = document.getElementById('tbDescription');
            if (title === null || title.value === '') {
                console.log('Invalid title');
                setPhotoError('Invalid title');
            } else if (description === null) {
                console.log('Invalid description');
                setPhotoError('Invalid description');
            } else if (photoUpload === null) {
                console.log('Invalid photo');
                setPhotoError('Invalid photo');
            } else {
                url.searchParams.set('userID', user.userID);
                const newPhoto = new PhotoRequestResponse();
                newPhoto.image = photoUpload;
                newPhoto.title = title.value;
                newPhoto.description = description.value;
                if (photoTags.length > 0) {
                    for (let i = 0; i < photoTags.length; i++) {
                        url.searchParams.append('tagIDs', photoTags[i]);
                    }
                }
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, newPhoto);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                const max = Math.floor(result.count / FetchData.pageRows) + (result.count % FetchData.pageRows ? 1 : 0);
                setMaxPage(max);
            }
            setPhotoAdd(false);
            setPhotoUpload(null);
            setPhotoTags([]);
            setPhotoLoading(false);
        }
        const fetchPhotoDelete = async (index) => {
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
            fetchPhotosGet();
        }
        if (photoLoading) {
            if (photoDelete !== null) {
                fetchPhotoDelete(photoDelete);
            } else if (photoAdd === true) {
                fetchPhotoPost();
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

    const handleExport = () => {
        photos.forEach((photo, index) => {
            const parts = photo.imageBase64.split(';');
            const base64Data = `${parts[0]};${parts[1]}`;
            const filename = parts.length === 3 ? parts[2].split('=')[1] : `photo_${index + 1}.jpg`;
            downloadBase64File(base64Data, filename);
        });
    };
    
    const downloadBase64File = (base64Data, filename) => {
        // Create a Blob from the base64 string
        const linkSource = base64Data;
        const downloadLink = document.createElement("a");
        const fileName = filename;
    
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }    

    const handleAddSearchTag = () => {
        const addTag = document.getElementById('tbSearchTag');
        if ((addTag === null) || (tags.map(tag => tag.tagName).includes(addTag.value) && !tagsSearch.includes(addTag.value))) {
            const tag = tags.find(tag => tag.tagName === addTag.value);
            setTagsSearch([...tagsSearch, tag.tagID]);
            setTagsSearchError('');
        } else {
            setTagsSearchError('Invalid tag');
        }
    }

    const handleDisplayTagsSearch = () => {
        return (
            tagsSearch.map((tagIndex, index) => (
                <React.Fragment key={index}>
                    <button className='general-button' onClick={() => handleDeleteTagSearch(index)}>{tags.find(tag => tag.tagID === tagIndex).tagName}</button>
                </React.Fragment>
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
        setPhotoLoading(true);
    }

    const handleCloseAddPhoto = () => {
        setPhotoAdd(photoAdd === false);
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
        const addTag = document.getElementById('tbAddTag');
        if ((addTag === null) || (tags.map(tag => tag.tagName).includes(addTag.value) && !photoTags.includes(addTag.value))) {
            const tag = tags.find(tag => tag.tagName === addTag.value);
            setPhotoTags([...photoTags, tag.tagID]);
            setPhotoError('');
        } else {
            setPhotoError('Invalid tag');
        }
    }
    
    const handleDisplayPhotoTags = () => {
        return (
            photoTags.map((tagIndex, index) => (
                <React.Fragment key={index}>
                    <button className='general-button' onClick={() => handleDeletePhotoTag(index)}>{tags.find(tag => tag.tagID === tagIndex).tagName}</button>
                </React.Fragment>
            ))
        )
    }

    const handleDeletePhotoTag = (index) => {
        setPhotoTags(photoTags.filter((_, i) => i !== index));
    }

    const handleNavigatePhotoDetail = (index) => {
        if (0 <= index && index < photos.length) {
            const photoDetailObject = photos[index];
            sessionStorage.setItem(FetchData.photoDetail, JSON.stringify(photoDetailObject));
            navigate('/detail');
        } else {
            console.log('Invalid photo');
        }
    }

    const handleDisplayPhoto = (imageBase64) => {
        if (!imageBase64) return null;

        const parts = imageBase64.split(';');
        const cleanBase64 = `${parts[0]};${parts[1]}`;
        return cleanBase64;
    };

    const handleDeletePhoto = (index) => {
        setPhotoDelete(index);
        setPhotoLoading(true);
    }

    const handleSelectPage = (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {
            setPage(newPage);
            setPhotoLoading(true);
        }
    };
    
    const PaginationButtons = ({ page, maxPage, handleSelectPage }) => (
        <div className='pagination-buttons'>
            <button className='general-button' onClick={() => handleSelectPage(page - 1)} disabled={page === 1}>Previous Page</button>
    
            {page > 2 && <button className='general-button' onClick={() => handleSelectPage(1)}>1</button>}
            {page > 3 && <label className='general-label-header'>...</label>}
    
            {page - 1 >= 1 && <button className='general-button' onClick={() => handleSelectPage(page - 1)}>{page - 1}</button>}
            <button className='general-button' disabled>{page}</button>
            {page + 1 <= maxPage && <button className='general-button' onClick={() => handleSelectPage(page + 1)}>{page + 1}</button>}
    
            {page < maxPage - 2 && <label className='general-label-header'>...</label>}
            {page < maxPage - 1 && <button className='general-button' onClick={() => handleSelectPage(maxPage)}>{maxPage}</button>}
    
            <button className='general-button' onClick={() => handleSelectPage(page + 1)} disabled={page === maxPage}>Next Page</button>
        </div>
    );

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
                <input id='tbSearch' className='search-input' placeholder='Photo title or Description' type='text' />
                <button className='general-button' onClick={handleItemSearch}>Search</button>
                <button className='general-button' onClick={handleItemAdvanceSearch}>Advance search</button>
                <button className='general-button' onClick={handleExport}>Export</button>
                {
                    itemAdvanceSearch && (
                        <>
                            <label className='search-label'>Camera maker: </label>
                            <input id='tbCameraMake' className='search-input' type='text' />
                            <label className='search-label'>Camera model: </label>
                            <input id='tbCameraModel' className='search-input' type='text' />
                            <label className='search-label'>Exposure time: </label>
                            <input id='tbExposureTime' className='search-input' type='number' step='any' />
                            <label className='search-label'>Aperture: </label>
                            <input id='tbAperture' className='search-input' type='number' step='any' />
                            <label className='search-label'>ISO: </label>
                            <input id='tbISO' className='search-input' type='number' />
                            <label className='search-label'>Focal length: </label>
                            <input id='tbFocalLength' className='search-input' type='number' step='any' />
                            <label className='search-label'>GPS latitude: </label>
                            <input id='tbGPSLatitude' className='search-input' type='number' step='any' />
                            <label className='search-label'>GPS longitude: </label>
                            <input id='tbGPSLongitude' className='search-input' type='number' step='any' />
                            <label className='search-label'>Date taken: </label>
                            <input id='tbDateTaken' className='search-input' type='datetime-local' />
                            <label className='search-label'>Tag: </label>
                            <input id='tbSearchTag' className='search-input' type='text' />
                            {
                                tagsSearchError !== '' && (
                                    <label className='general-label-error'>{tagsSearchError}</label>
                                )
                            }
                            <button className='general-button' onClick={handleAddSearchTag}>Add tag</button>
                            <br />
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
                photoAdd ? (
                    <div className='centered-box'>
                        <label className='general-label-error'>{photoError}</label>
                        <br />
                        <label className='general-label-header'>Photo: </label>
                        <input className='general-file-input' type='file' accept='.jpg, .jpeg' onChange={(e) => handleFileChange(e)} />
                        <br />
                        <label className='general-label-header'>Title: </label>
                        <input id='tbTtile' className='general-input' type='text' />
                        <br />
                        <label className='general-label-header'>Description: </label>
                        <textarea id='tbDescription' className='item-textarea' />
                        <br />
                        <label className='general-label-header'>Tag: </label>
                        <input id='tbAddTag' className='general-input' type='text' />
                        <br />
                        <button className='general-button' onClick={handleAddPhotoTag}>Add tag</button>
                        <br />
                        {
                            handleDisplayPhotoTags()
                        }
                        <br />
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
                    maxPage === 0 ? (
                        <label className='general-label-header'>No photos</label>
                    ) : (
                        <label className='general-label-header'>{page} / {maxPage}</label>
                    )
                }
                {
                    photos.map((item, index) => (
                        <div key={index} className='item-row'>
                            <div className='item-header' onClick={() => handleNavigatePhotoDetail(index)}>
                                <img id={`imgHeader${index}`} className='item-image' src={handleDisplayPhoto(item.imageBase64)} alt='No image' />
                                <label className='general-label-header'>{item.title}</label>
                            </div>
                            <button className='general-button' onClick={() => handleDeletePhoto(index)}>Delete photo</button>
                        </div>
                    ))
                }
                {
                    maxPage > 0 && <PaginationButtons page={page} maxPage={maxPage} handleSelectPage={handleSelectPage} />
                }
            </div>
            {
                (tagLoading || photoLoading) && (
                    <Popup open={true} position='center' closeOnDocumentClick={false}>
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