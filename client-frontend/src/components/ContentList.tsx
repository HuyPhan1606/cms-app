/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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

    const handleContentClick = (id: string) => {
        navigate(`/contents/${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
                <h1 className="text-xl font-semibold">Client Portal</h1>
                <div className="flex space-x-4">
                    <span>Content</span>
                    <span>Logout</span>
                </div>
            </header>

            {/* Content List Section */}
            <div className="max-w-7xl mx-auto py-6 px-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Content List
                </h2>

                {loading ? (
                    <p className="text-gray-600 text-center py-6">Loading...</p>
                ) : contents.length === 0 ? (
                    <p className="text-gray-600 text-center py-6">
                        No contents available.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contents.map((content) => (
                            <div
                                key={content._id}
                                className="bg-white p-4 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => handleContentClick(content._id)}
                            >
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-2">
                                        {/* Icon hoặc hình ảnh placeholder */}
                                        <span className="text-gray-500">
                                            📄
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-gray-500">
                                            {content.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="ml-12">
                                    <p className="text-gray-800 font-medium">
                                        {content.createdBy || "Unknown Author"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Created{" "}
                                        {new Date(
                                            content.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {content.blocks
                                            ?.map((block) => block.data.data)
                                            .join(" ") || "No description"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentList;
