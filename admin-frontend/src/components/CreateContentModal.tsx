/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { ContentTypes } from "../types/content.types";
import socket from "../services/socket";

interface CreateContentModalProps {
    onClose: () => void;
    accessToken: string;
    userId: string;
    isEdit?: boolean;
    content?: ContentTypes;
    previewContent?: ContentTypes;
}

const CreateContentModal = ({
    onClose,
    accessToken,
    userId,
    isEdit = false,
    content,
    previewContent,
}: CreateContentModalProps) => {
    const [title, setTitle] = useState("");
    const [editorContent, setEditorContent] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isEdit && content) {
            setTitle(content.title);
            setEditorContent(content.blocks[0]?.data.data || "");
        } else if (previewContent) {
            setTitle(previewContent.title);
            setEditorContent(previewContent.blocks[0]?.data.data || "");
        } else {
            setTitle("");
            setEditorContent("");
        }
    }, [isEdit, content, previewContent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && content) {
            try {
                const response = await axios.patch(
                    `http://localhost:5000/contents/${content._id}`,
                    {
                        title,
                        blocks: [
                            {
                                type: "html",
                                data: { tag: "div", data: editorContent },
                            },
                        ],
                        updatedBy: userId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                socket.emit("contentUpdated", response.data);
                onClose();
            } catch (err) {
                console.error("Error updating content:", err);
            }
        } else if (!previewContent) {
            try {
                const response = await axios.post(
                    "http://localhost:5000/contents",
                    {
                        title,
                        blocks: [
                            {
                                type: "html",
                                data: { tag: "div", data: editorContent },
                            },
                        ],
                        createdBy: userId,
                        updatedBy: userId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                socket.emit("contentCreated", response.data);
                onClose();
            } catch (err) {
                console.error("Error creating content:", err);
            }
        }
    };

    const isPreviewMode = !!previewContent;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
                <h3 className="text-xl font-semibold mb-4">
                    {isPreviewMode
                        ? "Preview Content"
                        : isEdit
                        ? "Edit Content"
                        : "Create New Content"}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isPreviewMode}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            Content
                        </label>
                        {isPreviewMode ? (
                            <div
                                className="prose max-w-none border p-4 rounded-lg [&_video]:max-w-full [&_video]:h-auto"
                                dangerouslySetInnerHTML={{
                                    __html: editorContent,
                                }}
                            />
                        ) : (
                            <Editor
                                apiKey={import.meta.env.VITE_TINY_MCE_API_KEY}
                                init={{
                                    height: 300,
                                    menubar: false,
                                    plugins: "image link media code",
                                    toolbar:
                                        "undo redo | formatselect | bold italic | alignleft aligncenter alignright | image media code",
                                    file_picker_types: "image media",
                                    media_live_embeds: true,
                                    media_filter_html: true,
                                    video_template_callback: (data: any) => {
                                        return (
                                            '<video width="100%" controls>' +
                                            '<source src="' +
                                            data.source +
                                            '" type="' +
                                            (data.sourcemime || "video/mp4") +
                                            '" />' +
                                            "</video>"
                                        );
                                    },
                                    file_picker_callback: (
                                        cb: (
                                            arg0: any,
                                            arg1: {
                                                title?: string;
                                                source?: any;
                                                sourcemime?: string;
                                                alt?: string;
                                            }
                                        ) => void,
                                        _value: any,
                                        meta: { filetype: string }
                                    ) => {
                                        const input =
                                            document.createElement("input");
                                        input.setAttribute("type", "file");
                                        if (meta.filetype === "media") {
                                            input.setAttribute(
                                                "accept",
                                                "video/*"
                                            );
                                        } else if (meta.filetype === "image") {
                                            input.setAttribute(
                                                "accept",
                                                "image/*"
                                            );
                                        }

                                        input.onchange = async () => {
                                            const file = input.files?.[0];
                                            if (!file) return;

                                            try {
                                                setIsUploading(true);
                                                const fileName =
                                                    file.name ||
                                                    `${Date.now()}.${
                                                        file.type.split(
                                                            "/"
                                                        )[1] || "mp4"
                                                    }`;
                                                const fileType = file.type;

                                                const {
                                                    data: {
                                                        uploadUrl,
                                                        fileUrl,
                                                    },
                                                } = await axios.post(
                                                    "http://localhost:5000/s3/upload-url",
                                                    { fileName, fileType },
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${accessToken}`,
                                                        },
                                                    }
                                                );

                                                if (!uploadUrl || !fileUrl) {
                                                    throw new Error(
                                                        "Missing uploadUrl or fileUrl"
                                                    );
                                                }

                                                await axios.put(
                                                    uploadUrl,
                                                    file,
                                                    {
                                                        headers: {
                                                            "Content-Type":
                                                                fileType,
                                                        },
                                                    }
                                                );

                                                setIsUploading(false);

                                                if (meta.filetype === "media") {
                                                    cb(fileUrl, {
                                                        title: fileName,
                                                        source: fileUrl,
                                                        sourcemime: fileType,
                                                    });
                                                } else {
                                                    cb(fileUrl, {
                                                        alt: fileName,
                                                    });
                                                }
                                            } catch (error: any) {
                                                setIsUploading(false);
                                                const message =
                                                    axios.isAxiosError(error)
                                                        ? `Upload failed: ${
                                                              error.response
                                                                  ?.status
                                                          } - ${JSON.stringify(
                                                              error.response
                                                                  ?.data
                                                          )}`
                                                        : `Upload failed: ${
                                                              error.message ||
                                                              "Unknown error"
                                                          }`;
                                                console.error(message);
                                                alert(message);
                                            }
                                        };

                                        input.click();
                                    },
                                    images_upload_handler: (blobInfo: {
                                        blob: () => any;
                                        progress: (arg0: number) => void;
                                    }) => {
                                        return new Promise(
                                            async (resolve, reject) => {
                                                try {
                                                    setIsUploading(true);
                                                    const file =
                                                        blobInfo.blob();
                                                    const fileName =
                                                        file.name ||
                                                        `${Date.now()}.${
                                                            file.type.split(
                                                                "/"
                                                            )[1] || "jpg"
                                                        }`;
                                                    const fileType = file.type;

                                                    const {
                                                        data: {
                                                            uploadUrl,
                                                            fileUrl,
                                                        },
                                                    } = await axios.post(
                                                        "http://localhost:5000/s3/upload-url",
                                                        { fileName, fileType },
                                                        {
                                                            headers: {
                                                                Authorization: `Bearer ${accessToken}`,
                                                            },
                                                        }
                                                    );

                                                    if (
                                                        !uploadUrl ||
                                                        !fileUrl
                                                    ) {
                                                        throw new Error(
                                                            "Missing uploadUrl or fileUrl"
                                                        );
                                                    }

                                                    await axios.put(
                                                        uploadUrl,
                                                        file,
                                                        {
                                                            headers: {
                                                                "Content-Type":
                                                                    fileType,
                                                            },
                                                            onUploadProgress: (
                                                                progressEvent
                                                            ) => {
                                                                if (
                                                                    progressEvent.total
                                                                ) {
                                                                    const percentCompleted =
                                                                        Math.round(
                                                                            (progressEvent.loaded *
                                                                                100) /
                                                                                progressEvent.total
                                                                        );
                                                                    blobInfo.progress?.(
                                                                        percentCompleted
                                                                    );
                                                                }
                                                            },
                                                        }
                                                    );

                                                    setIsUploading(false);
                                                    resolve(fileUrl);
                                                } catch (error: any) {
                                                    setIsUploading(false);
                                                    const message =
                                                        axios.isAxiosError(
                                                            error
                                                        )
                                                            ? `Upload failed: ${
                                                                  error.response
                                                                      ?.status
                                                              } - ${JSON.stringify(
                                                                  error.response
                                                                      ?.data
                                                              )}`
                                                            : `Upload failed: ${
                                                                  error.message ||
                                                                  "Unknown error"
                                                              }`;
                                                    console.error(message);
                                                    reject(message);
                                                }
                                            }
                                        );
                                    },

                                    images_dataimg_filter: (img: {
                                        getAttribute: (arg0: string) => {
                                            (): any;
                                            new (): any;
                                            match: {
                                                (arg0: RegExp): null;
                                                new (): any;
                                            };
                                        };
                                    }) => {
                                        return (
                                            img
                                                .getAttribute("src")
                                                .match(
                                                    /\.(jpg|jpeg|png|gif)$/i
                                                ) !== null
                                        );
                                    },
                                }}
                                value={editorContent}
                                onEditorChange={(newValue) =>
                                    setEditorContent(newValue)
                                }
                                disabled={isPreviewMode || isUploading}
                            />
                        )}
                        {isUploading && (
                            <div className="text-sm text-indigo-600 mt-1 font-medium animate-pulse">
                                Uploading file...
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3">
                        {isPreviewMode ? (
                            <button
                                type="button"
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                    disabled={isUploading}
                                >
                                    {isEdit ? "Update" : "Create"}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContentModal;
