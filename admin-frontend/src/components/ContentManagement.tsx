/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useContext } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";
import CreateContentModal from "./CreateContentModal";
import { ContentTypes } from "../types/content.types";
import axios from "axios";

interface Content {
    _id: string;
    title: string;
    blocks: { type: string; data: { tag: string; data: string } }[];
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContentManagementProps {
    onCreate?: () => void;
}

const ContentManagement: React.FC<ContentManagementProps> = () => {
    const auth = useContext(AuthContext) as AuthContextType;
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [previewContent, setPreviewContent] = useState<Content | null>(null);

    const handleRequestWithTokenRefresh = async (
        requestFunc: (token: string) => Promise<any>
    ) => {
        try {
            const response = await requestFunc(auth.accessToken || "");
            return response;
        } catch (error: any) {
            if (error.response?.status === 401) {
                try {
                    const new_access_token = await auth.refreshAccessToken();
                    if (!new_access_token) {
                        console.error("No access token found after refresh");
                        await auth.logout();
                        return {
                            message: "Token is invalid!",
                        };
                    }
                    return await requestFunc(new_access_token);
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    await auth.logout();
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
            return;
        }

        try {
            const response = await handleRequestWithTokenRefresh(
                (token: string) =>
                    axios.get("http://localhost:8080/contents", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
            );
            if (response) {
                setContents(response.data);
            }
        } catch (error) {
            console.error("Error fetching contents:", error);
            await auth.logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, [auth]);

    const handleCreate = () => {
        setEditingContent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (content: Content) => {
        setEditingContent(content);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this content?")) {
            if (!auth) {
                console.error("Auth context is not available");
                return;
            }

            try {
                await handleRequestWithTokenRefresh((token: string) =>
                    axios.delete(`http://localhost:8080/contents/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                );
                setContents(contents.filter((content) => content._id !== id));
            } catch (error) {
                console.error("Error deleting content:", error);
                await auth.logout();
            }
        }
    };

    const handlePreview = (content: Content) => {
        setPreviewContent(content);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingContent(null);
        setPreviewContent(null);
        fetchContents();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Content Management
                </h2>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    onClick={handleCreate}
                >
                    Create Content
                </button>
            </div>
            {loading ? (
                <p className="text-gray-600">Loading...</p>
            ) : contents.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contents.map((content) => (
                            <tr key={content._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                    {content.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                    {content.createdBy}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                    {new Date(
                                        content.createdAt
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button
                                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                                        onClick={() => handlePreview(content)}
                                    >
                                        Preview
                                    </button>
                                    <button
                                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
                                        onClick={() => handleEdit(content)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                                        onClick={() =>
                                            handleDelete(content._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-600">No content found.</p>
            )}
            {isModalOpen && (
                <CreateContentModal
                    onClose={handleModalClose}
                    accessToken={localStorage.getItem("access_token") as string}
                    userId={auth?.user?.id || ""}
                    isEdit={!!editingContent}
                    content={editingContent as ContentTypes}
                    previewContent={previewContent as ContentTypes}
                />
            )}
        </div>
    );
};

export default ContentManagement;
