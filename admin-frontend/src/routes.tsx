import { JSX, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

interface ProtectedRouteProps {
    children: JSX.Element;
    roles: string[];
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const auth = useContext(AuthContext);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            if (!auth?.accessToken && !auth?.isLoading) {
                setIsRefreshing(true);
                try {
                    await auth?.refreshAccessToken();
                } catch (error) {
                    console.error(
                        "Failed to refresh token in ProtectedRoute:",
                        error
                    );
                } finally {
                    setIsRefreshing(false);
                }
            }
        };
        checkToken();
    }, [auth?.accessToken, auth?.isLoading]);

    if (auth?.isLoading || isRefreshing) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    return children;
};
