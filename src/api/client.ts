import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://inventopro.runasp.net/Api/V1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for error handling (optional but good practice)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.config.url, error.response.data);
        } else if (error.request) {
            console.error('Network Error (No Response):', error.config.url);
        } else {
            console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
