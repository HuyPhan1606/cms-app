import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to CMS</h1>
                <button
                    className="bg-blue-500 text-white p-2 rounded"
                    onClick={() => navigate("/login")}
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default HomePage;
