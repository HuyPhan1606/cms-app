import { User } from "../types/user.types";

const UserManagement = ({
    users,
    onCreate,
    onEdit,
    onDelete,
}: {
    users: User[];
    onCreate: () => void;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    User Management
                </h2>
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    onClick={onCreate}
                >
                    Create User
                </button>
            </div>
            {users.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                    {user.role}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button
                                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
                                        onClick={() => onEdit(user)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                                        onClick={() => onDelete(user._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-600">No users found.</p>
            )}
        </div>
    );
};

export default UserManagement;
