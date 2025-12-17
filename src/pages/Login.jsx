// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const Login = ({ onLogin }) => {
  const [role, setRole] = useState("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    // Demo credentials
    if (username === "admin" && password === "admin123") {
      onLogin("admin");
    } else if (username === "user" && password === "user123") {
      onLogin("user");
    } else {
      setError("Invalid credentials. Use admin/admin123 or user/user123");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}>
            {role === "admin" ? (
              <AdminPanelSettingsIcon />
            ) : (
              <LockOutlinedIcon />
            )}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Invoice System Login
          </Typography>
          <Typography color="textSecondary">
            {role === "admin" ? "Admin Access" : "User Access"}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Login As</InputLabel>
            <Select
              value={role}
              label="Login As"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="user">Standard User</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button type="submit" fullWidth variant="contained" size="large">
            Sign In
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
