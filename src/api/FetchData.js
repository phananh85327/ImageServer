class FetchData {
    static httpGet = 'GET';
    static httpPost = 'POST';
    static httpPut = 'PUT';
    static httpDelete = 'DELETE';

    static loginUrl = 'http://localhost:5073/api/ImageServer/User/login';
    static tagsUrl = 'http://localhost:5073/api/ImageServer/Tags';
    static tagUrl = 'http://localhost:5073/api/ImageServer/Tag';
    static photosUrl = 'http://localhost:5073/api/ImageServer/Photos';
    static similarPhotoUrl = 'http://localhost:5073/api/ImageServer/Photos/Similar'
    static photoUrl = 'http://localhost:5073/api/ImageServer/Photo';
    static photoTagsUrl = 'http://localhost:5073/api/ImageServer/Photo/Tags';
    static importUrl = 'http://localhost:5073/api/ImageServer/Import';
    static exportUrl = '';
    static backupUrl = 'http://localhost:5073/api/ImageServer/Backup';
    static restoreUrl = 'http://localhost:5073/api/ImageServer/Restore';

    static maxImport = 100;
    static fileSize = 5 * 1024 * 1024;
    static n = 5;
    static pageRows = 10;
    static defaultFileName = 'backup.bak';
    static loginUser = 'loginUser';
    static photoDetail = "photoDetail";

    static sendRequest = async (url, method, data = null) => {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: (method === FetchData.httpGet)
                    ? null
                    : JSON.stringify(data)
            };
            const response = await fetch(url, options);
            if (!response.ok) {
                console.error('Fetch error:', response);
                result = null;
            }

            const contentType = response.headers.get('Content-Type');
            let result = {};
            try {
                if (contentType && contentType.includes('application/octet-stream')) {
                    result = await response.blob();
                } else {
                    result = await response.json();
                    if (Object.keys(result).length === 0) {
                        result = {};
                    }
                }
            } catch {
                result = {};
            }

            return result;
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    };
}

export default FetchData;