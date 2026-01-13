import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Avatar,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { api } from "../services/api";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await api.login({
        username,
        password,
      });

      // Store the token
      api.setToken(response.access_token);

      // Get user info
      const userResponse = await api.getCurrentUser();

      // Pass user info to parent
      onLogin(userResponse.role, userResponse);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = async (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setLoading(true);
    setError("");

    try {
      const response = await api.login({
        username: demoUsername,
        password: demoPassword,
      });

      api.setToken(response.access_token);
      const userResponse = await api.getCurrentUser();
      onLogin(userResponse.role, userResponse);
    } catch (err) {
      setError("Demo login failed. Please register first.");
      console.error("Demo login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Rice Bran Remittance Login
          </Typography>
          <Typography color="textSecondary">
            Sign in to access the invoice system
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Demo Accounts
            </Typography>
            <Box
              sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 1 }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin("admin", "admin123")}
                disabled={loading}
              >
                Admin Demo
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin("user", "user123")}
                disabled={loading}
              >
                User Demo
              </Button>
            </Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 2, display: "block" }}
            >
              Need an account? Register via API first.
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
