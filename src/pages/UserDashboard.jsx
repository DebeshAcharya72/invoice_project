// src/pages/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountCircle as AccountCircleIcon,
  Scale as ScaleIcon,
  Science as ScienceIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data states - grouped by purchase ID
  const [forms, setForms] = useState([]);
  const [parties, setParties] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [labDetails, setLabDetails] = useState([]);
  const [billings, setBillings] = useState([]);

  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    party: {
      party_name: "",
      address_line1: "",
      address_line2: "",
      po: "",
      landmark: "",
      city: "",
      state: "",
      pin: "",
      contact_person: "",
      gst: "",
      customer_type: "Registered",
      description: "",
    },
    purchase: {
      report_type: "Tax",
      party_name: "",
      purchased_from: "Party",
      agent_name: "",
      agent_number: "",
      bank_account: "",
      bank_name: "",
      branch_name: "",
      ifsc: "",
      invoice_no: "",
      date: new Date().toISOString().split("T")[0],
      product_name: "Boiled Rice Bran",
      contracted_rate: "",
      bran_type: "Good",
      gross_weight_mt: "",
    },
    vehicle: {
      vehicle_no: "",
      owner_name: "",
      owner_rc: "",
      owner_address_line1: "",
      owner_address_line2: "",
      owner_po: "",
      owner_landmark: "",
      owner_city: "",
      owner_state: "",
      owner_pin: "",
      mobile_no: "",
      rice_mill_name: "",
      destination_from: "",
      destination_to: "",
      quantity_mt: "",
      freight_per_mt: "",
      advance_amount: "",
      paid_by: "Buyer",
    },
    quantity: {
      gross_weight_mt: "",
      no_of_bags: "",
      bag_type: "Poly",
    },
    lab: {
      standard_ffa: "7",
      standard_oil: "19",
      obtain_ffa: "",
      obtain_oil: "",
      rebate_percent: "",
      rebate_rs: "",
      premium_percent: "",
      premium_rs: "",
    },
    billing: {
      gst_type: "Intra",
      invoice_amount: "",
    },
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        partiesData,
        purchasesData,
        vehiclesData,
        quantitiesData,
        labData,
        billingsData,
      ] = await Promise.all([
        api.getAdminStats(),
        api.getParties(),
        api.getPurchases(),
        api.getVehicles(),
        api.getQuantities(),
        api.getLabDetails(),
        api.getBillings(),
      ]);

      setStats(statsData);
      setParties(partiesData || []);
      setPurchases(purchasesData || []);
      setVehicles(vehiclesData || []);
      setQuantities(quantitiesData || []);
      setLabDetails(labData || []);
      setBillings(billingsData || []);

      const combinedForms = combineForms(
        purchasesData,
        partiesData,
        vehiclesData,
        quantitiesData,
        labData,
        billingsData
      );
      setForms(combinedForms);

      showSnackbar("Dashboard data loaded successfully", "success");
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      showSnackbar("Failed to load data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const combineForms = (
    purchases,
    parties,
    vehicles,
    quantities,
    labs,
    billings
  ) => {
    return purchases.map((purchase) => {
      const party = parties.find((p) => p.party_name === purchase.party_name);
      const vehicle = vehicles.find((v) => v.purchase_id === purchase.id);
      const quantity = quantities.find((q) => q.purchase_id === purchase.id);
      const lab = labs.find((l) => l.purchase_id === purchase.id);
      const billing = billings.find((b) => b.purchase_id === purchase.id);

      const createdAt = purchase.created_at
        ? new Date(purchase.created_at)
        : new Date();
      const currentTime = new Date();
      const hoursDifference = (currentTime - createdAt) / (1000 * 60 * 60);
      // CHANGED: User can edit AFTER 24 hours, not before
      const canEdit = hoursDifference >= 24;

      return {
        id: purchase.id,
        purchase,
        party,
        vehicle,
        quantity,
        lab,
        billing,
        created_at: purchase.created_at,
        created_at_obj: createdAt,
        status: billing?.amount_payable > 0 ? "Pending" : "Paid",
        total_amount: billing?.billed_amount || 0,
        canEdit: canEdit,
        hours_since_creation: hoursDifference.toFixed(1),
      };
    });
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEdit = (form) => {
    if (!form.canEdit) {
      showSnackbar("Cannot edit before 24 hours have passed", "warning");
      return;
    }

    setSelectedPurchaseId(form.id);
    setSelectedForm(form);

    setEditForm({
      party: {
        party_name: form.party?.party_name || "",
        address_line1: form.party?.address_line1 || "",
        address_line2: form.party?.address_line2 || "",
        po: form.party?.po || "",
        landmark: form.party?.landmark || "",
        city: form.party?.city || "",
        state: form.party?.state || "",
        pin: form.party?.pin || "",
        contact_person: form.party?.contact_person || "",
        gst: form.party?.gst || "",
        customer_type: form.party?.customer_type || "Registered",
        description: form.party?.description || "",
      },
      purchase: {
        report_type: form.purchase?.report_type || "Tax",
        party_name: form.purchase?.party_name || "",
        purchased_from: form.purchase?.purchased_from || "Party",
        agent_name: form.purchase?.agent_name || "",
        agent_number: form.purchase?.agent_number || "",
        bank_account: form.purchase?.bank_account || "",
        bank_name: form.purchase?.bank_name || "",
        branch_name: form.purchase?.branch_name || "",
        ifsc: form.purchase?.ifsc || "",
        invoice_no: form.purchase?.invoice_no || "",
        date: form.purchase?.date || new Date().toISOString().split("T")[0],
        product_name: form.purchase?.product_name || "Boiled Rice Bran",
        contracted_rate: form.purchase?.contracted_rate || "",
        bran_type: form.purchase?.bran_type || "Good",
        gross_weight_mt: form.purchase?.gross_weight_mt || "",
      },
      vehicle: {
        vehicle_no: form.vehicle?.vehicle_no || "",
        owner_name: form.vehicle?.owner_name || "",
        owner_rc: form.vehicle?.owner_rc || "",
        owner_address_line1: form.vehicle?.owner_address_line1 || "",
        owner_address_line2: form.vehicle?.owner_address_line2 || "",
        owner_po: form.vehicle?.owner_po || "",
        owner_landmark: form.vehicle?.owner_landmark || "",
        owner_city: form.vehicle?.owner_city || "",
        owner_state: form.vehicle?.owner_state || "",
        owner_pin: form.vehicle?.owner_pin || "",
        mobile_no: form.vehicle?.mobile_no || "",
        rice_mill_name: form.vehicle?.rice_mill_name || "",
        destination_from: form.vehicle?.destination_from || "",
        destination_to: form.vehicle?.destination_to || "",
        quantity_mt: form.vehicle?.quantity_mt || "",
        freight_per_mt: form.vehicle?.freight_per_mt || "",
        advance_amount: form.vehicle?.advance_amount || "",
        paid_by: form.vehicle?.paid_by || "Buyer",
      },
      quantity: {
        gross_weight_mt:
          form.quantity?.gross_weight_mt ||
          form.purchase?.gross_weight_mt ||
          "",
        no_of_bags: form.quantity?.no_of_bags || "",
        bag_type: form.quantity?.bag_type || "Poly",
      },
      lab: {
        standard_ffa: form.lab?.standard_ffa || "7",
        standard_oil: form.lab?.standard_oil || "19",
        obtain_ffa: form.lab?.obtain_ffa || "",
        obtain_oil: form.lab?.obtain_oil || "",
        rebate_percent: form.lab?.rebate_percent || "",
        rebate_rs: form.lab?.rebate_rs || "",
        premium_percent: form.lab?.premium_percent || "",
        premium_rs: form.lab?.premium_rs || "",
      },
      billing: {
        gst_type: form.billing?.gst_type || "Intra",
        invoice_amount: form.billing?.invoice_amount || "",
      },
    });

    setEditDialog(true);
  };

  const handleView = (form) => {
    setSelectedPurchaseId(form.id);
    setSelectedForm(form);

    // Populate form data for viewing (read-only)
    setEditForm({
      party: {
        party_name: form.party?.party_name || "",
        address_line1: form.party?.address_line1 || "",
        address_line2: form.party?.address_line2 || "",
        po: form.party?.po || "",
        landmark: form.party?.landmark || "",
        city: form.party?.city || "",
        state: form.party?.state || "",
        pin: form.party?.pin || "",
        contact_person: form.party?.contact_person || "",
        gst: form.party?.gst || "",
        customer_type: form.party?.customer_type || "",
        description: form.party?.description || "",
      },
      purchase: {
        report_type: form.purchase?.report_type || "",
        party_name: form.purchase?.party_name || "",
        purchased_from: form.purchase?.purchased_from || "",
        agent_name: form.purchase?.agent_name || "",
        agent_number: form.purchase?.agent_number || "",
        bank_account: form.purchase?.bank_account || "",
        bank_name: form.purchase?.bank_name || "",
        branch_name: form.purchase?.branch_name || "",
        ifsc: form.purchase?.ifsc || "",
        invoice_no: form.purchase?.invoice_no || "",
        date: form.purchase?.date || "",
        product_name: form.purchase?.product_name || "",
        contracted_rate: form.purchase?.contracted_rate || "",
        bran_type: form.purchase?.bran_type || "",
        gross_weight_mt: form.purchase?.gross_weight_mt || "",
      },
      vehicle: {
        vehicle_no: form.vehicle?.vehicle_no || "",
        owner_name: form.vehicle?.owner_name || "",
        owner_rc: form.vehicle?.owner_rc || "",
        owner_address_line1: form.vehicle?.owner_address_line1 || "",
        owner_address_line2: form.vehicle?.owner_address_line2 || "",
        owner_po: form.vehicle?.owner_po || "",
        owner_landmark: form.vehicle?.owner_landmark || "",
        owner_city: form.vehicle?.owner_city || "",
        owner_state: form.vehicle?.owner_state || "",
        owner_pin: form.vehicle?.owner_pin || "",
        mobile_no: form.vehicle?.mobile_no || "",
        rice_mill_name: form.vehicle?.rice_mill_name || "",
        destination_from: form.vehicle?.destination_from || "",
        destination_to: form.vehicle?.destination_to || "",
        quantity_mt: form.vehicle?.quantity_mt || "",
        freight_per_mt: form.vehicle?.freight_per_mt || "",
        advance_amount: form.vehicle?.advance_amount || "",
        paid_by: form.vehicle?.paid_by || "",
      },
      quantity: {
        gross_weight_mt: form.quantity?.gross_weight_mt || "",
        no_of_bags: form.quantity?.no_of_bags || "",
        bag_type: form.quantity?.bag_type || "",
      },
      lab: {
        standard_ffa: form.lab?.standard_ffa || "",
        standard_oil: form.lab?.standard_oil || "",
        obtain_ffa: form.lab?.obtain_ffa || "",
        obtain_oil: form.lab?.obtain_oil || "",
        rebate_percent: form.lab?.rebate_percent || "",
        rebate_rs: form.lab?.rebate_rs || "",
        premium_percent: form.lab?.premium_percent || "",
        premium_rs: form.lab?.premium_rs || "",
      },
      billing: {
        gst_type: form.billing?.gst_type || "",
        invoice_amount: form.billing?.invoice_amount || "",
      },
    });

    setViewDialog(true);
  };

  // Individual update functions for each section
  const updatePartySection = async () => {
    try {
      if (selectedForm.party?.id) {
        await api.updateParty(selectedForm.party.id, editForm.party);
        showSnackbar("Party details updated successfully", "success");
        loadDashboardData();
      }
    } catch (error) {
      showSnackbar("Failed to update party: " + error.message, "error");
    }
  };

  const updatePurchaseSection = async () => {
    try {
      const purchaseData = {
        ...editForm.purchase,
        contracted_rate: parseFloat(editForm.purchase.contracted_rate) || 0,
        gross_weight_mt: parseFloat(editForm.purchase.gross_weight_mt) || 0,
      };
      await api.updatePurchase(selectedPurchaseId, purchaseData);
      showSnackbar("Purchase details updated successfully", "success");
      loadDashboardData();
    } catch (error) {
      showSnackbar("Failed to update purchase: " + error.message, "error");
    }
  };

  const updateVehicleSection = async () => {
    try {
      if (selectedForm.vehicle?.id) {
        const vehicleData = {
          ...editForm.vehicle,
          quantity_mt: parseFloat(editForm.vehicle.quantity_mt) || 0,
          freight_per_mt: parseFloat(editForm.vehicle.freight_per_mt) || 0,
          advance_amount: parseFloat(editForm.vehicle.advance_amount) || 0,
        };
        await api.updateVehicle(selectedForm.vehicle.id, vehicleData);
        showSnackbar("Vehicle details updated successfully", "success");
        loadDashboardData();
      }
    } catch (error) {
      showSnackbar("Failed to update vehicle: " + error.message, "error");
    }
  };

  const updateQuantitySection = async () => {
    try {
      if (selectedForm.quantity?.id) {
        const quantityData = {
          purchase_id: selectedPurchaseId,
          gross_weight_mt: parseFloat(editForm.quantity.gross_weight_mt) || 0,
          no_of_bags: parseInt(editForm.quantity.no_of_bags) || 0,
          bag_type: editForm.quantity.bag_type,
        };
        await api.updateQuantity(selectedForm.quantity.id, quantityData);
        showSnackbar("Quantity details updated successfully", "success");
        loadDashboardData();
      }
    } catch (error) {
      showSnackbar("Failed to update quantity: " + error.message, "error");
    }
  };

  const updateLabSection = async () => {
    try {
      if (selectedForm.lab?.id) {
        const labData = {
          purchase_id: selectedPurchaseId,
          standard_ffa: parseFloat(editForm.lab.standard_ffa) || 0,
          standard_oil: parseFloat(editForm.lab.standard_oil) || 0,
          obtain_ffa: parseFloat(editForm.lab.obtain_ffa) || 0,
          obtain_oil: parseFloat(editForm.lab.obtain_oil) || 0,
          rebate_percent: parseFloat(editForm.lab.rebate_percent) || 0,
          rebate_rs: parseFloat(editForm.lab.rebate_rs) || 0,
          premium_percent: parseFloat(editForm.lab.premium_percent) || 0,
          premium_rs: parseFloat(editForm.lab.premium_rs) || 0,
        };
        await api.updateLabDetail(selectedForm.lab.id, labData);
        showSnackbar("Lab details updated successfully", "success");
        loadDashboardData();
      }
    } catch (error) {
      showSnackbar("Failed to update lab: " + error.message, "error");
    }
  };

  const updateBillingSection = async () => {
    try {
      if (selectedForm.billing?.id) {
        const billingData = {
          purchase_id: selectedPurchaseId,
          gst_type: editForm.billing.gst_type,
          invoice_amount: parseFloat(editForm.billing.invoice_amount) || 0,
        };
        await api.updateBilling(selectedForm.billing.id, billingData);
        showSnackbar("Billing details updated successfully", "success");
        loadDashboardData();
      }
    } catch (error) {
      showSnackbar("Failed to update billing: " + error.message, "error");
    }
  };

  const handleUpdate = async () => {
    try {
      // Update Party
      if (selectedForm.party?.id) {
        await api.updateParty(selectedForm.party.id, editForm.party);
      }

      // Update Purchase
      const purchaseData = {
        ...editForm.purchase,
        contracted_rate: parseFloat(editForm.purchase.contracted_rate) || 0,
        gross_weight_mt: parseFloat(editForm.purchase.gross_weight_mt) || 0,
      };
      await api.updatePurchase(selectedPurchaseId, purchaseData);

      // Update Vehicle
      if (selectedForm.vehicle?.id) {
        const vehicleData = {
          ...editForm.vehicle,
          quantity_mt: parseFloat(editForm.vehicle.quantity_mt) || 0,
          freight_per_mt: parseFloat(editForm.vehicle.freight_per_mt) || 0,
          advance_amount: parseFloat(editForm.vehicle.advance_amount) || 0,
        };
        await api.updateVehicle(selectedForm.vehicle.id, vehicleData);
      }

      // Update Quantity
      if (selectedForm.quantity?.id) {
        const quantityData = {
          purchase_id: selectedPurchaseId,
          gross_weight_mt: parseFloat(editForm.quantity.gross_weight_mt) || 0,
          no_of_bags: parseInt(editForm.quantity.no_of_bags) || 0,
          bag_type: editForm.quantity.bag_type,
        };
        await api.updateQuantity(selectedForm.quantity.id, quantityData);
      }

      // Update Lab Details
      if (selectedForm.lab?.id) {
        const labData = {
          purchase_id: selectedPurchaseId,
          standard_ffa: parseFloat(editForm.lab.standard_ffa) || 0,
          standard_oil: parseFloat(editForm.lab.standard_oil) || 0,
          obtain_ffa: parseFloat(editForm.lab.obtain_ffa) || 0,
          obtain_oil: parseFloat(editForm.lab.obtain_oil) || 0,
          rebate_percent: parseFloat(editForm.lab.rebate_percent) || 0,
          rebate_rs: parseFloat(editForm.lab.rebate_rs) || 0,
          premium_percent: parseFloat(editForm.lab.premium_percent) || 0,
          premium_rs: parseFloat(editForm.lab.premium_rs) || 0,
        };
        await api.updateLabDetail(selectedForm.lab.id, labData);
      }

      // Update Billing
      if (selectedForm.billing?.id) {
        const billingData = {
          purchase_id: selectedPurchaseId,
          gst_type: editForm.billing.gst_type,
          invoice_amount: parseFloat(editForm.billing.invoice_amount) || 0,
        };
        await api.updateBilling(selectedForm.billing.id, billingData);
      }

      showSnackbar("Complete form updated successfully", "success");
      loadDashboardData();
      setEditDialog(false);
    } catch (error) {
      showSnackbar("Failed to update: " + error.message, "error");
    }
  };

  // Filter forms based on search
  const filteredForms = forms.filter(
    (form) =>
      form.purchase?.invoice_no
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      form.party?.party_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      form.vehicle?.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats cards for user
  const editableForms = forms.filter((form) => form.canEdit);
  const nonEditableForms = forms.filter((form) => !form.canEdit);

  const statCards = [
    {
      title: "Total Forms",
      value: forms.length,
      icon: <InventoryIcon />,
      color: "#1976d2",
    },
    {
      title: "Editable Forms",
      value: editableForms.length,
      icon: <EditIcon />,
      color: "#2e7d32",
      subText: `${nonEditableForms.length} not yet editable`,
    },
    {
      title: "Total Parties",
      value: parties.length,
      icon: <PeopleIcon />,
      color: "#9c27b0",
    },
    {
      title: "Total Purchases",
      value: purchases.length,
      icon: <TrendingUpIcon />,
      color: "#2e7d32",
    },
    {
      title: "Total Billed",
      value: `₹${billings
        .reduce((sum, b) => sum + (b.billed_amount || 0), 0)
        .toFixed(2)}`,
      icon: <AttachMoneyIcon />,
      color: "#ed6c02",
    },
    {
      title: "Paid Invoices",
      value: billings.filter((b) => b.amount_payable <= 0).length,
      icon: <ReceiptIcon />,
      color: "#2e7d32",
      subText: `Pending: ${
        billings.filter((b) => b.amount_payable > 0).length
      }`,
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    return status === "Paid" ? "success" : "warning";
  };

  const getEditStatusColor = (canEdit) => {
    return canEdit ? "success" : "warning";
  };

  const getEditStatusText = (canEdit, hoursSinceCreation) => {
    return canEdit
      ? "Ready to edit"
      : `${(24 - hoursSinceCreation).toFixed(1)}h left`;
  };

  const getEditIcon = (canEdit) => {
    return canEdit ? <CheckCircleIcon /> : <AccessTimeIcon />;
  };

  // Calculations for form
  const bagWeightMT = editForm.quantity.bag_type === "Poly" ? 0.0002 : 0.0005;
  const netWeightMT =
    (parseFloat(editForm.quantity.gross_weight_mt) || 0) -
    (parseInt(editForm.quantity.no_of_bags) || 0) * bagWeightMT;
  const totalFreight =
    (parseFloat(editForm.vehicle.quantity_mt) || 0) *
    (parseFloat(editForm.vehicle.freight_per_mt) || 0);
  const toPay =
    totalFreight - (parseFloat(editForm.vehicle.advance_amount) || 0);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          User Dashboard - My Forms
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
          You can only edit forms after 24 hours have passed since creation
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search forms by invoice, party, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                ),
              }}
              sx={{ flex: 1, maxWidth: 500 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={loadDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                <Avatar sx={{ bgcolor: stat.color, mx: "auto", mb: 1 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stat.title}
                </Typography>
                {stat.subText && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 0.5 }}
                  >
                    {stat.subText}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* All Forms Table */}
      <Card>
        <CardHeader
          title="My Forms"
          subheader={`Showing ${filteredForms.length} forms (${editableForms.length} editable)`}
          action={
            <Button
              startIcon={<CancelIcon />}
              onClick={() => setSearchTerm("")}
              disabled={!searchTerm}
            >
              Clear Search
            </Button>
          }
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Party Name</TableCell>
                  <TableCell>Vehicle No</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Weight (MT)</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Edit Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((form) => (
                    <TableRow key={form.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {form.purchase?.invoice_no || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {form.party?.party_name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {form.vehicle?.vehicle_no || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {form.purchase?.product_name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography>
                          {form.purchase?.gross_weight_mt || 0} MT
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium" color="primary">
                          ₹
                          {form.purchase?.contracted_rate?.toFixed(2) || "0.00"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={form.status}
                          size="small"
                          color={getStatusColor(form.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(form.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getEditIcon(form.canEdit)}
                          label={getEditStatusText(
                            form.canEdit,
                            parseFloat(form.hours_since_creation)
                          )}
                          size="small"
                          color={getEditStatusColor(form.canEdit)}
                          variant={form.canEdit ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Tooltip
                            title={
                              form.canEdit
                                ? "Edit Form"
                                : "View Form (Not yet editable)"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                form.canEdit
                                  ? handleEdit(form)
                                  : handleView(form)
                              }
                              color={form.canEdit ? "primary" : "default"}
                            >
                              {form.canEdit ? (
                                <EditIcon fontSize="small" />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        {searchTerm
                          ? "No forms found matching your search."
                          : "No forms submitted yet."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* EDIT FORM DIALOG - Only shows for editable forms (after 24 hours) */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon />
            Edit Form - Invoice: {selectedForm?.purchase?.invoice_no}
            {selectedForm?.canEdit && (
              <Chip
                label={`Editable (Created ${selectedForm?.hours_since_creation}h ago)`}
                size="small"
                color="success"
                icon={<CheckCircleIcon />}
                sx={{ ml: 2 }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            {/* 1. PARTY DETAILS */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="1. Party Details"
                avatar={
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <AccountCircleIcon />
                  </Avatar>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={updatePartySection}
                    sx={{ mt: 1 }}
                  >
                    Update Party
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Party Name *"
                      value={editForm.party.party_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            party_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact Person"
                      value={editForm.party.contact_person}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            contact_person: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={editForm.party.address_line1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            address_line1: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={editForm.party.address_line2}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            address_line2: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="PO"
                      value={editForm.party.po}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: { ...editForm.party, po: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Landmark"
                      value={editForm.party.landmark}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            landmark: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={editForm.party.city}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: { ...editForm.party, city: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={editForm.party.state}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: { ...editForm.party, state: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      value={editForm.party.pin}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: { ...editForm.party, pin: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="GST"
                      value={editForm.party.gst}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: { ...editForm.party, gst: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Customer Type"
                      value={editForm.party.customer_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            customer_type: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={2}
                      value={editForm.party.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          party: {
                            ...editForm.party,
                            description: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 2. PURCHASE DETAILS */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="2. Purchase Details"
                avatar={
                  <Avatar sx={{ bgcolor: "success.light" }}>
                    <InventoryIcon />
                  </Avatar>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={updatePurchaseSection}
                    sx={{ mt: 1 }}
                  >
                    Update Purchase
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Report Type"
                      value={editForm.purchase.report_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            report_type: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Party Name"
                      value={editForm.purchase.party_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            party_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Purchased From"
                      value={editForm.purchase.purchased_from}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            purchased_from: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Agent Name"
                      value={editForm.purchase.agent_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            agent_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Agent Number"
                      value={editForm.purchase.agent_number}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            agent_number: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bank Account"
                      value={editForm.purchase.bank_account}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            bank_account: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={editForm.purchase.bank_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            bank_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Branch Name"
                      value={editForm.purchase.branch_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            branch_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      value={editForm.purchase.ifsc}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            ifsc: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Invoice No *"
                      value={editForm.purchase.invoice_no}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            invoice_no: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={editForm.purchase.date}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            date: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={editForm.purchase.product_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            product_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contracted Rate (₹)"
                      type="number"
                      value={editForm.purchase.contracted_rate}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            contracted_rate: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bran Type"
                      value={editForm.purchase.bran_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            bran_type: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Gross Weight (MT)"
                      type="number"
                      value={editForm.purchase.gross_weight_mt}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchase: {
                            ...editForm.purchase,
                            gross_weight_mt: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 3. VEHICLE DETAILS */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="3. Vehicle Details"
                avatar={
                  <Avatar sx={{ bgcolor: "info.light" }}>
                    <LocalShippingIcon />
                  </Avatar>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={updateVehicleSection}
                    sx={{ mt: 1 }}
                  >
                    Update Vehicle
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Vehicle No *"
                      value={editForm.vehicle.vehicle_no}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            vehicle_no: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      value={editForm.vehicle.owner_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner RC"
                      value={editForm.vehicle.owner_rc}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_rc: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Owner Address Line 1"
                      value={editForm.vehicle.owner_address_line1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_address_line1: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Owner Address Line 2"
                      value={editForm.vehicle.owner_address_line2}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_address_line2: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner PO"
                      value={editForm.vehicle.owner_po}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_po: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner Landmark"
                      value={editForm.vehicle.owner_landmark}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_landmark: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner City"
                      value={editForm.vehicle.owner_city}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_city: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner State"
                      value={editForm.vehicle.owner_state}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_state: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner Pin"
                      value={editForm.vehicle.owner_pin}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            owner_pin: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Mobile No"
                      value={editForm.vehicle.mobile_no}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            mobile_no: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Rice Mill Name"
                      value={editForm.vehicle.rice_mill_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            rice_mill_name: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Destination From"
                      value={editForm.vehicle.destination_from}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            destination_from: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Destination To"
                      value={editForm.vehicle.destination_to}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            destination_to: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Quantity (MT)"
                      type="number"
                      value={editForm.vehicle.quantity_mt}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            quantity_mt: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Freight/MT (₹)"
                      type="number"
                      value={editForm.vehicle.freight_per_mt}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            freight_per_mt: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Advance Amount (₹)"
                      type="number"
                      value={editForm.vehicle.advance_amount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            advance_amount: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Paid By"
                      value={editForm.vehicle.paid_by}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          vehicle: {
                            ...editForm.vehicle,
                            paid_by: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 4. QUANTITY DETAILS */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="4. Quantity Details"
                avatar={
                  <Avatar sx={{ bgcolor: "warning.light" }}>
                    <ScaleIcon />
                  </Avatar>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={updateQuantitySection}
                    sx={{ mt: 1 }}
                  >
                    Update Quantity
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Gross Weight (MT)"
                      type="number"
                      value={editForm.quantity.gross_weight_mt}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="No. of Bags"
                      type="number"
                      value={editForm.quantity.no_of_bags}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          quantity: {
                            ...editForm.quantity,
                            no_of_bags: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bag Type"
                      value={editForm.quantity.bag_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          quantity: {
                            ...editForm.quantity,
                            bag_type: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 5. LAB DETAILS */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="5. Laboratory Details"
                avatar={
                  <Avatar sx={{ bgcolor: "secondary.light" }}>
                    <ScienceIcon />
                  </Avatar>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={updateLabSection}
                    sx={{ mt: 1 }}
                  >
                    Update Lab
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Standard FFA"
                      value={editForm.lab.standard_ffa}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Obtained FFA"
                      type="number"
                      value={editForm.lab.obtain_ffa}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          lab: { ...editForm.lab, obtain_ffa: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Standard Oil"
                      value={editForm.lab.standard_oil}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Obtained Oil"
                      type="number"
                      value={editForm.lab.obtain_oil}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          lab: { ...editForm.lab, obtain_oil: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Rebate Percent"
                      type="number"
                      value={editForm.lab.rebate_percent}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          lab: {
                            ...editForm.lab,
                            rebate_percent: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Rebate Rs"
                      type="number"
                      value={editForm.lab.rebate_rs}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          lab: { ...editForm.lab, rebate_rs: e.target.value },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Premium Percent"
                      type="number"
                      value={editForm.lab.premium_percent}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          lab: {
                            ...editForm.lab,
                            premium_percent: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Premium Rs"
                      type="number"
                      value={editForm.lab.premium_rs}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          lab: { ...editForm.lab, premium_rs: e.target.value },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 6. BILLING DETAILS */}
            <Card sx={{ borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="6. Billing Details"
                avatar={
                  <Avatar sx={{ bgcolor: "error.light" }}>
                    <AttachMoneyIcon />
                  </Avatar>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={updateBillingSection}
                    sx={{ mt: 1 }}
                  >
                    Update Billing
                  </Button>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="GST Type"
                      value={editForm.billing.gst_type}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          billing: {
                            ...editForm.billing,
                            gst_type: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Invoice Amount (₹)"
                      type="number"
                      value={editForm.billing.invoice_amount}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          billing: {
                            ...editForm.billing,
                            invoice_amount: e.target.value,
                          },
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Update Complete Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW FORM DIALOG - Read-only for forms not yet editable (before 24 hours) */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VisibilityIcon />
            View Form (Read Only) - Invoice:{" "}
            {selectedForm?.purchase?.invoice_no}
            <Chip
              label="Not yet editable (24h required)"
              size="small"
              color="warning"
              icon={<AccessTimeIcon />}
              sx={{ ml: 2 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2 }}>
            {/* 1. PARTY DETAILS - FULL */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="1. Party Details"
                avatar={
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <AccountCircleIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Party Name"
                      value={editForm.party.party_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contact Person"
                      value={editForm.party.contact_person || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={editForm.party.address_line1 || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address Line 2"
                      value={editForm.party.address_line2 || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="PO"
                      value={editForm.party.po || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Landmark"
                      value={editForm.party.landmark || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={editForm.party.city || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={editForm.party.state || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      value={editForm.party.pin || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="GST"
                      value={editForm.party.gst || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Customer Type"
                      value={editForm.party.customer_type || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={2}
                      value={editForm.party.description || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 2. PURCHASE DETAILS - FULL */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="2. Purchase Details"
                avatar={
                  <Avatar sx={{ bgcolor: "success.light" }}>
                    <InventoryIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Report Type"
                      value={editForm.purchase.report_type || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Party Name"
                      value={editForm.purchase.party_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Purchased From"
                      value={editForm.purchase.purchased_from || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Agent Name"
                      value={editForm.purchase.agent_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Agent Number"
                      value={editForm.purchase.agent_number || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bank Account"
                      value={editForm.purchase.bank_account || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={editForm.purchase.bank_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Branch Name"
                      value={editForm.purchase.branch_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="IFSC Code"
                      value={editForm.purchase.ifsc || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Invoice No"
                      value={editForm.purchase.invoice_no || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Date"
                      value={editForm.purchase.date || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={editForm.purchase.product_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Contracted Rate (₹)"
                      value={editForm.purchase.contracted_rate || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bran Type"
                      value={editForm.purchase.bran_type || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Gross Weight (MT)"
                      value={editForm.purchase.gross_weight_mt || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 3. VEHICLE DETAILS - FULL */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="3. Vehicle Details"
                avatar={
                  <Avatar sx={{ bgcolor: "info.light" }}>
                    <LocalShippingIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Vehicle No"
                      value={editForm.vehicle.vehicle_no || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      value={editForm.vehicle.owner_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner RC"
                      value={editForm.vehicle.owner_rc || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Owner Address Line 1"
                      value={editForm.vehicle.owner_address_line1 || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Owner Address Line 2"
                      value={editForm.vehicle.owner_address_line2 || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner PO"
                      value={editForm.vehicle.owner_po || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner Landmark"
                      value={editForm.vehicle.owner_landmark || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner City"
                      value={editForm.vehicle.owner_city || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner State"
                      value={editForm.vehicle.owner_state || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Owner Pin"
                      value={editForm.vehicle.owner_pin || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Mobile No"
                      value={editForm.vehicle.mobile_no || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Rice Mill Name"
                      value={editForm.vehicle.rice_mill_name || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Destination From"
                      value={editForm.vehicle.destination_from || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Destination To"
                      value={editForm.vehicle.destination_to || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Quantity (MT)"
                      value={editForm.vehicle.quantity_mt || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Freight/MT (₹)"
                      value={editForm.vehicle.freight_per_mt || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Advance Amount (₹)"
                      value={editForm.vehicle.advance_amount || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Paid By"
                      value={editForm.vehicle.paid_by || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 4. QUANTITY DETAILS - FULL */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="4. Quantity Details"
                avatar={
                  <Avatar sx={{ bgcolor: "warning.light" }}>
                    <ScaleIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Gross Weight (MT)"
                      value={editForm.quantity.gross_weight_mt || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="No. of Bags"
                      value={editForm.quantity.no_of_bags || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Bag Type"
                      value={editForm.quantity.bag_type || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 5. LAB DETAILS - FULL */}
            <Card sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="5. Laboratory Details"
                avatar={
                  <Avatar sx={{ bgcolor: "secondary.light" }}>
                    <ScienceIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Standard FFA"
                      value={editForm.lab.standard_ffa || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Obtained FFA"
                      value={editForm.lab.obtain_ffa || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Standard Oil"
                      value={editForm.lab.standard_oil || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Obtained Oil"
                      value={editForm.lab.obtain_oil || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Rebate Percent"
                      value={editForm.lab.rebate_percent || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Rebate Rs"
                      value={editForm.lab.rebate_rs || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Premium Percent"
                      value={editForm.lab.premium_percent || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Premium Rs"
                      value={editForm.lab.premium_rs || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 6. BILLING DETAILS - FULL */}
            <Card sx={{ borderRadius: 2 }} variant="outlined">
              <CardHeader
                title="6. Billing Details"
                avatar={
                  <Avatar sx={{ bgcolor: "error.light" }}>
                    <AttachMoneyIcon />
                  </Avatar>
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="GST Type"
                      value={editForm.billing.gst_type || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Invoice Amount (₹)"
                      value={editForm.billing.invoice_amount || "N/A"}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {selectedForm?.billing && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Account Rate"
                          value={selectedForm.billing.account_rate || "N/A"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Billed Amount"
                          value={selectedForm.billing.billed_amount || "N/A"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Amount Payable"
                          value={selectedForm.billing.amount_payable || "N/A"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="CGST"
                          value={selectedForm.billing.cgst || "N/A"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="SGST"
                          value={selectedForm.billing.sgst || "N/A"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="IGST"
                          value={selectedForm.billing.igst || "N/A"}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDashboard;
