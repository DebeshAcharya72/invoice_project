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
  Chip,
  Snackbar,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Print as PrintIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

const Home = ({ userRole }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [saveAllLoading, setSaveAllLoading] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [purchaseId, setPurchaseId] = useState(null);
  const handlePrint = () => {
    window.print();
  };

  // Form states
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
    final_contracted_rate: "0",
    bran_type: "Good",
    gross_weight_mt: "",
  });
  const [vehicleForm, setVehicleForm] = useState({
    purchase_id: null, // Added purchase_id field
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
    purchase_id: null,
    gross_weight_mt: "",
    no_of_bags: "",
    bag_type: "Poly",
  });
  const [labForm, setLabForm] = useState({
    purchase_id: null,
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
    purchase_id: null,
    gst_type: "Intra",
    invoice_amount: "",
  });

  // Track saved status per section
  const [savedSections, setSavedSections] = useState({
    party: false,
    purchase: false,
    vehicle: false,
    quantity: false,
    lab: false,
    billing: false,
  });

  // Reference data
  const [parties, setParties] = useState([]);

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      const data = await api.getParties();
      setParties(data);

      // ✅ Only auto-fill on initial load if no party is selected
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

  // Auto-update lab standards
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

  // Auto-link gross weight
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

  // Calculate account rate based on FFA (per Excel spec) - FIXED
  const calculateAccountRate = (product, contractedRate, ffa) => {
    let deduction = 0;
    let remainingFFA = parseFloat(ffa);

    if (product === "Boiled Rice Bran") {
      if (remainingFFA > 45) {
        return Math.max(0, contractedRate - 4000);
      } else if (remainingFFA > 30) {
        return Math.max(0, contractedRate - 3500);
      } else if (remainingFFA > 25) {
        return Math.max(0, contractedRate - 2500);
      } else if (remainingFFA > 20) {
        return Math.max(0, contractedRate - 2000);
      } else if (remainingFFA > 15) {
        if (remainingFFA <= 19.99) {
          deduction += (remainingFFA - 15) * 170;
          remainingFFA = 15;
        }
        if (remainingFFA > 10) {
          deduction += Math.min(remainingFFA - 10, 5) * 150;
          remainingFFA = 10;
        }
        if (remainingFFA > 7) {
          deduction += (remainingFFA - 7) * 100;
        }
      }
    } else {
      // Raw/Rough Rice Bran
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

  // Calculate net rate: (Account Rate / Oil Standard) * Oil Difference
  const calculateNetRate = (accountRate, oilStandard, oilObtained) => {
    const oilDiff = oilObtained - oilStandard;
    return (accountRate / oilStandard) * oilDiff;
  };

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "error" });
  const showSuccess = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "success" });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Individual save handlers
  const handleSaveParty = async () => {
    try {
      const party = await api.createParty(partyForm);

      // ✅ Auto-fill the saved party name in purchase form
      setPurchaseForm((prev) => ({
        ...prev,
        party_name: party.party_name,
      }));

      // ✅ Refresh the parties list
      const updatedParties = await api.getParties();
      setParties(updatedParties);

      setSavedSections((prev) => ({ ...prev, party: true }));
      showSuccess("Party details saved!");
    } catch (err) {
      showError("Failed to save Party");
    }
  };

  const handleSavePurchase = async () => {
    try {
      const purchase = await api.createPurchase(purchaseForm);
      setPurchaseId(purchase.id);

      // Link all child forms to this purchase
      setVehicleForm((prev) => ({ ...prev, purchase_id: purchase.id }));
      setQuantityForm((prev) => ({ ...prev, purchase_id: purchase.id }));
      setLabForm((prev) => ({ ...prev, purchase_id: purchase.id }));
      setBillingForm((prev) => ({ ...prev, purchase_id: purchase.id }));

      setSavedSections((prev) => ({ ...prev, purchase: true }));
      showSuccess("Purchase details saved!");
    } catch (err) {
      showError("Failed to save Purchase");
    }
  };

  const handleSaveVehicle = async () => {
    try {
      // Include purchase_id in vehicle data
      const vehicleData = {
        ...vehicleForm,
        purchase_id: purchaseId,
      };

      if (!vehicleData.purchase_id) {
        showError("Purchase must be saved first");
        return;
      }

      await api.createVehicle(vehicleData);
      setSavedSections((prev) => ({ ...prev, vehicle: true }));
      showSuccess("Vehicle details saved!");
    } catch (err) {
      showError("Failed to save Vehicle");
    }
  };

  const handleSaveQuantity = async () => {
    try {
      const quantityData = {
        purchase_id: purchaseId,
        gross_weight_mt: parseFloat(quantityForm.gross_weight_mt),
        no_of_bags: parseInt(quantityForm.no_of_bags),
        bag_type: quantityForm.bag_type,
      };

      if (!quantityData.purchase_id) {
        showError("Purchase must be saved first");
        return;
      }
      if (isNaN(quantityData.gross_weight_mt)) {
        showError("Gross Weight must be a number");
        return;
      }
      if (isNaN(quantityData.no_of_bags)) {
        showError("No. of Bags must be a number");
        return;
      }

      await api.createQuantity(quantityData);
      setSavedSections((prev) => ({ ...prev, quantity: true }));
      showSuccess("Quantity details saved!");
    } catch (err) {
      showError("Failed to save Quantity");
    }
  };

  const handleSaveLab = async () => {
    try {
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

      await api.createLabDetail(labData);
      setSavedSections((prev) => ({ ...prev, lab: true }));
      showSuccess("Laboratory details saved!");
    } catch (err) {
      showError("Failed to save Lab");
    }
  };

  const handleSaveBilling = async () => {
    try {
      await api.createBilling({ ...billingForm, purchase_id: purchaseId });
      setSavedSections((prev) => ({ ...prev, billing: true }));
      showSuccess("Billing details saved!");
    } catch (err) {
      showError("Failed to save Billing");
    }
  };

  // Generate Invoice - FIXED CALCULATIONS
  const handleGenerateInvoice = async () => {
    try {
      // Get latest purchase for reference
      const purchase = await api
        .getPurchases()
        .then((res) => res[res.length - 1]);
      const party = await api
        .getParties()
        .then((res) => res.find((p) => p.party_name === purchase.party_name));
      const lab = await api
        .getLabDetails()
        .then((res) => res.find((l) => l.purchase_id === purchase.id));
      const quantity = await api
        .getQuantities()
        .then((res) => res.find((q) => q.purchase_id === purchase.id));
      const vehicle = await api
        .getVehicles()
        .then((res) => res.find((v) => v.purchase_id === purchase.id));

      // Calculate values - FIXED
      const accountRate = calculateAccountRate(
        purchase.product_name,
        parseFloat(purchase.contracted_rate),
        parseFloat(lab.obtain_ffa)
      );

      const netRate = calculateNetRate(
        accountRate,
        parseFloat(lab.standard_oil),
        parseFloat(lab.obtain_oil)
      );

      const materialAmount = accountRate * netWeightMT;
      const netAmount = netRate * netWeightMT; // Fixed: netRate * netWeightMT (not accountRate)
      const grossAmount = materialAmount + netAmount; // Fixed: Addition works for both + and -

      // Calculate GST
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

      // Determine note type
      const noteType =
        amountPayable > 0
          ? "DEBIT_NOTE"
          : amountPayable < 0
          ? "CREDIT_NOTE"
          : "NO_NOTE";

      // Prepare note data
      let noteData = null;
      if (noteType !== "NO_NOTE") {
        noteData = {
          type: noteType,
          title: noteType === "DEBIT_NOTE" ? "DEBIT NOTE" : "CREDIT NOTE",
          partyName: party?.party_name || "N/A",
          particulars: [
            {
              name:
                noteType === "DEBIT_NOTE"
                  ? "Additional amount payable for quality difference"
                  : "Amount to be credited for overpayment/quality difference",
              amount: Math.abs(amountPayable).toFixed(2),
            },
          ],
          totalAmount: Math.abs(amountPayable).toFixed(2),
          inWords: numberToWords(Math.abs(amountPayable)),
          backgroundColor: noteType === "DEBIT_NOTE" ? "#fff8e1" : "#e8f5e9",
          borderColor: noteType === "DEBIT_NOTE" ? "#ff9800" : "#4caf50",
        };
      }

      // Format invoice data
      const invoiceData = {
        reportType: purchase.report_type,
        reportDate: new Date().toLocaleDateString(),
        serialNo: `SRM/G-${new Date().getFullYear()}${
          new Date().getMonth() + 1
        }/${Math.floor(Math.random() * 1000)}`,
        partyName: party?.party_name || "N/A",
        address: `${party?.address_line1 || ""}, ${party?.city || ""}, ${
          party?.state || ""
        }, India`,
        gstNumber: party?.gst || "N/A",
        productName: purchase.product_name,
        hsnCode: "2302",
        contractedRate: parseFloat(purchase.contracted_rate).toFixed(2),
        accountRate: accountRate.toFixed(2),
        invoiceNo: purchase.invoice_no,
        invoiceDate: purchase.date,
        vehicleNo: vehicle?.vehicle_no || vehicleForm.vehicle_no,
        grossWeight: parseFloat(
          quantity?.gross_weight_mt || quantityForm.gross_weight_mt || 0
        ).toFixed(3),
        plasticBags: parseInt(
          quantity?.no_of_bags || quantityForm.no_of_bags || 0
        ),
        bagWeight: bagWeightMT.toFixed(6),
        netWeight: netWeightMT.toFixed(3),
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
        noteType: noteType,
        noteData: noteData,
        inWords: numberToWords(Math.abs(amountPayable)),
      };

      setGeneratedInvoice(invoiceData);
      setInvoiceDialog(true);
      showSuccess("Invoice generated successfully!");

      // Reset forms
      resetAllForms();
    } catch (err) {
      console.error("Invoice generation error:", err);
      showError("Failed to generate invoice");
    }
  };

  // Helper function to reset all forms
  const resetAllForms = () => {
    setPartyForm({
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
    });

    setPurchaseForm({
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

    setVehicleForm({
      purchase_id: null,
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

    setQuantityForm({
      purchase_id: null,
      gross_weight_mt: "",
      no_of_bags: "",
      bag_type: "Poly",
    });

    setLabForm({
      purchase_id: null,
      standard_ffa: "7",
      standard_oil: "19",
      obtain_ffa: "",
      obtain_oil: "",
      rebate_percent: "",
      rebate_rs: "",
      premium_percent: "",
      premium_rs: "",
    });

    setBillingForm({
      purchase_id: null,
      gst_type: "Intra",
      invoice_amount: "",
    });

    setPurchaseId(null);

    // Reset saved sections after generation
    setSavedSections({
      party: false,
      purchase: false,
      vehicle: false,
      quantity: false,
      lab: false,
      billing: false,
    });
  };

  // Helper: Convert number to words
  const numberToWords = (num) => {
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
    const scales = ["", "Thousand", "Million", "Billion"];

    if (num === 0) return "Zero";

    let words = "";
    let scaleIndex = 0;

    while (num > 0) {
      let chunk = num % 1000;
      num = Math.floor(num / 1000);

      if (chunk > 0) {
        let chunkWords = "";

        if (chunk >= 100) {
          chunkWords += units[Math.floor(chunk / 100)] + " Hundred ";
          chunk %= 100;
        }

        if (chunk >= 20) {
          chunkWords += tens[Math.floor(chunk / 10)] + " ";
          chunk %= 10;
        } else if (chunk >= 10) {
          chunkWords += teens[chunk - 10] + " ";
          chunk = 0;
        }

        if (chunk > 0) {
          chunkWords += units[chunk] + " ";
        }

        if (scaleIndex > 0) {
          chunkWords += scales[scaleIndex] + " ";
        }

        words = chunkWords + words;
      }

      scaleIndex++;
    }

    return words.trim() + " ONLY";
  };

  // Check if all sections are saved
  const allSectionsSaved = Object.values(savedSections).every(Boolean);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          📋 Rice Bran Invoice Form
        </Typography>

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
                disabled={savedSections.vehicle || !purchaseId}
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
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
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
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
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

        {/* Invoice Preview Dialog */}
        <Dialog
          open={invoiceDialog}
          onClose={() => setInvoiceDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptIcon color="primary" />
              FINAL REMITTANCE STATEMENT
            </Box>
          </DialogTitle>
          <DialogContent>
            {generatedInvoice && (
              <Box sx={{ mt: 2 }}>
                <div className="printable">
                  {/* === COMPANY HEADER === */}
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      MANMATH PATTANAIK & CO
                    </Typography>
                    <Typography variant="body2">
                      16- MAHANADI VIHAR CUTTACK-4
                    </Typography>
                    <Typography variant="body2">
                      Mob: 9437025723 / 9178314411 | Email:
                      manpat_ronu@rediffmail.com
                    </Typography>
                    <Typography variant="body2">
                      Tin: 21203000147 | GST NO: 21AMJPP6577A1Z4
                    </Typography>
                  </Box>

                  {/* === MAIN INVOICE INFO === */}
                  <Grid
                    container
                    spacing={1}
                    sx={{ mb: 2, fontSize: "0.875rem" }}
                  >
                    <Grid item xs={4}>
                      <strong>Party Name:</strong> {generatedInvoice.partyName}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>Invoice No:</strong> {generatedInvoice.invoiceNo}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>Vehicle No:</strong> {generatedInvoice.vehicleNo}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>Address:</strong> {generatedInvoice.address}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>Invoice Date:</strong>{" "}
                      {generatedInvoice.invoiceDate}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>GST No:</strong> {generatedInvoice.gstNumber}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>Product:</strong> {generatedInvoice.productName}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>HSN Code:</strong> {generatedInvoice.hsnCode}
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={4}>
                      <strong>Contracted Rate:</strong> ₹
                      {generatedInvoice.contractedRate}
                    </Grid>
                    <Grid item xs={4}>
                      <strong>Account Rate:</strong> ₹
                      {generatedInvoice.accountRate}
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2, borderBottomWidth: 2 }} />

                  {/* === QUANTITY & LAB ANALYSIS SIDE-BY-SIDE === */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {/* Quantity Particulars */}
                    <Grid item xs={6}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        QUANTITY PARTICULARS
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Gross Weight</TableCell>
                              <TableCell>
                                {generatedInvoice.grossWeight} MT
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Plastic Bags</TableCell>
                              <TableCell>
                                {generatedInvoice.plasticBags} × 0.20 ={" "}
                                {generatedInvoice.bagWeight} MT
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Net Weight</TableCell>
                              <TableCell>
                                {generatedInvoice.netWeight} MT
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    {/* Laboratory Analysis */}
                    <Grid item xs={6}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        LABORATORY ANALYSIS
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell>Std</TableCell>
                              <TableCell>Result</TableCell>
                              <TableCell>Diff</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>FFA</TableCell>
                              <TableCell>
                                {generatedInvoice.ffaStandard}
                              </TableCell>
                              <TableCell>
                                {generatedInvoice.ffaResult}
                              </TableCell>
                              <TableCell>
                                {generatedInvoice.ffaDifference}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>OIL</TableCell>
                              <TableCell>
                                {generatedInvoice.oilStandard}
                              </TableCell>
                              <TableCell>
                                {generatedInvoice.oilResult}
                              </TableCell>
                              <TableCell>
                                {generatedInvoice.oilDifference}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>

                  {/* === BILLING BREAKDOWN === */}
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    gutterBottom
                  >
                    BILLING DETAILS
                  </Typography>
                  <TableContainer sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Material Amount</TableCell>
                          <TableCell align="right">
                            ₹{generatedInvoice.materialAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Net Amount</TableCell>
                          <TableCell align="right">
                            ₹{generatedInvoice.netAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Gross Amount</TableCell>
                          <TableCell align="right">
                            ₹{generatedInvoice.grossAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>CGST (2.5%)</TableCell>
                          <TableCell align="right">
                            ₹{generatedInvoice.cgstAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SGST (2.5%)</TableCell>
                          <TableCell align="right">
                            ₹{generatedInvoice.sgstAmount}
                          </TableCell>
                        </TableRow>
                        {generatedInvoice.igstAmount !== "0.00" && (
                          <TableRow>
                            <TableCell>IGST (5%)</TableCell>
                            <TableCell align="right">
                              ₹{generatedInvoice.igstAmount}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell>
                            <strong>Billed Amount</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>₹{generatedInvoice.billedAmount}</strong>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Invoice Amount</TableCell>
                          <TableCell align="right">
                            ₹{generatedInvoice.invoiceAmount}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Net Payable</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>
                              ₹{generatedInvoice.amountPayable}
                              {generatedInvoice.amountPayable.startsWith("-") &&
                                " (Credit)"}
                            </strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* === DYNAMIC NOTE SECTION === */}
                  {generatedInvoice.noteData && (
                    <Box
                      sx={{
                        p: 2,
                        border: `2px solid ${generatedInvoice.noteData.borderColor}`,
                        borderRadius: 1,
                        bgcolor: generatedInvoice.noteData.backgroundColor,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={generatedInvoice.noteData.borderColor}
                        >
                          {generatedInvoice.noteData.title}
                        </Typography>
                        <Typography variant="body2">
                          Party: {generatedInvoice.noteData.partyName}
                        </Typography>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Particulars</TableCell>
                              <TableCell align="right">Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {generatedInvoice.noteData.particulars.map(
                              (item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell align="right">
                                    {item.amount}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow
                              sx={{
                                borderTop: `2px solid ${generatedInvoice.noteData.borderColor}`,
                              }}
                            >
                              <TableCell>
                                <strong>TOTAL</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>
                                  {generatedInvoice.noteData.totalAmount}
                                </strong>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: "italic" }}
                        >
                          Rupees in words: {generatedInvoice.noteData.inWords}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            mt: 1,
                            display: "block",
                          }}
                        >
                          {generatedInvoice.noteType === "DEBIT_NOTE"
                            ? "Note: This amount is payable by the party."
                            : "Note: This amount will be adjusted in next transaction."}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* === SIGNATURES & FOOTER === */}
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="caption">Prepared By</Typography>
                      <Box
                        sx={{
                          height: "40px",
                          border: "1px dashed #ccc",
                          mt: 1,
                        }}
                      />
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="caption">Checked By</Typography>
                      <Box
                        sx={{
                          height: "40px",
                          border: "1px dashed #ccc",
                          mt: 1,
                        }}
                      />
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                      <Typography variant="caption">
                        Authorised Signatory
                      </Typography>
                      <Box
                        sx={{
                          height: "40px",
                          border: "1px dashed #ccc",
                          mt: 1,
                        }}
                      />
                      <Typography variant="caption">
                        For Manmath Pattanaik & Co.
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 2,
                      pt: 1,
                      borderTop: "1px dotted #000",
                      fontSize: "0.75rem",
                    }}
                  >
                    <Typography>
                      • Second test report if any should reach us within 10 days
                      of our result.
                    </Typography>
                    <Typography>
                      • Declaration: Subject to Cuttack Jurisdiction only.
                    </Typography>
                  </Box>
                </div>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvoiceDialog(false)}>Close</Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              color="success"
            >
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* Snackbar */}
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
