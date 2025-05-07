// axiosConfig.ts
import axios from "axios";
import { AuthContextType } from "./AuthContext";

const api = axios.create({
    baseURL: "http://huyphan23.workspace.opstech.org:8080",
    withCredentials: true,
});

export const setupAxiosInterceptors = (authContext: AuthContextType | null) => {
    api.interceptors.request.use(async (config) => {
        if (!authContext) {
            console.error("AuthContext is not available");
            return Promise.reject(new Error("Authentication context missing"));
        }

        let token = authContext.access_token;
        if (!token) {
            try {
                console.log("No access token found, attempting to refresh");
                token = await authContext.refreshAccessToken();
            } catch (error) {
                console.error("Failed to refresh token on request:", error);
                return Promise.reject(error);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.error("No valid token available after refresh attempt");
            return Promise.reject(new Error("No valid access token available"));
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
                    console.log(
                        "Attempting to refresh token for:",
                        originalRequest.url
                    );
                    if (!authContext) {
                        throw new Error("Authentication context missing");
                    }
                    const newToken = await authContext.refreshAccessToken();
                    console.log("New token obtained:", newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    console.log("Retrying request:", originalRequest.url);
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    if (
                        axios.isAxiosError(refreshError) &&
                        refreshError.response?.status === 401
                    ) {
                        authContext?.logout();
                    }
                    return Promise.reject(refreshError);
                }
            }
            console.log("Rejecting error:", error.response?.status);
            return Promise.reject(error);
        }
    );
};

export default api;
