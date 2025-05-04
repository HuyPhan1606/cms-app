import axios from "axios";
import { AuthContextType } from "./AuthContext";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

export const setupAxiosInterceptors = (authContext: AuthContextType | null) => {
    api.interceptors.request.use(async (config) => {
        let token = authContext?.access_token;
        if (!token) {
            try {
                token = await authContext?.refreshaccess_token();
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
            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes("/auth/logout")
            ) {
                originalRequest._retry = true;
                try {
                    const newToken = await authContext?.refreshaccess_token();
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
