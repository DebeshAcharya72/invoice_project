// src/components/Navigation.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navigation = ({ userRole, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  // Updated menu items with Company Management
  const menuItems = [
    {
      text: "Home",
      icon: <HomeIcon fontSize="small" />,
      path: "/home",
      roles: ["user", "admin"],
    },
    {
      text: "User Dashboard",
      icon: <DashboardIcon fontSize="small" />,
      path: "/user",
      roles: ["user"],
    },
    {
      text: "Admin Dashboard",
      icon: <AdminIcon fontSize="small" />,
      path: "/admin",
      roles: ["admin"],
    },
    // {
    //   text: "Company Management",
    //   icon: <BusinessIcon fontSize="small" />,
    //   path: "/admin/companies",
    //   roles: ["admin"],
    // },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    handleMobileMenuClose();
    onLogout();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ bgcolor: "white", color: "text.primary", boxShadow: 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "64px" }}>
          {/* Logo/Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor:
                  userRole === "admin" ? "secondary.main" : "primary.main",
                width: 36,
                height: 36,
              }}
            >
              {userRole === "admin" ? <AdminIcon /> : <PeopleIcon />}
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              Rice Bran System
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Tabs
              value={location.pathname}
              sx={{ minHeight: "64px" }}
              TabIndicatorProps={{
                style: {
                  backgroundColor:
                    userRole === "admin" ? "secondary.main" : "primary.main",
                },
              }}
            >
              {filteredMenuItems.map((item) => (
                <Tab
                  key={item.text}
                  component={Link}
                  to={item.path}
                  value={item.path}
                  icon={item.icon}
                  iconPosition="start"
                  label={item.text}
                  sx={{
                    minHeight: "64px",
                    color:
                      location.pathname === item.path
                        ? userRole === "admin"
                          ? "secondary.main"
                          : "primary.main"
                        : "text.primary",
                    fontWeight:
                      location.pathname === item.path ? "bold" : "normal",
                  }}
                />
              ))}
            </Tabs>

            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

            {/* User Profile Dropdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={userRole === "admin" ? "Administrator" : "User"}
                color={userRole === "admin" ? "secondary" : "primary"}
                size="small"
                variant="outlined"
              />
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 0.5,
                }}
              >
                <PersonIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: { mt: 1, minWidth: 180 },
                }}
              >
                <MenuItem disabled>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">
                    {userRole === "admin" ? "Administrator" : "User"}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Mobile Menu Button */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Chip
              label={userRole === "admin" ? "Admin" : "User"}
              color={userRole === "admin" ? "secondary" : "primary"}
              size="small"
              sx={{ display: { xs: "none", sm: "flex" } }}
            />
            <IconButton color="inherit" onClick={handleMobileMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
              PaperProps={{
                sx: { mt: 1, minWidth: 200 },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor:
                        userRole === "admin"
                          ? "secondary.main"
                          : "primary.main",
                      width: 24,
                      height: 24,
                    }}
                  >
                    {userRole === "admin" ? (
                      <AdminIcon fontSize="small" />
                    ) : (
                      <PeopleIcon fontSize="small" />
                    )}
                  </Avatar>
                </ListItemIcon>
                <Typography variant="body2" fontWeight="bold">
                  {userRole === "admin" ? "Administrator" : "User"}
                </Typography>
              </MenuItem>
              <Divider />
              {filteredMenuItems.map((item) => (
                <MenuItem
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    bgcolor:
                      location.pathname === item.path
                        ? "action.selected"
                        : "transparent",
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  {item.text}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navigation;
