import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../types/jwt.payload";
import Cookies from "js-cookie";

export interface AuthContextType {
    access_token: string | null;
    user: { id: string; email: string; role: string } | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshaccess_token: () => Promise<string>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [access_token, setaccess_token] = useState<string | null>(
        localStorage.getItem("access_token")
    );
    const [user, setUser] = useState<{
        id: string;
        email: string;
        role: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [refreshAttempts, setRefreshAttempts] = useState<number>(0);

    const validateToken = async (token: string) => {
        try {
            const response = await axios.get("http://localhost:5000/contents", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            return response.status === 200;
        } catch (error) {
            console.log(`Token error: ${error}`);
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            let storedToken = localStorage.getItem("access_token");
            if (storedToken) {
                try {
                    const decoded: JwtPayload = jwtDecode(storedToken);
                    setaccess_token(storedToken);
                    setUser({
                        id: decoded.sub,
                        email: decoded.email,
                        role: decoded.role,
                    });

                    console.log(decoded);

                    const isValid = await validateToken(storedToken);
                    if (!isValid) {
                        storedToken = await refreshaccess_token();
                    }
                } catch (error) {
                    console.error("Error validating token:", error);
                    setaccess_token(null);
                    setUser(null);
                    localStorage.removeItem("access_token");
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await axios.post(
            "http://localhost:5000/auth/login",
            { email, password },
            { withCredentials: true }
        );
        const { access_token } = response.data;
        setaccess_token(access_token);
        setRefreshAttempts(0);
        localStorage.setItem("access_token", access_token);

        const decoded: JwtPayload = jwtDecode(access_token);
        const newUser = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
        };
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await axios.post(
                "http://localhost:5000/auth/logout",
                {},
                {
                    headers: { Authorization: `Bearer ${access_token}` },
                    withCredentials: true,
                }
            );
            setaccess_token(null);
            setUser(null);
            setRefreshAttempts(0);
            localStorage.removeItem("access_token");
            Cookies.remove("refreshToken");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const refreshaccess_token = async (): Promise<string> => {
        if (refreshAttempts >= 3) {
            await logout();
            throw new Error(
                "Max refresh attempts reached. Please log in again."
            );
        }

        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
            await logout();
            throw new Error("No refresh token available. Please log in again.");
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/auth/refresh",
                {},
                { withCredentials: true }
            );
            const { access_token: newaccess_token } = response.data;
            setaccess_token(newaccess_token);
            setRefreshAttempts(0);
            localStorage.setItem("access_token", newaccess_token);
            const decoded: JwtPayload = jwtDecode(newaccess_token);
            setUser({
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            });
            return newaccess_token;
        } catch (error) {
            setRefreshAttempts((prev) => prev + 1);
            await logout();
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message || "Failed to refresh token"
                );
            }
            throw new Error("An unexpected error occurred");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                access_token,
                user,
                login,
                logout,
                refreshaccess_token,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
