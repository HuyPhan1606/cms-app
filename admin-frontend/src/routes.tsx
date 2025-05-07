import { JSX, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "./types/jwt.payload";

interface ProtectedRouteProps {
    children: JSX.Element;
    roles?: string[];
}

const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: JwtPayload = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true;
    }
};

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            if (!auth) {
                navigate("/login");
                return;
            }

            if (auth.isLoading) {
                return;
            }

            if (
                !auth.accessToken ||
                (auth.accessToken && isTokenExpired(auth.accessToken))
            ) {
                setIsRefreshing(true);
                try {
                    await auth.refreshAccessToken();
                } catch (error) {
                    console.error(
                        "Failed to refresh token in ProtectedRoute:",
                        error
                    );
                    navigate("/login");
                } finally {
                    setIsRefreshing(false);
                }
            }
        };

        checkToken();
    }, [auth, auth?.accessToken, auth?.isLoading, auth?.user, navigate, roles]);

    if (auth?.isLoading || isRefreshing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    return children;
};
