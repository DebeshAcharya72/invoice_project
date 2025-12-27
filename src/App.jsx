// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate, // 👈 Add this
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

// Components
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";
import ViewForm from "./pages/ViewForm";
import EditForm from "./pages/EditForm";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
});

// 👇 Create a wrapper component to use hooks
function AppContent() {
  const navigate = useNavigate(); // ✅ Now you can navigate
  const [userRole, setUserRole] = useState("user");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
    // ✅ ALWAYS redirect to /home after login
    navigate("/home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("user");
    // Optional: go back to login
    navigate("/");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Navigation userRole={userRole} onLogout={handleLogout} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home userRole={userRole} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard userRole={userRole} />} />
          <Route path="/edit-form/:purchaseId" element={<EditForm />} />
          <Route path="/view-form/:purchaseId" element={<ViewForm />} />
        </Routes>
      </Box>
    </>
  );
}

// 👇 Wrap AppContent in Router
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
