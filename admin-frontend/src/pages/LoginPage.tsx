import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState<"success" | "error" | null>(
        null
    );
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await auth?.login(email, password);

            await new Promise((resolve) => setTimeout(resolve, 0));
            if (user?.role !== "admin" && user?.role !== "editor") {
                throw new Error(
                    "Client cannot have privilege to access the admin website"
                );
            }
            setAlertType("success");
            setAlertMessage("Login successful! Redirecting to dashboard...");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (err) {
            setAlertType("error");
            if (err instanceof Error) {
                setAlertMessage(err.message);
            } else {
                setAlertMessage("Login failed");
            }
        }
    };

    // Alert component
    const Alert = ({
        type,
        message,
    }: {
        type: "success" | "error";
        message: string;
    }) => {
        const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
        const textColor =
            type === "success" ? "text-green-800" : "text-red-800";
        const borderColor =
            type === "success" ? "border-green-400" : "border-red-400";
        const icon =
            type === "success" ? (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            ) : (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            );

        return (
            <div
                className={`${bgColor} border-l-4 ${borderColor} p-4 mb-4 rounded`}
            >
                <div className="flex items-center">
                    <div className={`flex-shrink-0 ${textColor}`}>{icon}</div>
                    <div className="ml-3">
                        <p className={`${textColor} font-medium`}>{message}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                {alertType && alertMessage && (
                    <Alert type={alertType} message={alertMessage} />
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
