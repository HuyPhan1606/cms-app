// ContentList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Content } from "../types/content.types";
import { AuthContext } from "../context/AuthContext";
import api from "../context/axiosConfig";
import socket from "../services/socket";

const ContentList = () => {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);

    useEffect(() => {
        // Get initial data
        const fetchContents = async () => {
            try {
                const response = await api.get("/contents");
                setContents(response.data);
            } catch (error) {
                console.error("Error fetching contents:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!auth?.isLoading) {
            fetchContents();
        }
    }, [auth?.isLoading]);

    // Get updated data with WebSockets
    useEffect(() => {
        socket.on("contentCreated", (createdContent: any) => {
            setContents((prevContents) => {
                return [...prevContents, createdContent];
            });
        });

        return () => {
            socket.off("contentCreated");
        };
    }, []);

    useEffect(() => {
        socket.on("contentUpdated", (updatedContent: any) => {
            setContents((prevContents) => {
                const index = prevContents.findIndex(
                    (content) => content._id === updatedContent._id
                );
                const newContents = [...prevContents];
                newContents[index] = updatedContent;
                return newContents;
            });
        });
        return () => {
            socket.off("contentUpdated");
        };
    }, []);

    // Get deleted data with WebSockets
    useEffect(() => {
        socket.on("contentDeleted", (deletedContent: any) => {
            setContents((prevContents) => {
                const result = prevContents.filter(
                    (c) => c._id !== deletedContent._id
                );
                return [...result];
            });
        });

        return () => {
            socket.off("contentDeleted");
        };
    }, []);

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
