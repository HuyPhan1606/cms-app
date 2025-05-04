import axios from "axios";
import { AuthContextType } from "./AuthContext";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

export const setupAxiosInterceptors = (
    authContext: AuthContextType | undefined
) => {
    api.interceptors.request.use(async (config) => {
        let token = authContext?.accessToken;
        if (!token) {
            try {
                token = await authContext?.refreshAccessToken();
            } catch (error) {
                console.error("Failed to refresh token on request:", error);
                throw error;
            }
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            // Skip refresh for logout requests
            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes("/auth/logout") // Add this condition
            ) {
                originalRequest._retry = true;
                try {
                    const newToken = await authContext?.refreshAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error(
                        "Failed to refresh token on response:",
                        refreshError
                    );
                    authContext?.logout();
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;
