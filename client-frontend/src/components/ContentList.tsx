/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Content } from "../types/content.types";

const ContentList = () => {
    const auth = useContext(AuthContext) as AuthContextType;
    const navigate = useNavigate();
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);

    const handleRequestWithTokenRefresh = async (
        requestFunc: (token: string) => Promise<any>
    ) => {
        try {
            const response = await requestFunc(auth.access_token || "");
            return response;
        } catch (error: any) {
            if (error.response?.status === 401) {
                try {
                    const new_access_token = await auth.refreshAccessToken();
                    if (!new_access_token) {
                        console.error("No access token found after refresh");
                        await auth.logout();
                        navigate("/login");
                        return {
                            message: "Token is invalid!",
                        };
                    }
                    return await requestFunc(new_access_token);
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    await auth.logout();
                    navigate("/login");
                    return {
                        message: "Token is invalid!",
                    };
                }
            } else {
                console.error("Request error:", error);
                throw error;
            }
        }
    };

    const fetchContents = async () => {
        if (!auth) {
            console.error("Auth context is not available");
            setLoading(false);
            navigate("/login");
            return;
        }

        try {
            const response = await handleRequestWithTokenRefresh(
                (token: string) =>
                    axios.get(
                        `http://huyphan23.workspace.opstech.org:8080/contents`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
            );
            if (response) {
                setContents(response.data);
            }
        } catch (error) {
            console.error("Error fetching contents:", error);
            await auth.logout();
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!auth?.isLoading) {
            fetchContents();
        }
    }, [auth?.isLoading]);

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Content List
            </h2>
            {auth?.isLoading || loading ? (
                <p className="text-gray-600">Loading...</p>
            ) : contents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.map((content) => (
                        <Link
                            key={content._id}
                            to={`/content/${content._id}`}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                        >
                            <h3 className="text-lg font-medium text-gray-800">
                                {content.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-2">
                                Created:{" "}
                                {new Date(
                                    content.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">No content found.</p>
            )}
        </div>
    );
};

export default ContentList;
