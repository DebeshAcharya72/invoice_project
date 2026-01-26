// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Receipt as InvoiceIcon,
  LocalShipping as VehicleIcon,
  Science as LabIcon,
  AttachMoney as BillingIcon,
  Print as PrintIcon,
  Sms as SmsIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  Lock as LockIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const UserDashboard = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    pendingForms: 0,
    completedForms: 0,
    recentActivity: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load user's forms
  // const loadForms = async () => {
  //   try {
  //     setLoading(true);
  //     const purchases = await api.getPurchases();

  //     // Enrich forms with additional data
  //     const enrichedForms = await Promise.all(
  //       purchases.map(async (purchase) => {
  //         const purchaseId =
  //           purchase._id || purchase.id || purchase.purchase_id;
  //         let vehicle = null;
  //         let lab = null;
  //         let billing = null;

  //         try {
  //           const vehicles = await api.getVehicles();
  //           vehicle = vehicles.find((v) => v.purchase_id === purchaseId);
  //         } catch (err) {}

  //         try {
  //           const labs = await api.getLabDetails();
  //           lab = labs.find((l) => l.purchase_id === purchaseId);
  //         } catch (err) {}

  //         try {
  //           const billings = await api.getBillings();
  //           billing = billings.find((b) => b.purchase_id === purchaseId);
  //         } catch (err) {}

  //         // Calculate status and editable status
  //         const createdAt = new Date(purchase.created_at);
  //         const now = new Date();
  //         const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
  //         const isEditable = hoursDiff < 24;
  //         const status = billing ? "Completed" : "In Progress";

  //         return {
  //           ...purchase,
  //           purchaseId,
  //           vehicle,
  //           lab,
  //           billing,
  //           createdAt,
  //           isEditable,
  //           status,
  //           hoursDiff,
  //           isLocked: !isEditable,
  //         };
  //       })
  //     );

  //     setForms(enrichedForms);

  //     // Calculate stats
  //     const totalForms = enrichedForms.length;
  //     const completedForms = enrichedForms.filter((f) => f.billing).length;
  //     const pendingForms = totalForms - completedForms;
  //     const recentActivity =
  //       enrichedForms.length > 0 ? enrichedForms[0].createdAt : null;

  //     setStats({
  //       totalForms,
  //       pendingForms,
  //       completedForms,
  //       recentActivity,
  //     });
  //   } catch (err) {
  //     console.error("Failed to load forms:", err);
  //     showError("Failed to load your forms");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadForms = async () => {
    try {
      setLoading(true);

      // ✅ Fetch all data in parallel (only 4 calls total)
      const [purchases, vehicles, labs, billings] = await Promise.all([
        api.getPurchases(),
        api.getVehicles(),
        api.getLabDetails(),
        api.getBillings(),
      ]);

      // ✅ Create lookup maps for O(1) access
      const vehicleMap = new Map();
      const labMap = new Map();
      const billingMap = new Map();

      vehicles.forEach((v) => {
        const pid = v.purchase_id || v._id;
        if (pid) vehicleMap.set(pid, v);
      });

      labs.forEach((l) => {
        const pid = l.purchase_id || l._id;
        if (pid) labMap.set(pid, l);
      });

      billings.forEach((b) => {
        const pid = b.purchase_id || b._id;
        if (pid) billingMap.set(pid, b);
      });

      // ✅ Enrich purchases in a single pass
      const enrichedForms = purchases.map((purchase) => {
        const purchaseId = purchase._id || purchase.id || purchase.purchase_id;
        const vehicle = vehicleMap.get(purchaseId) || null;
        const lab = labMap.get(purchaseId) || null;
        const billing = billingMap.get(purchaseId) || null;

        const createdAt = new Date(purchase.created_at);
        const now = new Date();
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
        const isEditable = hoursDiff < 24;
        const status = billing ? "Completed" : "In Progress";

        return {
          ...purchase,
          purchaseId,
          vehicle,
          lab,
          billing,
          createdAt,
          isEditable,
          status,
          hoursDiff,
          isLocked: !isEditable,
        };
      });

      setForms(enrichedForms);

      // Calculate stats
      const totalForms = enrichedForms.length;
      const completedForms = enrichedForms.filter((f) => f.billing).length;
      const pendingForms = totalForms - completedForms;
      const recentActivity =
        enrichedForms.length > 0 ? enrichedForms[0].createdAt : null;

      setStats({
        totalForms,
        pendingForms,
        completedForms,
        recentActivity,
      });
    } catch (err) {
      console.error("Failed to load forms:", err);
      showError("Failed to load your forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "error" });
  const showSuccess = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "success" });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  const handleEditForm = (form) => {
    if (!form.isEditable) {
      showError("This form can no longer be edited (24-hour limit exceeded)");
      return;
    }

    // Navigate to edit form with form data
    // You'll need to implement this navigation based on your routing

    navigate(`/home/${form.purchaseId}`);
  };

  const handleViewForm = (form) => {
    // Navigate to view form
    console.log("View form:", form.purchaseId);
    navigate(`/view-form/${form.purchaseId}`);
  };

  const handleGenerateInvoice = (form) => {
    if (!form.billing) {
      showError("Please complete billing details first");
      return;
    }

    // Generate invoice for completed form
    console.log("Generate invoice for:", form.purchaseId);
    // You can open invoice preview modal here
  };

  const handlePrintVehicleSlip = (form) => {
    if (!form.vehicle) {
      showError("No vehicle details found for this form");
      return;
    }

    // Print vehicle slip
    console.log("Print vehicle slip for:", form.purchaseId);
    // You can open print vehicle slip modal here
  };

  const handleSendSMS = (form) => {
    if (!form.lab) {
      showError("No lab details found for this form");
      return;
    }

    // Send SMS
    console.log("Send SMS for:", form.purchaseId);
    // You can open SMS dialog here
  };

  const handleRefresh = () => {
    loadForms();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Forms Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {currentUser?.full_name || currentUser?.username}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "primary.light", mr: 2 }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6">Total Forms</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {stats.totalForms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "warning.light", mr: 2 }}>
                  <TimeIcon />
                </Avatar>
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {stats.pendingForms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "success.light", mr: 2 }}>
                  <BillingIcon />
                </Avatar>
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {stats.completedForms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "info.light", mr: 2 }}>
                  <RefreshIcon />
                </Avatar>
                <Typography variant="h6">Last Activity</Typography>
              </Box>
              <Typography variant="h6">
                {stats.recentActivity
                  ? formatTimeAgo(stats.recentActivity)
                  : "No activity"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Forms Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            My Forms ({forms.length})
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading forms...</Typography>
        ) : forms.length === 0 ? (
          <Alert severity="info">
            You haven't created any forms yet. Start by creating a new form.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Party Name</TableCell>
                  {/* <TableCell>Vehicle No</TableCell> */}
                  <TableCell>Product</TableCell>
                  <TableCell>Weight (MT)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forms
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((form) => (
                    <TableRow key={form.purchaseId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {form.invoice_no || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {form.party_name || "N/A"}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>
                      <Typography variant="body2">
                        {form.vehicle?.vehicle_no || "N/A"}
                      </Typography>
                    </TableCell> */}
                      <TableCell>
                        <Chip
                          label={form.product_name || "N/A"}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {form.gross_weight_mt
                            ? `${form.gross_weight_mt} MT`
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.status}
                          size="small"
                          color={getStatusColor(form.status)}
                        />
                        {form.isLocked && (
                          <Tooltip title="24-hour edit limit expired">
                            <Chip
                              icon={<LockIcon />}
                              label="Locked"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDate(form.createdAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(form.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Tooltip
                            title={
                              form.isEditable
                                ? "Edit Form"
                                : "Cannot edit after 24 hours"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditForm(form)}
                                disabled={!form.isEditable}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="View Form">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewForm(form)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {form.billing && (
                            <Tooltip title="Generate Invoice">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleGenerateInvoice(form)}
                              >
                                <InvoiceIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {form.vehicle && (
                            <Tooltip title="Print Vehicle Slip">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handlePrintVehicleSlip(form)}
                              >
                                <VehicleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {form.lab && (
                            <Tooltip title="Send SMS">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleSendSMS(form)}
                              >
                                <SmsIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Forms can only be edited within 24 hours of
          creation. After 24 hours, forms become locked and cannot be modified.
          Please contact an administrator if you need to make changes to a
          locked form.
        </Typography>
      </Alert>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDashboard;
