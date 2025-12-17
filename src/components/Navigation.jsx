// src/components/Navigation.jsx
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Science as ScienceIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

const Navigation = ({ userRole, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    {
      text: "Home",
      icon: <HomeIcon />,
      path: "/home",
      roles: ["user"],
      // roles: ["user", "admin"],
    },
    {
      text: "User Dashboard",
      icon: <DashboardIcon />,
      path: "/user",
      roles: ["user"],
    },
    {
      text: "Admin Dashboard",
      icon: <AdminIcon />,
      path: "/admin",
      roles: ["admin"],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Avatar
          sx={{
            bgcolor: userRole === "admin" ? "secondary.main" : "primary.main",
            mx: "auto",
            mb: 1,
          }}
        >
          {userRole === "admin" ? <AdminIcon /> : <PeopleIcon />}
        </Avatar>
        <Typography variant="h6">
          {userRole === "admin" ? "Admin" : "User"}
        </Typography>
        <Chip
          label={userRole}
          size="small"
          color={userRole === "admin" ? "secondary" : "primary"}
        />
      </Box>
      <Divider />

      <List>
        {menuItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.light",
                    color: "white",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path ? "white" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <ListItemButton onClick={onLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Navigation;
