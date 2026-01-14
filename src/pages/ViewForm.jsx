// src/pages/ViewForm.jsx - UPDATED VERSION

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  LocalShipping as VehicleIcon,
  Science as LabIcon,
  AttachMoney as BillingIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Inventory as InventoryIcon,
  Scale as ScaleIcon,
} from "@mui/icons-material";
import { api } from "../services/api";
import InvoicePreview from "../components/InvoicePreview";

const ViewForm = () => {
  const { purchaseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // State for calculated values (like in Home.jsx)
  const [calculatedValues, setCalculatedValues] = useState({
    accountRate: 0,
    netRate: 0,
    materialAmount: 0,
    grossAmount: 0,
    billedAmount: 0,
    amountPayable: 0,
  });

  useEffect(() => {
    loadFormData();
  }, [purchaseId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getFormComplete(purchaseId);
      console.log("Form Data Received:", data);

      setFormData(data);

      // Calculate values like in Home.jsx
      if (data) {
        calculateValues(data);
      }
    } catch (err) {
      console.error("Failed to load form data:", err);
      setError("Failed to load form data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate values like in Home.jsx
  const calculateValues = (data) => {
    const { purchase, lab, quantity, billing } = data;

    if (!purchase) return;

    // Calculate account rate (same as Home.jsx)
    const calculateAccountRate = () => {
      const contractedRate = parseFloat(purchase.contracted_rate) || 0;
      const ffaRebate =
        parseFloat(lab?.ffa_rebate_rs || lab?.rebate_rs || 0) || 0;
      return parseFloat((contractedRate - ffaRebate).toFixed(2));
    };

    // Calculate net rate (same as Home.jsx)
    const calculateNetRate = () => {
      const accountRate = calculateAccountRate();
      const oilStandard = parseFloat(lab?.standard_oil) || 19;
      const oilObtained = parseFloat(lab?.obtain_oil) || oilStandard;
      const oilDifference = oilObtained - oilStandard;

      if (oilStandard === 0) return 0;
      const netRate = (accountRate / oilStandard) * oilDifference + accountRate;
      return parseFloat(netRate.toFixed(2));
    };

    // Calculate material amount
    const calculateMaterialAmount = () => {
      const accountRate = calculateAccountRate();
      const netWeight =
        parseFloat(quantity?.net_weight_mt || purchase.net_weight_mt) || 0;
      return parseFloat((accountRate * netWeight).toFixed(2));
    };

    // Calculate gross amount
    const calculateGrossAmount = () => {
      const materialAmount = calculateMaterialAmount();
      const oilPremium = parseFloat(lab?.oil_premium_rs || 0) || 0;
      const oilRebate = parseFloat(lab?.oil_rebate_rs || 0) || 0;

      if (oilPremium > 0) {
        return parseFloat((materialAmount + oilPremium).toFixed(2));
      } else if (oilRebate > 0) {
        return parseFloat((materialAmount - oilRebate).toFixed(2));
      } else {
        return materialAmount;
      }
    };

    // Calculate GST
    const calculateGST = () => {
      const grossAmount = calculateGrossAmount();
      const gstType = billing?.gst_type || "Intra";

      let cgst = 0,
        sgst = 0,
        igst = 0;

      if (gstType === "Intra") {
        cgst = grossAmount * 0.025;
        sgst = grossAmount * 0.025;
      } else {
        igst = grossAmount * 0.05;
      }

      return {
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        igst: parseFloat(igst.toFixed(2)),
        total: parseFloat((cgst + sgst + igst).toFixed(2)),
      };
    };

    // Calculate billed amount
    const calculateBilledAmount = () => {
      const grossAmount = calculateGrossAmount();
      const gst = calculateGST();
      return parseFloat((grossAmount + gst.total).toFixed(2));
    };

    // Calculate amount payable
    const calculateAmountPayable = () => {
      const billedAmount = calculateBilledAmount();
      const invoiceAmount = parseFloat(billing?.invoice_amount) || 0;
      return parseFloat((billedAmount - invoiceAmount).toFixed(2));
    };

    setCalculatedValues({
      accountRate: calculateAccountRate(),
      netRate: calculateNetRate(),
      materialAmount: calculateMaterialAmount(),
      grossAmount: calculateGrossAmount(),
      billedAmount: calculateBilledAmount(),
      amountPayable: calculateAmountPayable(),
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "N/A";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatWeight = (weight) => {
    if (weight === undefined || weight === null || isNaN(weight)) return "N/A";
    return `${parseFloat(weight).toLocaleString("en-IN", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })} MT`;
  };

  const calculateIsEditable = () => {
    if (!formData?.purchase?.created_at) return false;

    const createdAt = new Date(formData.purchase.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    return hoursDiff < 24;
  };

  const handleEdit = () => {
    if (!calculateIsEditable()) {
      alert("This form can no longer be edited (24-hour limit exceeded)");
      return;
    }
    navigate(`/edit-form/${purchaseId}`);
  };

  const handleGenerateInvoice = async () => {
    try {
      const response = await api.generateInvoice(purchaseId);
      if (response && response.data) {
        setInvoiceData(response.data);
        setShowInvoice(true);
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      alert("Failed to generate invoice");
    }
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Form not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const { purchase, party, vehicle, quantity, lab, billing } = formData;
  const isEditable = calculateIsEditable();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Invoice Info */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Invoice Details: {purchase?.invoice_no || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={isEditable ? "Editable" : "View Only"}
              color={isEditable ? "success" : "default"}
              icon={isEditable ? <EditIcon /> : <TimeIcon />}
            />
            {billing && (
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={handleGenerateInvoice}
                color="success"
                size="small"
              >
                View Invoice
              </Button>
            )}
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Invoice Date
                </Typography>
                <Typography variant="h6">
                  {formatDate(purchase?.date)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle No
                </Typography>
                <Typography variant="h6">
                  {vehicle?.vehicle_no || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Product
                </Typography>
                <Typography variant="h6">
                  {purchase?.product_name || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(
                    billing?.billed_amount || calculatedValues.billedAmount
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Party Details - Fixed to show all fields */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PersonIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Party Details</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Party Name"
                value={party?.party_name || purchase?.party_name || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Contact Person"
                value={party?.contact_person || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Mobile No"
                value={party?.mobile_no || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="GST Number"
                value={party?.gst || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
                value={
                  [party?.address_line1, party?.city, party?.state, party?.pin]
                    .filter(Boolean)
                    .join(", ") || "N/A"
                }
                fullWidth
                multiline
                rows={2}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Purchase Details - Fixed to show all fields */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <InventoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Purchase Details</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Invoice No"
                value={purchase?.invoice_no || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Product Name"
                value={purchase?.product_name || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Contracted Rate (₹)"
                value={formatCurrency(purchase?.contracted_rate)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Bran Type"
                value={purchase?.bran_type || "Good"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            {purchase?.bran_type === "Red" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Final Contracted Rate (₹)"
                  value={formatCurrency(purchase?.final_contracted_rate)}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Gross Weight (MT)"
                value={formatWeight(purchase?.gross_weight_mt)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="No. of Bags"
                value={purchase?.no_of_bags || quantity?.no_of_bags || "0"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Bag Type"
                value={purchase?.bag_type || "Poly"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Net Weight (MT)"
                value={formatWeight(
                  purchase?.net_weight_mt || quantity?.net_weight_mt
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <VehicleIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Vehicle Details</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Vehicle No"
                value={vehicle?.vehicle_no || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Owner Name"
                value={vehicle?.owner_name || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Owner Mobile"
                value={vehicle?.mobile_no || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Rice Mill Name"
                value={vehicle?.rice_mill_name || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="From"
                value={vehicle?.destination_from || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="To"
                value={vehicle?.destination_to || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lab Details */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <LabIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Laboratory Analysis</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Standard FFA"
                value={lab?.standard_ffa || "7"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Obtained FFA"
                value={lab?.obtain_ffa || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="FFA Rebate (₹)"
                value={formatCurrency(lab?.ffa_rebate_rs || lab?.rebate_rs)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Standard Oil"
                value={lab?.standard_oil || "19"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Obtained Oil"
                value={lab?.obtain_oil || "N/A"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Oil Rebate (₹)"
                value={formatCurrency(lab?.oil_rebate_rs)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Oil Premium (₹)"
                value={formatCurrency(lab?.oil_premium_rs)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Billing Details */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <BillingIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Billing Details</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Account Rate (₹)"
                value={formatCurrency(
                  billing?.account_rate || calculatedValues.accountRate
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Net Rate (₹)"
                value={formatCurrency(
                  billing?.net_rate || calculatedValues.netRate
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Material Amount (₹)"
                value={formatCurrency(
                  billing?.material_amount || calculatedValues.materialAmount
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Gross Amount (₹)"
                value={formatCurrency(
                  billing?.gross_amount || calculatedValues.grossAmount
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="GST Type"
                value={billing?.gst_type || "Intra"}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            {billing?.gst_type === "Intra" ? (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="CGST (2.5%)"
                    value={formatCurrency(billing?.cgst)}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="SGST (2.5%)"
                    value={formatCurrency(billing?.sgst)}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </>
            ) : (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="IGST (5%)"
                  value={formatCurrency(billing?.igst)}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Billed Amount (₹)"
                value={formatCurrency(
                  billing?.billed_amount || calculatedValues.billedAmount
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Invoice Amount (₹)"
                value={formatCurrency(billing?.invoice_amount)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Amount Payable (₹)"
                value={formatCurrency(
                  billing?.amount_payable || calculatedValues.amountPayable
                )}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                color={
                  (billing?.amount_payable || calculatedValues.amountPayable) >
                  0
                    ? "error"
                    : (billing?.amount_payable ||
                        calculatedValues.amountPayable) < 0
                    ? "success"
                    : "primary"
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Back to List
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            startIcon={<EditIcon />}
            onClick={handleEdit}
            variant="contained"
            color="primary"
            disabled={!isEditable}
          >
            Edit Form
          </Button>
          {billing && (
            <Button
              startIcon={<ReceiptIcon />}
              onClick={handleGenerateInvoice}
              variant="contained"
              color="success"
            >
              Generate Invoice
            </Button>
          )}
        </Box>
      </Box>

      {/* Invoice Preview Dialog */}
      <InvoicePreview
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        invoiceData={invoiceData}
      />
    </Container>
  );
};

export default ViewForm;
