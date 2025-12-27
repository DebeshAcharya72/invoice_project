// src/pages/ViewForm.jsx
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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  LocalShipping as VehicleIcon,
  Science as LabIcon,
  AttachMoney as BillingIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
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

  useEffect(() => {
    loadFormData();
  }, [purchaseId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      setError("");

      // Use the new endpoint to get complete form data
      const data = await api.getCompleteForm(purchaseId);
      setFormData(data);
    } catch (err) {
      console.error("Failed to load form data:", err);
      setError("Failed to load form data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  const handleGenerateInvoice = () => {
    if (!formData) return;

    // Prepare invoice data from form data
    const invoice = {
      reportType: formData.purchase?.report_type || "Purchase",
      serialNo: `SRM/G-${new Date().getFullYear()}${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${Math.floor(Math.random() * 1000)}`,
      companyName: formData.company?.company_name || "MANMATH PATTANAIK & CO",
      companyAddress:
        formData.company?.address_line1 || "16- MAHANADI VIHAR CUTTACK-4",
      companyMobile: formData.company?.mobile_no || "9437025723 / 9178314411",
      partyName:
        formData.party?.party_name || formData.purchase?.party_name || "N/A",
      address: formData.party
        ? `${formData.party.address_line1 || ""}, ${
            formData.party.city || ""
          }, ${formData.party.state || ""}`.trim()
        : "N/A",
      gstNumber: formData.party?.gst || "N/A",
      productName: formData.purchase?.product_name || "N/A",
      contractedRate: parseFloat(
        formData.purchase?.contracted_rate || 0
      ).toFixed(2),
      accountRate: parseFloat(formData.billing?.account_rate || 0).toFixed(2),
      invoiceNo: formData.purchase?.invoice_no || "N/A",
      invoiceDate:
        formData.purchase?.date || new Date().toISOString().split("T")[0],
      vehicleNo: formData.vehicle?.vehicle_no || "N/A",
      grossWeight: parseFloat(
        formData.quantity?.gross_weight_mt ||
          formData.purchase?.gross_weight_mt ||
          0
      ).toFixed(3),
      plasticBags: formData.quantity?.no_of_bags || 0,
      bagWeight: parseFloat(formData.quantity?.bag_weight_mt || 0.0002).toFixed(
        6
      ),
      netWeight: parseFloat(formData.quantity?.net_weight_mt || 0).toFixed(3),
      ffaStandard: parseFloat(formData.lab?.standard_ffa || 7).toFixed(2),
      ffaResult: parseFloat(formData.lab?.obtain_ffa || 0).toFixed(2),
      ffaDifference: (
        parseFloat(formData.lab?.obtain_ffa || 0) -
        parseFloat(formData.lab?.standard_ffa || 7)
      ).toFixed(2),
      oilStandard: parseFloat(formData.lab?.standard_oil || 19).toFixed(2),
      oilResult: parseFloat(formData.lab?.obtain_oil || 19).toFixed(2),
      oilDifference: (
        parseFloat(formData.lab?.obtain_oil || 19) -
        parseFloat(formData.lab?.standard_oil || 19)
      ).toFixed(2),
      netRate: parseFloat(formData.billing?.net_rate || 0).toFixed(2),
      netAmount: parseFloat(formData.billing?.net_amount || 0).toFixed(2),
      materialAmount: parseFloat(
        formData.billing?.material_amount || 0
      ).toFixed(2),
      grossAmount: parseFloat(formData.billing?.gross_amount || 0).toFixed(2),
      sgstAmount: parseFloat(formData.billing?.sgst || 0).toFixed(2),
      cgstAmount: parseFloat(formData.billing?.cgst || 0).toFixed(2),
      igstAmount: parseFloat(formData.billing?.igst || 0).toFixed(2),
      billedAmount: parseFloat(formData.billing?.billed_amount || 0).toFixed(2),
      invoiceAmount: parseFloat(formData.billing?.invoice_amount || 0).toFixed(
        2
      ),
      amountPayable: parseFloat(formData.billing?.amount_payable || 0).toFixed(
        2
      ),
      amountPayableAbs: Math.abs(
        parseFloat(formData.billing?.amount_payable || 0)
      ).toFixed(2),
      noteType:
        parseFloat(formData.billing?.amount_payable || 0) > 0
          ? "DEBIT_NOTE"
          : parseFloat(formData.billing?.amount_payable || 0) < 0
          ? "CREDIT_NOTE"
          : "NO_NOTE",
      inWords: "Zero ONLY", // You can add number-to-words conversion here
      purchaseId: purchaseId,
      company_id: formData.purchase?.company_id,
    };

    setInvoiceData(invoice);
    setShowInvoice(true);
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
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
              Form Details
            </Typography>
            <Chip
              label={isEditable ? "Editable" : "Locked"}
              color={isEditable ? "success" : "error"}
              icon={isEditable ? null : <TimeIcon />}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit Form">
              <span>
                <IconButton
                  onClick={handleEdit}
                  color="primary"
                  disabled={!isEditable}
                  sx={{ border: "1px solid", borderColor: "primary.main" }}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
            {billing && (
              <Tooltip title="Generate Invoice">
                <IconButton
                  onClick={handleGenerateInvoice}
                  color="success"
                  sx={{ border: "1px solid", borderColor: "success.main" }}
                >
                  <ReceiptIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Invoice Information</Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Invoice No:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {purchase?.invoice_no || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(purchase?.date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Created:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(purchase?.created_at)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Product Details</Typography>
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Product:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {purchase?.product_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Bran Type:
                    </Typography>
                    <Chip
                      label={purchase?.bran_type || "Good"}
                      size="small"
                      color={
                        purchase?.bran_type === "Red" ? "error" : "success"
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contracted Rate:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(purchase?.contracted_rate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Final Rate:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatCurrency(purchase?.final_contracted_rate)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Party Details */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <PersonIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Party Information</Typography>
          </Box>
          {party ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Party Name:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {party.party_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Contact Person:
                </Typography>
                <Typography variant="body1">
                  {party.contact_person || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Mobile No:
                </Typography>
                <Typography variant="body1">
                  {party.mobile_no || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  GST Number:
                </Typography>
                <Typography variant="body1">{party.gst || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Address:
                </Typography>
                <Typography variant="body1">
                  {[party.address_line1, party.city, party.state, party.pin]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No party information available</Alert>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout for Vehicle and Quantity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Vehicle Details */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <VehicleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Vehicle Details</Typography>
              </Box>
              {vehicle ? (
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Vehicle No:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {vehicle.vehicle_no}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Owner Name:
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.owner_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mobile No:
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.mobile_no || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      From:
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.destination_from || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      To:
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.destination_to || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity:
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.quantity_mt || "0"} MT
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Rice Mill:
                    </Typography>
                    <Typography variant="body1">
                      {vehicle.rice_mill_name || "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">No vehicle information available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quantity Details */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <AttachMoney
                  as
                  AttachMoneyIcon
                  color="primary"
                  sx={{ mr: 1 }}
                />
                <Typography variant="h6">Quantity Details</Typography>
              </Box>
              {quantity ? (
                <Grid container spacing={1}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Gross Weight:
                    </Typography>
                    <Typography variant="body1">
                      {quantity.gross_weight_mt} MT
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      No. of Bags:
                    </Typography>
                    <Typography variant="body1">
                      {quantity.no_of_bags}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Bag Type:
                    </Typography>
                    <Chip label={quantity.bag_type} size="small" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Bag Weight:
                    </Typography>
                    <Typography variant="body1">
                      {quantity.bag_weight_mt} MT
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Net Weight:
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      fontSize="1.2rem"
                    >
                      {quantity.net_weight_mt} MT
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">No quantity information available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lab Details */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <LabIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Laboratory Analysis</Typography>
          </Box>
          {lab ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  FFA Analysis
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Standard</TableCell>
                        <TableCell>Obtained</TableCell>
                        <TableCell>Difference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>FFA</TableCell>
                        <TableCell>{lab.standard_ffa}</TableCell>
                        <TableCell>{lab.obtain_ffa}</TableCell>
                        <TableCell>
                          {(
                            parseFloat(lab.obtain_ffa || 0) -
                            parseFloat(lab.standard_ffa || 0)
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {lab.rebate_rs && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Rebate Amount:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(lab.rebate_rs)}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Oil Analysis
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Standard</TableCell>
                        <TableCell>Obtained</TableCell>
                        <TableCell>Difference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Oil</TableCell>
                        <TableCell>{lab.standard_oil}</TableCell>
                        <TableCell>{lab.obtain_oil}</TableCell>
                        <TableCell>
                          {(
                            parseFloat(lab.obtain_oil || 0) -
                            parseFloat(lab.standard_oil || 0)
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {lab.premium_rs && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Premium Amount:
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(lab.premium_rs)}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No laboratory analysis available</Alert>
          )}
        </CardContent>
      </Card>

      {/* Billing Details */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <BillingIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Billing Details</Typography>
          </Box>
          {billing ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Account Rate:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(billing.account_rate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Net Rate:
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(billing.net_rate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Material Amount:
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(billing.material_amount)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Net Amount:
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(billing.net_amount)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Gross Amount:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  fontSize="1.1rem"
                >
                  {formatCurrency(billing.gross_amount)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  GST Type:
                </Typography>
                <Chip label={billing.gst_type} size="small" color="info" />
              </Grid>
              {billing.gst_type === "Intra" && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      CGST (2.5%):
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(billing.cgst)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      SGST (2.5%):
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(billing.sgst)}
                    </Typography>
                  </Grid>
                </>
              )}
              {billing.gst_type === "Inter" && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    IGST (5%):
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(billing.igst)}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Billed Amount:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  fontSize="1.2rem"
                >
                  {formatCurrency(billing.billed_amount)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Invoice Amount:
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(billing.invoice_amount)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Amount Payable:
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    billing.amount_payable > 0
                      ? "error"
                      : billing.amount_payable < 0
                      ? "success"
                      : "text.primary"
                  }
                >
                  {formatCurrency(billing.amount_payable)}
                  {billing.amount_payable > 0 && " (Debit)"}
                  {billing.amount_payable < 0 && " (Credit)"}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="warning">Billing details not completed yet</Alert>
          )}
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
