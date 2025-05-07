/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Content } from "../types/content.types";

const ContentList = ({ onCreate }: { onCreate: () => void }) => {
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Content Management
                </h2>
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    onClick={onCreate}
                >
                    Create New Content
                </button>
            </div>

            {loading ? (
                <p className="text-gray-600">Loading contents...</p>
            ) : contents.length === 0 ? (
                <p className="text-gray-600">No contents available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-gray-600">
                                    Title
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600">
                                    Author
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600">
                                    Created At
                                </th>
                                <th className="py-3 px-4 text-left text-gray-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {contents.map((content) => (
                                <tr key={content._id} className="border-b">
                                    <td className="py-3 px-4">
                                        {content.title}
                                    </td>
                                    <td className="py-3 px-4">
                                        {content.author}
                                    </td>
                                    <td className="py-3 px-4">
                                        {new Date(
                                            content.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            className="text-indigo-600 hover:underline mr-3"
                                            onClick={() => {}}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline"
                                            onClick={() => {}}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ContentList;
