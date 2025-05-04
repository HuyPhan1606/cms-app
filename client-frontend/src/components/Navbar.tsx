import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth?.logout();
        navigate("/login");
    };

    return (
        <nav className="bg-indigo-600 p-4 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-semibold">
                    Client Portal
                </Link>
                <div className="space-x-4">
                    {auth?.access_token ? (
                        <>
                            <Link
                                to="/"
                                className="text-white hover:text-indigo-200"
                            >
                                Content
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-indigo-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-white hover:text-indigo-200"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-white hover:text-indigo-200"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
