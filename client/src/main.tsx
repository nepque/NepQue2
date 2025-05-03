import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug admin token at startup
const adminToken = localStorage.getItem("adminToken");
console.log("DEBUG: Admin token at startup:", adminToken ? "exists" : "not found");

// Clear React Query cache on application startup to prevent stale data issues
import { queryClient } from "./lib/queryClient";
queryClient.clear();

createRoot(document.getElementById("root")!).render(<App />);
