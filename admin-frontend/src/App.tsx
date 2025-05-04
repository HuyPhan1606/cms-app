import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { ProtectedRoute } from "./routes";
import CreateContentPage from "./pages/CreateContentPage";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute
                                roles={["admin", "editor", "client"]}
                            >
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <div className="p-8">Admin Only Panel</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/editor"
                        element={
                            <ProtectedRoute roles={["admin", "editor"]}>
                                <div className="p-8">Editor or Admin Panel</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-content"
                        element={
                            <ProtectedRoute roles={["admin", "editor"]}>
                                <CreateContentPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
