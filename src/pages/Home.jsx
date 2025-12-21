// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  InputAdornment,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Scale as ScaleIcon,
  Science as ScienceIcon,
  AttachMoney as AttachMoneyIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
// Import Components
import PrintVehicleSlip from "../components/PrintVehicleSlip";
import SMSDialog from "../components/SMSDialog";
import InvoicePreview from "../components/InvoicePreview";
import { api } from "../services/api";

const Home = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog States
  const [showVehicleSlip, setShowVehicleSlip] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Form States (unchanged)
  const [partyForm, setPartyForm] = useState({
    party_name: "",
    address_line1: "",
    address_line2: "",
    po: "",
    landmark: "",
    city: "",
    state: "",
    pin: "",
    contact_person: "",
    mobile_no: "",
    gst: "",
    customer_type: "Registered",
    description: "",
  });

  const [purchaseForm, setPurchaseForm] = useState({
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
  });

  const [vehicleForm, setVehicleForm] = useState({
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
  });

  const [quantityForm, setQuantityForm] = useState({
    gross_weight_mt: "",
    no_of_bags: "",
    bag_type: "Poly",
  });

  const [labForm, setLabForm] = useState({
    standard_ffa: "7",
    standard_oil: "19",
    obtain_ffa: "",
    obtain_oil: "",
    rebate_percent: "",
    rebate_rs: "",
    premium_percent: "",
    premium_rs: "",
  });

  const [billingForm, setBillingForm] = useState({
    gst_type: "Intra",
    invoice_amount: "",
  });

  // Data States
  const [purchaseId, setPurchaseId] = useState(null);
  const [parties, setParties] = useState([]);
  const [savedSections, setSavedSections] = useState({
    party: false,
    purchase: false,
    vehicle: false,
    quantity: false,
    lab: false,
    billing: false,
  });

  // Newly added: to hold actual saved data
  const [savedVehicleData, setSavedVehicleData] = useState(null);
  const [savedLabData, setSavedLabData] = useState(null);
  const [savedPurchaseData, setSavedPurchaseData] = useState(null);
  const [savedPartyData, setSavedPartyData] = useState(null);

  // Load parties on mount
  useEffect(() => {
    loadParties();
  }, []);

  // Auto-update lab standards based on product
  useEffect(() => {
    const map = {
      "Boiled Rice Bran": { ffa: "7", oil: "19" },
      "Raw Rice Bran": { ffa: "20", oil: "16" },
      "Rough Rice Bran": { ffa: "10", oil: "7" },
    };
    const { ffa, oil } = map[purchaseForm.product_name] || {
      ffa: "7",
      oil: "19",
    };
    setLabForm((prev) => ({ ...prev, standard_ffa: ffa, standard_oil: oil }));
  }, [purchaseForm.product_name]);

  useEffect(() => {
    setQuantityForm((prev) => ({
      ...prev,
      gross_weight_mt: purchaseForm.gross_weight_mt,
    }));
  }, [purchaseForm.gross_weight_mt]);

  // Calculations
  const bagWeightMT = quantityForm.bag_type === "Poly" ? 0.0002 : 0.0005;
  const netWeightMT =
    (parseFloat(quantityForm.gross_weight_mt) || 0) -
    (parseInt(quantityForm.no_of_bags) || 0) * bagWeightMT;
  const totalFreight =
    (parseFloat(vehicleForm.quantity_mt) || 0) *
    (parseFloat(vehicleForm.freight_per_mt) || 0);
  const toPay = totalFreight - (parseFloat(vehicleForm.advance_amount) || 0);

  // Helper functions
  const loadParties = async () => {
    try {
      const data = await api.getParties();
      setParties(data);
      if (data.length > 0 && !purchaseForm.party_name) {
        setPurchaseForm((prev) => ({
          ...prev,
          party_name: data[0].party_name,
        }));
      }
    } catch (err) {
      showError("Failed to load parties");
    }
  };

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "error" });
  const showSuccess = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "success" });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // === FORM HANDLERS (MODIFIED TO USE API RESPONSE) ===

  const handleSaveParty = async () => {
    try {
      const savedParty = await api.createParty(partyForm);
      setSavedPartyData(savedParty);
      setPurchaseForm((prev) => ({
        ...prev,
        party_name: savedParty.party_name,
      }));
      await loadParties();
      setSavedSections((prev) => ({ ...prev, party: true }));
      showSuccess("Party details saved!");
    } catch (err) {
      showError("Failed to save Party");
    }
  };

  const handleSavePurchase = async () => {
    try {
      const purchase = await api.createPurchase(purchaseForm);
      setSavedPurchaseData(purchase);
      setPurchaseId(purchase._id);
      setSavedSections((prev) => ({ ...prev, purchase: true }));
      showSuccess("Purchase details saved!");
    } catch (err) {
      showError("Failed to save Purchase");
    }
  };

  const handleSaveVehicle = async () => {
    try {
      if (!purchaseId) {
        showError("Purchase must be saved first");
        return;
      }
      const vehicleData = {
        ...vehicleForm,
        purchase_id: purchaseId,
      };
      const savedVehicle = await api.createVehicle(vehicleData);
      setSavedVehicleData(savedVehicle);
      setSavedSections((prev) => ({ ...prev, vehicle: true }));
      showSuccess("Vehicle details saved!");

      // ✅ Use actual backend response
      setShowVehicleSlip(true);
    } catch (err) {
      showError("Failed to save Vehicle");
    }
  };

  const handleSaveQuantity = async () => {
    try {
      if (!purchaseId) {
        showError("Purchase must be saved first");
        return;
      }
      const quantityData = {
        purchase_id: purchaseId,
        gross_weight_mt: parseFloat(quantityForm.gross_weight_mt) || 0,
        no_of_bags: parseInt(quantityForm.no_of_bags) || 0,
        bag_type: quantityForm.bag_type,
      };
      await api.createQuantity(quantityData);
      setSavedSections((prev) => ({ ...prev, quantity: true }));
      showSuccess("Quantity details saved!");
    } catch (err) {
      showError("Failed to save Quantity");
    }
  };

  const handleSaveLab = async () => {
    try {
      if (!purchaseId) {
        showError("Purchase must be saved first");
        return;
      }
      const labData = {
        ...labForm,
        purchase_id: purchaseId,
        obtain_ffa: labForm.obtain_ffa ? parseFloat(labForm.obtain_ffa) : null,
        obtain_oil: labForm.obtain_oil ? parseFloat(labForm.obtain_oil) : null,
        rebate_percent: labForm.rebate_percent
          ? parseFloat(labForm.rebate_percent)
          : null,
        rebate_rs: labForm.rebate_rs ? parseFloat(labForm.rebate_rs) : null,
        premium_percent: labForm.premium_percent
          ? parseFloat(labForm.premium_percent)
          : null,
        premium_rs: labForm.premium_rs ? parseFloat(labForm.premium_rs) : null,
      };
      const savedLab = await api.createLabDetail(labData);
      setSavedLabData(savedLab);
      setSavedSections((prev) => ({ ...prev, lab: true }));
      showSuccess("Laboratory details saved!");

      // ✅ Use actual backend response
      setShowSMSDialog(true);
    } catch (err) {
      showError("Failed to save Lab");
    }
  };

  const handleSaveBilling = async () => {
    try {
      if (!purchaseId) {
        showError("Purchase must be saved first");
        return;
      }
      await api.createBilling({ ...billingForm, purchase_id: purchaseId });
      setSavedSections((prev) => ({ ...prev, billing: true }));
      showSuccess("Billing details saved!");
    } catch (err) {
      showError("Failed to save Billing");
    }
  };

  // Generate Invoice — unchanged (already fetches latest data)
  const handleGenerateInvoice = async () => {
    try {
      const purchases = await api.getPurchases();
      const purchase = purchases[purchases.length - 1];
      const partiesData = await api.getParties();
      const party = partiesData.find(
        (p) => p.party_name === purchase.party_name
      );
      const labs = await api.getLabDetails();
      const lab = labs.find((l) => l.purchase_id === purchase.id);
      const quantities = await api.getQuantities();
      const quantity = quantities.find((q) => q.purchase_id === purchase.id);
      const vehicles = await api.getVehicles();
      const vehicle = vehicles.find((v) => v.purchase_id === purchase.id);

      const accountRate = calculateAccountRate(
        purchase.product_name,
        parseFloat(purchase.contracted_rate),
        parseFloat(lab?.obtain_ffa || 0)
      );
      const oilStandard = parseFloat(lab?.standard_oil || 19);
      const oilObtained = parseFloat(lab?.obtain_oil || 19);
      const netRate =
        oilStandard > 0
          ? (accountRate / oilStandard) * (oilObtained - oilStandard)
          : 0;
      const netWeight = quantity?.net_weight_mt || netWeightMT;
      const materialAmount = accountRate * netWeight;
      const netAmount = netRate * netWeight;
      const grossAmount = materialAmount + netAmount;

      let cgst = 0,
        sgst = 0,
        igst = 0;
      if (billingForm.gst_type === "Intra") {
        cgst = grossAmount * 0.025;
        sgst = grossAmount * 0.025;
      } else if (billingForm.gst_type === "Inter") {
        igst = grossAmount * 0.05;
      }
      const billedAmount = grossAmount + cgst + sgst + igst;
      const invoiceAmount = parseFloat(billingForm.invoice_amount) || 0;
      const amountPayable = billedAmount - invoiceAmount;

      const invoiceData = {
        reportType: purchase.report_type,
        serialNo: `SRM/G-${new Date().getFullYear()}${(
          new Date().getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${Math.floor(Math.random() * 1000)}`,
        partyName: party?.party_name || "N/A",
        address: `${party?.address_line1 || ""}, ${party?.city || ""}, ${
          party?.state || ""
        }`,
        gstNumber: party?.gst || "N/A",
        productName: purchase.product_name,
        contractedRate: parseFloat(purchase.contracted_rate).toFixed(2),
        accountRate: accountRate.toFixed(2),
        invoiceNo: purchase.invoice_no,
        invoiceDate: purchase.date,
        vehicleNo: vehicle?.vehicle_no || "N/A",
        grossWeight: (quantity?.gross_weight_mt || 0).toFixed(3),
        plasticBags: quantity?.no_of_bags || 0,
        bagWeight: bagWeightMT.toFixed(6),
        netWeight: netWeight.toFixed(3),
        ffaStandard: lab?.standard_ffa || "0.00",
        ffaResult: lab?.obtain_ffa || "0.00",
        ffaDifference: (
          parseFloat(lab?.obtain_ffa || 0) - parseFloat(lab?.standard_ffa || 0)
        ).toFixed(2),
        oilStandard: lab?.standard_oil || "0.00",
        oilResult: lab?.obtain_oil || "0.00",
        oilDifference: (
          parseFloat(lab?.obtain_oil || 0) - parseFloat(lab?.standard_oil || 0)
        ).toFixed(2),
        netRate: netRate.toFixed(2),
        netAmount: netAmount.toFixed(2),
        materialAmount: materialAmount.toFixed(2),
        grossAmount: grossAmount.toFixed(2),
        sgstAmount: sgst.toFixed(2),
        cgstAmount: cgst.toFixed(2),
        igstAmount: igst.toFixed(2),
        billedAmount: billedAmount.toFixed(2),
        invoiceAmount: billingForm.invoice_amount || "0.00",
        amountPayable: amountPayable.toFixed(2),
        amountPayableAbs: Math.abs(amountPayable).toFixed(2),
        noteType:
          amountPayable > 0
            ? "DEBIT_NOTE"
            : amountPayable < 0
            ? "CREDIT_NOTE"
            : "NO_NOTE",
        inWords: numberToWords(Math.abs(amountPayable)),
      };

      setGeneratedInvoice(invoiceData);
      setShowInvoice(true);
      showSuccess("Invoice generated successfully!");
    } catch (err) {
      console.error("Invoice generation error:", err);
      showError("Failed to generate invoice");
    }
  };

  // Calculation functions — unchanged
  const calculateAccountRate = (product, contractedRate, ffa) => {
    let deduction = 0;
    let remainingFFA = parseFloat(ffa);
    if (product === "Boiled Rice Bran") {
      if (remainingFFA > 45) return Math.max(0, contractedRate - 4000);
      else if (remainingFFA > 30) return Math.max(0, contractedRate - 3500);
      else if (remainingFFA > 25) return Math.max(0, contractedRate - 2500);
      else if (remainingFFA > 20) return Math.max(0, contractedRate - 2000);
      else if (remainingFFA > 15) {
        if (remainingFFA <= 19.99) {
          deduction += (remainingFFA - 15) * 170;
          remainingFFA = 15;
        }
        if (remainingFFA > 10) {
          deduction += Math.min(remainingFFA - 10, 5) * 150;
          remainingFFA = 10;
        }
        if (remainingFFA > 7) deduction += (remainingFFA - 7) * 100;
      }
    } else {
      if (remainingFFA > 55) deduction = 1000;
      else if (remainingFFA > 50) deduction = 700;
      else if (remainingFFA > 45) deduction = 600;
      else if (remainingFFA > 40) deduction = 500;
      else if (remainingFFA > 35) deduction = 400;
      else if (remainingFFA > 30) deduction = 300;
      else if (remainingFFA > 25) deduction = 200;
      else if (remainingFFA > 20) deduction = 100;
    }
    return Math.max(0, contractedRate - deduction);
  };

  const numberToWords = (num) => {
    if (num === 0) return "Zero ONLY";
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    let words = "";
    if (num >= 100) {
      words += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + " ";
      num = 0;
    }
    if (num > 0) words += units[num] + " ";
    return words.trim() + " ONLY";
  };

  const allSectionsSaved = Object.values(savedSections).every(Boolean);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          📋 Rice Bran Invoice Form
        </Typography>

        {/* === REST OF FORM UI REMAINS EXACTLY THE SAME === */}
        {/* (Party, Purchase, Vehicle, Quantity, Lab, Billing sections — no changes needed) */}
        {/* Keep all your existing JSX below unchanged */}

        {/* 1. PARTY DETAILS */}
        <Card sx={{ mb: 4, borderRadius: 2 }} variant="outlined">
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
                  label="Party Name *"
                  value={partyForm.party_name}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, party_name: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={partyForm.contact_person}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      contact_person: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={partyForm.address_line1}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      address_line1: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={partyForm.address_line2}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      address_line2: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="P.O."
                  value={partyForm.po}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, po: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Landmark"
                  value={partyForm.landmark}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, landmark: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={partyForm.city}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, city: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={partyForm.state}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, state: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Pin"
                  value={partyForm.pin}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, pin: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="GST"
                  value={partyForm.gst}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, gst: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile No"
                  value={partyForm.mobile_no}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      mobile_no: e.target.value,
                    })
                  }
                  type="tel"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Customer Type</InputLabel>
                  <Select
                    value={partyForm.customer_type}
                    label="Customer Type"
                    onChange={(e) =>
                      setPartyForm({
                        ...partyForm,
                        customer_type: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Registered">Registered</MenuItem>
                    <MenuItem value="Unregistered">Unregistered</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={partyForm.description}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, description: e.target.value })
                  }
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveParty}
                disabled={savedSections.party}
                sx={{
                  bgcolor: savedSections.party ? "#4caf50" : "#198754",
                  "&:hover": {
                    bgcolor: savedSections.party ? "#388e3c" : "#157347",
                  },
                }}
              >
                {savedSections.party ? "✓ Saved" : "Save Party"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 2. PURCHASE DETAILS */}
        <Card sx={{ mb: 4, borderRadius: 2 }} variant="outlined">
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
              <Grid size={{ xs: 12 }}>
                <FormControl>
                  <RadioGroup
                    row
                    value={purchaseForm.report_type}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        report_type: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Tax"
                      control={<Radio />}
                      label="Tax"
                    />
                    <FormControlLabel
                      value="Manual"
                      control={<Radio />}
                      label="Manual"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Party Name</InputLabel>
                  <Select
                    value={purchaseForm.party_name}
                    label="Party Name"
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        party_name: e.target.value,
                      })
                    }
                  >
                    {parties.map((p) => (
                      <MenuItem key={p.id} value={p.party_name}>
                        {p.party_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl>
                  <RadioGroup
                    row
                    value={purchaseForm.purchased_from}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        purchased_from: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Party"
                      control={<Radio />}
                      label="Party"
                    />
                    <FormControlLabel
                      value="Agent"
                      control={<Radio />}
                      label="Agent"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              {purchaseForm.purchased_from === "Agent" && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Agent Name"
                      value={purchaseForm.agent_name}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          agent_name: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Agent Number"
                      value={purchaseForm.agent_number}
                      onChange={(e) =>
                        setPurchaseForm({
                          ...purchaseForm,
                          agent_number: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bank Account"
                  value={purchaseForm.bank_account}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      bank_account: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={purchaseForm.bank_name}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      bank_name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Branch Name"
                  value={purchaseForm.branch_name}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      branch_name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="IFSC"
                  value={purchaseForm.ifsc}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, ifsc: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Invoice No *"
                  value={purchaseForm.invoice_no}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      invoice_no: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={purchaseForm.date}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setPurchaseForm({ ...purchaseForm, date: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Product Name</InputLabel>
                  <Select
                    value={purchaseForm.product_name}
                    label="Product Name"
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        product_name: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Boiled Rice Bran">
                      Boiled Rice Bran
                    </MenuItem>
                    <MenuItem value="Raw Rice Bran">Raw Rice Bran</MenuItem>
                    <MenuItem value="Rough Rice Bran">Rough Rice Bran</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contracted Rate (₹)"
                  type="number"
                  value={purchaseForm.contracted_rate}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      contracted_rate: e.target.value,
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Final Contracted Rate (₹)"
                  value={
                    purchaseForm.bran_type === "Red"
                      ? Math.max(
                          0,
                          (parseFloat(purchaseForm.contracted_rate) || 0) - 500
                        ).toFixed(2)
                      : (parseFloat(purchaseForm.contracted_rate) || 0).toFixed(
                          2
                        )
                  }
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  helperText={
                    purchaseForm.bran_type === "Red"
                      ? "Red bran: ₹500 deducted"
                      : "Good bran: No deduction"
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Gross Weight (MT)"
                  type="number"
                  value={purchaseForm.gross_weight_mt}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      gross_weight_mt: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl>
                  <RadioGroup
                    row
                    value={purchaseForm.bran_type}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        bran_type: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Good"
                      control={<Radio />}
                      label="Good"
                    />
                    <FormControlLabel
                      value="Red"
                      control={<Radio />}
                      label="Red"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePurchase}
                disabled={savedSections.purchase}
                sx={{
                  bgcolor: savedSections.purchase ? "#4caf50" : "#198754",
                  "&:hover": {
                    bgcolor: savedSections.purchase ? "#388e3c" : "#157347",
                  },
                }}
              >
                {savedSections.purchase ? "✓ Saved" : "Save Purchase"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 3. VEHICLE DETAILS */}
        <Card sx={{ mb: 4, borderRadius: 2 }} variant="outlined">
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Vehicle No *"
                  value={vehicleForm.vehicle_no}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      vehicle_no: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  value={vehicleForm.owner_name}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Owner RC"
                  value={vehicleForm.owner_rc}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, owner_rc: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  sx={{ mt: 2, mb: 1 }}
                >
                  Owner Address
                </Typography>
                <Divider />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={vehicleForm.owner_address_line1}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_address_line1: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={vehicleForm.owner_address_line2}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_address_line2: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="P.O."
                  value={vehicleForm.owner_po}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, owner_po: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Landmark"
                  value={vehicleForm.owner_landmark}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_landmark: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={vehicleForm.owner_city}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_city: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={vehicleForm.owner_state}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_state: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Pin"
                  value={vehicleForm.owner_pin}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_pin: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile No"
                  value={vehicleForm.mobile_no}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      mobile_no: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Rice Mill Name"
                  value={vehicleForm.rice_mill_name}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      rice_mill_name: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Destination From"
                  value={vehicleForm.destination_from}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      destination_from: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Destination To"
                  value={vehicleForm.destination_to}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      destination_to: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Quantity (MT)"
                  type="number"
                  value={vehicleForm.quantity_mt}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      quantity_mt: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Freight/MT (₹)"
                  type="number"
                  value={vehicleForm.freight_per_mt}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      freight_per_mt: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Advance Amount (₹)"
                  type="number"
                  value={vehicleForm.advance_amount}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      advance_amount: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="To Pay (₹)"
                  value={toPay.toFixed(2)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl>
                  <RadioGroup
                    row
                    value={vehicleForm.paid_by}
                    onChange={(e) =>
                      setVehicleForm({
                        ...vehicleForm,
                        paid_by: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Buyer"
                      control={<Radio />}
                      label="Paid by Buyer"
                    />
                    <FormControlLabel
                      value="Seller"
                      control={<Radio />}
                      label="Paid by Seller"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveVehicle}
                // disabled={savedSections.vehicle || !purchaseId}
                sx={{
                  bgcolor: savedSections.vehicle ? "#4caf50" : "#198754",
                  "&:hover": {
                    bgcolor: savedSections.vehicle ? "#388e3c" : "#157347",
                  },
                }}
              >
                {savedSections.vehicle ? "✓ Saved" : "Save Vehicle"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 4. QUANTITY DETAILS */}
        <Card sx={{ mb: 4, borderRadius: 2 }} variant="outlined">
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
                  type="number"
                  value={quantityForm.gross_weight_mt}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="No. of Bags"
                  type="number"
                  value={quantityForm.no_of_bags}
                  onChange={(e) =>
                    setQuantityForm({
                      ...quantityForm,
                      no_of_bags: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl>
                  <RadioGroup
                    row
                    value={quantityForm.bag_type}
                    onChange={(e) =>
                      setQuantityForm({
                        ...quantityForm,
                        bag_type: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Poly"
                      control={<Radio />}
                      label="Poly"
                    />
                    <FormControlLabel
                      value="Jute"
                      control={<Radio />}
                      label="Jute"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bag Weight (MT)"
                  value={bagWeightMT.toFixed(6)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Net Weight (MT)"
                  value={netWeightMT.toFixed(6)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveQuantity}
                disabled={savedSections.quantity || !purchaseId}
                sx={{
                  bgcolor: savedSections.quantity ? "#4caf50" : "#198754",
                  "&:hover": {
                    bgcolor: savedSections.quantity ? "#388e3c" : "#157347",
                  },
                }}
              >
                {savedSections.quantity ? "✓ Saved" : "Save Quantity"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 5. LAB DETAILS */}
        <Card sx={{ mb: 4, borderRadius: 2 }} variant="outlined">
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
                  value={labForm.standard_ffa}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Obtained FFA"
                  type="number"
                  value={labForm.obtain_ffa}
                  onChange={(e) =>
                    setLabForm({ ...labForm, obtain_ffa: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Standard Oil"
                  value={labForm.standard_oil}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Obtained Oil"
                  type="number"
                  value={labForm.obtain_oil}
                  onChange={(e) =>
                    setLabForm({ ...labForm, obtain_oil: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Rebate (%)"
                  type="number"
                  value={labForm.rebate_percent}
                  onChange={(e) =>
                    setLabForm({ ...labForm, rebate_percent: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Rebate (₹)"
                  type="number"
                  value={labForm.rebate_rs}
                  onChange={(e) =>
                    setLabForm({ ...labForm, rebate_rs: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Premium (%)"
                  type="number"
                  value={labForm.premium_percent}
                  onChange={(e) =>
                    setLabForm({ ...labForm, premium_percent: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Premium (₹)"
                  type="number"
                  value={labForm.premium_rs}
                  onChange={(e) =>
                    setLabForm({ ...labForm, premium_rs: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveLab}
                disabled={savedSections.lab || !purchaseId}
                sx={{
                  bgcolor: savedSections.lab ? "#4caf50" : "#198754",
                  "&:hover": {
                    bgcolor: savedSections.lab ? "#388e3c" : "#157347",
                  },
                }}
              >
                {savedSections.lab ? "✓ Saved" : "Save Lab"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 6. BILLING DETAILS */}
        <Card sx={{ mb: 4, borderRadius: 2 }} variant="outlined">
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
              <Grid size={{ xs: 12 }}>
                <FormControl>
                  <RadioGroup
                    row
                    value={billingForm.gst_type}
                    onChange={(e) =>
                      setBillingForm({
                        ...billingForm,
                        gst_type: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Intra"
                      control={<Radio />}
                      label="Intra State"
                    />
                    <FormControlLabel
                      value="Inter"
                      control={<Radio />}
                      label="Inter State"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Invoice Amount (₹)"
                  type="number"
                  value={billingForm.invoice_amount}
                  onChange={(e) =>
                    setBillingForm({
                      ...billingForm,
                      invoice_amount: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveBilling}
                disabled={savedSections.billing || !purchaseId}
                sx={{
                  bgcolor: savedSections.billing ? "#4caf50" : "#198754",
                  "&:hover": {
                    bgcolor: savedSections.billing ? "#388e3c" : "#157347",
                  },
                }}
              >
                {savedSections.billing ? "✓ Saved" : "Save Billing"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Generate Invoice Button */}
        {allSectionsSaved && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={handleGenerateInvoice}
              size="large"
              sx={{
                bgcolor: "#ff9a9e",
                "&:hover": { bgcolor: "#ff7b81" },
                minWidth: 200,
              }}
            >
              Generate Final Invoice
            </Button>
          </Box>
        )}
      </Paper>

      {/* Dialogs — now use actual saved data */}
      <PrintVehicleSlip
        open={showVehicleSlip}
        onClose={() => setShowVehicleSlip(false)}
        vehicleData={savedVehicleData || vehicleForm}
        purchaseData={savedPurchaseData || purchaseForm}
      />

      <SMSDialog
        open={showSMSDialog}
        onClose={() => setShowSMSDialog(false)}
        labData={savedLabData || labForm}
        purchaseData={savedPurchaseData || purchaseForm}
        partyData={parties.find(
          (p) =>
            p.party_name ===
            (savedPurchaseData?.party_name || purchaseForm.party_name)
        )}
        agentData={{
          agent_name: savedPurchaseData?.agent_name || purchaseForm.agent_name,
          agent_number:
            savedPurchaseData?.agent_number || purchaseForm.agent_number,
        }}
      />

      <InvoicePreview
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        invoiceData={generatedInvoice}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;
