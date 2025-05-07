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

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Content Management
                </h2>
            </div>

            {loading ? (
                <p className="text-gray-600">Loading contents...</p>
            ) : contents.length === 0 ? (
                <p className="text-gray-600">No contents available.</p>
            ) : (
                <ul className="space-y-4">
                    {contents.map((content) => (
                        <li
                            key={content._id}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-lg font-medium text-gray-800">
                                    {content.title}
                                </h3>
                                <p className="text-gray-600">
                                    Author: {content.author} | Created At:{" "}
                                    {new Date(
                                        content.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ContentList;
