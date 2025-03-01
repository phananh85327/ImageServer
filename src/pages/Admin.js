import React, { useState, useEffect } from 'react'
import ImportExportRequest from '../model/ImportExportRequest'
import BackupRestoreRequest from '../model/BackupRestoreRequest'
import FetchData from '../api/FetchData'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/Main.css'

const Admin = () => {
    const [processLoading, setProcessLoading] = useState(false);
    const [importProcess, setImportProcess] = useState(false);
    const [backupProcess, setBackupProcess] = useState(false);
    const [restoreProcess, setRestoreProcess] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [titles, setTitles] = useState([]);
    const [file, setFile] = useState(null);

    const [showMessage, setShowMessage] = useState('');

    const navigate = useNavigate();

    if (sessionStorage.getItem(FetchData.loginUser) === null) {
        navigate('/login');
    }

    const user = JSON.parse(sessionStorage.getItem(FetchData.loginUser));

    if (user.role !== 'Admin') {
        navigate('/error');
    }

    // Process effect
    useEffect(() => {
        const fetchImportPost = async () => {
            const checkClearPhotos = document.getElementById('ckClearPhotos');
            const checkPhotosOnly = document.getElementById('ckPhotosOnly');
            if (checkClearPhotos === undefined) {
                console.log('Invalid element');
            } else if (photos.length === 0 || titles === 0 || photos.length != titles.length) {
                console.log('Invalid photos');
                setShowMessage('Invalid photos');
            } else {
                const url = new URL(FetchData.importUrl);
                url.searchParams.set('userID', user.userID);
                url.searchParams.set('clearExisting', checkClearPhotos.checked);
                url.searchParams.set('importOnlyPhotos', checkPhotosOnly.checked);
                const importRequesat = [];
                for (let i = 0; i < photos.length; i++) {
                    var importPhoto = new ImportExportRequest(photos[i], titles[i]);
                    importRequesat.push(importPhoto);
                }
                //const importRequesat = new ImportExportRequest(photos, titles);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, importRequesat);
                if (result === null) {
                    setProcessLoading(false);
                    navigate('/error');
                    return;
                }
                setShowMessage('The process result will be send to your email');
            }
            setImportProcess(false);
            setProcessLoading(false);
        }
        const fetchBackupPost = async () => {
            const url = new URL(FetchData.backupUrl);
            url.searchParams.set('userID', user.userID);
            const result = await FetchData.sendRequest(url.href, FetchData.httpPost);
            if (result === null) {
                setProcessLoading(false);
                navigate('/error');
                return;
            }
            
            // Check if the result is a Blob
            if (result instanceof Blob) {
                const urlObject = window.URL.createObjectURL(result);
                const a = document.createElement('a');
                a.href = urlObject;
                a.download = FetchData.defaultFileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(urlObject);
            }
        
            setBackupProcess(false);
            setProcessLoading(false);
        };
        
        const fetchRestorePost = async () => {
            if (file === null) {
                console.log('Invalid bak file');
                setShowMessage('Invalid bak file');
            } else {
                const url = new URL(FetchData.restoreUrl);
                url.searchParams.set('userID', user.userID);
                const restoreRequesat = new BackupRestoreRequest(file);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, restoreRequesat);
                if (result === null) {
                    setProcessLoading(false);
                    navigate('/error');
                    return;
                }
                setShowMessage('The process result will be send to your email');
            }
            setRestoreProcess(false);
            setProcessLoading(false);
        }
        if (processLoading) {
            if (importProcess) {
                fetchImportPost();
            } else if (backupProcess) {
                fetchBackupPost();
            } else if (restoreProcess) {
                fetchRestorePost();
            } else {
                setProcessLoading(false);
            }
        }
    }, [processLoading]);

    const handleNavigateMain = () => {
        navigate('/main')
    }

    const handleNavigateLogout = () => {
        sessionStorage.setItem(FetchData.loginUser, null);
        navigate('/login')
    }

    const handleFolderSelection = async (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        // Allowed file types
        const validExtensions = ['.jpg', '.jpeg'];
        
        // Filter image files
        const imageFiles = selectedFiles.filter(file =>
          validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
        );

        if (imageFiles.length > FetchData.maxImport) {
            setShowMessage('Max import of ' + FetchData.maxImport + ' photo limit per batch reach');
            return;
        }
    
        // Extract image names
        const names = imageFiles.map(file => file.name);
        setTitles(names);
    
        // Convert images to Base64
        const base64Promises = imageFiles.map(file => toBase64(file));
        const base64Results = await Promise.all(base64Promises);
    
        setPhotos(base64Results);
    };

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleImportProcess = () => {
        setImportProcess(true);
        setProcessLoading(true);
    }
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackupProcess = () => {
        setBackupProcess(true);
        setProcessLoading(true);
    }

    const handleRestoreProcess = () => {
        setRestoreProcess(true);
        setProcessLoading(true);
    }

    const handleCloseMessage = () => {
        window.location.reload();
    }

    return (
        <div className='body'>
            <div className='header'>
                <label onClick={handleNavigateMain}>Photo management</label>
                <div onClick={handleNavigateLogout}>
                    <label>Logout</label>
                </div>
            </div>
            <div className='centered-box'>
                <div className='item-row'>
                    <label className='general-label-header'>Import photos</label>
                    <br />
                    <input className='general-file-input' type='file' webkitdirectory='true' directory='true' multiple onChange={(e) => handleFolderSelection(e)} />
                    <br />
                    <input id='ckClearPhotos' className='general-input-checkbox' type='checkbox' />
                    <label>Clear all current photos before import</label>
                    <br />
                    <input id='ckPhotosOnly' className='general-input-checkbox' type='checkbox' />
                    <label>Import photos only</label>
                    <br />
                    <button className='general-button' onClick={handleImportProcess}>Import</button>
                </div>
                <div className='item-row'>
                    <label className='general-label-header'>Backup / Restore database</label>
                    <br />
                    <input className='general-file-input' type='file' accept='.bak' onChange={(e) => handleFileChange(e)} />
                    <br />
                    <button className='general-button' onClick={handleBackupProcess}>Backup</button>
                    <button className='general-button' onClick={handleRestoreProcess}>Restore</button>
                </div>
            </div>
            {
                showMessage.length > 0 && (
                    <div className='popup-overlay'>
                        <Popup open={true} position='center' closeOnDocumentClick={false}>
                            <div className='popup-container'>
                                <label className='general-label-header'>{showMessage}</label>
                                <br />
                                <button className='general-button' onClick={handleCloseMessage}>OK</button>
                            </div>
                        </Popup>
                    </div>
                )
            }
            {
                (processLoading) && (
                    <Popup open={true} position='center' closeOnDocumentClick={false}>
                        <div className='loading-container'>
                            <label className='general-label-warning'>Loading data please wait...</label>
                        </div>
                    </Popup>
                )
            }
        </div>
    )
}

export default Admin;