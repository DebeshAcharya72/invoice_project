// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFormReset from "../hooks/useFormReset";
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
  const { purchaseId } = useParams(); // Get purchaseId from URL if editing
  const navigate = useNavigate();
  const [mode, setMode] = useState(purchaseId ? "edit" : "create"); // "create" or "edit"
  const [loading, setLoading] = useState(purchaseId ? true : false);
  const [saving, setSaving] = useState(false);
  const receivedDateRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add this state to track if we're using existing party
  const [usingExistingParty, setUsingExistingParty] = useState(false);
  const [selectedExistingParty, setSelectedExistingParty] = useState(null);

  // Add this function to handle party dropdown selection
  const handlePartySelectFromDropdown = (partyName) => {
    const selectedParty = parties.find((p) => p.party_name === partyName);
    if (selectedParty) {
      setSelectedExistingParty(selectedParty);
      setUsingExistingParty(true);

      // Auto-fill party form with selected party data
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

      // Mark party section as saved (since we're using existing)
      setSavedSections((prev) => ({ ...prev, party: true }));
      setModifiedSections((prev) => ({ ...prev, party: false }));
    }
  };

  // Add these helper functions after your calculation functions

  // Helper function to round to 2 decimal places (for prices)
  const roundToTwoDecimals = (num) => {
    return Math.round(parseFloat(num || 0) * 100) / 100;
  };

  // Helper function to round to 3 decimal places (for weights)
  const roundToThreeDecimals = (num) => {
    return Math.round(parseFloat(num || 0) * 1000) / 1000;
  };

  // Helper function to format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0.00";
    const rounded = roundToTwoDecimals(amount);
    return rounded.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper function to format weight for display
  const formatWeight = (weight) => {
    if (weight === undefined || weight === null || isNaN(weight))
      return "0.000";
    const rounded = roundToThreeDecimals(weight);
    return rounded.toLocaleString("en-IN", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  // ============ CALCULATION FUNCTIONS ============

  const validateGSTFormat = (gst) => {
    if (!gst) return true;
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  // 1. FFA Rebate Calculation (Keeping your logic intact)
  const calculateFFARebate = (product, ffa) => {
    const ffaValue = parseFloat(ffa) || 0;
    let rebate = 0;

    if (product === "Boiled Rice Bran") {
      // Handle flat deductions for high FFA
      if (ffaValue > 45) {
        rebate = 4000;
      } else if (ffaValue > 30) {
        rebate = 3500;
      } else if (ffaValue > 25) {
        rebate = 2500;
      } else if (ffaValue > 20) {
        rebate = 2000;
      } else if (ffaValue > 15) {
        // Tier 3: 15.1 to 19.99
        if (ffaValue <= 19.99) {
          rebate += (ffaValue - 15) * 170;
        }

        // Tier 2: 10.1 to 15.0 (max 5 units)
        if (15 > 10) {
          rebate += Math.min(15 - 10, 5) * 150;
        }

        // Tier 1: 7.1 to 10.0
        if (10 > 7) {
          rebate += (10 - 7) * 100;
        }
      } else if (ffaValue > 10) {
        // Only in tiers 1 and 2 (10.1 to 15.0)
        // Tier 2: 10.1 to 15.0 (max 5 units)
        rebate += Math.min(ffaValue - 10, 5) * 150;

        // Tier 1: 7.1 to 10.0
        if (10 > 7) {
          rebate += (10 - 7) * 100;
        }
      } else if (ffaValue > 7) {
        // Only in tier 1 (7.1 to 10.0)
        rebate += (ffaValue - 7) * 100;
      }
    } else {
      // For other products: flat rebates
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

  // 2. Oil Rebate & Premium Calculation
  const calculateOilRebatePremium = (
    product,
    oilObtained,
    contractedRate,
    netWeight,
  ) => {
    const oilValue = parseFloat(oilObtained) || 0;
    const rate = parseFloat(contractedRate) || 0;
    const weight = parseFloat(netWeight) || 0;
    let rebate = 0;
    let premium = 0;

    const oilStandard = getOilStandard(product);
    const oilDiff = oilValue - oilStandard;

    if (oilDiff > 0) {
      // PREMIUM CALCULATION
      if (product === "Boiled Rice Bran") {
        if (oilDiff <= 5) {
          const ratio = oilDiff / oilStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        } else if (oilDiff <= 9) {
          const halfExcess = oilDiff / 2;
          const ratio = halfExcess / oilStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        }
      } else if (product === "Raw Rice Bran") {
        const rawStandard = 16;
        if (oilDiff <= 3) {
          const ratio = oilDiff / rawStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        }
      } else if (product === "Rough Rice Bran") {
        const roughStandard = 7;
        if (oilDiff === 1) {
          const ratio = 1 / roughStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        } else if (oilDiff === 2) {
          const halfExcess = 2 / 2;
          const ratio = halfExcess / roughStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        }
      }
    } else if (oilDiff < 0) {
      const diff = Math.abs(oilDiff);

      if (product === "Boiled Rice Bran") {
        const boiledStandard = 19;
        if (oilValue >= 16) {
          const ratio = diff / boiledStandard;
          const effectiveRebateWeight = weight * ratio;
          rebate = effectiveRebateWeight * rate;
        } else {
          const diffTo16 = 16 - oilValue;
          const diffFrom19 = 3;

          const ratio1 = diffFrom19 / boiledStandard;
          const weight1 = weight * ratio1;
          const rebate1 = weight1 * rate;

          const doubleExcess = diffTo16 * 2;
          const ratio2 = doubleExcess / boiledStandard;
          const weight2 = weight * ratio2;
          const rebate2 = weight2 * rate;

          rebate = rebate1 + rebate2;
        }
      } else if (product === "Raw Rice Bran") {
        const rawStandard = 16;
        if (oilValue >= 12) {
          const ratio = diff / rawStandard;
          const effectiveRebateWeight = weight * ratio;
          rebate = effectiveRebateWeight * rate;
        } else {
          const diffTo12 = 12 - oilValue;
          const diffFrom16 = 4;

          const ratio1 = diffFrom16 / rawStandard;
          const weight1 = weight * ratio1;
          const rebate1 = weight1 * rate;

          const onePointFiveExcess = diffTo12 * 1.5;
          const ratio2 = onePointFiveExcess / rawStandard;
          const weight2 = weight * ratio2;
          const rebate2 = weight2 * rate;

          rebate = rebate1 + rebate2;
        }
      }
    }

    return {
      rebate: parseFloat(rebate.toFixed(2)),
      premium: parseFloat(premium.toFixed(2)),
    };
  };

  // Initialize the form reset hook
  const formReset = useFormReset();

  // Create resetForm function using the hook
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
      loadParties,
      showSuccess,
      partyNameRef,
      currentUser,
      companies,
      setSelectedCompany,
      navigate, // Add this since your hook uses navigate
    });
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

  const calculateNetRate = () => {
    const accountRate = calculateAccountRate();
    const oilStandard = parseFloat(labForm.standard_oil) || 19;
    const oilObtained = parseFloat(labForm.obtain_oil) || oilStandard;
    const oilDifference = oilObtained - oilStandard;

    if (oilStandard === 0) return 0;

    const netRate = (accountRate / oilStandard) * oilDifference + accountRate;
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
    const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;
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

  const canGenerateInvoice = () => {
    // Minimum requirements for invoice:
    // 1. Purchase must be saved (mandatory)
    // 2. Billing should be saved for calculations
    // Party, Vehicle, Lab are optional

    if (!savedSections.purchase) {
      return false; // Purchase is mandatory
    }

    // Optional: Check if billing is saved (recommended but not mandatory)
    if (!savedSections.billing) {
      console.warn(
        "Billing not saved - invoice may have incomplete calculations",
      );
      // You can still allow generation but show warning
    }

    return true;
  };

  const calculateGST = () => {
    const grossAmount = calculateGrossAmount();
    const gstType = billingForm.gst_type || "Intra";

    let cgst = 0,
      sgst = 0,
      igst = 0;

    // FIXED: Match backend logic
    if (gstType === "Intra") {
      // Intra-state: Same state (Odisha to Odisha) → CGST 2.5% + SGST 2.5%
      cgst = grossAmount * 0.025;
      sgst = grossAmount * 0.025;
    } else {
      // Inter-state: Different state → IGST 5%
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
  const getOilStandard = (product) => {
    const mapping = {
      "Boiled Rice Bran": 19.0,
      "Raw Rice Bran": 16.0,
      "Rough Rice Bran": 7.0,
    };
    return mapping[product] || 19.0;
  };

  // ============ UTILITY FUNCTIONS ============
  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Refs for all input fields...
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

  // Enter key navigation
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  // ============ STATE VARIABLES ============
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

  // Form States
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

  // Data States
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

  // Add this new state variable for tracking modifications
  const [modifiedSections, setModifiedSections] = useState({
    party: false,
    purchase: false,
    vehicle: false,
    lab: false,
    billing: false,
  });

  // Saved data states (for edit mode)
  const [savedVehicleData, setSavedVehicleData] = useState(null);
  const [savedLabData, setSavedLabData] = useState(null);
  const [savedPurchaseData, setSavedPurchaseData] = useState(null);
  const [savedPartyData, setSavedPartyData] = useState(null);
  const [savedBillingData, setSavedBillingData] = useState(null);

  // ============ USE EFFECTS ============

  // Add this useEffect to auto-fill party when party name changes
  useEffect(() => {
    if (purchaseForm.party_name && parties.length > 0) {
      const selectedParty = parties.find(
        (p) => p.party_name === purchaseForm.party_name,
      );
      if (selectedParty && !usingExistingParty) {
        // Only auto-fill if not already using an existing party
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

  // Load companies and parties on mount
  useEffect(() => {
    loadCompanies();
    loadParties();
    if (mode === "edit" && purchaseId) {
      loadFormData();
    }
  }, [purchaseId]);

  // Load form data for edit mode
  const loadFormData = async () => {
    try {
      setLoading(true);
      const formData = await api.getFormComplete(purchaseId);

      // Populate party form
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

      // Populate purchase form
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
          net_weight_mt: formData.quantity?.net_weight_mt || "",
          billed_weight_mt: formData.purchase.billed_weight_mt || "",
        });
        setSavedPurchaseData(formData.purchase);
        setSavedSections((prev) => ({ ...prev, purchase: true }));
      }

      // Populate vehicle form
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

      // Populate lab form
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

      // Populate billing form
      if (formData.billing) {
        setBillingForm({
          gst_type: formData.billing.gst_type || "Intra",
          invoice_amount: formData.billing.invoice_amount?.toString() || "",
        });
        setSavedBillingData(formData.billing);
        setSavedSections((prev) => ({ ...prev, billing: true }));
      }

      // Set selected company
      if (formData.purchase?.company_id) {
        setSelectedCompany(formData.purchase.company_id);
      }

      // Reset modified sections when loading form
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

  // Auto-fill destination_from from selected party
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

  // Auto-fill rice mill name from selected party
  useEffect(() => {
    if (purchaseForm.party_name) {
      setVehicleForm((prev) => ({
        ...prev,
        rice_mill_name: purchaseForm.party_name,
      }));
    }
  }, [purchaseForm.party_name]);

  useEffect(() => {
    if (purchaseForm.gross_weight_mt) {
      setVehicleForm((prev) => ({
        ...prev,
        quantity_mt: purchaseForm.gross_weight_mt,
      }));
    }
  }, [purchaseForm.gross_weight_mt]);

  // Auto-fill destination_to from selected company
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

  // Auto-recalculate oil rebate/premium when ANY input changes
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

  // Auto-calculate bag weight and net weight
  useEffect(() => {
    const bagWeight = purchaseForm.bag_type === "Poly" ? 0.0002 : 0.0005;
    const bagWeightStr = bagWeight.toFixed(6);

    const grossWeight = parseFloat(purchaseForm.gross_weight_mt) || 0;
    const noOfBags = parseInt(purchaseForm.no_of_bags) || 0;
    const netWeight = grossWeight - noOfBags * bagWeight;
    const netWeightStr = netWeight >= 0 ? netWeight.toFixed(3) : "0.000";

    setPurchaseForm((prev) => ({
      ...prev,
      bag_weight_mt: bagWeightStr,
      net_weight_mt: netWeightStr,
    }));
  }, [
    purchaseForm.bag_type,
    purchaseForm.gross_weight_mt,
    purchaseForm.no_of_bags,
  ]);

  // Auto-select GST type based on GST number
  useEffect(() => {
    if (partyForm.gst && partyForm.gst.length >= 2) {
      const stateCode = partyForm.gst.substring(0, 2);
      const isOdisha = stateCode === "21";
      // FIXED: If state code is 21 (Odisha), it's Intra State
      setBillingForm((prev) => ({
        ...prev,
        gst_type: isOdisha ? "Intra" : "Inter", // Changed from isOdisha ? "Inter" : "Intra"
      }));
    }
  }, [partyForm.gst]);

  // ============ HELPER FUNCTIONS ============

  // Load companies from backend
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
            const firstCompany = companiesData[0];
            setSelectedCompany(firstCompany._id || firstCompany.id);
          }
        } else {
          const firstCompany = companiesData[0];
          setSelectedCompany(firstCompany._id || firstCompany.id);
        }
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
      showError("Failed to load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Mobile number validation
  const validateMobileNumber = (value) => {
    if (value === "") return true;
    return /^\d{0,10}$/.test(value);
  };

  // Handle mobile number input
  const handleMobileChange = (e, formType, setForm) => {
    const value = e.target.value;
    if (validateMobileNumber(value)) {
      setForm((prev) => ({ ...prev, mobile_no: value }));
    }
  };

  // Handle company change
  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);
  };

  // Calculations
  const totalFreight =
    (parseFloat(vehicleForm.quantity_mt) || 0) *
    (parseFloat(vehicleForm.freight_per_mt) || 0);
  const toPay = totalFreight - (parseFloat(vehicleForm.advance_amount) || 0);

  // Load parties
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

  // Handle SMS button click
  const handleSMSClick = () => {
    if (!savedSections.lab) {
      showError("Please save Lab details first");
      return;
    }
    setShowSMSDialog(true);
  };

  // ============ FORM HANDLERS ============

  // Helper function to update form with tracking
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

  // const handleSaveParty = async () => {
  //   try {
  //     const partyData = {
  //       ...partyForm,
  //       company_id: selectedCompany,
  //     };

  //     let savedParty;
  //     if (mode === "edit" && savedPartyData) {
  //       // Update existing party
  //       savedParty = await api.updateParty(savedPartyData._id, partyData);
  //     } else {
  //       // Create new party
  //       savedParty = await api.createParty(partyData);
  //     }

  //     setSavedPartyData(savedParty);
  //     setPurchaseForm((prev) => ({
  //       ...prev,
  //       party_name: savedParty.party_name,
  //     }));
  //     await loadParties();
  //     setSavedSections((prev) => ({ ...prev, party: true }));
  //     setModifiedSections((prev) => ({ ...prev, party: false }));
  //     showSuccess("Party details saved!");
  //   } catch (err) {
  //     showError("Failed to save Party");
  //   }
  // };

  const handleSaveParty = async () => {
    try {
      // If using existing party, don't save again
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
        savedParty = await api.updateParty(savedPartyData._id, partyData);
      } else {
        savedParty = await api.createParty(partyData);
      }

      setSavedPartyData(savedParty);
      setPurchaseForm((prev) => ({
        ...prev,
        party_name: savedParty.party_name,
      }));
      await loadParties();
      setSavedSections((prev) => ({ ...prev, party: true }));
      setModifiedSections((prev) => ({ ...prev, party: false }));
      showSuccess("Party details saved!");
    } catch (err) {
      showError("Failed to save Party");
    }
  };

  // Add this to reset party form when user wants to add new party

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

  const handleSavePurchase = async () => {
    try {
      const bagWeight = purchaseForm.bag_type === "Poly" ? 0.0002 : 0.0005;
      const grossWeight = parseFloat(purchaseForm.gross_weight_mt) || 0;
      const noOfBags = parseInt(purchaseForm.no_of_bags) || 0;
      const netWeight = grossWeight - noOfBags * bagWeight;

      const purchaseData = {
        ...purchaseForm,
        bag_weight_mt: bagWeight.toFixed(6),
        net_weight_mt: netWeight.toFixed(6),
        gross_weight_mt: grossWeight,
        no_of_bags: noOfBags,
        company_id: selectedCompany,
        date: purchaseForm.date,
        received_date: purchaseForm.received_date || null,
      };

      let purchase;
      if (mode === "edit" && savedPurchaseData) {
        // Update existing purchase
        purchase = await api.updatePurchase(
          savedPurchaseData._id,
          purchaseData,
        );
      } else {
        // Create new purchase
        purchase = await api.createPurchase(purchaseData);
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

  // In your Home.jsx file, find the handleSaveBilling function and update it:
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

      // Save all sections in sequence
      // if (
      //   (mode === "create" && !savedSections.party) ||
      //   (mode === "edit" && modifiedSections.party)
      // )
      //   await handleSaveParty();
      if (
        (mode === "create" && !savedSections.purchase) ||
        (mode === "edit" && modifiedSections.purchase)
      )
        await handleSavePurchase();
      if (
        (mode === "create" && !savedSections.vehicle) ||
        (mode === "edit" && modifiedSections.vehicle)
      )
        await handleSaveVehicle();
      if (
        (mode === "create" && !savedSections.lab) ||
        (mode === "edit" && modifiedSections.lab)
      )
        await handleSaveLab();
      if (
        (mode === "create" && !savedSections.billing) ||
        (mode === "edit" && modifiedSections.billing)
      )
        await handleSaveBilling();

      if (mode === "create") {
        showSuccess("All sections saved successfully!");
      } else {
        showSuccess("Form updated successfully!");
      }
    } catch (err) {
      showError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoice = async () => {
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
            company_name: "Sriyansh Solvent Solutions Pvt Ltd",
            address_line1: "At-Kamira, Po-Singhijuba, Via-Binka",
            mobile_no: "6371195818",
            gst_number: selectedCompanyObj?.gst_number || "",
            email: selectedCompanyObj?.email || "",
          },

          party: partyData || {
            party_name: "MANMATH PATTNAIK & CO",
            address_line1: "MANASA PLACE GANDARPUR",
            city: "Cuttack",
            state: "Odisha",
            pin: "753003",
            gst: "21AMJPP6577A124",
            mobile_no: "9876543210",
            contact_person: "Mr. Mammath Pathnak",
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
    navigate(-1); // Go back to previous page
  };

  // const allSectionsSaved = Object.values(savedSections).every(Boolean);
  const allSectionsSaved = savedSections.purchase && savedSections.billing;

  const getUserCompanyName = () => {
    if (!currentUser || companies.length === 0) {
      return "Select Company";
    }

    if (selectedCompany) {
      const selected = companies.find(
        (c) => (c._id || c.id) === selectedCompany,
      );
      return selected ? selected.company_name : "Select Company";
    }

    return "Select Company";
  };

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
              <FormControl
                size="small"
                sx={{ minWidth: 250 }}
                disabled={userRole !== "admin" && companies.length <= 1}
              >
                <InputLabel>Select Company</InputLabel>
                <Select
                  value={selectedCompany}
                  label="Select Company"
                  onChange={handleCompanyChange}
                  sx={{
                    "& .MuiSelect-select": {
                      fontSize: "13px",
                      padding: "8px 12px",
                    },
                    height: "40px",
                  }}
                >
                  {loadingCompanies ? (
                    <MenuItem disabled>Loading companies...</MenuItem>
                  ) : companies.length === 0 ? (
                    <MenuItem disabled>No companies available</MenuItem>
                  ) : (
                    companies.map((company) => (
                      <MenuItem
                        key={company._id || company.id}
                        value={company._id || company.id}
                      >
                        {company.company_name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {userRole !== "admin" && companies.length <= 1 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  Assigned to: {getUserCompanyName()}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Party and Purchase Details Side by Side */}
          <Grid container spacing={1} sx={styles.compactGrid}>
            {/* PARTY DETAILS - Left Column */}
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
                    onClick={() => toggleSection("party")}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{ bgcolor: "primary.light", width: 28, height: 28 }}
                      >
                        <AccountCircleIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="bold">
                        1. Party Details
                      </Typography>
                      {savedSections.party && mode === "create" && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                      {mode === "edit" && modifiedSections.party && (
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
                        transform: expandedSections.party
                          ? "rotate(180deg)"
                          : "none",
                        transition: "0.3s",
                      }}
                    />
                  </Box>

                  <Collapse in={expandedSections.party}>
                    <Divider sx={{ my: 1 }} />

                    {/* Add this button to switch between new/existing party */}
                    <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                      <Button
                        variant={!usingExistingParty ? "contained" : "outlined"}
                        size="small"
                        onClick={handleAddNewParty}
                        sx={{ fontSize: "11px", padding: "4px 8px" }}
                      >
                        Add New Party
                      </Button>
                      {/* <Button
                        variant={usingExistingParty ? "contained" : "outlined"}
                        size="small"
                        onClick={() => {
                          // This will be triggered when user selects from dropdown
                          // The dropdown is in Purchase Details
                        }}
                        sx={{ fontSize: "11px", padding: "4px 8px" }}
                        disabled
                      >
                        Select Existing
                      </Button> */}
                    </Box>

                    <Grid container spacing={1} sx={styles.compactGrid}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Party Name *"
                          value={partyForm.party_name}
                          onChange={(e) =>
                            updateFormWithTracking(setPartyForm, "party", {
                              ...partyForm,
                              party_name: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, contactPersonRef)}
                          inputRef={partyNameRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Contact Person"
                          value={partyForm.contact_person}
                          onChange={(e) =>
                            updateFormWithTracking(setPartyForm, "party", {
                              ...partyForm,
                              contact_person: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyMobileRef)}
                          inputRef={contactPersonRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Mobile No *"
                          value={partyForm.mobile_no}
                          onChange={(e) =>
                            handleMobileChange(e, "party", setPartyForm)
                          }
                          inputProps={{ maxLength: 10 }}
                          type="tel"
                          helperText="10 digits only"
                          onKeyDown={(e) => handleKeyDown(e, partyAddressRef)}
                          inputRef={partyMobileRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Address"
                          value={partyForm.address_line1}
                          onChange={(e) =>
                            updateFormWithTracking(setPartyForm, "party", {
                              ...partyForm,
                              address_line1: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyCityRef)}
                          inputRef={partyAddressRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="City"
                          value={partyForm.city}
                          onChange={(e) =>
                            updateFormWithTracking(setPartyForm, "party", {
                              ...partyForm,
                              city: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyStateRef)}
                          inputRef={partyCityRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="State"
                          value={partyForm.state}
                          onChange={(e) =>
                            updateFormWithTracking(setPartyForm, "party", {
                              ...partyForm,
                              state: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyPinRef)}
                          inputRef={partyStateRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Pin Code"
                          value={partyForm.pin}
                          onChange={(e) =>
                            updateFormWithTracking(setPartyForm, "party", {
                              ...partyForm,
                              pin: e.target.value,
                            })
                          }
                          inputProps={{ maxLength: 6 }}
                          onKeyDown={(e) => handleKeyDown(e, partyGstRef)}
                          inputRef={partyPinRef}
                          fullWidth
                          // disabled={usingExistingParty}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={styles.compactSelect}
                        >
                          <InputLabel>Customer Type</InputLabel>
                          <Select
                            value={partyForm.customer_type}
                            label="Customer Type"
                            onChange={(e) =>
                              updateFormWithTracking(setPartyForm, "party", {
                                ...partyForm,
                                customer_type: e.target.value,
                              })
                            }
                          >
                            <MenuItem value="Registered">Registered</MenuItem>
                            <MenuItem value="Unregistered">
                              Unregistered
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {partyForm.customer_type === "Registered" && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="GST Number"
                            value={partyForm.gst}
                            onChange={(e) => {
                              const gstValue = e.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "");
                              if (
                                validateGSTFormat(gstValue) ||
                                gstValue.length < 50
                              ) {
                                updateFormWithTracking(setPartyForm, "party", {
                                  ...partyForm,
                                  gst: gstValue,
                                });
                              }
                            }}
                            // helperText={
                            //   partyForm.gst && !validateGSTFormat(partyForm.gst)
                            //     ? "Invalid GST format"
                            //     : partyForm.gst
                            //     ? `State: ${partyForm.gst.substring(0, 2)}`
                            //     : "15 characters"
                            // }
                            // error={
                            //   partyForm.gst && !validateGSTFormat(partyForm.gst)
                            // }
                            onKeyDown={(e) => handleKeyDown(e, invoiceNoRef)}
                            inputRef={partyGstRef}
                            fullWidth
                            inputProps={{
                              style: { textTransform: "uppercase" },
                              maxLength: 15,
                            }}
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: "right", mt: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveParty}
                            disabled={
                              mode === "create"
                                ? // ? savedSections.party
                                  // : !modifiedSections.party
                                  (usingExistingParty && savedSections.party) ||
                                  (!usingExistingParty &&
                                    !partyForm.party_name?.trim())
                                : !modifiedSections.party
                            }
                            sx={styles.compactButton}
                          >
                            {/* {mode === "create"
                              ? savedSections.party
                                ? "Saved"
                                : "Save Party"
                              : modifiedSections.party
                                ? "Save Changes"
                                : "Saved"} */}

                            {usingExistingParty && selectedExistingParty
                              ? "Using Existing Party"
                              : mode === "create"
                                ? savedSections.party
                                  ? "Saved"
                                  : "Save Party"
                                : modifiedSections.party
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
                        2. Purchase Details
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
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          sx={styles.compactSelect}
                        >
                          <InputLabel>Party Name</InputLabel>
                          {/* <Select
                            value={purchaseForm.party_name}
                            label="Party Name"
                            onChange={(e) =>
                              updateFormWithTracking(
                                setPurchaseForm,
                                "purchase",
                                {
                                  ...purchaseForm,
                                  party_name: e.target.value,
                                },
                              )
                            }
                          > */}
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
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Net Weight (MT)"
                          value={purchaseForm.net_weight_mt}
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
                              label="Red Bran"
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
          </Grid>

          {/* Vehicle and Lab Details Side by Side */}
          <Grid container spacing={1} sx={styles.compactGrid}>
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
                        3. Vehicle Details
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
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Vehicle No *"
                          value={vehicleForm.vehicle_no}
                          onChange={(e) => {
                            // Auto capitalize all letters
                            const value = e.target.value.toUpperCase();
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              vehicle_no: value,
                            });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, ownerNameRef)}
                          inputRef={vehicleNoRef}
                          fullWidth
                          inputProps={{
                            style: { textTransform: "uppercase" },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner Name"
                          value={vehicleForm.owner_name}
                          onChange={(e) =>
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              owner_name: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, ownerMobileRef)}
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
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              rice_mill_name: e.target.value,
                            })
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
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              destination_from: e.target.value,
                            })
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
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              destination_to: e.target.value,
                            })
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
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              quantity_mt: quantity,
                            });
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
                            // Allow up to 2 decimal places
                            if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
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
                            // Allow up to 2 decimal places
                            if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
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
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              bank_account: e.target.value,
                            })
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
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              bank_name: toTitleCase(e.target.value),
                            })
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
                            // Auto capitalize and allow only alphanumeric
                            const value = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "");
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              ifsc: value,
                            });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, ownerAddrRef)}
                          inputRef={ifscRef}
                          fullWidth
                          inputProps={{
                            style: { textTransform: "uppercase" },
                            maxLength: 50, // IFSC codes are typically 11 characters
                          }}
                          helperText="e.g., SBIN0001234"
                        />
                      </Grid>
                      {/* <Grid size={{ xs: 12 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner Address"
                          value={vehicleForm.owner_address_line1}
                          onChange={(e) =>
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              owner_address_line1: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, ownerCityRef)}
                          inputRef={ownerAddrRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner City"
                          value={vehicleForm.owner_city}
                          onChange={(e) =>
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              owner_city: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, ownerStateRef)}
                          inputRef={ownerCityRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner State"
                          value={vehicleForm.owner_state}
                          onChange={(e) =>
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              owner_state: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, ownerPinRef)}
                          inputRef={ownerStateRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner Pin Code"
                          value={vehicleForm.owner_pin}
                          onChange={(e) =>
                            updateFormWithTracking(setVehicleForm, "vehicle", {
                              ...vehicleForm,
                              owner_pin: e.target.value,
                            })
                          }
                          inputProps={{ maxLength: 6 }}
                          onKeyDown={(e) => handleKeyDown(e, obtainFfaRef)}
                          inputRef={ownerPinRef}
                          fullWidth
                        />
                      </Grid> */}
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
                        4. Laboratory Details
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
          </Grid>

          {/* BILLING DETAILS Row */}
          <Card elevation={1} sx={{ borderRadius: 2, ...styles.compactCard }}>
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
                    5. Billing Details
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
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Account Rate (₹)"
                      value={calculateAccountRate().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Net Rate (₹)"
                      value={calculateNetRate().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Material Amount (₹)"
                      value={calculateMaterialAmount().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FormControl sx={styles.compactRadio}>
                        <RadioGroup
                          row
                          value={billingForm.gst_type}
                          onChange={(e) =>
                            updateFormWithTracking(setBillingForm, "billing", {
                              ...billingForm,
                              gst_type: e.target.value,
                            })
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
                      {/* {partyForm.gst && (
                        <Chip
                          label={
                            billingForm.gst_type === "Intra"
                              ? `State ${partyForm.gst.substring(
                                  0,
                                  2,
                                )} (CGST+SGST)`
                              : "IGST"
                          }
                          size="small"
                          color={
                            billingForm.gst_type === "Intra"
                              ? "success"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      )} */}
                    </Box>
                    {/* <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "11px" }}
                    >
                      {partyForm.gst
                        ? `GST: ${partyForm.gst.substring(0, 2)} = ${
                            billingForm.gst_type === "Intra"
                              ? "Intra-State (2.5%+2.5%)"
                              : "Inter-State (5%)"
                          }`
                        : "Enter GST to auto-select"}
                    </Typography> */}
                  </Grid>
                  {/* GST Fields */}
                  {billingForm.gst_type === "Intra" && (
                    <>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="CGST (2.5%)"
                          value={calculateGST().cgst.toFixed(2)}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Billed Amount (₹)"
                      value={calculateBilledAmount().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Amount Payable (₹)"
                      value={calculateAmountPayable().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ textAlign: "right", mt: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveBilling}
                      disabled={
                        mode === "create"
                          ? savedSections.billing || !currentPurchaseId
                          : !modifiedSections.billing
                      }
                      sx={{ ...styles.compactButton, bgcolor: "error.main" }}
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
                <Button
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  onClick={handleGenerateInvoice}
                  sx={{
                    padding: "6px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    textTransform: "none",
                    borderRadius: "4px",
                    height: "36px",
                    minWidth: "180px",
                    bgcolor: "#ff6b6b",
                    background:
                      "linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%)",
                    "&:hover": { bgcolor: "#ff5252" },
                    boxShadow: "0 2px 4px 1px rgba(255, 105, 135, .2)",
                    "& .MuiButton-startIcon": {
                      marginRight: "6px",
                      "& > *:first-of-type": {
                        fontSize: "18px",
                      },
                    },
                  }}
                >
                  Generate Final Invoice
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
          net_weight_mt: purchaseForm.net_weight_mt,
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
    </Box>
  );
};

export default Home;
