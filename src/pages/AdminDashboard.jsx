import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Badge,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({
    company_name: "",
    address_line1: "",
    mobile_no: "",
    gst_number: "", // Add this
    email: "", // Add this
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [userManagementDialog, setUserManagementDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    role: "user",
    company_id: "",
  });
  const [allUsers, setAllUsers] = useState([]);
  const [formMenuAnchor, setFormMenuAnchor] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [viewFormDialog, setViewFormDialog] = useState(false);
  const [selectedFormDetails, setSelectedFormDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // const loadData = async () => {
  //   setLoading(true);
  //   try {
  //     const companiesData = await api.getCompaniesSimple();
  //     setCompanies(companiesData);
  //     const formsData = await api.getAllFormsEnhanced();
  //     setAllForms(formsData);
  //     const usersData = await api.getUsers();
  //     setAllUsers(usersData);
  //     showSnackbar("Data loaded successfully", "success");
  //   } catch (error) {
  //     showSnackbar("Failed to load data: " + error.message, "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadData = async () => {
    setLoading(true);
    try {
      const companiesData = await api.getCompaniesSimple();
      setCompanies(companiesData);

      const formsData = await api.getAllFormsEnhanced();
      // The backend returns {forms: [], pagination: {}}
      // Extract the forms array from the response
      const formsArray = formsData.forms || formsData || [];
      setAllForms(formsArray);

      const usersData = await api.getUsers();
      setAllUsers(usersData);
      showSnackbar("Data loaded successfully", "success");
    } catch (error) {
      showSnackbar("Failed to load data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddCompany = async () => {
    if (!newCompany.company_name) {
      showSnackbar("Company name is required", "error");
      return;
    }
    try {
      await api.createCompanySimple(newCompany);
      await loadData();
      setNewCompany({ company_name: "", address_line1: "", mobile_no: "" });
      showSnackbar("Company added successfully", "success");
    } catch (error) {
      showSnackbar("Failed to add company: " + error.message, "error");
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${companyName}"? This will also delete all associated forms.`,
      )
    ) {
      return;
    }
    try {
      const companyForms = allForms.filter(
        (form) => form.company === companyName,
      );
      if (companyForms.length > 0) {
        if (
          !window.confirm(
            `This company has ${companyForms.length} forms. Deleting will remove all of them. Continue?`,
          )
        ) {
          return;
        }
      }
      await api.deleteCompany(companyId);
      await loadData();
      showSnackbar(`Company "${companyName}" deleted successfully`, "success");
    } catch (error) {
      showSnackbar("Failed to delete company: " + error.message, "error");
    }
  };

  const handleOpenFormMenu = (event, form) => {
    setFormMenuAnchor(event.currentTarget);
    setSelectedForm(form);
  };

  const handleCloseFormMenu = () => {
    setFormMenuAnchor(null);
    setSelectedForm(null);
  };

  const handleViewForm = () => {
    if (selectedForm) {
      setSelectedFormDetails(selectedForm);
      setViewFormDialog(true);
    }
    handleCloseFormMenu();
  };

  const handleEditForm = () => {
    if (selectedForm) {
      navigate(`/home/${selectedForm.purchase_id}`);
    }
    handleCloseFormMenu();
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;
    if (
      !window.confirm(
        `Are you sure you want to delete invoice ${selectedForm.invoice_no}? This action cannot be undone.`,
      )
    ) {
      handleCloseFormMenu();
      return;
    }
    try {
      await api.deletePurchase(selectedForm.purchase_id);
      await loadData();
      showSnackbar(
        `Form ${selectedForm.invoice_no} deleted successfully`,
        "success",
      );
    } catch (error) {
      showSnackbar(`Failed to delete form: ${error.message}`, "error");
    }
    handleCloseFormMenu();
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      showSnackbar("Username, email and password are required", "error");
      return;
    }
    try {
      await api.createUser(newUser);
      await loadData();
      setNewUser({
        username: "",
        email: "",
        password: "",
        full_name: "",
        role: "user",
        company_id: "",
      });
      setUserManagementDialog(false);
      showSnackbar("User created successfully", "success");
    } catch (error) {
      showSnackbar("Failed to create user: " + error.message, "error");
    }
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!userToEdit) return;
    try {
      const updateData = {
        email: userToEdit.email,
        full_name: userToEdit.full_name,
        role: userToEdit.role,
        company_id: userToEdit.company_id || "",
        is_active: userToEdit.is_active,
      };
      await api.updateUser(userToEdit._id, updateData);
      await loadData();
      setEditUserDialog(false);
      setUserToEdit(null);
      showSnackbar("User updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update user: " + error.message, "error");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await api.deleteUser(userId);
      await loadData();
      showSnackbar("User deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete user: " + error.message, "error");
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const updateData = {
        is_active: !user.is_active,
      };
      await api.updateUser(user._id, updateData);
      await loadData();
      showSnackbar(
        `User ${user.username} ${
          user.is_active ? "deactivated" : "activated"
        } successfully`,
        "success",
      );
    } catch (error) {
      showSnackbar("Failed to update user status", "error");
    }
  };

  const getUsersByCompany = (companyId) => {
    return allUsers.filter((user) => user.company_id === companyId);
  };

  const getFormsByCompany = (companyName) => {
    return allForms.filter((form) => form.company === companyName);
  };

  // 🔍 Search Helper
  const matchesSearch = (text, term) => {
    return text?.toString().toLowerCase().includes(term.toLowerCase());
  };

  // 🔍 Filtered Data
  const filteredCompanies = companies.filter(
    (company) =>
      matchesSearch(company.company_name, searchTerm) ||
      matchesSearch(company.address_line1, searchTerm) ||
      matchesSearch(company.mobile_no, searchTerm),
  );

  const filteredForms = allForms.filter(
    (form) =>
      matchesSearch(form.invoice_no, searchTerm) ||
      matchesSearch(form.party_name, searchTerm) ||
      matchesSearch(form.company, searchTerm) ||
      matchesSearch(form.created_by_user, searchTerm) ||
      matchesSearch(form.vehicle_no, searchTerm) ||
      matchesSearch(form.product, searchTerm),
  );

  const filteredUsers = allUsers.filter(
    (user) =>
      matchesSearch(user.username, searchTerm) ||
      matchesSearch(user.full_name, searchTerm) ||
      matchesSearch(user.email, searchTerm) ||
      matchesSearch(user.role, searchTerm),
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>

      {/* 🔍 Global Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search companies, forms, or users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        size="small"
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab
            label={
              <Badge badgeContent={filteredCompanies.length} color="primary">
                Companies
              </Badge>
            }
            icon={<BusinessIcon />}
          />
          <Tab
            label={
              <Badge badgeContent={filteredForms.length} color="secondary">
                All Forms
              </Badge>
            }
            icon={<ReceiptIcon />}
          />
          <Tab
            label={
              <Badge badgeContent={filteredUsers.length} color="info">
                Users
              </Badge>
            }
            icon={<PeopleIcon />}
          />
        </Tabs>
      </Box>

      {/* 🏢 Companies Tab */}
      {selectedTab === 0 && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Register New Company
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Company Name *"
                    value={newCompany.company_name}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        company_name: e.target.value,
                      })
                    }
                    helperText="This will appear in all users' dropdown"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Company Address"
                    value={newCompany.address_line1}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        address_line1: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={newCompany.mobile_no}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        mobile_no: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="GST Number (Optional)"
                    value={newCompany.gst_number}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        gst_number: e.target.value,
                      })
                    }
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      maxLength: 50,
                    }}
                    helperText="e.g. 27AABCU9603R1ZX"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Email (Optional)"
                    type="email"
                    value={newCompany.email}
                    onChange={(e) =>
                      setNewCompany({
                        ...newCompany,
                        email: e.target.value,
                      })
                    }
                    helperText="Company email address"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCompany}
                    disabled={!newCompany.company_name}
                  >
                    Add Company
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">
                  All Companies ({filteredCompanies.length})
                </Typography>
                <Button startIcon={<RefreshIcon />} onClick={loadData}>
                  Refresh
                </Button>
              </Box>

              {filteredCompanies.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <BusinessIcon
                    sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="textSecondary">
                    No companies match your search
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredCompanies.map((company) => {
                    const companyUsers = getUsersByCompany(company._id);
                    const companyForms = getFormsByCompany(
                      company.company_name,
                    );
                    return (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={company._id}>
                        <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            mb={1}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {company.company_name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteCompany(
                                  company._id,
                                  company.company_name,
                                )
                              }
                              title="Delete Company"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            {company.address_line1 && (
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 0.5,
                                }}
                              >
                                <LocationIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: "text.secondary" }}
                                />
                                {company.address_line1}
                              </Typography>
                            )}
                            {company.mobile_no && (
                              <Typography
                                variant="body2"
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <PhoneIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: "text.secondary" }}
                                />
                                {company.mobile_no}
                              </Typography>
                            )}
                            {company.gst_number && (
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 0.5,
                                  textTransform: "uppercase",
                                }}
                              >
                                <Typography
                                  component="span"
                                  sx={{
                                    fontWeight: "bold",
                                    mr: 0.5,
                                    fontSize: "11px",
                                    color: "text.secondary",
                                  }}
                                >
                                  GST:
                                </Typography>
                                {company.gst_number.toUpperCase()}
                              </Typography>
                            )}
                            {company.email && (
                              <Typography
                                variant="body2"
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <EmailIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: "text.secondary" }}
                                />
                                {company.email}
                              </Typography>
                            )}
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              mb={1}
                            >
                              {/* <Chip
                                icon={<PeopleIcon />}
                                label={`${companyUsers.length} users`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              /> */}
                              <Chip
                                icon={<ReceiptIcon />}
                                label={`${companyForms.length} forms`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              display="block"
                              mb={0.5}
                            >
                              Recent Activity:
                            </Typography>
                            {companyForms.length > 0 ? (
                              <Typography variant="body2">
                                Last form:{" "}
                                {companyForms[0]?.invoice_no || "N/A"}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                fontStyle="italic"
                              >
                                No forms yet
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* 📝 All Forms Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                All Submitted Forms ({filteredForms.length})
              </Typography>
              <Button startIcon={<RefreshIcon />} onClick={loadData}>
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredForms.length === 0 ? (
              <Box textAlign="center" py={4}>
                <ReceiptIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" color="textSecondary">
                  No forms match your search
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Party Name</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Vehicle No</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Weight (MT)</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredForms
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at),
                      )
                      .map((form) => (
                        <TableRow key={form.purchase_id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {form.invoice_no}
                            </Typography>
                          </TableCell>
                          <TableCell>{form.party_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={form.company}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  mr: 1,
                                  bgcolor: "primary.main",
                                }}
                              >
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2">
                                  {form.created_by_user}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {form.created_by_email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{form.vehicle_no}</TableCell>
                          <TableCell>{form.product}</TableCell>
                          <TableCell>{form.weight_mt}</TableCell>
                          <TableCell>
                            ₹{form.amount ? form.amount.toFixed(2) : "0.00"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={form.status}
                              size="small"
                              color={
                                form.status === "Paid" ? "success" : "warning"
                              }
                              icon={
                                form.status === "Paid" ? (
                                  <CheckCircleIcon />
                                ) : null
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(form.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenFormMenu(e, form)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* 👥 Users Tab */}
      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">
                User Management ({filteredUsers.length})
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setUserManagementDialog(true)}
                  sx={{ mr: 1 }}
                >
                  Add New User
                </Button>
                <Button startIcon={<RefreshIcon />} onClick={loadData}>
                  Refresh
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box textAlign="center" py={4}>
                <PeopleIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" color="textSecondary">
                  No users match your search
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                mr: 1,
                                bgcolor:
                                  user.role === "admin"
                                    ? "secondary.main"
                                    : "primary.main",
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {user.username}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {user.full_name || "No name provided"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={
                              user.role === "admin" ? "secondary" : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? "Active" : "Inactive"}
                            size="small"
                            color={user.is_active ? "success" : "error"}
                            icon={
                              user.is_active ? (
                                <CheckCircleIcon />
                              ) : (
                                <CancelIcon />
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {user.last_login ? (
                            new Date(user.last_login).toLocaleDateString()
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Never
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                onClick={() => handleEditUser(user)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={user.is_active ? "Deactivate" : "Activate"}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleToggleUserStatus(user)}
                                color={user.is_active ? "warning" : "success"}
                              >
                                {user.is_active ? (
                                  <CancelIcon />
                                ) : (
                                  <CheckCircleIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteUser(user._id, user.username)
                                }
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Actions Menu */}
      <Menu
        anchorEl={formMenuAnchor}
        open={Boolean(formMenuAnchor)}
        onClose={handleCloseFormMenu}
      >
        <MenuItem onClick={handleViewForm}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditForm}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Form
        </MenuItem>
        <MenuItem onClick={handleDeleteForm} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Form
        </MenuItem>
      </Menu>

      {/* View Form Dialog */}
      <Dialog
        open={viewFormDialog}
        onClose={() => setViewFormDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedFormDetails && (
          <>
            <DialogTitle>
              Form Details: {selectedFormDetails.invoice_no}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Party Details
                  </Typography>
                  <Typography variant="body1">
                    {selectedFormDetails.party_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Vehicle Details
                  </Typography>
                  <Typography variant="body1">
                    {selectedFormDetails.vehicle_no}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Company
                  </Typography>
                  <Typography variant="body1">
                    {selectedFormDetails.company}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {selectedFormDetails.created_by_user}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedFormDetails.created_by_email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Product
                  </Typography>
                  <Typography variant="body1">
                    {selectedFormDetails.product}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Weight
                  </Typography>
                  <Typography variant="body1">
                    {selectedFormDetails.weight_mt} MT
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹
                    {selectedFormDetails.amount
                      ? selectedFormDetails.amount.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedFormDetails.status}
                    color={
                      selectedFormDetails.status === "Paid"
                        ? "success"
                        : "warning"
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedFormDetails.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewFormDialog(false)}>Close</Button>
              <Button variant="contained" onClick={handleEditForm}>
                Edit Form
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={userManagementDialog}
        onClose={() => setUserManagementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <PeopleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Add New User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" paragraph>
              Note: Users can select any company from dropdown when creating
              forms.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username *"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password *"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Role"
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserManagementDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddUser}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editUserDialog}
        onClose={() => setEditUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {userToEdit && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" paragraph>
                Users can select any company from dropdown when creating forms.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={userToEdit.username}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={userToEdit.email}
                    onChange={(e) =>
                      setUserToEdit({ ...userToEdit, email: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={userToEdit.full_name || ""}
                    onChange={(e) =>
                      setUserToEdit({
                        ...userToEdit,
                        full_name: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={userToEdit.role}
                      label="Role"
                      onChange={(e) =>
                        setUserToEdit({ ...userToEdit, role: e.target.value })
                      }
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={userToEdit.is_active}
                      label="Status"
                      onChange={(e) =>
                        setUserToEdit({
                          ...userToEdit,
                          is_active: e.target.value,
                        })
                      }
                    >
                      <MenuItem value={true}>Active</MenuItem>
                      <MenuItem value={false}>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUser}>
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;
