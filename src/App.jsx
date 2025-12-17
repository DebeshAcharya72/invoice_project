// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
});

function App() {
  const [userRole, setUserRole] = useState("user");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("user");
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex" }}>
          <Navigation userRole={userRole} onLogout={handleLogout} />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home userRole={userRole} />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route
                path="/user"
                element={<UserDashboard userRole={userRole} />}
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
