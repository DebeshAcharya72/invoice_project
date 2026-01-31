// import React, { useState } from "react";
// import {
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Button,
//   TextField,
//   Alert,
//   Avatar,
//   CircularProgress,
//   InputAdornment, // 👈 Add this
//   IconButton,
// } from "@mui/material";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
// // import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import { api } from "../services/api";

// const Login = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     if (!username || !password) {
//       setError("Please enter both username and password");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await api.login({
//         username,
//         password,
//       });

//       // Store the token
//       api.setToken(response.access_token);

//       // Get user info
//       const userResponse = await api.getCurrentUser();

//       // Pass user info to parent
//       onLogin(userResponse.role, userResponse);
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Invalid credentials. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Demo login for testing
//   const handleDemoLogin = async (demoUsername, demoPassword) => {
//     setUsername(demoUsername);
//     setPassword(demoPassword);
//     setLoading(true);
//     setError("");

//     try {
//       const response = await api.login({
//         username: demoUsername,
//         password: demoPassword,
//       });

//       api.setToken(response.access_token);
//       const userResponse = await api.getCurrentUser();
//       onLogin(userResponse.role, userResponse);
//     } catch (err) {
//       setError("Demo login failed. Please register first.");
//       console.error("Demo login error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container maxWidth="sm" sx={{ mt: 8 }}>
//       <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
//         <Box sx={{ textAlign: "center", mb: 3 }}>
//           <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 2 }}>
//             <LockOutlinedIcon />
//           </Avatar>
//           <Typography variant="h4" gutterBottom>
//             Rice Bran Remittance Login
//           </Typography>
//           <Typography color="textSecondary">
//             Sign in to access the invoice system
//           </Typography>
//         </Box>

//         <form onSubmit={handleSubmit}>
//           <TextField
//             fullWidth
//             label="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             sx={{ mb: 3 }}
//             disabled={loading}
//           />

//           {/* <TextField
//             fullWidth
//             label="Password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             sx={{ mb: 3 }}
//             disabled={loading}
//           /> */}

//           <TextField
//             fullWidth
//             label="Password"
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             disabled={loading}
//             sx={{ mb: 3 }}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton
//                     aria-label="toggle password visibility"
//                     onClick={() => setShowPassword(!showPassword)}
//                     edge="end"
//                     size="small"
//                   >
//                     {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />

//           {error && (
//             <Alert severity="error" sx={{ mb: 3 }}>
//               {error}
//             </Alert>
//           )}

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             size="large"
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} /> : "Sign In"}
//           </Button>

//           {/* <Box sx={{ mt: 3, textAlign: "center" }}>
//             <Typography variant="body2" color="textSecondary" gutterBottom>
//               Demo Accounts
//             </Typography>
//             <Box
//               sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 1 }}
//             >
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={() => handleDemoLogin("admin", "admin123")}
//                 disabled={loading}
//               >
//                 Admin Demo
//               </Button>
//               <Button
//                 variant="outlined"
//                 size="small"
//                 onClick={() => handleDemoLogin("user", "user123")}
//                 disabled={loading}
//               >
//                 User Demo
//               </Button>
//             </Box>
//             <Typography
//               variant="caption"
//               color="textSecondary"
//               sx={{ mt: 2, display: "block" }}
//             >
//               Need an account? Register via API first.
//             </Typography>
//           </Box> */}
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default Login;

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
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Zoom,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import KeyIcon from "@mui/icons-material/Key";
import { api } from "../services/api";
import { styled } from "@mui/material/styles";

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: 24,
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: "white",
  padding: theme.spacing(1.5),
  borderRadius: 12,
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  "&:disabled": {
    background: theme.palette.action.disabled,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: alpha(theme.palette.primary.main, 0.5),
      },
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
  },
}));

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

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

      api.setToken(response.access_token);
      const userResponse = await api.getCurrentUser();
      onLogin(userResponse.role, userResponse);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        py: 4,
      }}
    >
      <Zoom in={true} timeout={500}>
        <StyledPaper elevation={0}>
          {/* Decorative elements */}
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -150,
              left: -150,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 70%)`,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Grow in={true} timeout={700}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    mx: "auto",
                    mb: 3,
                    width: 80,
                    height: 80,
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  Rice Bran Remittance
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 400 }}
                >
                  Secure Invoice Management System
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ opacity: 0.8 }}
                >
                  Sign in to manage your invoices and payments
                </Typography>
              </Box>
            </Grow>

            <Fade in={true} timeout={800}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <StyledTextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover": {
                          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <StyledTextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{
                              color: theme.palette.action.active,
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1,
                                ),
                              },
                            }}
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover": {
                          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      },
                    }}
                  />
                </Box>

                {error && (
                  <Fade in={!!error}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                        backgroundColor: alpha(theme.palette.error.main, 0.05),
                      }}
                      icon={false}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2">{error}</Typography>
                      </Box>
                    </Alert>
                  </Fade>
                )}

                <GradientButton
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <LoginIcon />
                    )
                  }
                >
                  {loading ? "Signing In..." : "Sign In"}
                </GradientButton>
              </form>
            </Fade>

            {/* Footer */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textAlign: "center",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ opacity: 0.6 }}
              >
                © {new Date().getFullYear()} Rice Bran Remittance
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Zoom>
    </Container>
  );
};

export default Login;
