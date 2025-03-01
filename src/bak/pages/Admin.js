import React, { useState, useEffect } from 'react'
import ImportExportRequest from '../model/ImportExportRequest'
import BackupRestoreRequest from '../model/BackupRestoreRequest'
import FetchData from '../api/FetchData'
import Popup from 'reactjs-popup'
import { useNavigate } from 'react-router-dom'
import '../css/Admin.css'

const Admin = () => {
    const [processLoading, setProcessLoading] = useState(false);
    const [importProcess, setImportProcess] = useState(false);
    const [exportProcess, setExportProcess] = useState(false);
    const [backupProcess, setBackupProcess] = useState(false);
    const [restoreProcess, setRestoreProcess] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [titles, setTitles] = useState([]);
    const [file, setFile] = useState(null);

    const [showMessage, setShowMessage] = useState('');
    const [error, setError] = useState('');

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
            if (checkClearPhotos === undefined) {
                console.log('Invalid element');
            } else if (photos.length === 0 || titles === 0 || photos.length != titles.length) {
                console.log('Invalid photos');
                setError('Invalid photos');
            } else {
                const url = new URL(FetchData.importUrl);
                const importRequesat = new ImportExportRequest(user.userID, photos, titles, checkClearPhotos.checked);
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
        const fetchExportPost = async () => {
            const url = new URL(FetchData.exportUrl);
            const exportRequesat = new ImportExportRequest(user.userID);
            const result = await FetchData.sendRequest(url.href, FetchData.httpPost, exportRequesat);
            if (result === null) {
                setProcessLoading(false);
                navigate('/error');
                return;
            }
            setShowMessage('The process result will be send to your email');
            setExportProcess(false);
            setProcessLoading(false);
        }
        const fetchBackupPost = async () => {
            const url = new URL(FetchData.backupUrl);
            const backupRequesat = new BackupRestoreRequest(user.userID);
            const result = await FetchData.sendRequest(url.href, FetchData.httpPost, backupRequesat);
            if (result === null) {
                setProcessLoading(false);
                navigate('/error');
                return;
            }
            setShowMessage('The process result will be send to your email');
            setBackupProcess(false);
            setProcessLoading(false);
        }
        const fetchRestorePost = async () => {
            if (file === null) {
                console.log('Invalid bak file');
                setError('Invalid bak file');
            } else {
                const url = new URL(FetchData.restoreUrl);
                const restoreRequesat = new BackupRestoreRequest(user.userID, file);
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
            } else if (exportProcess) {
                fetchExportPost();
            } else if (backupProcess) {
                fetchBackupPost();
            } else if (restoreProcess) {
                fetchRestorePost();
            } else {
                setProcessLoading(false);
            }
        }
    }, [processLoading]);

    const handleNavigateLogout = () => {
        sessionStorage.setItem(FetchData.loginUser, null);
        navigate('/login')
    }

    const handleFolderSelection = async (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        // Allowed file types
        const validExtensions = [".png", ".jpg", ".jpeg", ".gif"];
        
        // Filter image files
        const imageFiles = selectedFiles.filter(file =>
          validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
        );
    
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

    const handleExportProcess = () => {
        setExportProcess(true);
        setProcessLoading(true);
    }
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
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
        setShowMessage('');
    }

    return (
        <div className='body'>
            <div className='header'>
                <label>Photo management</label>
                <div onClick={handleNavigateLogout}>
                    <label>Logout</label>
                </div>
            </div>
            <div className='centered-box'>
                <label>Import / Export photos</label>
                <input type="file" webkitdirectory="true" directory multiple onChange={(e) => handleFolderSelection(e)} />
                <input id='ckClearPhotos' type='checkbox'>Clear all photos before import</input>
                <button onClick={handleImportProcess}>Import</button>
                <button onClick={handleExportProcess}>Export</button>
            </div>
            <div className='centered-box'>
                <label>Backup / Restore database</label>
                <input type="file" accept=".bak" onChange={(e) => handleFileChange(e)} />
                <button onClick={handleBackupProcess}>Backup</button>
                <button onClick={handleRestoreProcess}>Restore</button>
            </div>
            {
                showMessage.length > 0 && (
                    <Popup open={true} position="center" closeOnDocumentClick={false}>
                        <div className='loading-container'>
                            <label className='general-label-warning'>{showMessage}</label>
                            <button onClick={handleCloseMessage}>OK</button>
                        </div>
                    </Popup>
                )
            }
            {
                error.length > 0 && (
                    <Popup open={true} position="center" closeOnDocumentClick={false}>
                        <div className='loading-container'>
                            <label className='general-label-error'>{error}</label>
                            <button className='general-button' onClick={handleCloseError}>OK</button>
                        </div> 
                    </Popup>
                )
            }
            {
                (processLoading) && (
                    <Popup open={true} position="center" closeOnDocumentClick={false}>
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