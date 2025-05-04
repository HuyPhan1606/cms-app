import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./AuthContext";

const Root = () => {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
