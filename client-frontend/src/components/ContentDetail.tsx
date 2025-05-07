/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Content } from "../types/content.types";
import { AuthContext } from "../context/AuthContext";
import socket from "../services/socket";

const ContentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = useContext(AuthContext);

    // Get initial data
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(
                    `http://huyphan23.workspace.opstech.or:8080/contents/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.access_token}`,
                        },
                    }
                );
                setContent(response.data);
            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id]);

    useEffect(() => {
        socket.on("contentUpdated", (updatedContent: any) => {
            setContent(() => {
                return updatedContent;
            });
        });
        return () => {
            socket.off("contentUpdated");
        };
    }, []);

    if (loading) {
        return <p className="text-gray-600 text-center py-6">Loading...</p>;
    }

    if (!content) {
        return (
            <p className="text-gray-600 text-center py-6">Content not found.</p>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                {content.title}
            </h2>
            <p className="text-gray-600 mb-4">
                Created by: {content.createdBy} on{" "}
                {new Date(content.createdAt).toLocaleDateString()}
            </p>
            <div className="prose max-w-none">
                {content.blocks.map((block, index) => (
                    <div
                        key={index}
                        dangerouslySetInnerHTML={{ __html: block.data.data }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ContentDetail;
