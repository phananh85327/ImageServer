class FetchData {
    static httpGet = 'GET';
    static httpPost = 'POST';
    static httpPut = 'PUT';
    static httpPatch = 'PATCH';
    static httpDelete = 'DELETE';

    // User data
    static loginUrl = 'http://localhost:7042/api/Management/Login';
    static tokenUrl = 'http://localhost:7042/api/Management/Token';
    static userUrl = 'http://localhost:7042/api/Management/User';
    static changePassUrl = 'http://localhost:7042/api/Management/ChangePass';
    static logoutUrl = 'http://localhost:7042/api/Management/Logout';
    static loginUser = 'loginUser';
    static accessToken = 'accessToken';
    static refreshToken = 'refreshToken';
    static superAdmin = 'SUPER ADMIN';
    static userMaxDisplay = 25;
    static userPassLength = 7;

    // Category data
    static categoryUrl = 'http://localhost:7042/api/Management/Category';

    // List data
    static listUrl = 'http://localhost:7042/api/Management/List';

    // Item data
    static itemUrl = 'http://localhost:7042/api/Management/Item';
    static itemFileUrl = 'http://localhost:7042/api/Management/ItemFile';
    static notificationUrl = 'http://localhost:7042/api/Management/Notification';
    static itemSeparator = '|';
    static itemNoSeparator = ';';
    static fileSize = 5 * 1024 * 1024;
    static defaultFileName = 'downloaded_file.pdf';
    static itemMaxDisplay = 25;

    // Customer data
    static customerUrl = 'http://localhost:7042/api/Management/Customer';
    static customerMaxDisplay = 25;

    // Mail data
    static mailUrl = 'http://localhost:7042/api/Management/Mail';
    static mailMaxDisplay = 25;

    // Error message
    static message = 'message';

    static sendRequest = async (url, method, token = '', data = null, navigate = null) => {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: (method === FetchData.httpGet)
                    ? null
                    : JSON.stringify(data)
            };
            const response = await fetch(url, options);

            if ((response.status === 401) && (url.includes(FetchData.tokenUrl) === false)) {
                if (navigate === null) return null;
                const refreshUrl = new URL(FetchData.tokenUrl);
                if (sessionStorage.getItem(FetchData.loginUser) === null) {
                    navigate(`/login/?` + FetchData.message + `=session%20time%20out`);
                } else {
                    refreshUrl.searchParams.set('userID', JSON.parse(sessionStorage.getItem(FetchData.loginUser)).userID);
                    const newToken = await FetchData.sendRequest(refreshUrl, FetchData.httpGet, sessionStorage.getItem(FetchData.refreshToken));
                    if (newToken === null) {
                        navigate(`/login/?` + FetchData.message + `=session%20time%20out`);
                    } else {
                        sessionStorage.setItem(FetchData.accessToken, newToken.accessToken);
                        return FetchData.sendRequest(url, method, newToken.accessToken, data);
                    }
                }
            }

            let result;
            try {
                result = await response.json();
                if (Object.keys(result).length === 0) {
                    result = {};
                }
            } catch {
                if (response.ok) {
                    result = {};
                } else {
                    console.error('Fetch error:', response);
                    result = null;
                }
            }

            return result;
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    };
}

export default FetchData;