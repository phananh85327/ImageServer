import React, { useState, useEffect } from 'react';
import UserRequestResponse from '../api/UserRequestResponse'
import FetchData from '../api/FetchData'
import { useNavigate, useLocation } from 'react-router-dom'
import '../css/Login.css'

const Login = () => {
    // User data
    const [userLoading, setUserLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // User effect
    useEffect(() => {
        const fetchUserGet = async () => {
            const userEmail = document.getElementById('tbEmail');
            const userPassword = document.getElementById('tbPassword');
            const userError = document.getElementById('lbError');
            if ((userEmail === null) || (userPassword === null) || (userError === null)) {
                console.log('Invalid element');
            } else if (userEmail.value === '') {
                userError.textContent = 'Invalid email';
            } else if (userPassword.value === '') {
                userError.textContent = 'Invalid password';
            } else if (userPassword.value.length < FetchData.userPassLength) {
                userError.textContent = 'Minimum pass length is ' + FetchData.userPassLength;
            } else {
                const url = new URL(FetchData.loginUrl);
                const postUser = new UserRequestResponse()
                postUser.email = userEmail.value;
                postUser.password = await encryptPassword(userPassword.value);
                const result = await FetchData.sendRequest(url.href, FetchData.httpPost, '', postUser);
                if (result !== null) {
                    const user = UserRequestResponse.fromObject(result);
                    if (user.error === '') {
                        sessionStorage.setItem(FetchData.accessToken, result.accessToken);
                        sessionStorage.setItem(FetchData.refreshToken, result.refreshToken);
                        sessionStorage.setItem(FetchData.loginUser, JSON.stringify(user));
                        navigate('/main');
                    } else {
                        userError.textContent = user.error;
                        setUserLoading(false);
                    }
                }
            }
            setUserLoading(false);
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
        if (userLoading) {
            fetchUserGet();
        }
    }, [userLoading]);

    const handleSubmit = () => {
        setUserLoading(true);
    }

    const handleNavigateView = () => {
        navigate('/view');
    }

    const handleErrorDisplay = () => {
        const searchParams = new URLSearchParams(location.search);
        var message = searchParams.get(FetchData.message);
        return message ?? '';
    }

    return (
        <div className='login-body'>
            <div className='login-centered-box'>
                <h2 className='login-header'>Library management</h2>
                <br />
                <input id='tbEmail' className='login-input' placeholder='Email' type='text' />
                <br />
                <input id='tbPassword' className='login-input' placeholder='Password' type='password' />
                <br />
                <br />
                {
                    userLoading ? (
                        <>
                            <label className='login-label-warning'>Loading data please wait...</label>
                        </>
                    ) : (
                        <>
                            <button id='btSubmit' className='login-button' onClick={handleSubmit}>Submit</button>
                            <button className='login-button' onClick={handleNavigateView}>Back to view page</button>
                        </>
                    )
                }
                <br />
                <label id='lbError' className='login-label-error'>{handleErrorDisplay()}</label>
            </div>
        </div>
    );
}

export default Login;
