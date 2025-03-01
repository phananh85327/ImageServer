import React, { useState, useEffect } from 'react'
import { PhotoRequestResponse, MetadataRequestResponse } from '../model/PhotoRequestResponse'
import PhotoTagsRequestResponse from '../model/PhotoTagsRequestResponse'
import TagRequestResponse from '../model/TagRequestResponse'
import FetchData from '../api/FetchData'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/Main.css'

const Detail = () => {
    const [tagLoading, setTagLoading] = useState(true);
    const [tags, setTags] = useState([]);

    const [photoLoading, setPhotoLoading] = useState(true);
    const [similarPhotos, setSimilarPhotos] = useState([]);
    const [photoUpdate, setPhotoUpdate] = useState(false);
    const [photoTags, setPhotoTags] = useState([]);
    const [photoError, setPhotoError] = useState('');
    
    const navigate = useNavigate();

    if (sessionStorage.getItem(FetchData.loginUser) === null) {
        navigate('/login');
    } else if (sessionStorage.getItem(FetchData.photoDetail) === null) {
        navigate('/main');
    }

    const user = JSON.parse(sessionStorage.getItem(FetchData.loginUser));
    const photo = JSON.parse(sessionStorage.getItem(FetchData.photoDetail));

    // Tags effect
    useEffect(() => {
        const url = new URL(FetchData.tagsUrl);
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
        if (tagLoading) {
            fetchTagsGet();
        }
    }, [tagLoading]);

    // Photo effect
    useEffect(() => {
        //let url = new URL(FetchData.photoTagsUrl);
        const fecthPhotoTagsGet = async () => {
            let url = new URL(FetchData.photoTagsUrl);
            url.searchParams.set('photoID', photo.photoID);
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setPhotoLoading(false);
                navigate('/error');
                return;
            }
            setPhotoTags(Object.values(result).map(photoTag => PhotoTagsRequestResponse.fromObject(photoTag)));
        }
        const fetchSimilarPhotosGet = async () => {
            let url = new URL(FetchData.similarPhotoUrl)
            url.searchParams.set('photoID', photo.photoID);
            url.searchParams.set('n', FetchData.n);
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setPhotoLoading(false);
                navigate('/error');
                return;
            }
            setSimilarPhotos(Object.values(result).map(photo => PhotoRequestResponse.fromObject(photo)));
            setPhotoLoading(false);
        }
        const fetchPhotosPut = async () => {
            let url = new URL(FetchData.photoUrl);
            const title = document.getElementById('tbTtile');
            const description = document.getElementById('tbDescription');
            if (title === null || title.value === '') {
                console.log('Invalid title');
                setPhotoError('Invalid title');
            } else if (description === null) {
                console.log('Invalid description');
                setPhotoError('Invalid description');
            } else {
                url.searchParams.set('photoID', photo.photoID);
                url.searchParams.set('title', title.value);
                url.searchParams.set('description', description.value);
                if (photoTags.length > 0) {
                    for (let i = 0; i < photoTags.length; i++) {
                        url.searchParams.append('tagIDs', photoTags[i].tagID);
                    }
                }
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                sessionStorage.setItem(FetchData.photoDetail, JSON.stringify(photo));
            }
            setPhotoUpdate(false);
            setPhotoLoading(false);
        }
        if (photoLoading) {
            if (photoUpdate) {
                fetchPhotosPut();
            } else {
                fecthPhotoTagsGet();
                fetchSimilarPhotosGet();
            }
        }
    }, [photoLoading]);

    const handleNavigateMain = () => {
        navigate('/main')
    }

    const handleNavigateLoginUpdate = () => {
        if (user.role === 'Admin') {
            navigate('/admin');
        } else {
            sessionStorage.setItem(FetchData.loginUser, null);
            navigate('/login')
        }
    }

    const handleUpdatePhoto = () => {
        setPhotoUpdate(true);
        setPhotoLoading(true);
    }

    const handleAddPhotoTag = () => {
        const addTag = document.getElementById('tbAddTag');
        if ((addTag === null) || (tags.map(tag => tag.tagName).includes(addTag.value) && !photoTags.includes(addTag.value))) {
            const tag = tags.find(tag => tag.tagName === addTag.value);
            setPhotoTags([...photoTags, new PhotoTagsRequestResponse(photo.photoID, tag.tagID)]);
            setPhotoError('');
        } else {
            setPhotoError('Invalid tag');
        }
    }
    
    const handleDisplayPhotoTags = () => {
        console.log(photoTags);
        console.log('...')
        console.log(tags);
        return (
            photoTags.map((photoTag, index) => (
                <React.Fragment key={index}>
                    <button className='general-button' onClick={() => handleDeletePhotoTag(index)}>{tags.find(tag => tag.tagID === photoTag.tagID)?.tagName}</button>
                </React.Fragment>
            ))
        )
    }

    const handleDeletePhotoTag = (index) => {
        setPhotoTags(photoTags.filter((_, i) => i !== index));
    }

    const handleNavigatePhotoDetail = (index) => {
        if (0 <= index && index < similarPhotos.length) {
            sessionStorage.setItem(FetchData.photoDetail, JSON.stringify(similarPhotos[index]));
            window.location.reload();
        } else {
            console.log('Invalid photo');
        }
    }

    return (
        <div className='body'>
            <div className='header'>
                <label onClick={handleNavigateMain}>Photo management</label>
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
            <div className='centered-box'>
                {
                    photoError.length > 0 && (
                        <div className='item-row'>
                            <label className='general-label-error'>{photoError}</label>
                        </div>
                    )
                }
                <div className='item-row'>
                    <input id='tbTtile' className='general-input' defaultValue={photo.title} type='text' />
                    <button className='general-button' onClick={handleUpdatePhoto}>Update</button>
                </div>
                <div className='item-row'>
                    <div>
                        <img id='imgHeader' className='item-image-super' src={photo.imageBase64 === null || photo.imageBase64 === '' ? null : photo.imageBase64} alt="No image" />
                    </div>
                    <div>
                        <textarea id='tbDescription' className='item-textarea' defaultValue={photo.description} />
                    </div>
                </div>
                <div>
                    <input id='tbAddTag' className='general-input' type='text' />
                    {
                        handleDisplayPhotoTags()
                    }
                    <br />
                    <button className='general-button' onClick={handleAddPhotoTag}>Add tag</button>
                </div>
            </div>
            <div className='centered-box'>
                {
                    similarPhotos.map((item, index) => (
                        <div key={index} className='item-row'>
                            <div className='item-header' onClick={() => handleNavigatePhotoDetail(index)}>
                                <img id={`imgHeader${index}`} className='item-image' src={item.imageBase64 === null || item.imageBase64 === '' ? null : item.imageBase64} alt="No image" />
                                <label className='general-label-header'>{item.title}</label>
                            </div>
                        </div>
                    ))
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

export default Detail;