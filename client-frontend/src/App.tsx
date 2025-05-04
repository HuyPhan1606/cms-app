import { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { setupAxiosInterceptors } from "./context/axiosConfig";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import ContentList from "./components/ContentList";
import ContentDetail from "./components/ContentDetail";

export const App = () => {
    const authContext = useContext(AuthContext);

    useEffect(() => {
        setupAxiosInterceptors(authContext);
    }, [authContext]);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<ContentList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/content/:id" element={<ContentDetail />} />
            </Routes>
        </Router>
    );
};

const AppWithAuth = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default AppWithAuth;
