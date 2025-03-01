import React, { useState, useEffect } from 'react'
import PhotoTagsRequestResponse from '../model/PhotoTagsRequestResponse'
import PhotoRequestResponse from '../model/PhotoRequestResponse'
import TagRequestResponse from '../model/TagRequestResponse'
import FetchData from '../api/FetchData'
import { useNavigate } from 'react-router-dom'
import '../css/Detail.css'

const Detail = () => {
    const [tagLoading, setTagLoading] = useState(true);
    const [tags, setTags] = useState([]);

    const [photoLoading, setPhotoLoading] = useState(true);
    const [photo, setPhoto] = useState(null);
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
    setPhoto(JSON.parse(sessionStorage.getItem(FetchData.photoDetail)));

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
        if (tagLoading) {
            fetchTagsGet();
        }
    }, [tagLoading]);

    // Photo effect
    useEffect(() => {
        const url = new URL(FetchData.photUrl);
        const fecthPhotoTagsGet = async () => {
            url.searchParams.set('photoID', photo.photoID);
            const result = await FetchData.sendRequest(url.href, FetchData.httpGet);
            if (result === null) {
                setPhotoLoading(false);
                navigate('/error');
                return;
            }
            setPhotoTags(Object.values(result).map(photoTag => PhotoTagsRequestResponse.fromObject(photoTag)));
            setPhotoLoading(false);
        }
        const fetchSimilarPhotosGet = async () => {
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
            const title = document.getElementById('tbTtile');
            const description = document.getElementById('tbDescription');
            if (title === undefined || title.value === '') {
                console.log('Invalid title');
                setPhotoError('Invalid title');
            } else if (description === undefined || description.value === '') {
                console.log('Invalid description');
                setPhotoError('Invalid description');
            } else {
                url.searchParams.set('photoID', photo.photoID);
                photo.title = title.value;
                photo.description = description.value;
                photo
                const result = await FetchData.sendRequest(url.href, FetchData.httpPut, photo);
                if (result === null) {
                    setPhotoLoading(false);
                    navigate('/error');
                    return;
                }
                setPhoto(photo);
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

    const handleNavigatePhotoDetail = (index) => {
        if (0 <= index && index < similarPhotos.length) {
            sessionStorage.setItem(FetchData.photoDetail, similarPhotos[index]);
            navigate('/detail');
        } else {
            console.log('Invalid photo');
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
            <div className='centered-box'>
                <div>
                    <div className='item-row'>
                        <label className='general-label-error'>{photoError}</label>
                        <input id='tbTtile' className='general-input' defaultValue={photo.title} type='text' />
                        <button className='general-button' onClick={handleUpdatePhoto}>Update</button>
                    </div>
                </div>
                <div className='item-row'>
                    <div>
                        <img id='imgHeader' className='item-image' src={photo.imageBase64 === null || photo.imageBase64 === '' ? null : photo.imageBase64} alt="No image" />
                    </div>
                    <div>
                        <textarea id='tbDescription' className='item-textarea' defaultValue={photo.description} />
                    </div>
                </div>
                <div>
                    <input id='tbAddTag' className='general-input' type='text' />
                    <button className='general-button' onClick={handleAddPhotoTag}>Add tag</button>
                    {
                        handleDisplayPhotoTags()
                    }
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
        </div>
    );
}

export default Detail;