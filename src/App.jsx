// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
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

function AppContent() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("user");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
    navigate("/home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("user");
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
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Single route that handles both /home and /home/:purchaseId */}
          <Route
            path="/home/:purchaseId?"
            element={<Home userRole={userRole} />}
          />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard userRole={userRole} />} />
          <Route path="/edit-form/:purchaseId" element={<EditForm />} />
          <Route path="/view-form/:purchaseId" element={<ViewForm />} />

          {/* Catch-all redirect to home for unmatched routes */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Box>
    </>
  );
}

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
