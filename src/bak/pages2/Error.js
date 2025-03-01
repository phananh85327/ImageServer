import FetchData from '../api/FetchData'
import { useNavigate, useLocation } from 'react-router-dom'
import '../css/Error.css'

const Error = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname

    const handleNavigateView = () => {
        if ((sessionStorage.getItem(FetchData.accessToken) === null)
            || (sessionStorage.getItem(FetchData.refreshToken) === null)
            || (sessionStorage.getItem(FetchData.loginUser) === null)) {
            navigate('/view');
        } else {
            navigate('/main');
        }
    }

    return (
        <div className='error-body'>
            <div className='error-centered-box'>
                {
                    currentPath === '/error' ? (
                        <>
                            <h2 className='error-header'>System failure</h2>
                            <p className='error-message'>Load data fail please try again</p>
                            <button className='error-button' onClick={handleNavigateView}>Back to Home</button>
                        </>
                    ) : (
                        <>
                            <h2 className='error-header'>404</h2>
                            <p className='error-message'>Page Not Found</p>
                            <button className='error-button' onClick={handleNavigateView}>Back to Home</button>
                        </>
                    )
                }
            </div>
        </div>
    );
}

export default Error;