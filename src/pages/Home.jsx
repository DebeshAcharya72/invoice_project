// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import useFormReset from "../hooks/useFormReset";
import { useFormReset } from "../hooks/useFormReset";
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
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
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Collapse,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
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
  ExpandMore as ExpandMoreIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Sms as SmsIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

// Import Components
import PrintVehicleSlip from "../components/PrintVehicleSlip";
import SMSDialog from "../components/SMSDialog";
import InvoicePreview from "../components/InvoicePreview";
import { api } from "../services/api";

// Compact Field Styles
const styles = {
  compactField: {
    "& .MuiOutlinedInput-root": {
      height: "32px",
      backgroundColor: "#fff",
      borderRadius: "6px",
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#1976d2",
        },
      },
      "&.Mui-focused": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: "1px",
          borderColor: "#1976d2",
        },
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: "400",
      color: "#2c3e50",
      "&::placeholder": {
        color: "#95a5a6",
        opacity: 1,
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "13px",
      fontWeight: "500",
      color: "#34495e",
      transform: "translate(14px, 10px) scale(1)",
      "&.Mui-focused": {
        color: "#1976d2",
      },
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.85)",
      backgroundColor: "#ffffff02",
      padding: "0 4px",
    },
    "& .MuiFormHelperText-root": {
      fontSize: "11px",
      marginTop: "3px",
      marginLeft: "0",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#dfe6e9",
      borderWidth: "1px",
    },
  },
  compactSelect: {
    "& .MuiOutlinedInput-root": {
      height: "36px",
      backgroundColor: "#fff",
      borderRadius: "6px",
    },
    "& .MuiSelect-select": {
      padding: "6px 12px",
      paddingRight: "32px !important",
      fontSize: "13px",
      minHeight: "unset !important",
      lineHeight: "1.5",
    },
    "& .MuiInputLabel-root": {
      fontSize: "13px",
      transform: "translate(14px, 10px) scale(1)",
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.85)",
      backgroundColor: "#fff",
      padding: "0 4px",
    },
  },
  compactGrid: {
    "& > .MuiGrid-item": {
      paddingTop: "4px !important",
    },
  },
  compactButton: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "none",
    borderRadius: "4px",
    height: "32px",
    minWidth: "100px",
    "& .MuiButton-startIcon": {
      marginRight: "4px",
      "& > *:first-of-type": {
        fontSize: "16px",
      },
    },
  },
  compactRadio: {
    "& .MuiRadio-root": {
      padding: "4px",
      "& .MuiSvgIcon-root": {
        fontSize: "18px",
      },
    },
    "& .MuiFormControlLabel-label": {
      fontSize: "13px",
      fontWeight: "400",
    },
  },
  compactCard: {
    marginBottom: "6px",
    "& .MuiCardContent-root": {
      padding: "8px",
      "&:last-child": {
        paddingBottom: "12px",
      },
    },
  },
};

const Home = ({ userRole, onLogout, currentUser }) => {
  const { purchaseId } = useParams();
  const navigate = useNavigate();

  // ======================
  // 1. STATE DECLARATIONS
  // ======================

  const [mode, setMode] = useState(purchaseId ? "edit" : "create");
  const [loading, setLoading] = useState(purchaseId ? true : false);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [showVehicleSlip, setShowVehicleSlip] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    party: true,
    purchase: true,
    vehicle: true,
    lab: true,
    billing: true,
  });

  const [partyForm, setPartyForm] = useState({
    party_name: "",
    address_line1: "",
    city: "",
    state: "",
    pin: "",
    contact_person: "",
    mobile_no: "",
    gst: "",
    customer_type: "Registered",
  });

  const [purchaseForm, setPurchaseForm] = useState({
    party_name: "",
    purchased_from: "Party",
    agent_name: "",
    agent_number: "",
    invoice_no: "",
    date: new Date().toISOString().split("T")[0],
    received_date: "",
    product_name: "Boiled Rice Bran",
    contracted_rate: "",
    final_contracted_rate: "",
    bran_type: "Good",
    gross_weight_mt: "",
    no_of_bags: "",
    bag_type: "Poly",
    bag_weight_mt: "0.000200",
    net_weight_mt: "",
    billed_weight_mt: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicle_no: "",
    owner_name: "",
    owner_rc: "",
    owner_address_line1: "",
    owner_city: "",
    owner_state: "",
    owner_pin: "",
    mobile_no: "",
    bank_account: "",
    bank_name: "",
    ifsc: "",
    rice_mill_name: "",
    destination_from: "",
    destination_to: "",
    quantity_mt: "",
    freight_per_mt: "",
    advance_amount: "",
    paid_by: "Buyer",
  });

  const [labForm, setLabForm] = useState({
    standard_ffa: "7",
    standard_oil: "19",
    obtain_ffa: "",
    obtain_oil: "",
    ffa_rebate_rs: "",
    ffa_premium_rs: "",
    oil_rebate_rs: "",
    oil_premium_rs: "",
  });

  const [billingForm, setBillingForm] = useState({
    gst_type: "Intra",
    invoice_amount: "",
  });

  const [currentPurchaseId, setCurrentPurchaseId] = useState(
    purchaseId || null,
  );
  const [parties, setParties] = useState([]);
  const [savedSections, setSavedSections] = useState({
    party: false,
    purchase: false,
    vehicle: false,
    lab: false,
    billing: false,
  });
  const [modifiedSections, setModifiedSections] = useState({
    party: false,
    purchase: false,
    vehicle: false,
    lab: false,
    billing: false,
  });

  const [savedVehicleData, setSavedVehicleData] = useState(null);
  const [savedLabData, setSavedLabData] = useState(null);
  const [savedPurchaseData, setSavedPurchaseData] = useState(null);
  const [savedPartyData, setSavedPartyData] = useState(null);
  const [savedBillingData, setSavedBillingData] = useState(null);

  // Modal & Party States
  const [openPartyModal, setOpenPartyModal] = useState(false);
  const [modalPartyForm, setModalPartyForm] = useState({
    party_name: "",
    address_line1: "",
    city: "",
    state: "",
    pin: "",
    contact_person: "",
    mobile_no: "",
    gst: "",
    customer_type: "Registered",
  });
  const [usingExistingParty, setUsingExistingParty] = useState(false);
  const [selectedExistingParty, setSelectedExistingParty] = useState(null);

  // Refs
  const receivedDateRef = useRef(null);
  const partyNameRef = useRef(null);
  const contactPersonRef = useRef(null);
  const partyMobileRef = useRef(null);
  const partyAddressRef = useRef(null);
  const partyCityRef = useRef(null);
  const partyStateRef = useRef(null);
  const partyPinRef = useRef(null);
  const partyGstRef = useRef(null);
  const invoiceNoRef = useRef(null);
  const purchaseDateRef = useRef(null);
  const contractedRateRef = useRef(null);
  const grossWeightRef = useRef(null);
  const noOfBagsRef = useRef(null);
  const agentNameRef = useRef(null);
  const agentMobileRef = useRef(null);
  const vehicleNoRef = useRef(null);
  const ownerNameRef = useRef(null);
  const ownerMobileRef = useRef(null);
  const riceMillRef = useRef(null);
  const destFromRef = useRef(null);
  const destToRef = useRef(null);
  const quantityMtRef = useRef(null);
  const freightMtRef = useRef(null);
  const advanceAmtRef = useRef(null);
  const bankAccRef = useRef(null);
  const bankNameRef = useRef(null);
  const ifscRef = useRef(null);
  const ownerAddrRef = useRef(null);
  const ownerCityRef = useRef(null);
  const ownerStateRef = useRef(null);
  const ownerPinRef = useRef(null);
  const obtainFfaRef = useRef(null);
  const ffaPremiumRef = useRef(null);
  const obtainOilRef = useRef(null);
  const oilRebateRef = useRef(null);
  const oilPremiumRef = useRef(null);
  const invoiceAmountRef = useRef(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const totalFreight =
    (parseFloat(vehicleForm.quantity_mt) || 0) *
    (parseFloat(vehicleForm.freight_per_mt) || 0);
  const toPay = totalFreight - (parseFloat(vehicleForm.advance_amount) || 0);
  // ======================
  // 2. HELPER FUNCTIONS
  // ======================

  // Add this alongside other helpers
  // const truncateToThreeDecimals = (num) => {
  //   if (num == null || isNaN(num)) return "0.000";
  //   const truncated = Math.floor(num * 1000) / 1000;
  //   return truncated.toFixed(3); // Ensures 3 decimal places (e.g., 21.159 → "21.159")
  // };
  const truncateToThreeDecimals = (num) => {
    if (num == null || isNaN(num)) return 0;
    return Math.floor(num * 1000) / 1000;
  };
  const checkInvoiceRequirements = () => {
    if (!selectedCompany) {
      showError("Please select a company first");
      return false;
    }

    if (!savedSections.purchase) {
      showError("Please save purchase details first");
      return false;
    }

    // Optional: Add more checks with specific messages
    if (!savedSections.billing) {
      showError("Please save billing details first");
      return false;
    }

    return true;
  };

  const roundToTwoDecimals = (num) => {
    return Math.round(parseFloat(num || 0) * 100) / 100;
  };

  const roundToThreeDecimals = (num) => {
    return Math.round(parseFloat(num || 0) * 1000) / 1000;
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0.00";
    const rounded = roundToTwoDecimals(amount);
    return rounded.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatWeight = (weight) => {
    if (weight === undefined || weight === null || isNaN(weight))
      return "0.000";
    const rounded = roundToThreeDecimals(weight);
    return rounded.toLocaleString("en-IN", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const validateGSTFormat = (gst) => {
    if (!gst) return true;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validateMobileNumber = (value) => {
    if (value === "") return true;
    return /^\d{0,10}$/.test(value);
  };

  const handleMobileChange = (e, formType, setForm) => {
    const value = e.target.value;
    if (validateMobileNumber(value)) {
      setForm((prev) => ({ ...prev, mobile_no: value }));
    }
  };

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "error" });
  const showSuccess = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "success" });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getOilStandard = (product) => {
    const mapping = {
      "Boiled Rice Bran": 19.0,
      "Raw Rice Bran": 16.0,
      "Rough Rice Bran": 7.0,
    };
    return mapping[product] || 19.0;
  };

  // ======================
  // 3. CALCULATION FUNCTIONS
  // ======================

  const calculateFFARebate = (product, ffa) => {
    const ffaValue = parseFloat(ffa) || 0;
    let rebate = 0;
    if (product === "Boiled Rice Bran") {
      if (ffaValue > 45) rebate = 4000;
      else if (ffaValue > 30) rebate = 3500;
      else if (ffaValue > 25) rebate = 2500;
      else if (ffaValue > 20) rebate = 2000;
      else if (ffaValue > 15) {
        if (ffaValue <= 19.99) rebate += (ffaValue - 15) * 170;
        rebate += Math.min(15 - 10, 5) * 150;
        if (10 > 7) rebate += (10 - 7) * 100;
      } else if (ffaValue > 10) {
        rebate += Math.min(ffaValue - 10, 5) * 150;
        if (10 > 7) rebate += (10 - 7) * 100;
      } else if (ffaValue > 7) {
        rebate += (ffaValue - 7) * 100;
      }
    } else {
      if (ffaValue > 55) rebate = 1000;
      else if (ffaValue > 50) rebate = 700;
      else if (ffaValue > 45) rebate = 600;
      else if (ffaValue > 40) rebate = 500;
      else if (ffaValue > 35) rebate = 400;
      else if (ffaValue > 30) rebate = 300;
      else if (ffaValue > 25) rebate = 200;
      else if (ffaValue > 20) rebate = 100;
    }
    return rebate;
  };

  const calculateOilRebatePremium = (
    product,
    oilObtained,
    accountRate,
    netWeight,
  ) => {
    const oilValue = parseFloat(oilObtained) || 0;
    const rate = parseFloat(accountRate) || 0;
    const weight = parseFloat(netWeight) || 0;
    let premium = 0;

    const standards = {
      "Boiled Rice Bran": 19.0,
      "Raw Rice Bran": 16.0,
      "Rough Rice Bran": 7.0,
    };

    const oilStandard = standards[product] || 19.0;

    if (oilValue > oilStandard) {
      if (product === "Boiled Rice Bran") {
        if (oilValue <= 24) {
          // 19-24%: Full premium for all units
          const effectiveDifference = oilValue - oilStandard;
          premium = (rate / oilStandard) * effectiveDifference * weight;
        } else if (oilValue <= 28) {
          // 24-28%: First 5 units full, remaining half premium
          const fullPremiumUnits = 5.0; // 19 to 24 = 5 units
          const halfPremiumUnits = oilValue - 24;
          const effectiveDifference = fullPremiumUnits + halfPremiumUnits * 0.5;
          premium = (rate / oilStandard) * effectiveDifference * weight;
        } else {
          // 🔴 FIXED: Above 28% - NO PREMIUM (ZERO)
          premium = 0; // No premium above 28%
        }
      } else if (product === "Raw Rice Bran") {
        if (oilValue <= 19) {
          const effectiveDifference = oilValue - oilStandard;
          premium = (rate / oilStandard) * effectiveDifference * weight;
        } else if (oilValue <= 21) {
          const fullPremiumUnits = 3.0; // 16 to 19 = 3 units
          const halfPremiumUnits = oilValue - 19;
          const effectiveDifference = fullPremiumUnits + halfPremiumUnits * 0.5;
          premium = (rate / oilStandard) * effectiveDifference * weight;
        } else {
          // 🔴 FIXED: Above 21% - NO PREMIUM (ZERO)
          premium = 0; // No premium above 21%
        }
      } else if (product === "Rough Rice Bran") {
        if (oilValue <= 8) {
          const effectiveDifference = oilValue - oilStandard;
          premium = (rate / oilStandard) * effectiveDifference * weight;
        } else if (oilValue <= 9) {
          const fullPremiumUnits = 1.0; // 7 to 8 = 1 unit
          const halfPremiumUnits = oilValue - 8;
          const effectiveDifference = fullPremiumUnits + halfPremiumUnits * 0.5;
          premium = (rate / oilStandard) * effectiveDifference * weight;
        } else {
          // 🔴 FIXED: Above 9% - NO PREMIUM (ZERO)
          premium = 0; // No premium above 9%
        }
      }
    }

    return {
      rebate: 0,
      premium: parseFloat(premium.toFixed(2)),
    };
  };

  const calculateAccountRate = () => {
    const contractedRate =
      parseFloat(
        purchaseForm.bran_type === "Red"
          ? purchaseForm.final_contracted_rate || purchaseForm.contracted_rate
          : purchaseForm.contracted_rate,
      ) || 0;
    const ffaRebate =
      parseFloat(
        savedLabData?.ffa_rebate_rs ||
          savedLabData?.rebate_rs ||
          labForm.ffa_rebate_rs,
      ) || 0;
    return roundToTwoDecimals(contractedRate - ffaRebate);
  };

  // const calculateNetRate = () => {
  //   const accountRate = calculateAccountRate();
  //   const oilStandard = parseFloat(labForm.standard_oil) || 19;
  //   const oilObtained = parseFloat(labForm.obtain_oil) || oilStandard;
  //   const oilDifference = oilObtained - oilStandard;
  //   if (oilStandard === 0) return 0;
  //   const netRate = (accountRate / oilStandard) * oilDifference + accountRate;
  //   return roundToTwoDecimals(netRate);
  // };
  const calculateNetRate = () => {
    const accountRate = calculateAccountRate();
    const oilStandard = parseFloat(labForm.standard_oil) || 19;
    const oilObtained = parseFloat(labForm.obtain_oil) || oilStandard;

    // Calculate Effective Difference based on your premium logic
    let effectiveDifference = 0;

    if (oilObtained > oilStandard) {
      const product = purchaseForm.product_name;

      if (product === "Boiled Rice Bran") {
        if (oilObtained <= 24) {
          effectiveDifference = oilObtained - oilStandard; // Full premium
        } else if (oilObtained <= 28) {
          const fullPremiumUnits = 5; // 19 to 24 = 5 units
          const halfPremiumUnits = oilObtained - 24;
          effectiveDifference = fullPremiumUnits + halfPremiumUnits * 0.5;
        } else {
          effectiveDifference = 5 + 4 * 0.5; // 5 + 2 = 7 (max at 28%)
        }
      } else if (product === "Raw Rice Bran") {
        if (oilObtained <= 19) {
          effectiveDifference = oilObtained - oilStandard; // 16 to 19 = full premium
        } else if (oilObtained <= 21) {
          const fullPremiumUnits = 3; // 16 to 19 = 3 units
          const halfPremiumUnits = oilObtained - 19;
          effectiveDifference = fullPremiumUnits + halfPremiumUnits * 0.5;
        } else {
          effectiveDifference = 3 + 2 * 0.5; // 3 + 1 = 4 (max at 21%)
        }
      } else if (product === "Rough Rice Bran") {
        if (oilObtained <= 8) {
          effectiveDifference = oilObtained - oilStandard; // 7 to 8 = full premium
        } else if (oilObtained <= 9) {
          const fullPremiumUnits = 1; // 7 to 8 = 1 unit
          const halfPremiumUnits = oilObtained - 8;
          effectiveDifference = fullPremiumUnits + halfPremiumUnits * 0.5;
        } else {
          effectiveDifference = 1 + 1 * 0.5; // 1 + 0.5 = 1.5 (max at 9%)
        }
      }
    }

    // Net Rate = Account Rate + (Account Rate / Oil Standard) × Effective Difference
    const netRate =
      (accountRate / oilStandard) * effectiveDifference + accountRate;
    return roundToTwoDecimals(netRate);
  };

  const calculateNetAmount = () => {
    const netRate = calculateNetRate();
    const accountRate = calculateAccountRate();
    const netAmount = netRate * accountRate;
    return roundToTwoDecimals(netAmount);
  };

  const calculateMaterialAmount = () => {
    const accountRate = calculateAccountRate();
    // const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;
    const netWeight = truncateToThreeDecimals(
      parseFloat(purchaseForm.net_weight_mt),
    );
    return roundToTwoDecimals(accountRate * netWeight);
  };

  const calculateGrossAmount = () => {
    const materialAmount = calculateMaterialAmount();
    const oilPremium = parseFloat(labForm.oil_premium_rs) || 0;
    const oilRebate = parseFloat(labForm.oil_rebate_rs) || 0;
    if (oilPremium > 0) {
      return roundToTwoDecimals(materialAmount + oilPremium);
    } else if (oilRebate > 0) {
      return roundToTwoDecimals(materialAmount - oilRebate);
    } else {
      return roundToTwoDecimals(materialAmount);
    }
  };

  const calculateGST = () => {
    const grossAmount = calculateGrossAmount();
    const gstType = billingForm.gst_type || "Intra";
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
      cgst: roundToTwoDecimals(cgst),
      sgst: roundToTwoDecimals(sgst),
      igst: roundToTwoDecimals(igst),
      total: roundToTwoDecimals(cgst + sgst + igst),
    };
  };

  const calculateBilledAmount = () => {
    const grossAmount = calculateGrossAmount();
    const gst = calculateGST();
    return roundToTwoDecimals(grossAmount + gst.total);
  };

  const calculateAmountPayable = () => {
    const billedAmount = calculateBilledAmount();
    const invoiceAmount = parseFloat(billingForm.invoice_amount) || 0;
    return roundToTwoDecimals(billedAmount - invoiceAmount);
  };

  // const canGenerateInvoice = () => {
  //   if (!savedSections.purchase) return false;
  //   return true;
  // };

  const canGenerateInvoice = () => {
    // Check if company is selected
    if (!selectedCompany) {
      return false;
    }

    // Check if purchase is saved
    if (!savedSections.purchase) {
      return false;
    }

    // Optional: You can add more checks here if needed
    // For example, check if billing is saved:
    // if (!savedSections.billing) return false;

    return true;
  };

  // ======================
  // 4. USE EFFECTS
  // ======================

  // Auto-fill party when selected
  useEffect(() => {
    if (purchaseForm.party_name && parties.length > 0) {
      const selectedParty = parties.find(
        (p) => p.party_name === purchaseForm.party_name,
      );
      if (selectedParty && !usingExistingParty) {
        setPartyForm({
          party_name: selectedParty.party_name,
          address_line1: selectedParty.address_line1 || "",
          city: selectedParty.city || "",
          state: selectedParty.state || "",
          pin: selectedParty.pin || "",
          contact_person: selectedParty.contact_person || "",
          mobile_no: selectedParty.mobile_no || "",
          gst: selectedParty.gst || "",
          customer_type: selectedParty.customer_type || "Registered",
        });
        setUsingExistingParty(true);
        setSelectedExistingParty(selectedParty);
      }
    }
  }, [purchaseForm.party_name, parties, usingExistingParty]);

  // Load data on mount
  useEffect(() => {
    loadCompanies();
    loadParties();
    if (mode === "edit" && purchaseId) {
      loadFormData();
    } else {
      // If in create mode (fresh Home page), reset the form
      console.log("🔄 Fresh Home page - resetting form");
      resetForm();
    }
  }, [purchaseId]);

  // Auto-fill destination_from from party
  useEffect(() => {
    if (purchaseForm.party_name) {
      const selectedParty = parties.find(
        (p) => p.party_name === purchaseForm.party_name,
      );
      if (selectedParty) {
        const destinationFrom = [
          selectedParty.address_line1,
          selectedParty.city,
          selectedParty.state,
          selectedParty.pin,
        ]
          .filter(Boolean)
          .join(", ");
        setVehicleForm((prev) => ({
          ...prev,
          destination_from: destinationFrom,
        }));
      }
    }
  }, [purchaseForm.party_name, parties]);

  // Auto-fill rice mill name
  useEffect(() => {
    if (purchaseForm.party_name) {
      setVehicleForm((prev) => ({
        ...prev,
        rice_mill_name: purchaseForm.party_name,
      }));
    }
  }, [purchaseForm.party_name]);

  // Sync quantity_mt with gross_weight_mt
  useEffect(() => {
    if (purchaseForm.gross_weight_mt) {
      setVehicleForm((prev) => ({
        ...prev,
        quantity_mt: purchaseForm.gross_weight_mt,
      }));
    }
  }, [purchaseForm.gross_weight_mt]);

  // Auto-fill destination_to from company
  useEffect(() => {
    if (selectedCompany) {
      const selectedCompanyObj = companies.find(
        (c) => (c._id || c.id) === selectedCompany,
      );
      if (selectedCompanyObj) {
        const destinationTo = [
          selectedCompanyObj.address_line1,
          selectedCompanyObj.city,
          selectedCompanyObj.state,
          selectedCompanyObj.pin,
        ]
          .filter(Boolean)
          .join(", ");
        setVehicleForm((prev) => ({
          ...prev,
          destination_to: destinationTo,
        }));
      }
    }
  }, [selectedCompany, companies]);

  // Auto-recalculate oil rebate/premium
  useEffect(() => {
    const oilValue = parseFloat(labForm.obtain_oil);
    const rate = parseFloat(purchaseForm.contracted_rate);
    const grossWeight = parseFloat(purchaseForm.gross_weight_mt) || 0;
    const noOfBags = parseInt(purchaseForm.no_of_bags) || 0;
    const bagWeight = purchaseForm.bag_type === "Poly" ? 0.0002 : 0.0005;
    const netWeight = grossWeight - noOfBags * bagWeight;
    const product = purchaseForm.product_name;

    if (!isNaN(oilValue) && !isNaN(rate) && netWeight > 0 && product) {
      const oilCalc = calculateOilRebatePremium(
        product,
        oilValue,
        rate,
        netWeight,
      );
      setLabForm((prev) => ({
        ...prev,
        oil_rebate_rs: oilCalc.rebate > 0 ? oilCalc.rebate.toFixed(2) : "",
        oil_premium_rs: oilCalc.premium > 0 ? oilCalc.premium.toFixed(2) : "",
      }));
    }
  }, [
    labForm.obtain_oil,
    purchaseForm.contracted_rate,
    purchaseForm.gross_weight_mt,
    purchaseForm.no_of_bags,
    purchaseForm.bag_type,
    purchaseForm.product_name,
  ]);

  // Update lab standards based on product
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

    if (labForm.obtain_oil && purchaseForm.contracted_rate) {
      const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;
      const oilCalc = calculateOilRebatePremium(
        purchaseForm.product_name,
        labForm.obtain_oil,
        purchaseForm.contracted_rate,
        netWeight,
      );
      setLabForm((prev) => ({
        ...prev,
        oil_rebate_rs: oilCalc.rebate > 0 ? oilCalc.rebate.toFixed(2) : "",
        oil_premium_rs: oilCalc.premium > 0 ? oilCalc.premium.toFixed(2) : "",
      }));
    }
  }, [purchaseForm.product_name]);

  // Handle Red Bran logic
  useEffect(() => {
    if (purchaseForm.bran_type === "Red") {
      const baseRate = parseFloat(purchaseForm.contracted_rate) || 0;
      const finalRate = Math.max(0, baseRate - 500);
      setPurchaseForm((prev) => ({
        ...prev,
        final_contracted_rate: finalRate.toString(),
      }));
    } else {
      setPurchaseForm((prev) => ({
        ...prev,
        final_contracted_rate: "",
      }));
    }
  }, [purchaseForm.bran_type, purchaseForm.contracted_rate]);

  // Auto-calculate bag & net weight
  useEffect(() => {
    const bagWeight = purchaseForm.bag_type === "Poly" ? 0.0002 : 0.0005;
    const grossWeight = parseFloat(purchaseForm.gross_weight_mt) || 0;
    const noOfBags = parseInt(purchaseForm.no_of_bags) || 0;

    // Calculate and truncate immediately
    const netWeight = grossWeight - noOfBags * bagWeight;
    const truncatedNetWeight =
      netWeight >= 0 ? truncateToThreeDecimals(netWeight) : 0;

    setPurchaseForm((prev) => ({
      ...prev,
      bag_weight_mt: bagWeight.toString(),
      net_weight_mt: truncatedNetWeight, // ← Store as TRUNCATED value
    }));
  }, [
    purchaseForm.bag_type,
    purchaseForm.gross_weight_mt,
    purchaseForm.no_of_bags,
  ]);

  // Auto-set GST type from GST number
  useEffect(() => {
    if (partyForm.gst && partyForm.gst.length >= 2) {
      const stateCode = partyForm.gst.substring(0, 2);
      const isOdisha = stateCode === "21";
      setBillingForm((prev) => ({
        ...prev,
        gst_type: isOdisha ? "Intra" : "Inter",
      }));
    }
  }, [partyForm.gst]);

  // NEW: Oil premium calculation using account rate (as per your logic)
  useEffect(() => {
    const oilValue = parseFloat(labForm.obtain_oil);
    const accountRate = calculateAccountRate();
    // const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;
    const netWeightRaw = parseFloat(purchaseForm.net_weight_mt) || 0;
    const netWeight = truncateToThreeDecimals(netWeightRaw); // e.g., 21.1596 → 21.159
    const product = purchaseForm.product_name;

    if (!isNaN(oilValue) && !isNaN(accountRate) && netWeight > 0 && product) {
      const oilCalc = calculateOilRebatePremium(
        product,
        oilValue,
        accountRate,
        netWeight,
      );
      setLabForm((prev) => ({
        ...prev,
        oil_rebate_rs: "0.00",
        oil_premium_rs: oilCalc.premium > 0 ? oilCalc.premium.toFixed(2) : "",
      }));
    }
  }, [
    labForm.obtain_oil,
    purchaseForm.product_name,
    purchaseForm.net_weight_mt,
    purchaseForm.contracted_rate,
    purchaseForm.bran_type,
    labForm.obtain_ffa,
    labForm.ffa_rebate_rs,
  ]);

  // ======================
  // 5. DATA LOADING & FORM HANDLERS
  // ======================

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesData = await api.getMyCompanies();
      setCompanies(companiesData);
      if (companiesData.length > 0) {
        if (mode === "edit" && savedPurchaseData?.company_id) {
          setSelectedCompany(savedPurchaseData.company_id);
        } else if (currentUser?.company_id) {
          const userCompany = companiesData.find(
            (c) => (c._id || c.id) === currentUser.company_id,
          );
          if (userCompany) {
            setSelectedCompany(userCompany._id || userCompany.id);
          } else {
            setSelectedCompany(companiesData[0]._id || companiesData[0].id);
          }
        } else {
          setSelectedCompany(companiesData[0]._id || companiesData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
      showError("Failed to load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadParties = async () => {
    try {
      const data = await api.getParties();
      setParties(data);
      if (data.length > 0 && !purchaseForm.party_name && mode === "create") {
        setPurchaseForm((prev) => ({
          ...prev,
          party_name: data[0].party_name,
        }));
      }
    } catch (err) {
      showError("Failed to load parties");
    }
  };

  const loadFormData = async () => {
    try {
      setLoading(true);
      const formData = await api.getFormComplete(purchaseId);

      if (formData.party) {
        setPartyForm({
          party_name: formData.party.party_name || "",
          address_line1: formData.party.address_line1 || "",
          city: formData.party.city || "",
          state: formData.party.state || "",
          pin: formData.party.pin || "",
          contact_person: formData.party.contact_person || "",
          mobile_no: formData.party.mobile_no || "",
          gst: formData.party.gst || "",
          customer_type: formData.party.customer_type || "Registered",
        });
        setSavedPartyData(formData.party);
        setSavedSections((prev) => ({ ...prev, party: true }));
      }

      if (formData.purchase) {
        setPurchaseForm({
          party_name: formData.purchase.party_name || "",
          purchased_from: formData.purchase.purchased_from || "Party",
          agent_name: formData.purchase.agent_name || "",
          agent_number: formData.purchase.agent_number || "",
          invoice_no: formData.purchase.invoice_no || "",
          date:
            formData.purchase.date || new Date().toISOString().split("T")[0],
          received_date: formData.purchase.received_date || "",
          product_name: formData.purchase.product_name || "Boiled Rice Bran",
          contracted_rate: formData.purchase.contracted_rate || "",
          final_contracted_rate: formData.purchase.final_contracted_rate || "",
          bran_type: formData.purchase.bran_type || "Good",
          gross_weight_mt: formData.purchase.gross_weight_mt || "",
          no_of_bags: formData.quantity?.no_of_bags || "",
          bag_type: "Poly",
          bag_weight_mt: formData.quantity?.bag_weight_mt || "0.000200",
          // net_weight_mt: formData.quantity?.net_weight_mt || "",
          net_weight_mt: truncateToThreeDecimals(
            parseFloat(formData.quantity?.net_weight_mt) || "",
          ),
          billed_weight_mt: formData.purchase.billed_weight_mt || "",
        });
        setSavedPurchaseData(formData.purchase);
        setSavedSections((prev) => ({ ...prev, purchase: true }));
      }

      if (formData.vehicle) {
        setVehicleForm({
          vehicle_no: formData.vehicle.vehicle_no || "",
          owner_name: formData.vehicle.owner_name || "",
          owner_rc: formData.vehicle.owner_rc || "",
          owner_address_line1: formData.vehicle.owner_address_line1 || "",
          owner_city: formData.vehicle.owner_city || "",
          owner_state: formData.vehicle.owner_state || "",
          owner_pin: formData.vehicle.owner_pin || "",
          mobile_no: formData.vehicle.mobile_no || "",
          bank_account: formData.vehicle.bank_account || "",
          bank_name: formData.vehicle.bank_name || "",
          ifsc: formData.vehicle.ifsc || "",
          rice_mill_name: formData.vehicle.rice_mill_name || "",
          destination_from: formData.vehicle.destination_from || "",
          destination_to: formData.vehicle.destination_to || "",
          quantity_mt: formData.vehicle.quantity_mt || "",
          freight_per_mt: formData.vehicle.freight_per_mt || "",
          advance_amount: formData.vehicle.advance_amount || "",
          paid_by: formData.vehicle.paid_by || "Buyer",
        });
        setSavedVehicleData(formData.vehicle);
        setSavedSections((prev) => ({ ...prev, vehicle: true }));
      }

      if (formData.lab) {
        setLabForm({
          standard_ffa: formData.lab.standard_ffa?.toString() || "7",
          standard_oil: formData.lab.standard_oil?.toString() || "19",
          obtain_ffa: formData.lab.obtain_ffa?.toString() || "",
          obtain_oil: formData.lab.obtain_oil?.toString() || "",
          ffa_rebate_rs: formData.lab.rebate_rs?.toString() || "",
          ffa_premium_rs: formData.lab.premium_rs?.toString() || "",
          oil_rebate_rs: formData.lab.oil_rebate_rs?.toString() || "",
          oil_premium_rs: formData.lab.oil_premium_rs?.toString() || "",
        });
        setSavedLabData(formData.lab);
        setSavedSections((prev) => ({ ...prev, lab: true }));
      }

      if (formData.billing) {
        setBillingForm({
          gst_type: formData.billing.gst_type || "Intra",
          invoice_amount: formData.billing.invoice_amount?.toString() || "",
        });
        setSavedBillingData(formData.billing);
        setSavedSections((prev) => ({ ...prev, billing: true }));
      }

      if (formData.purchase?.company_id) {
        setSelectedCompany(formData.purchase.company_id);
      }

      setModifiedSections({
        party: false,
        purchase: false,
        vehicle: false,
        lab: false,
        billing: false,
      });
    } catch (error) {
      console.error("Failed to load form data:", error);
      showError("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const updateFormWithTracking = (setter, formType, updater) => {
    if (mode === "edit") {
      setModifiedSections((prev) => ({ ...prev, [formType]: true }));
    }
    if (typeof updater === "function") {
      setter((prev) => updater(prev));
    } else {
      setter(updater);
    }
  };

  // --- Save Handlers ---
  const handleSaveParty = async () => {
    try {
      if (usingExistingParty && selectedExistingParty) {
        showSuccess("Using existing party details!");
        return;
      }

      const partyData = {
        ...partyForm,
        company_id: selectedCompany,
      };

      let savedParty;
      if (mode === "edit" && savedPartyData) {
        // Update existing party
        savedParty = await api.updateParty(savedPartyData._id, partyData);
      } else {
        // Create new party
        savedParty = await api.createParty(partyData);
      }

      // ✅ CRITICAL: Reload parties so the new one appears in dropdown
      await loadParties();

      // ✅ CRITICAL: Auto-select the newly created/updated party
      setPurchaseForm((prev) => ({
        ...prev,
        party_name: savedParty.party_name, // ← This ensures it shows in the dropdown
      }));

      // Update local state
      setSavedPartyData(savedParty);
      setSavedSections((prev) => ({ ...prev, party: true }));
      setModifiedSections((prev) => ({ ...prev, party: false }));

      showSuccess("Party details saved!");
    } catch (err) {
      console.error("Failed to save Party:", err);
      showError("Failed to save Party: " + (err.message || "Unknown error"));
    }
  };
  const handleSavePurchase = async () => {
    try {
      const purchaseData = {
        ...purchaseForm,
        company_id: selectedCompany,
        // Ensure no_of_bags is included
        no_of_bags: parseInt(purchaseForm.no_of_bags) || 0,
      };

      let purchase;
      if (mode === "edit" && savedPurchaseData) {
        purchase = await api.updatePurchase(
          savedPurchaseData._id,
          purchaseData,
        );
      } else {
        purchase = await api.createPurchase(purchaseData);
      }

      // Also save quantity separately
      if (purchase._id && purchaseForm.no_of_bags) {
        const quantityData = {
          purchase_id: purchase._id,
          gross_weight_mt: parseFloat(purchaseForm.gross_weight_mt) || 0,
          no_of_bags: parseInt(purchaseForm.no_of_bags) || 0,
          bag_type: purchaseForm.bag_type || "Poly",
        };

        await api.createQuantity(quantityData);
      }

      setSavedPurchaseData(purchase);
      setCurrentPurchaseId(purchase._id);
      setSavedSections((prev) => ({ ...prev, purchase: true }));
      setModifiedSections((prev) => ({ ...prev, purchase: false }));
      showSuccess("Purchase details saved!");
    } catch (err) {
      showError("Failed to save Purchase");
    }
  };

  const handleSaveVehicle = async () => {
    try {
      if (!currentPurchaseId) {
        showError("Purchase must be saved first");
        return;
      }
      const vehicleData = {
        ...vehicleForm,
        purchase_id: currentPurchaseId,
      };

      let savedVehicle;
      if (mode === "edit" && savedVehicleData) {
        // Update existing vehicle
        savedVehicle = await api.updateVehicle(
          savedVehicleData._id,
          vehicleData,
        );
      } else {
        // Create new vehicle
        savedVehicle = await api.createVehicle(vehicleData);
      }

      setSavedVehicleData(savedVehicle);
      setSavedSections((prev) => ({ ...prev, vehicle: true }));
      setModifiedSections((prev) => ({ ...prev, vehicle: false }));
      showSuccess("Vehicle details saved!");
      if (mode === "create") {
        setShowVehicleSlip(true);
      }
    } catch (err) {
      showError("Failed to save Vehicle");
    }
  };

  const handleSaveLab = async () => {
    try {
      if (!currentPurchaseId) {
        showError("Purchase must be saved first");
        return;
      }

      const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;
      const oilCalc = calculateOilRebatePremium(
        purchaseForm.product_name,
        labForm.obtain_oil,
        purchaseForm.contracted_rate,
        netWeight,
      );

      const labData = {
        purchase_id: currentPurchaseId,
        obtain_ffa: labForm.obtain_ffa ? parseFloat(labForm.obtain_ffa) : null,
        obtain_oil: labForm.obtain_oil ? parseFloat(labForm.obtain_oil) : null,
        rebate_rs: labForm.ffa_rebate_rs
          ? parseFloat(labForm.ffa_rebate_rs)
          : null,
        premium_rs: labForm.ffa_premium_rs
          ? parseFloat(labForm.ffa_premium_rs)
          : null,
        oil_rebate_rs: oilCalc.rebate > 0 ? oilCalc.rebate : null,
        oil_premium_rs: oilCalc.premium > 0 ? oilCalc.premium : null,
        standard_ffa: parseFloat(labForm.standard_ffa) || 0,
        standard_oil: parseFloat(labForm.standard_oil) || 0,
      };

      let savedLab;
      if (mode === "edit" && savedLabData) {
        // Update existing lab
        savedLab = await api.updateLabDetail(savedLabData._id, labData);
      } else {
        // Create new lab
        savedLab = await api.createLabDetail(labData);
      }

      const completeLabData = {
        ...savedLab,
        ffa_rebate_rs: savedLab.rebate_rs,
        ffa_premium_rs: savedLab.premium_rs,
      };

      setSavedLabData(completeLabData);
      setSavedSections((prev) => ({ ...prev, lab: true }));
      setModifiedSections((prev) => ({ ...prev, lab: false }));
      showSuccess("Laboratory details saved!");
    } catch (err) {
      console.error("Lab save error:", err);
      showError("Failed to save Lab: " + err.message);
    }
  };
  const handleSaveBilling = async () => {
    try {
      if (!currentPurchaseId) {
        showError("Please save purchase details first");
        return;
      }

      // Calculate all values
      const billingData = {
        purchase_id: currentPurchaseId,
        gst_type: billingForm.gst_type,
        invoice_amount: parseFloat(billingForm.invoice_amount) || 0,
        // Send ALL calculated values
        account_rate: calculateAccountRate(),
        net_rate: calculateNetRate(),
        net_amount: calculateNetAmount(),
        material_amount: calculateMaterialAmount(),
        gross_amount: calculateGrossAmount(),
        cgst: calculateGST().cgst,
        sgst: calculateGST().sgst,
        igst: calculateGST().igst,
        billed_amount: calculateBilledAmount(),
        amount_payable: calculateAmountPayable(),
        revised_amount: calculateAmountPayable(),
        ffa_rebate: parseFloat(labForm.ffa_rebate_rs) || 0,
        oil_rebate: parseFloat(labForm.oil_rebate_rs) || 0,
        oil_premium: parseFloat(labForm.oil_premium_rs) || 0,
        ffa_obtained: parseFloat(labForm.obtain_ffa) || 0,
        oil_obtained: parseFloat(labForm.obtain_oil) || 0,
      };

      console.log("Sending billing data to backend:", billingData); // For debugging

      // Save to backend (will just store, no calculations)
      await api.createBilling(billingData);

      setSavedSections((prev) => ({ ...prev, billing: true }));
      setModifiedSections((prev) => ({ ...prev, billing: false }));
      showSuccess("Billing details saved!");

      // If all sections saved and in edit mode, show success message
      if (mode === "edit" && allSectionsSaved) {
        showSuccess("All changes saved successfully!");
      }
    } catch (err) {
      console.error("Billing save error:", err);
      showError("Failed to save Billing: " + err.message);
    }
  };
  const handleSaveAll = async () => {
    try {
      setSaving(true);

      // 1. Update Purchase
      await api.updatePurchase(currentPurchaseId, purchaseForm);

      // 2. Update Party
      if (savedPartyData?._id) {
        await api.updateParty(savedPartyData._id, partyForm);
      } else {
        const newParty = await api.createParty({
          ...partyForm,
          company_id: selectedCompany,
        });
        setSavedPartyData(newParty);
      }

      // 3. Update Vehicle
      if (savedVehicleData?._id) {
        await api.updateVehicle(savedVehicleData._id, vehicleForm);
      } else {
        await api.createVehicle({
          ...vehicleForm,
          purchase_id: currentPurchaseId,
        });
      }

      // 4. Update Quantity
      if (savedQuantityData?._id) {
        await api.updateQuantity(savedQuantityData._id, quantityForm);
      } else {
        await api.createQuantity({
          ...quantityForm,
          purchase_id: currentPurchaseId,
        });
      }

      // 5. Update Lab
      if (savedLabData?._id) {
        await api.updateLabDetail(savedLabData._id, labForm);
      } else {
        await api.createLabDetail({
          ...labForm,
          purchase_id: currentPurchaseId,
        });
      }

      // 6. Update Billing
      if (savedBillingData?._id) {
        await api.updateBilling(savedBillingData._id, billingForm);
      } else {
        await api.createBilling({
          ...billingForm,
          purchase_id: currentPurchaseId,
        });
      }

      showSuccess("Form updated successfully!");
      setModifiedSections({
        party: false,
        purchase: false,
        vehicle: false,
        quantity: false,
        lab: false,
        billing: false,
      });
    } catch (err) {
      console.error("Save error:", err);
      showError("Failed to save form: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePartyInModal = async () => {
    try {
      const partyData = {
        ...modalPartyForm,
        company_id: selectedCompany,
      };

      const savedParty = await api.createParty(partyData);
      await loadParties(); // Refresh party list

      // Auto-select new party
      setPurchaseForm((prev) => ({
        ...prev,
        party_name: savedParty.party_name,
      }));

      setSavedPartyData(savedParty);
      setSavedSections((prev) => ({ ...prev, party: true }));
      setModifiedSections((prev) => ({ ...prev, party: false }));

      // Reset & close
      setOpenPartyModal(false);
      setModalPartyForm({
        party_name: "",
        address_line1: "",
        city: "",
        state: "",
        pin: "",
        contact_person: "",
        mobile_no: "",
        gst: "",
        customer_type: "Registered",
      });

      showSuccess("Party details saved!");
    } catch (err) {
      console.error("Failed to save Party:", err);
      showError("Failed to save Party: " + (err.message || "Unknown error"));
    }
  };
  const handleAddNewParty = () => {
    // Reset all party-related states
    setUsingExistingParty(false);
    setSelectedExistingParty(null);

    // Clear the party form
    setPartyForm({
      party_name: "",
      address_line1: "",
      city: "",
      state: "",
      pin: "",
      contact_person: "",
      mobile_no: "",
      gst: "",
      customer_type: "Registered",
    });

    // Also clear the party in purchase form if it was selected
    setPurchaseForm((prev) => ({
      ...prev,
      party_name: "",
    }));

    // Reset saved state
    setSavedSections((prev) => ({ ...prev, party: false }));
    setModifiedSections((prev) => ({ ...prev, party: false }));

    // Focus on the party name field
    if (partyNameRef.current) {
      setTimeout(() => partyNameRef.current.focus(), 100);
    }
  };

  const handleGenerateInvoice = async () => {
    // Check all requirements first
    if (!checkInvoiceRequirements()) {
      return; // Stop if requirements not met
    }
    try {
      if (!currentPurchaseId) {
        showError("Please save purchase details first");
        return;
      }

      // Get complete form data from backend
      const response = await api.generateInvoice(currentPurchaseId);

      // if (response && response.data) {
      //   const raw = response.data;
      if (response && typeof response === "object") {
        const raw = response;

        // Get selected company
        const selectedCompanyObj = companies.find(
          (c) => (c._id || c.id) === selectedCompany,
        );

        // Get party data
        const partyData = parties.find(
          (p) => p.party_name === purchaseForm.party_name,
        );

        // Use the ACTUAL billing data from backend response
        const billingData = raw.billing || {};

        // Transform data to match InvoicePreview format
        const transformedData = {
          company: selectedCompanyObj || {
            company_name: "Not Added Yet!",
            address_line1: "N/A",
            mobile_no: "N/A",
            gst_number: selectedCompanyObj?.gst_number || "",
            email: selectedCompanyObj?.email || "",
          },

          party: partyData || {
            party_name: "Not Added Yet!",
            address_line1: "N/A",
            city: "N/A",
            state: "N/A",
            pin: "N/A",
            gst: "N/A",
            mobile_no: "N/A",
            contact_person: "N/A",
          },

          purchase: raw.purchase || {
            ...purchaseForm,
            agent_name: purchaseForm.agent_name || "",
            agent_number: purchaseForm.agent_number || "",
            product_name: purchaseForm.product_name || "Boiled Rice Bran",
            gross_weight_mt: parseFloat(purchaseForm.gross_weight_mt) || 0,
            contracted_rate: parseFloat(purchaseForm.contracted_rate) || 0,
            bran_type: purchaseForm.bran_type || "Good",
            final_contracted_rate:
              parseFloat(purchaseForm.final_contracted_rate) ||
              parseFloat(purchaseForm.contracted_rate) ||
              0,
          },

          quantity: raw.quantity || {
            no_of_bags: parseInt(purchaseForm.no_of_bags) || 0,
            gross_weight_mt: parseFloat(purchaseForm.gross_weight_mt) || 0,
            net_weight_mt: parseFloat(purchaseForm.net_weight_mt) || 0,
            bag_weight_mt: parseFloat(purchaseForm.bag_weight_mt) || 0,
            bag_type: purchaseForm.bag_type || "Poly",
          },

          lab: raw.lab || {
            obtain_ffa: parseFloat(labForm.obtain_ffa) || 0,
            ffa_rebate_rs: parseFloat(labForm.ffa_rebate_rs) || 0,
            ffa_premium_rs: parseFloat(labForm.ffa_premium_rs) || 0,
            obtain_oil: parseFloat(labForm.obtain_oil) || 0,
            oil_rebate_rs: parseFloat(labForm.oil_rebate_rs) || 0,
            oil_premium_rs: parseFloat(labForm.oil_premium_rs) || 0,
            standard_ffa: parseFloat(labForm.standard_ffa) || 7,
            standard_oil: parseFloat(labForm.standard_oil) || 19,
          },

          // Use the ACTUAL billing data from backend
          billing: {
            account_rate:
              billingData.account_rate || calculateAccountRate().toFixed(2),
            net_rate: billingData.net_rate || calculateNetRate().toFixed(2),
            material_amount:
              billingData.material_amount ||
              calculateMaterialAmount().toFixed(2),
            gross_amount:
              billingData.gross_amount || calculateGrossAmount().toFixed(2),
            cgst: billingData.cgst || calculateGST().cgst.toFixed(2),
            sgst: billingData.sgst || calculateGST().sgst.toFixed(2),
            igst: billingData.igst || calculateGST().igst.toFixed(2),
            billed_amount:
              billingData.billed_amount || calculateBilledAmount().toFixed(2),
            amount_payable:
              billingData.amount_payable || calculateAmountPayable().toFixed(2),
            revised_amount:
              billingData.revised_amount || calculateAmountPayable().toFixed(2),
            invoice_amount:
              billingData.invoice_amount ||
              parseFloat(billingForm.invoice_amount) ||
              0,
            gst_type: billingData.gst_type || billingForm.gst_type || "Intra",
            // CRITICAL: Add these fields from the backend response
            ffa_rebate: billingData.ffa_rebate || billingData.rebate_rs || 0,
            oil_rebate:
              billingData.oil_rebate || billingData.oil_rebate_rs || 0,
            oil_premium:
              billingData.oil_premium || billingData.oil_premium_rs || 0,
            // Add rebate_rs for backward compatibility
            rebate_rs: billingData.rebate_rs || billingData.ffa_rebate || 0,
            oil_rebate_rs:
              billingData.oil_rebate_rs || billingData.oil_rebate || 0,
            oil_premium_rs:
              billingData.oil_premium_rs || billingData.oil_premium || 0,
          },

          vehicle: raw.vehicle ||
            vehicleForm || {
              vehicle_no: "O015F 6232",
              owner_name: "",
              mobile_no: "",
            },
        };

        console.log("Generated invoice data:", transformedData); // For debugging

        setGeneratedInvoice(transformedData);
        setShowInvoice(true);
        showSuccess("Invoice generated successfully!");
      } else {
        showError("No invoice data returned from server");
      }
    } catch (err) {
      console.error("Invoice generation error:", err);
      showError(
        "Failed to generate invoice: " + (err.message || "Unknown error"),
      );
    }
  };
  const handleCancelEdit = () => {
    navigate(-1);
  };
  const handleSMSClick = () => {
    if (!savedSections.lab) {
      showError("Please save Lab details first");
      return;
    }
    setShowSMSDialog(true);
  };
  const formReset = useFormReset();
  const resetForm = () => {
    formReset.resetForm({
      setPartyForm,
      setPurchaseForm,
      setVehicleForm,
      setLabForm,
      setBillingForm,
      setSavedSections,
      setModifiedSections,
      setSavedVehicleData,
      setSavedLabData,
      setSavedPurchaseData,
      setSavedPartyData,
      setSavedBillingData,
      setCurrentPurchaseId,
      setUsingExistingParty,
      setSelectedExistingParty,
      mode,
      loadParties: () => loadParties(),
      showSuccess: (msg) => showSuccess(msg),
      partyNameRef,
      currentUser,
      companies,
      setSelectedCompany,
      parties,
    });
  };

  const allSectionsSaved = savedSections.purchase && savedSections.billing;

  const getUserCompanyName = () => {
    if (!currentUser || companies.length === 0) return "Select Company";
    if (selectedCompany) {
      const selected = companies.find(
        (c) => (c._id || c.id) === selectedCompany,
      );
      return selected ? selected.company_name : "Select Company";
    }
    return "Select Company";
  };

  const handlePartySelectFromDropdown = (partyName) => {
    const selectedParty = parties.find((p) => p.party_name === partyName);
    if (selectedParty) {
      setSelectedExistingParty(selectedParty);
      setUsingExistingParty(true);
      setPartyForm({
        party_name: selectedParty.party_name,
        address_line1: selectedParty.address_line1 || "",
        city: selectedParty.city || "",
        state: selectedParty.state || "",
        pin: selectedParty.pin || "",
        contact_person: selectedParty.contact_person || "",
        mobile_no: selectedParty.mobile_no || "",
        gst: selectedParty.gst || "",
        customer_type: selectedParty.customer_type || "Registered",
      });
      setSavedSections((prev) => ({ ...prev, party: true }));
      setModifiedSections((prev) => ({ ...prev, party: false }));
    }
  };

  // ======================
  // 6. RENDER
  // ======================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation Bar for Edit Mode */}
      {mode === "edit" && (
        <AppBar
          position="static"
          elevation={1}
          sx={{ bgcolor: "white", color: "text.primary" }}
        >
          <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton onClick={handleCancelEdit}>
                <ArrowBackIcon color="primary" />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, fontWeight: "bold" }}
              >
                Edit Form: {purchaseForm.invoice_no}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label="Edit Mode"
                color="warning"
                size="small"
                variant="outlined"
              />
              <IconButton
                color="primary"
                onClick={() => navigate("/home")}
                size="small"
              >
                <HomeIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Box
        sx={{
          flex: 1,
          bgcolor: "#f5f5f5",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            maxHeight: "100%",
            overflow: "auto",
          }}
        >
          {/* Title with Company Dropdown */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              fontWeight="bold"
              color="primary"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              {mode === "edit"
                ? "✏️ Edit Rice Bran Invoice Form"
                : "📋 Rice Bran Invoice Form"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 250,
              }}
            >
              <BusinessIcon color="primary" fontSize="small" />
              <FormControl fullWidth size="small" sx={styles.compactSelect}>
                <InputLabel>Company *</InputLabel>
                <Select
                  value={selectedCompany}
                  label="Company"
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  {companies.map((company) => (
                    <MenuItem key={company._id} value={company._id}>
                      {company.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box
                sx={{ display: "flex", alignItems: "center", height: "100%" }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenPartyModal(true)}
                  sx={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}
                >
                  + Add New Party
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Party and Purchase Details Side by Side */}
          <Grid container spacing={1} sx={styles.compactGrid}>
            {/* PURCHASE DETAILS - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={1}
                sx={{ borderRadius: 2, height: "100%", ...styles.compactCard }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleSection("purchase")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ bgcolor: "success.light", width: 28, height: 28 }}
                      >
                        <InventoryIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="bold">
                        1. Purchase Details
                      </Typography>
                      {savedSections.purchase && mode === "create" && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                      {mode === "edit" && modifiedSections.purchase && (
                        <Chip
                          label="Modified"
                          size="small"
                          color="warning"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedSections.purchase
                          ? "rotate(180deg)"
                          : "none",
                        transition: "0.3s",
                      }}
                    />
                  </Box>

                  <Collapse in={expandedSections.purchase}>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1} sx={styles.compactGrid}>
                      {/* <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={styles.compactSelect}
                        >
                          <InputLabel>Party Name</InputLabel>

                          <Select
                            value={purchaseForm.party_name}
                            label="Party Name"
                            onChange={(e) => {
                              const selectedPartyName = e.target.value;

                              // Update purchase form
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  party_name: selectedPartyName,
                                },
                              );

                              // Find and auto-fill party details
                              const selectedParty = parties.find(
                                (p) => p.party_name === selectedPartyName,
                              );
                              if (selectedParty) {
                                setUsingExistingParty(true);
                                setSelectedExistingParty(selectedParty);

                                // Auto-fill party form
                                setPartyForm({
                                  party_name: selectedParty.party_name,
                                  address_line1:
                                    selectedParty.address_line1 || "",
                                  city: selectedParty.city || "",
                                  state: selectedParty.state || "",
                                  pin: selectedParty.pin || "",
                                  contact_person:
                                    selectedParty.contact_person || "",
                                  mobile_no: selectedParty.mobile_no || "",
                                  gst: selectedParty.gst || "",
                                  customer_type:
                                    selectedParty.customer_type || "Registered",
                                });

                                // Mark party as saved
                                setSavedSections((prev) => ({
                                  ...prev,
                                  party: true,
                                }));
                                setModifiedSections((prev) => ({
                                  ...prev,
                                  party: false,
                                }));
                              }
                            }}
                          >
                            {parties.map((p) => (
                              <MenuItem key={p.id} value={p.party_name}>
                                {p.party_name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid> */}

                      {/* New Autocomplete Component */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                          freeSolo
                          value={purchaseForm.party_name}
                          onChange={(event, newValue) => {
                            // If user selects from dropdown
                            if (newValue && typeof newValue === "string") {
                              const selectedParty = parties.find(
                                (p) => p.party_name === newValue,
                              );

                              if (selectedParty) {
                                // Existing party selected from dropdown
                                updateFormWithTracking(
                                  setPurchaseForm,
                                  "purchase",
                                  {
                                    ...purchaseForm,
                                    party_name: newValue,
                                  },
                                );

                                setUsingExistingParty(true);
                                setSelectedExistingParty(selectedParty);

                                // Auto-fill party form
                                setPartyForm({
                                  party_name: selectedParty.party_name,
                                  address_line1:
                                    selectedParty.address_line1 || "",
                                  city: selectedParty.city || "",
                                  state: selectedParty.state || "",
                                  pin: selectedParty.pin || "",
                                  contact_person:
                                    selectedParty.contact_person || "",
                                  mobile_no: selectedParty.mobile_no || "",
                                  gst: selectedParty.gst || "",
                                  customer_type:
                                    selectedParty.customer_type || "Registered",
                                });

                                // Mark party as saved
                                setSavedSections((prev) => ({
                                  ...prev,
                                  party: true,
                                }));
                                setModifiedSections((prev) => ({
                                  ...prev,
                                  party: false,
                                }));
                              } else {
                                // User typed a new party name
                                updateFormWithTracking(
                                  setPurchaseForm,
                                  "purchase",
                                  {
                                    ...purchaseForm,
                                    party_name: newValue,
                                  },
                                );

                                // Reset party form for new entry
                                setUsingExistingParty(false);
                                setSelectedExistingParty(null);

                                setPartyForm({
                                  party_name: newValue,
                                  address_line1: "",
                                  city: "",
                                  state: "",
                                  pin: "",
                                  contact_person: "",
                                  mobile_no: "",
                                  gst: "",
                                  customer_type: "Registered",
                                });

                                // Mark party as unsaved
                                setSavedSections((prev) => ({
                                  ...prev,
                                  party: false,
                                }));
                                setModifiedSections((prev) => ({
                                  ...prev,
                                  party: false,
                                }));
                              }
                            } else if (newValue === null) {
                              // User cleared the field
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  party_name: "",
                                },
                              );
                              setUsingExistingParty(false);
                              setSelectedExistingParty(null);
                            }
                          }}
                          onInputChange={(event, newInputValue) => {
                            // Update as user types
                            updateFormWithTracking(
                              setPurchaseForm,
                              "purchase",
                              {
                                ...purchaseForm,
                                party_name: newInputValue,
                              },
                            );

                            // Check if typed value matches existing party
                            const matchingParty = parties.find(
                              (p) =>
                                p.party_name.toLowerCase() ===
                                newInputValue.toLowerCase(),
                            );

                            if (matchingParty && newInputValue.trim() !== "") {
                              setUsingExistingParty(true);
                              setSelectedExistingParty(matchingParty);

                              // Auto-fill party form
                              setPartyForm({
                                party_name: matchingParty.party_name,
                                address_line1:
                                  matchingParty.address_line1 || "",
                                city: matchingParty.city || "",
                                state: matchingParty.state || "",
                                pin: matchingParty.pin || "",
                                contact_person:
                                  matchingParty.contact_person || "",
                                mobile_no: matchingParty.mobile_no || "",
                                gst: matchingParty.gst || "",
                                customer_type:
                                  matchingParty.customer_type || "Registered",
                              });

                              setSavedSections((prev) => ({
                                ...prev,
                                party: true,
                              }));
                            } else if (newInputValue.trim() !== "") {
                              // User typing new party
                              setUsingExistingParty(false);
                              setSelectedExistingParty(null);

                              // Set party name but keep other fields empty
                              setPartyForm({
                                party_name: newInputValue,
                                address_line1: "",
                                city: "",
                                state: "",
                                pin: "",
                                contact_person: "",
                                mobile_no: "",
                                gst: "",
                                customer_type: "Registered",
                              });

                              setSavedSections((prev) => ({
                                ...prev,
                                party: false,
                              }));
                            }
                          }}
                          options={parties.map((p) => p.party_name)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={styles.compactField}
                              label="Party Name *"
                              placeholder="Type or select party"
                              fullWidth
                              InputProps={{
                                ...params.InputProps,
                                style: { padding: 0, height: "32px" },
                              }}
                              inputProps={{
                                ...params.inputProps,
                                style: {
                                  fontSize: "13px",
                                  padding: "6px 12px",
                                },
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <li {...props} style={{ fontSize: "13px" }}>
                              {option}
                            </li>
                          )}
                          noOptionsText="No matching parties found"
                          filterOptions={(options, state) => {
                            const inputValue = state.inputValue.toLowerCase();
                            return options.filter((option) =>
                              option.toLowerCase().includes(inputValue),
                            );
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Invoice No *"
                          value={purchaseForm.invoice_no}
                          onChange={(e) =>
                            updateFormWithTracking(
                              setPurchaseForm,
                              "purchase",
                              {
                                ...purchaseForm,
                                invoice_no: e.target.value,
                              },
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, purchaseDateRef)}
                          inputRef={invoiceNoRef}
                          fullWidth
                        />
                      </Grid>
                      {/* Date Fields */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Invoice Date *"
                          type="date"
                          value={purchaseForm.date}
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) =>
                            updateFormWithTracking(
                              setPurchaseForm,
                              "purchase",
                              {
                                ...purchaseForm,
                                date: e.target.value,
                              },
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, receivedDateRef)}
                          inputRef={purchaseDateRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Received Date"
                          type="date"
                          value={purchaseForm.received_date}
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) =>
                            updateFormWithTracking(
                              setPurchaseForm,
                              "purchase",
                              {
                                ...purchaseForm,
                                received_date: e.target.value,
                              },
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, contractedRateRef)}
                          inputRef={receivedDateRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={styles.compactSelect}
                        >
                          <InputLabel>Product Name</InputLabel>
                          <Select
                            value={purchaseForm.product_name}
                            label="Product Name"
                            onChange={(e) =>
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  product_name: e.target.value,
                                },
                              )
                            }
                          >
                            <MenuItem value="Boiled Rice Bran">
                              Boiled Rice Bran
                            </MenuItem>
                            <MenuItem value="Raw Rice Bran">
                              Raw Rice Bran
                            </MenuItem>
                            <MenuItem value="Rough Rice Bran">
                              Rough Rice Bran
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Contracted Rate (₹)"
                          type="number"
                          value={purchaseForm.contracted_rate}
                          onChange={(e) => {
                            const newRate = e.target.value;
                            // Allow up to 2 decimal places
                            if (
                              newRate === "" ||
                              /^\d*\.?\d{0,2}$/.test(newRate)
                            ) {
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  contracted_rate: newRate,
                                },
                              );

                              // Auto-calculate oil rebate/premium when rate changes
                              if (labForm.obtain_oil) {
                                const netWeight =
                                  parseFloat(purchaseForm.net_weight_mt) || 0;
                                const oilCalc = calculateOilRebatePremium(
                                  purchaseForm.product_name,
                                  labForm.obtain_oil,
                                  newRate,
                                  netWeight,
                                );
                                updateFormWithTracking(
                                  setLabForm,
                                  "lab",
                                  (prev) => ({
                                    ...prev,
                                    oil_rebate_rs:
                                      oilCalc.rebate > 0
                                        ? oilCalc.rebate.toFixed(2)
                                        : "",
                                    oil_premium_rs:
                                      oilCalc.premium > 0
                                        ? oilCalc.premium.toFixed(2)
                                        : "",
                                  }),
                                );
                              }
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            ),
                            inputProps: {
                              min: "0",
                              step: "0.01", // Allows 2 decimal places
                            },
                          }}
                          onKeyDown={(e) => handleKeyDown(e, grossWeightRef)}
                          inputRef={contractedRateRef}
                          fullWidth
                        />
                      </Grid>
                      {purchaseForm.bran_type === "Red" && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="Final Contracted Rate (₹)"
                            type="number"
                            value={purchaseForm.final_contracted_rate}
                            onChange={(e) => {
                              const finalRate = e.target.value;
                              // Allow up to 2 decimal places
                              if (
                                finalRate === "" ||
                                /^\d*\.?\d{0,2}$/.test(finalRate)
                              ) {
                                updateFormWithTracking(
                                  setPurchaseForm,
                                  "purchase",
                                  {
                                    ...purchaseForm,
                                    final_contracted_rate: finalRate,
                                  },
                                );
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                              inputProps: {
                                min: "0",
                                step: "0.01",
                              },
                            }}
                            fullWidth
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Billed Weight (MT)"
                          type="number"
                          value={purchaseForm.billed_weight_mt}
                          onChange={(e) => {
                            const billedWeight = e.target.value;
                            updateFormWithTracking(
                              setPurchaseForm,
                              "purchase",
                              {
                                ...purchaseForm,
                                billed_weight_mt: billedWeight,
                              },
                            );
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Actual Weight (MT)"
                          type="number"
                          value={purchaseForm.gross_weight_mt}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow up to 3 decimal places
                            if (value === "" || /^\d*\.?\d{0,3}$/.test(value)) {
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  gross_weight_mt: value,
                                },
                              );
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, noOfBagsRef)}
                          inputRef={grossWeightRef}
                          fullWidth
                          InputProps={{
                            inputProps: {
                              min: "0",
                              step: "0.001", // Allows 3 decimal places
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="No. of Bags"
                          type="number"
                          value={purchaseForm.no_of_bags}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only integers (no decimals)
                            if (value === "" || /^\d+$/.test(value)) {
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  no_of_bags: value,
                                },
                              );
                            }
                          }}
                          onKeyDown={(e) => handleKeyDown(e, vehicleNoRef)}
                          inputRef={noOfBagsRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={styles.compactSelect}
                        >
                          <InputLabel>Type of Bags</InputLabel>
                          <Select
                            value={purchaseForm.bag_type}
                            label="Type of Bags"
                            onChange={(e) =>
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  bag_type: e.target.value,
                                },
                              )
                            }
                          >
                            <MenuItem value="Poly">Poly Bags</MenuItem>
                            <MenuItem value="Jute">Jute Bags</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Bag Weight (MT)"
                          value={purchaseForm.bag_weight_mt}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {/* <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Net Weight (MT)"
                          value={purchaseForm.net_weight_mt}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        /> */}

                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Net Weight (MT)"
                          value={
                            purchaseForm.net_weight_mt >= 0
                              ? truncateToThreeDecimals(
                                  purchaseForm.net_weight_mt,
                                )
                              : "0.000"
                          }
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FormControl sx={styles.compactRadio}>
                          <RadioGroup
                            row
                            value={purchaseForm.bran_type}
                            onChange={(e) =>
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  bran_type: e.target.value,
                                },
                              )
                            }
                          >
                            <FormControlLabel
                              value="Good"
                              control={<Radio size="small" />}
                              label="Good Bran"
                            />
                            <FormControlLabel
                              value="Red"
                              control={<Radio size="small" />}
                              label="Red Bran(500)"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FormControl sx={styles.compactRadio}>
                          <RadioGroup
                            row
                            value={purchaseForm.purchased_from}
                            onChange={(e) =>
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  purchased_from: e.target.value,
                                },
                              )
                            }
                          >
                            <FormControlLabel
                              value="Party"
                              control={<Radio size="small" />}
                              label="Purchased from Party"
                            />
                            <FormControlLabel
                              value="Agent"
                              control={<Radio size="small" />}
                              label="Purchased through Agent"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      {purchaseForm.purchased_from === "Agent" && (
                        <Grid container spacing={1} sx={styles.compactGrid}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Agent Name"
                              value={purchaseForm.agent_name}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setPurchaseForm,
                                  "purchase",
                                  {
                                    ...purchaseForm,
                                    agent_name: toTitleCase(e.target.value),
                                  },
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(e, agentMobileRef)
                              }
                              inputRef={agentNameRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Agent Mobile No"
                              value={purchaseForm.agent_number}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^\d{0,10}$/.test(value)) {
                                  updateFormWithTracking(
                                    setPurchaseForm,
                                    "purchase",
                                    {
                                      ...purchaseForm,
                                      agent_number: value,
                                    },
                                  );
                                }
                              }}
                              inputProps={{ maxLength: 10 }}
                              type="tel"
                              helperText="10 digits only"
                              onKeyDown={(e) => handleKeyDown(e, null)}
                              inputRef={agentMobileRef}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: "right", mt: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSavePurchase}
                            disabled={
                              mode === "create"
                                ? savedSections.purchase
                                : !modifiedSections.purchase
                            }
                            sx={{
                              ...styles.compactButton,
                              bgcolor: "success.main",
                            }}
                          >
                            {mode === "create"
                              ? savedSections.purchase
                                ? "Saved"
                                : "Save Purchase"
                              : modifiedSections.purchase
                                ? "Save Changes"
                                : "Saved"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            {/* VEHICLE DETAILS - Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={1}
                sx={{ borderRadius: 2, height: "100%", ...styles.compactCard }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleSection("vehicle")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ bgcolor: "info.light", width: 28, height: 28 }}
                      >
                        <LocalShippingIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="bold">
                        2. Vehicle Details
                      </Typography>
                      {savedSections.vehicle && mode === "create" && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                      {mode === "edit" && modifiedSections.vehicle && (
                        <Chip
                          label="Modified"
                          size="small"
                          color="warning"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedSections.vehicle
                          ? "rotate(180deg)"
                          : "none",
                        transition: "0.3s",
                      }}
                    />
                  </Box>

                  <Collapse in={expandedSections.vehicle}>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1} sx={styles.compactGrid}>
                      {/* Radio button for Paid By - Should always be visible */}
                      <Grid size={{ xs: 12 }}>
                        <FormControl sx={styles.compactRadio}>
                          <RadioGroup
                            row
                            value={vehicleForm.paid_by}
                            onChange={(e) =>
                              updateFormWithTracking(
                                setVehicleForm,
                                "vehicle",
                                {
                                  ...vehicleForm,
                                  paid_by: e.target.value,
                                },
                              )
                            }
                          >
                            <FormControlLabel
                              value="Buyer"
                              control={<Radio size="small" />}
                              label="Paid by Buyer"
                            />
                            <FormControlLabel
                              value="Seller"
                              control={<Radio size="small" />}
                              label="Paid by Seller"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>

                      {/* Vehicle No - Always visible */}
                      <Grid
                        size={{
                          xs: 12,
                          sm: vehicleForm.paid_by === "Seller" ? 12 : 6,
                        }}
                      >
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Vehicle No *"
                          value={vehicleForm.vehicle_no}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              vehicle_no: value,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (vehicleForm.paid_by === "Buyer") {
                              handleKeyDown(e, ownerNameRef);
                            } else {
                              handleKeyDown(e, null);
                            }
                          }}
                          inputRef={vehicleNoRef}
                          fullWidth
                          inputProps={{
                            style: { textTransform: "uppercase" },
                          }}
                        />
                      </Grid>

                      {/* Show all other fields ONLY when Paid by Buyer */}
                      {vehicleForm.paid_by === "Buyer" && (
                        <>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Owner Name"
                              value={vehicleForm.owner_name}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    owner_name: toTitleCase(e.target.value),
                                  },
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(e, ownerMobileRef)
                              }
                              inputRef={ownerNameRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Owner Mobile No"
                              value={vehicleForm.mobile_no}
                              onChange={(e) =>
                                handleMobileChange(e, "vehicle", setVehicleForm)
                              }
                              inputProps={{ maxLength: 10 }}
                              type="tel"
                              onKeyDown={(e) => handleKeyDown(e, riceMillRef)}
                              inputRef={ownerMobileRef}
                              fullWidth
                            />
                          </Grid>

                          {/* Rice Mill Name - Auto-filled from Party Name but editable */}
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Rice Mill Name"
                              value={
                                vehicleForm.rice_mill_name ||
                                purchaseForm.party_name
                              }
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    rice_mill_name: e.target.value,
                                  },
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, destFromRef)}
                              inputRef={riceMillRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Destination From"
                              value={vehicleForm.destination_from}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    destination_from: e.target.value,
                                  },
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, destToRef)}
                              inputRef={destFromRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Destination To"
                              value={vehicleForm.destination_to}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    destination_to: e.target.value,
                                  },
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, quantityMtRef)}
                              inputRef={destToRef}
                              fullWidth
                            />
                          </Grid>

                          {/* Vehicle Quantity - Auto-filled from Actual Weight */}
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Quantity (MT) *"
                              type="number"
                              value={vehicleForm.quantity_mt}
                              onChange={(e) => {
                                const quantity = e.target.value;
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    quantity_mt: quantity,
                                  },
                                );
                              }}
                              onKeyDown={(e) => handleKeyDown(e, freightMtRef)}
                              inputRef={quantityMtRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Freight/MT (₹)"
                              type="number"
                              value={vehicleForm.freight_per_mt}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === "" ||
                                  /^\d*\.?\d{0,2}$/.test(value)
                                ) {
                                  updateFormWithTracking(
                                    setVehicleForm,
                                    "vehicle",
                                    {
                                      ...vehicleForm,
                                      freight_per_mt: value,
                                    },
                                  );
                                }
                              }}
                              onKeyDown={(e) => handleKeyDown(e, advanceAmtRef)}
                              inputRef={freightMtRef}
                              fullWidth
                              InputProps={{
                                inputProps: {
                                  min: "0",
                                  step: "0.01",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Advance Amount (₹)"
                              type="number"
                              value={vehicleForm.advance_amount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === "" ||
                                  /^\d*\.?\d{0,2}$/.test(value)
                                ) {
                                  updateFormWithTracking(
                                    setVehicleForm,
                                    "vehicle",
                                    {
                                      ...vehicleForm,
                                      advance_amount: value,
                                    },
                                  );
                                }
                              }}
                              onKeyDown={(e) => handleKeyDown(e, bankAccRef)}
                              inputRef={advanceAmtRef}
                              fullWidth
                              InputProps={{
                                inputProps: {
                                  min: "0",
                                  step: "0.01",
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Balance to Pay (₹)"
                              value={toPay.toFixed(2)}
                              InputProps={{ readOnly: true }}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Bank Account Number"
                              value={vehicleForm.bank_account}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    bank_account: e.target.value,
                                  },
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, bankNameRef)}
                              inputRef={bankAccRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Bank Name"
                              value={vehicleForm.bank_name}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    bank_name: toTitleCase(e.target.value),
                                  },
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, ifscRef)}
                              inputRef={bankNameRef}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="IFSC Code"
                              value={vehicleForm.ifsc}
                              onChange={(e) => {
                                const value = e.target.value
                                  .toUpperCase()
                                  .replace(/[^A-Z0-9]/g, "");
                                updateFormWithTracking(
                                  setVehicleForm,
                                  "vehicle",
                                  {
                                    ...vehicleForm,
                                    ifsc: value,
                                  },
                                );
                              }}
                              onKeyDown={(e) => handleKeyDown(e, null)}
                              inputRef={ifscRef}
                              fullWidth
                              inputProps={{
                                style: { textTransform: "uppercase" },
                                maxLength: 50,
                              }}
                              helperText="e.g., SBIN0001234"
                            />
                          </Grid>
                        </>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: "right", mt: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveVehicle}
                            disabled={
                              mode === "create"
                                ? savedSections.vehicle || !currentPurchaseId
                                : !modifiedSections.vehicle
                            }
                            sx={{
                              ...styles.compactButton,
                              bgcolor: "info.main",
                            }}
                          >
                            {mode === "create"
                              ? savedSections.vehicle
                                ? "Saved"
                                : "Save Vehicle"
                              : modifiedSections.vehicle
                                ? "Save Changes"
                                : "Saved"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Vehicle and Lab Details Side by Side */}
          <Grid container spacing={1} sx={styles.compactGrid}>
            {/* LABORATORY DETAILS - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={1}
                sx={{ borderRadius: 2, height: "100%", ...styles.compactCard }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.5,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleSection("lab")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: "secondary.light",
                          width: 28,
                          height: 28,
                        }}
                      >
                        <ScienceIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="bold">
                        3. Laboratory Details
                      </Typography>
                      {savedSections.lab && mode === "create" && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                      {mode === "edit" && modifiedSections.lab && (
                        <Chip
                          label="Modified"
                          size="small"
                          color="warning"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedSections.lab
                          ? "rotate(180deg)"
                          : "none",
                        transition: "0.3s",
                      }}
                    />
                  </Box>
                  <Collapse in={expandedSections.lab}>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1} sx={styles.compactGrid}>
                      {/* FFA Analysis Column */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="primary"
                            gutterBottom
                          >
                            FFA Analysis
                          </Typography>
                          <TextField
                            size="small"
                            sx={[styles.compactField, { mb: 1 }]}
                            label="Standard FFA"
                            value={labForm.standard_ffa}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={[styles.compactField, { mb: 1 }]}
                            label="Obtained FFA"
                            type="number"
                            value={labForm.obtain_ffa}
                            onChange={(e) => {
                              const ffaValue = e.target.value;
                              const product =
                                purchaseForm.product_name || "Boiled Rice Bran";
                              const rebate = calculateFFARebate(
                                product,
                                ffaValue,
                              );
                              updateFormWithTracking(setLabForm, "lab", {
                                ...labForm,
                                obtain_ffa: ffaValue,
                                ffa_rebate_rs:
                                  rebate > 0 ? rebate.toFixed(2) : "",
                              });
                            }}
                            onKeyDown={(e) => handleKeyDown(e, ffaPremiumRef)}
                            inputRef={obtainFfaRef}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={[styles.compactField, { mb: 1 }]}
                            label="Rebate Amount (₹)"
                            value={labForm.ffa_rebate_rs}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="Premium Amount (₹)"
                            type="number"
                            value={labForm.ffa_premium_rs}
                            onChange={(e) =>
                              updateFormWithTracking(setLabForm, "lab", {
                                ...labForm,
                                ffa_premium_rs: e.target.value,
                              })
                            }
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            onKeyDown={(e) => handleKeyDown(e, obtainOilRef)}
                            inputRef={ffaPremiumRef}
                            fullWidth
                          />
                        </Box>
                      </Grid>

                      {/* Oil Analysis Column (AUTO-CALCULATING) */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="primary"
                            gutterBottom
                          >
                            Oil Analysis
                          </Typography>
                          <TextField
                            size="small"
                            sx={[styles.compactField, { mb: 1 }]}
                            label="Standard Oil"
                            value={labForm.standard_oil}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={[styles.compactField, { mb: 1 }]}
                            label="Obtained Oil"
                            type="number"
                            value={labForm.obtain_oil}
                            onChange={(e) =>
                              updateFormWithTracking(
                                setLabForm,
                                "lab",
                                (prev) => ({
                                  ...prev,
                                  obtain_oil: e.target.value,
                                }),
                              )
                            }
                            onKeyDown={(e) => handleKeyDown(e, oilRebateRef)}
                            inputRef={obtainOilRef}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={[styles.compactField, { mb: 1 }]}
                            label="Rebate Amount (₹)"
                            value={labForm.oil_rebate_rs}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="Premium Amount (₹)"
                            value={labForm.oil_premium_rs}
                            InputProps={{
                              readOnly: true,
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            fullWidth
                          />
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 1,
                          }}
                        >
                          <Button
                            variant="outlined"
                            startIcon={<SmsIcon />}
                            onClick={() => setShowSMSDialog(true)}
                            disabled={!savedSections.lab}
                            sx={{
                              ...styles.compactButton,
                              color: "info.main",
                              borderColor: "info.main",
                            }}
                          >
                            Send SMS
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveLab}
                            disabled={
                              mode === "create"
                                ? savedSections.lab || !currentPurchaseId
                                : !modifiedSections.lab
                            }
                            sx={{
                              ...styles.compactButton,
                              bgcolor: "secondary.main",
                            }}
                          >
                            {mode === "create"
                              ? savedSections.lab
                                ? "Saved"
                                : "Save Lab"
                              : modifiedSections.lab
                                ? "Save Changes"
                                : "Saved"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* BILLING DETAILS Row */}
              <Card
                elevation={1}
                sx={{ borderRadius: 2, ...styles.compactCard }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleSection("billing")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ bgcolor: "error.light", width: 28, height: 28 }}
                      >
                        <AttachMoneyIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="bold">
                        4. Billing Details
                      </Typography>
                      {savedSections.billing && mode === "create" && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                      {mode === "edit" && modifiedSections.billing && (
                        <Chip
                          label="Modified"
                          size="small"
                          color="warning"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedSections.billing
                          ? "rotate(180deg)"
                          : "none",
                        transition: "0.3s",
                      }}
                    />
                  </Box>

                  <Collapse in={expandedSections.billing}>
                    <Divider sx={{ my: 1 }} />

                    {/* Billing Calculation Display */}
                    <Grid container spacing={1} sx={styles.compactGrid}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Account Rate (₹)"
                          value={calculateAccountRate().toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Net Rate (₹)"
                          value={calculateNetRate().toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Material Amount (₹)"
                          value={calculateMaterialAmount().toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Gross Amount (₹)"
                          value={calculateGrossAmount().toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      {/* // In the billing section where GST type is shown: */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <FormControl sx={styles.compactRadio}>
                            <RadioGroup
                              row
                              value={billingForm.gst_type}
                              onChange={(e) =>
                                updateFormWithTracking(
                                  setBillingForm,
                                  "billing",
                                  {
                                    ...billingForm,
                                    gst_type: e.target.value,
                                  },
                                )
                              }
                            >
                              <FormControlLabel
                                value="Intra"
                                control={<Radio size="small" />}
                                label="Intra State"
                              />
                              <FormControlLabel
                                value="Inter"
                                control={<Radio size="small" />}
                                label="Inter State"
                              />
                            </RadioGroup>
                          </FormControl>
                        </Box>
                      </Grid>
                      {/* GST Fields */}
                      {billingForm.gst_type === "Intra" && (
                        <>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="CGST (2.5%)"
                              value={calculateGST().cgst.toFixed(2)}
                              InputProps={{ readOnly: true }}
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="SGST (2.5%)"
                              value={calculateGST().sgst.toFixed(2)}
                              InputProps={{ readOnly: true }}
                              fullWidth
                            />
                          </Grid>
                        </>
                      )}
                      {billingForm.gst_type === "Inter" && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="IGST (5%)"
                            value={calculateGST().igst.toFixed(2)}
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Billed Amount (₹)"
                          value={calculateBilledAmount().toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Invoice Amount (₹)"
                          type="number"
                          value={billingForm.invoice_amount}
                          onChange={(e) =>
                            updateFormWithTracking(setBillingForm, "billing", {
                              ...billingForm,
                              invoice_amount: e.target.value,
                            })
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, null, handleSaveBilling)
                          }
                          inputRef={invoiceAmountRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Amount Payable (₹)"
                          value={calculateAmountPayable().toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid
                        size={{ xs: 12 }}
                        sx={{ textAlign: "right", mt: 1 }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveBilling}
                          disabled={
                            mode === "create"
                              ? savedSections.billing || !currentPurchaseId
                              : !modifiedSections.billing
                          }
                          sx={{
                            ...styles.compactButton,
                            bgcolor: "error.main",
                          }}
                        >
                          {mode === "create"
                            ? savedSections.billing
                              ? "Saved"
                              : "Save Billing"
                            : modifiedSections.billing
                              ? "Save Changes"
                              : "Saved"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {mode === "edit" ? (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  sx={styles.compactButton}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    saving ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  onClick={handleSaveAll}
                  disabled={saving}
                  sx={{
                    ...styles.compactButton,
                    bgcolor: "primary.main",
                    minWidth: "150px",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="outlined"
                onClick={resetForm}
                sx={{
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  textTransform: "none",
                  borderRadius: "4px",
                  height: "36px",
                  minWidth: "120px",
                  borderColor: "#95a5a6",
                  color: "#7f8c8d",
                  "&:hover": {
                    borderColor: "#7f8c8d",
                    backgroundColor: "rgba(127, 140, 141, 0.04)",
                  },
                }}
              >
                Reset Form
              </Button>
              {/* Generate Invoice Button */}
              {/* {allSectionsSaved && ( */}
              {canGenerateInvoice() && (
                // <Button
                //   variant="contained"
                //   startIcon={<ReceiptIcon />}
                //   onClick={handleGenerateInvoice}
                //   sx={{
                //     padding: "6px 20px",
                //     fontSize: "13px",
                //     fontWeight: "600",
                //     textTransform: "none",
                //     borderRadius: "4px",
                //     height: "36px",
                //     minWidth: "180px",
                //     bgcolor: "#ff6b6b",
                //     background:
                //       "linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%)",
                //     "&:hover": { bgcolor: "#ff5252" },
                //     boxShadow: "0 2px 4px 1px rgba(255, 105, 135, .2)",
                //     "& .MuiButton-startIcon": {
                //       marginRight: "6px",
                //       "& > *:first-of-type": {
                //         fontSize: "18px",
                //       },
                //     },
                //   }}
                // >
                //   Generate Final Invoice
                // </Button>
                // Replace your current Generate Invoice button with this:
                <Button
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  onClick={handleGenerateInvoice}
                  disabled={!canGenerateInvoice()}
                  sx={{
                    padding: "6px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "none",
                    borderRadius: "4px",
                    height: "36px",
                    minWidth: "180px",
                    bgcolor: !selectedCompany ? "#bdc3c7" : "#ff6b6b",
                    background: !selectedCompany
                      ? "linear-gradient(45deg, #bdc3c7 30%, #95a5a6 90%)"
                      : "linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%)",
                    "&:hover": {
                      bgcolor: !selectedCompany ? "#bdc3c7" : "#ff5252",
                    },
                    boxShadow: !selectedCompany
                      ? "none"
                      : "0 2px 4px 1px rgba(255, 105, 135, .2)",
                    cursor: !selectedCompany ? "not-allowed" : "pointer",
                    "& .MuiButton-startIcon": {
                      marginRight: "6px",
                      "& > *:first-of-type": {
                        fontSize: "18px",
                      },
                    },
                  }}
                >
                  {!selectedCompany
                    ? "Select Company First"
                    : "Generate Final Invoice"}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Dialogs */}
      <PrintVehicleSlip
        open={showVehicleSlip}
        onClose={() => setShowVehicleSlip(false)}
        vehicleData={savedVehicleData || vehicleForm}
        purchaseData={savedPurchaseData || purchaseForm}
        companyData={companies.find((c) => (c._id || c.id) === selectedCompany)}
      />

      <SMSDialog
        open={showSMSDialog}
        onClose={() => setShowSMSDialog(false)}
        labData={savedLabData || labForm}
        purchaseData={{
          // Merge saved purchase data with current form data
          ...(savedPurchaseData || {}),
          // Ensure these specific fields are included
          invoice_no: purchaseForm.invoice_no,
          date: purchaseForm.date,
          gross_weight_mt: purchaseForm.gross_weight_mt,
          contracted_rate: purchaseForm.contracted_rate,
          // THESE ARE THE CRITICAL FIELDS:
          no_of_bags: purchaseForm.no_of_bags, // Make sure this exists
          bag_type: purchaseForm.bag_type, // Make sure this exists
          product_name: purchaseForm.product_name,
          // Also include net weight if available
          // net_weight_mt: purchaseForm.net_weight_mt,
          net_weight_mt: truncateToThreeDecimals(
            parseFloat(purchaseForm.net_weight_mt),
          ),
        }}
        partyData={parties.find(
          (p) =>
            p.party_name ===
            (savedPurchaseData?.party_name || purchaseForm.party_name),
        )}
        agentData={{
          agent_name: savedPurchaseData?.agent_name || purchaseForm.agent_name,
          agent_number:
            savedPurchaseData?.agent_number || purchaseForm.agent_number,
        }}
        vehicleData={savedVehicleData || vehicleForm}
        companyData={companies.find((c) => (c._id || c.id) === selectedCompany)}
      />

      <InvoicePreview
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        onAfterPrint={resetForm}
        invoiceData={generatedInvoice}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%", fontSize: "13px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Party Modal */}
      <Dialog
        open={openPartyModal}
        onClose={() => setOpenPartyModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Party</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Party Name"
                sx={styles.compactField}
                value={modalPartyForm.party_name}
                onChange={(e) =>
                  setModalPartyForm((prev) => ({
                    ...prev,
                    party_name: toTitleCase(e.target.value),
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Focus on Contact Person field
                    if (contactPersonRef.current) {
                      contactPersonRef.current.focus();
                    }
                  }
                }}
                inputRef={partyNameRef}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contact Person"
                sx={styles.compactField}
                value={modalPartyForm.contact_person}
                onChange={(e) =>
                  setModalPartyForm((prev) => ({
                    ...prev,
                    contact_person: toTitleCase(e.target.value),
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Focus on Mobile No field
                    if (partyMobileRef.current) {
                      partyMobileRef.current.focus();
                    }
                  }
                }}
                inputRef={contactPersonRef}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mobile No"
                sx={styles.compactField}
                value={modalPartyForm.mobile_no}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,10}$/.test(val)) {
                    setModalPartyForm((prev) => ({ ...prev, mobile_no: val }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Focus on Address field
                    if (partyAddressRef.current) {
                      partyAddressRef.current.focus();
                    }
                  }
                }}
                inputRef={partyMobileRef}
                inputProps={{ maxLength: 10 }}
                type="tel"
                helperText="10 digits only"
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Address"
                sx={styles.compactField}
                value={modalPartyForm.address_line1}
                onChange={(e) =>
                  setModalPartyForm((prev) => ({
                    ...prev,
                    address_line1: toTitleCase(e.target.value),
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Focus on City field
                    if (partyCityRef.current) {
                      partyCityRef.current.focus();
                    }
                  }
                }}
                inputRef={partyAddressRef}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                sx={styles.compactField}
                value={modalPartyForm.city}
                onChange={(e) =>
                  setModalPartyForm((prev) => ({
                    ...prev,
                    city: toTitleCase(e.target.value),
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Focus on State field
                    if (partyStateRef.current) {
                      partyStateRef.current.focus();
                    }
                  }
                }}
                inputRef={partyCityRef}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="State"
                sx={styles.compactField}
                value={modalPartyForm.state}
                onChange={(e) =>
                  setModalPartyForm((prev) => ({
                    ...prev,
                    state: toTitleCase(e.target.value),
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // Focus on Pin Code field
                    if (partyPinRef.current) {
                      partyPinRef.current.focus();
                    }
                  }
                }}
                inputRef={partyStateRef}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Pin Code"
                sx={styles.compactField}
                value={modalPartyForm.pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,6}$/.test(val)) {
                    setModalPartyForm((prev) => ({ ...prev, pin: val }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // If customer type is Registered, focus on GST field
                    if (modalPartyForm.customer_type === "Registered") {
                      if (partyGstRef.current) {
                        partyGstRef.current.focus();
                      }
                    } else {
                      // Otherwise focus on Save button
                      const saveButton =
                        document.querySelector(".save-party-button");
                      if (saveButton) {
                        saveButton.focus();
                      }
                    }
                  }
                }}
                inputRef={partyPinRef}
                inputProps={{ maxLength: 6 }}
                fullWidth
              />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={modalPartyForm.customer_type}
                  label="Customer Type"
                  sx={styles.compactField}
                  onChange={(e) =>
                    setModalPartyForm((prev) => ({
                      ...prev,
                      customer_type: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="Registered">Registered</MenuItem>
                  <MenuItem value="Unregistered">Unregistered</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {modalPartyForm.customer_type === "Registered" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="GST"
                  sx={styles.compactField}
                  value={modalPartyForm.gst}
                  onChange={(e) =>
                    setModalPartyForm((prev) => ({
                      ...prev,
                      gst: e.target.value.toUpperCase(),
                    }))
                  }
                  inputProps={{ maxLength: 15 }}
                  fullWidth
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPartyModal(false)}>Cancel</Button>
          <Button
            onClick={handleSavePartyInModal}
            variant="contained"
            disabled={
              !modalPartyForm.party_name.trim() || !modalPartyForm.mobile_no
            }
          >
            Save Party
          </Button> */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={modalPartyForm.customer_type}
                  label="Customer Type"
                  sx={styles.compactField}
                  onChange={(e) =>
                    setModalPartyForm((prev) => ({
                      ...prev,
                      customer_type: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Focus on next field based on customer type
                      if (modalPartyForm.customer_type === "Registered") {
                        if (partyGstRef.current) {
                          partyGstRef.current.focus();
                        }
                      } else {
                        // Focus on Save button for Unregistered
                        const saveButton =
                          document.querySelector(".save-party-button");
                        if (saveButton) {
                          saveButton.focus();
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="Registered">Registered</MenuItem>
                  <MenuItem value="Unregistered">Unregistered</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* GST (only for Registered customers) */}
            {modalPartyForm.customer_type === "Registered" && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="GST"
                  sx={styles.compactField}
                  value={modalPartyForm.gst}
                  onChange={(e) =>
                    setModalPartyForm((prev) => ({
                      ...prev,
                      gst: e.target.value.toUpperCase(),
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Focus on Save button
                      const saveButton =
                        document.querySelector(".save-party-button");
                      if (saveButton) {
                        saveButton.focus();
                      }
                    }
                  }}
                  inputRef={partyGstRef}
                  inputProps={{ maxLength: 15 }}
                  fullWidth
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPartyModal(false)}>Cancel</Button>
          <Button
            onClick={handleSavePartyInModal}
            variant="contained"
            disabled={
              !modalPartyForm.party_name.trim() || !modalPartyForm.mobile_no
            }
            className="save-party-button"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSavePartyInModal();
              }
            }}
          >
            Save Party
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
