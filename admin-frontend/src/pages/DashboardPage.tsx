/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { User } from "../types/user.types";
import UserManagement from "../components/UserManagement";
import ContentManagement from "../components/ContentManagement";
import CreateContentModal from "../components/CreateContentModal";
import axios from "axios";

const DashboardPage = () => {
    const auth = useContext(AuthContext) as AuthContextType;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<
        "dashboard" | "content" | "users"
    >("dashboard");
    const [users, setUsers] = useState<User[]>([]);
    const [, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [newUser, setNewUser] = useState<User>({
        name: "",
        email: "",
        role: "client",
        password: "",
    } as User);
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);

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

    const fetchUsers = async () => {
        if (!auth) {
            console.error("Auth context is not available");
            setLoading(false);
            navigate("/login");
            return;
        }

        try {
            const response = await handleRequestWithTokenRefresh(
                (token: string) =>
                    axios.get("http://localhost:5000/users", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
            );
            if (response) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            await auth.logout();
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.user?.role === "admin" && activeTab === "users") {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [auth, activeTab]);

    const handleCreateUser = () => {
        setNewUser({
            name: "",
            email: "",
            role: "client",
            password: "",
        } as User);
        setCreatingUser(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
    };

    const handleSaveNewUser = async () => {
        if (!auth) {
            console.error("Auth context is not available");
            navigate("/login");
            return;
        }

        try {
            const response = await handleRequestWithTokenRefresh(
                (token: string) =>
                    axios.post(
                        "http://localhost:5000/users",
                        {
                            ...newUser,
                            createdAt: new Date(),
                            createdBy: auth?.user?.email,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
            );
            if (response) {
                setUsers([...users, response.data]);
                setCreatingUser(false);
            }
        } catch (error) {
            console.error("Error creating user:", error);
            await auth.logout();
            navigate("/login");
        }
    };

    const handleUpdateUser = async (updatedUser: User) => {
        if (!auth) {
            console.error("Auth context is not available");
            navigate("/login");
            return;
        }

        try {
            const response = await handleRequestWithTokenRefresh(
                (token: string) =>
                    axios.patch(
                        `http://localhost:5000/users/${updatedUser._id}`,
                        {
                            ...updatedUser,
                            updatedAt: new Date(),
                            updatedBy: auth?.user?.email,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
            );
            if (response) {
                setUsers(
                    users.map((user) =>
                        user._id === updatedUser._id ? response.data : user
                    )
                );
                setEditingUser(null);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            await auth.logout();
            navigate("/login");
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            if (!auth) {
                console.error("Auth context is not available");
                navigate("/login");
                return;
            }

            try {
                await handleRequestWithTokenRefresh((token: string) =>
                    axios.delete(`http://localhost:5000/users/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                );
                setUsers(users.filter((user) => user._id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
                await auth.logout();
                navigate("/login");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white h-screen p-6 hidden md:block shadow-lg">
                <h2 className="text-2xl font-bold mb-8">CMS Admin</h2>
                <ul className="space-y-4">
                    <li>
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`flex items-center space-x-2 w-full text-left hover:text-indigo-300 transition ${
                                activeTab === "dashboard"
                                    ? "text-indigo-300 font-semibold"
                                    : ""
                            }`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 10a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                            <span>Dashboard</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab("content")}
                            className={`flex items-center space-x-2 w-full text-left hover:text-indigo-300 transition ${
                                activeTab === "content"
                                    ? "text-indigo-300 font-semibold"
                                    : ""
                            }`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M2 4a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm2 2v8h12V6H4z" />
                            </svg>
                            <span>Content Management</span>
                        </button>
                    </li>
                    {auth?.user?.role === "admin" && (
                        <li>
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`flex items-center space-x-2 w-full text-left hover:text-indigo-300 transition ${
                                    activeTab === "users"
                                        ? "text-indigo-300 font-semibold"
                                        : ""
                                }`}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                                </svg>
                                <span>User Management</span>
                            </button>
                        </li>
                    )}
                </ul>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">
                            Welcome, {auth?.user?.email}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Your role: {auth?.user?.role}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            onClick={() =>
                                auth
                                    .logout()
                                    .then(() => navigate("/login"))
                                    .catch(() => navigate("/login"))
                            }
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "dashboard" && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Dashboard
                        </h2>
                        <p className="text-gray-600">
                            Welcome to the CMS Dashboard. Select a tab to manage
                            users or content.
                        </p>
                    </div>
                )}

                {activeTab === "content" && (
                    <ContentManagement
                        onCreate={() => setShowCreateContentModal(true)}
                    />
                )}

                {activeTab === "users" && auth?.user?.role === "admin" && (
                    <UserManagement
                        users={users}
                        onCreate={handleCreateUser}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                {/* Create User Modal */}
                {creatingUser && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">
                                Create New User
                            </h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveNewUser();
                                }}
                            >
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="name"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={newUser.name}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="password"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                password: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="role"
                                    >
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        value={newUser.role}
                                        onChange={(e) =>
                                            setNewUser({
                                                ...newUser,
                                                role: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="client">Client</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                        onClick={() => setCreatingUser(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">
                                Edit User
                            </h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateUser(editingUser);
                                }}
                            >
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="name"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={editingUser.name}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={editingUser.email}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="password"
                                    >
                                        Password (leave blank to keep current)
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={
                                            (editingUser as User).password || ""
                                        }
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                password: e.target.value,
                                            } as User & { password?: string })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        className="block text-gray-700 mb-2"
                                        htmlFor="role"
                                    >
                                        Role
                                    </label>
                                    <select
                                        id="rolezie"
                                        value={editingUser.role}
                                        onChange={(e) =>
                                            setEditingUser({
                                                ...editingUser,
                                                role: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="client">Client</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                                        onClick={() => setEditingUser(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Content Modal */}
                {showCreateContentModal && (
                    <CreateContentModal
                        onClose={() => setShowCreateContentModal(false)}
                        accessToken={auth.accessToken as string}
                        userId={auth.user?.id || ""}
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
