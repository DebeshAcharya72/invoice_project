// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
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
  const [loading, setLoading] = useState(false);
  const receivedDateRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ============ CALCULATION FUNCTIONS ============

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

  // 2. Oil Rebate & Premium Calculation (Keeping your logic intact)
  // 2. Oil Rebate & Premium Calculation (CORRECTED with proper half premium logic)
  const calculateOilRebatePremium = (
    product,
    oilObtained,
    contractedRate,
    netWeight
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
          // 19% to 24% (19+5) - FULL PREMIUM
          // Premium = (Excess / Standard) × Net Weight × Rate
          const ratio = oilDiff / oilStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        } else if (oilDiff <= 9) {
          // 24% to 28% (19+9) - HALF PREMIUM
          // Premium = ((Excess/2) / Standard) × Net Weight × Rate
          const halfExcess = oilDiff / 2;
          const ratio = halfExcess / oilStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        }
        // Above 28%: no premium
      } else if (product === "Raw Rice Bran") {
        const rawStandard = 16;
        if (oilDiff <= 3) {
          // 16% to 19% (16+3) - FULL PREMIUM
          const ratio = oilDiff / rawStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        }
        // Above 19%: no premium
      } else if (product === "Rough Rice Bran") {
        const roughStandard = 7;
        if (oilDiff === 1) {
          // 7% to 8% - FULL PREMIUM
          const ratio = 1 / roughStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        } else if (oilDiff === 2) {
          // 7% to 9% - HALF PREMIUM
          const halfExcess = 2 / 2; // Half of 2% excess
          const ratio = halfExcess / roughStandard;
          const effectivePremiumWeight = weight * ratio;
          premium = effectivePremiumWeight * rate;
        }
        // Above 9%: no premium
      }
    } else if (oilDiff < 0) {
      // REBATE CALCULATION (for less oil than standard)
      const diff = Math.abs(oilDiff);

      if (product === "Boiled Rice Bran") {
        const boiledStandard = 19;
        if (oilValue >= 16) {
          // 19% to 16%: 1% each (FULL rebate)
          const ratio = diff / boiledStandard;
          const effectiveRebateWeight = weight * ratio;
          rebate = effectiveRebateWeight * rate;
        } else {
          // Below 16%: 2% each (DOUBLE rebate)
          const diffTo16 = 16 - oilValue;
          const diffFrom19 = 3; // 19-16

          // First 3% (19-16): 1% each (full rebate)
          const ratio1 = diffFrom19 / boiledStandard;
          const weight1 = weight * ratio1;
          const rebate1 = weight1 * rate;

          // Below 16%: 2% each (double rebate)
          const doubleExcess = diffTo16 * 2;
          const ratio2 = doubleExcess / boiledStandard;
          const weight2 = weight * ratio2;
          const rebate2 = weight2 * rate;

          rebate = rebate1 + rebate2;
        }
      } else if (product === "Raw Rice Bran") {
        const rawStandard = 16;
        if (oilValue >= 12) {
          // 16% to 12%: 1% each (FULL rebate)
          const ratio = diff / rawStandard;
          const effectiveRebateWeight = weight * ratio;
          rebate = effectiveRebateWeight * rate;
        } else {
          // Below 12%: 1.5% each
          const diffTo12 = 12 - oilValue;
          const diffFrom16 = 4; // 16-12

          // First 4% (16-12): 1% each (full rebate)
          const ratio1 = diffFrom16 / rawStandard;
          const weight1 = weight * ratio1;
          const rebate1 = weight1 * rate;

          // Below 12%: 1.5% each
          const onePointFiveExcess = diffTo12 * 1.5;
          const ratio2 = onePointFiveExcess / rawStandard;
          const weight2 = weight * ratio2;
          const rebate2 = weight2 * rate;

          rebate = rebate1 + rebate2;
        }
      }
      // Rough Rice Bran: No rebate mentioned
    }

    return {
      rebate: parseFloat(rebate.toFixed(2)),
      premium: parseFloat(premium.toFixed(2)),
    };
  };

  const calculateAccountRate = () => {
    // Use final contracted rate for Red Bran, otherwise use contracted rate
    const contractedRate =
      parseFloat(
        purchaseForm.bran_type === "Red"
          ? purchaseForm.final_contracted_rate || purchaseForm.contracted_rate
          : purchaseForm.contracted_rate
      ) || 0;

    // Get FFA rebate from either saved data or current form
    const ffaRebate =
      parseFloat(
        savedLabData?.ffa_rebate_rs ||
          savedLabData?.rebate_rs ||
          labForm.ffa_rebate_rs
      ) || 0;

    console.log("Account rate calculation:", {
      contractedRate,
      ffaRebate,
      branType: purchaseForm.bran_type,
      finalContractedRate: purchaseForm.final_contracted_rate,
      savedLabData,
      labForm,
    });

    // Account Rate = Contracted Rate - FFA Rebate
    const accountRate = Math.max(0, contractedRate - ffaRebate);

    return parseFloat(accountRate.toFixed(2));
  };

  // 4. NEW: Net Rate Calculation (Account Rate / Oil Standard) * Oil Difference
  const calculateNetRate = () => {
    const accountRate = calculateAccountRate();
    const oilStandard = parseFloat(labForm.standard_oil) || 19;
    const oilObtained = parseFloat(labForm.obtain_oil) || oilStandard;
    const oilDifference = oilObtained - oilStandard;

    if (oilStandard === 0) return 0;

    const netRate = (accountRate / oilStandard) * oilDifference + accountRate;
    return parseFloat(netRate.toFixed(2));
  };

  // 5. NEW: Net Amount Calculation

  const calculateNetAmount = () => {
    const netRate = calculateNetRate();
    // const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;
    const accountRate = calculateAccountRate();

    // Net Amount = Net Rate per MT × Net Weight
    const netAmount = netRate * accountRate;
    return parseFloat(netAmount.toFixed(2));
  };

  // 6. NEW: Material Amount Calculation (Account Rate × Net Weight)
  const calculateMaterialAmount = () => {
    const accountRate = calculateAccountRate();
    const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;

    const materialAmount = accountRate * netWeight;
    return parseFloat(materialAmount.toFixed(2));
  };

  // 7. NEW: Gross Amount Calculation (Net Amount + Material Amount)
  const calculateGrossAmount = () => {
    const materialAmount = calculateMaterialAmount();
    const oilPremium = parseFloat(labForm.oil_premium_rs) || 0;
    const oilRebate = parseFloat(labForm.oil_rebate_rs) || 0;

    // Only one of premium or rebate will be non-zero
    return materialAmount + oilPremium - oilRebate;
  };

  // 8. NEW: GST Calculation
  const calculateGST = () => {
    const grossAmount = calculateGrossAmount();
    const gstType = billingForm.gst_type;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (gstType === "Intra") {
      // Intra State: 2.5% CGST + 2.5% SGST
      cgst = grossAmount * 0.025;
      sgst = grossAmount * 0.025;
    } else if (gstType === "Inter") {
      // Inter State: 5% IGST
      igst = grossAmount * 0.05;
    }

    return {
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: parseFloat(igst.toFixed(2)),
      total: parseFloat((cgst + sgst + igst).toFixed(2)),
    };
  };

  // 9. NEW: Billed Amount Calculation (Gross Amount + GST)
  const calculateBilledAmount = () => {
    const grossAmount = calculateGrossAmount();
    const gst = calculateGST();

    const billedAmount = grossAmount + gst.total;
    return parseFloat(billedAmount.toFixed(2));
  };

  // 10. NEW: Amount Payable Calculation (Billed Amount - Invoice Amount)
  const calculateAmountPayable = () => {
    const billedAmount = calculateBilledAmount();
    const invoiceAmount = parseFloat(billingForm.invoice_amount) || 0;

    const amountPayable = billedAmount - invoiceAmount;
    return parseFloat(amountPayable.toFixed(2));
  };

  // 11. Helper function to get oil standard
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
  const [purchaseId, setPurchaseId] = useState(null);
  const [parties, setParties] = useState([]);
  const [savedSections, setSavedSections] = useState({
    party: false,
    purchase: false,
    vehicle: false,
    lab: false,
    billing: false,
  });

  // Saved data states
  const [savedVehicleData, setSavedVehicleData] = useState(null);
  const [savedLabData, setSavedLabData] = useState(null);
  const [savedPurchaseData, setSavedPurchaseData] = useState(null);
  const [savedPartyData, setSavedPartyData] = useState(null);

  // ============ USE EFFECTS ============

  // Load companies and parties on mount
  useEffect(() => {
    loadCompanies();
    loadParties();
  }, []);

  // Auto-fill destination_from from selected party
  useEffect(() => {
    if (purchaseForm.party_name) {
      const selectedParty = parties.find(
        (p) => p.party_name === purchaseForm.party_name
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
        (c) => (c._id || c.id) === selectedCompany
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
        netWeight
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

    // Auto-calculate oil rebate/premium when product changes if oil value exists
    if (labForm.obtain_oil && purchaseForm.contracted_rate) {
      const oilCalc = calculateOilRebatePremium(
        purchaseForm.product_name,
        labForm.obtain_oil,
        purchaseForm.contracted_rate,
        netWeight
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
      // Clear final rate for Good Bran
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
    const netWeightStr = netWeight >= 0 ? netWeight.toFixed(6) : "0.000000";

    // const billedWeightStr = grossWeight > 0 ? grossWeight.toFixed(6) : "";

    setPurchaseForm((prev) => ({
      ...prev,
      bag_weight_mt: bagWeightStr,
      net_weight_mt: netWeightStr,
      // billed_weight_mt: billedWeightStr,
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
      setBillingForm((prev) => ({
        ...prev,
        gst_type: isOdisha ? "Inter" : "Intra",
      }));
    }
  }, [partyForm.gst]);

  // ============ HELPER FUNCTIONS ============

  // Load companies from backend
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesData = await api.getMyCompanies();
      console.log("Loaded companies for dropdown:", companiesData);

      setCompanies(companiesData);

      if (companiesData.length > 0) {
        if (currentUser?.company_id) {
          const userCompany = companiesData.find(
            (c) => (c._id || c.id) === currentUser.company_id
          );
          if (userCompany) {
            setSelectedCompany(userCompany._id || userCompany.id);
            console.log("Selected user's company:", userCompany.company_name);
          } else {
            const firstCompany = companiesData[0];
            setSelectedCompany(firstCompany._id || firstCompany.id);
            console.log("Selected first company:", firstCompany.company_name);
          }
        } else {
          const firstCompany = companiesData[0];
          setSelectedCompany(firstCompany._id || firstCompany.id);
          console.log(
            "No user company, selected first:",
            firstCompany.company_name
          );
        }
      } else {
        console.log("No companies available");
        setSelectedCompany("");
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

    const selectedCompanyObj = companies.find(
      (c) => (c._id || c.id) === companyId
    );
    if (selectedCompanyObj) {
      console.log("Selected company:", selectedCompanyObj.company_name);
    }
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

  const handleSaveParty = async () => {
    try {
      const partyData = {
        ...partyForm,
        company_id: selectedCompany,
      };

      const savedParty = await api.createParty(partyData);
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
        date: purchaseForm.date, // Invoice Date
        received_date: purchaseForm.received_date || null,
      };

      const purchase = await api.createPurchase(purchaseData);
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
      setShowVehicleSlip(true);
    } catch (err) {
      showError("Failed to save Vehicle");
    }
  };

  const handleSaveLab = async () => {
    try {
      if (!purchaseId) {
        showError("Purchase must be saved first");
        return;
      }
      const netWeight = parseFloat(purchaseForm.net_weight_mt) || 0;

      // Calculate oil rebate and premium
      const oilCalc = calculateOilRebatePremium(
        purchaseForm.product_name,
        labForm.obtain_oil,
        purchaseForm.contracted_rate,
        netWeight
      );

      // IMPORTANT: Match backend field names
      const labData = {
        purchase_id: purchaseId,
        obtain_ffa: labForm.obtain_ffa ? parseFloat(labForm.obtain_ffa) : null,
        obtain_oil: labForm.obtain_oil ? parseFloat(labForm.obtain_oil) : null,
        rebate_rs: labForm.ffa_rebate_rs
          ? parseFloat(labForm.ffa_rebate_rs)
          : null, // Backend uses rebate_rs
        premium_rs: labForm.ffa_premium_rs
          ? parseFloat(labForm.ffa_premium_rs)
          : null, // Backend uses premium_rs
        oil_rebate_rs: oilCalc.rebate > 0 ? oilCalc.rebate : null,
        oil_premium_rs: oilCalc.premium > 0 ? oilCalc.premium : null,
        standard_ffa: parseFloat(labForm.standard_ffa) || 0,
        standard_oil: parseFloat(labForm.standard_oil) || 0,
      };

      console.log("Saving lab data to backend:", labData);

      const savedLab = await api.createLabDetail(labData);
      console.log("Backend response:", savedLab);

      // Store with both field names for frontend compatibility
      const completeLabData = {
        ...savedLab,
        ffa_rebate_rs: savedLab.rebate_rs, // Map for frontend
        ffa_premium_rs: savedLab.premium_rs, // Map for frontend
      };

      setSavedLabData(completeLabData);
      setSavedSections((prev) => ({ ...prev, lab: true }));
      showSuccess("Laboratory details saved!");
    } catch (err) {
      console.error("Lab save error:", err);
      showError("Failed to save Lab: " + err.message);
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

  const handleGenerateInvoice = async () => {
    try {
      if (!purchaseId) {
        showError("Please save purchase details first");
        return;
      }

      // Debug: Check current state
      console.log("Current state before generating invoice:", {
        purchaseId,
        purchaseForm,
        labForm,
        savedLabData,
        selectedCompany,
        companies,
        parties,
      });

      // Get complete form data from backend
      const response = await api.generateInvoice(purchaseId);
      console.log("API Response for invoice:", response);

      if (response && response.data) {
        const raw = response.data;

        // Get selected company
        const selectedCompanyObj = companies.find(
          (c) => (c._id || c.id) === selectedCompany
        );
        console.log("Selected company:", selectedCompanyObj);

        // Get party data
        const partyData = parties.find(
          (p) => p.party_name === purchaseForm.party_name
        );
        console.log("Found party data:", partyData);

        // Get lab data - handle both backend and local data
        const rawLab = raw.lab || {};
        console.log("Raw lab data from API:", rawLab);
        console.log("Local lab form data:", labForm);
        console.log("Saved lab data:", savedLabData);

        // Combine lab data with proper field mapping
        const labData = {
          // FFA Analysis
          obtain_ffa:
            parseFloat(rawLab.obtain_ffa) ||
            parseFloat(savedLabData?.obtain_ffa) ||
            parseFloat(labForm.obtain_ffa) ||
            0,

          // Map backend 'rebate_rs' to frontend 'ffa_rebate_rs'
          ffa_rebate_rs:
            parseFloat(rawLab.rebate_rs) ||
            parseFloat(savedLabData?.rebate_rs) ||
            parseFloat(savedLabData?.ffa_rebate_rs) ||
            parseFloat(labForm.ffa_rebate_rs) ||
            0,

          ffa_premium_rs:
            parseFloat(rawLab.premium_rs) ||
            parseFloat(savedLabData?.premium_rs) ||
            parseFloat(savedLabData?.ffa_premium_rs) ||
            parseFloat(labForm.ffa_premium_rs) ||
            0,

          // Oil Analysis
          obtain_oil:
            parseFloat(rawLab.obtain_oil) ||
            parseFloat(savedLabData?.obtain_oil) ||
            parseFloat(labForm.obtain_oil) ||
            0,

          oil_rebate_rs:
            parseFloat(rawLab.oil_rebate_rs) ||
            parseFloat(savedLabData?.oil_rebate_rs) ||
            parseFloat(labForm.oil_rebate_rs) ||
            0,

          oil_premium_rs:
            parseFloat(rawLab.oil_premium_rs) ||
            parseFloat(savedLabData?.oil_premium_rs) ||
            parseFloat(labForm.oil_premium_rs) ||
            0,

          // Standards
          standard_ffa:
            parseFloat(rawLab.standard_ffa) ||
            parseFloat(savedLabData?.standard_ffa) ||
            parseFloat(labForm.standard_ffa) ||
            7,

          standard_oil:
            parseFloat(rawLab.standard_oil) ||
            parseFloat(savedLabData?.standard_oil) ||
            parseFloat(labForm.standard_oil) ||
            19,
        };

        console.log("Combined lab data for invoice:", labData);

        // Get billing data
        const billingData = raw.billing || {};
        console.log("Billing data:", billingData);

        // Calculate values using new calculation functions
        const accountRate = calculateAccountRate();
        const netRate = calculateNetRate();
        const netAmount = calculateNetAmount();
        const materialAmount = calculateMaterialAmount();
        const grossAmount = calculateGrossAmount();
        const gst = calculateGST();
        const billedAmount = calculateBilledAmount();
        const amountPayable = calculateAmountPayable();

        console.log("Calculated values:", {
          accountRate,
          netRate,
          netAmount,
          materialAmount,
          grossAmount,
          gst,
          billedAmount,
          amountPayable,
        });

        // Transform data to match InvoicePreview format
        const transformedData = {
          // Company Details
          company: selectedCompanyObj || {
            company_name: "Sriyansh Solvent Solutions Pvt Ltd",
            address_line1: "At-Kamira, Po-Singhijuba, Via-Binka",
            mobile_no: "6371195818",
          },

          // Party Details
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

          // Purchase Details
          purchase: {
            ...raw.purchase,
            ...purchaseForm,
            product_name: purchaseForm.product_name || "Boiled Rice Bran",
            gross_weight_mt: parseFloat(purchaseForm.gross_weight_mt) || 0,
            contracted_rate: parseFloat(purchaseForm.contracted_rate) || 0,
            bran_type: purchaseForm.bran_type || "Good",
            final_contracted_rate:
              parseFloat(purchaseForm.final_contracted_rate) ||
              parseFloat(purchaseForm.contracted_rate) ||
              0,
          },

          // Quantity Details
          quantity: {
            no_of_bags: parseInt(purchaseForm.no_of_bags) || 0,
            gross_weight_mt: parseFloat(purchaseForm.gross_weight_mt) || 0,
            net_weight_mt: parseFloat(purchaseForm.net_weight_mt) || 0,
            bag_weight_mt: parseFloat(purchaseForm.bag_weight_mt) || 0,
            bag_type: purchaseForm.bag_type || "Poly",
          },

          // Lab Details
          lab: labData,

          // Billing Details
          billing: {
            account_rate: accountRate.toFixed(2),
            net_rate: netRate.toFixed(2),
            // net_amount: netAmount.toFixed(2),
            material_amount: materialAmount.toFixed(2),
            gross_amount: grossAmount.toFixed(2),
            cgst: gst.cgst.toFixed(2),
            sgst: gst.sgst.toFixed(2),
            igst: gst.igst.toFixed(2),
            billed_amount: billedAmount.toFixed(2),
            amount_payable: amountPayable.toFixed(2),
            gst_type: billingForm.gst_type || "Intra",
            invoice_amount: parseFloat(billingForm.invoice_amount) || 0,
            ...billingData,
          },

          // Vehicle Details
          vehicle: raw.vehicle ||
            vehicleForm || {
              vehicle_no: "O015F 6232",
              owner_name: "",
              mobile_no: "",
            },

          // Invoice Details
          debitNoteNo: `FSR-${purchaseForm.invoice_no || "7203"}`,
          purchaseDate:
            purchaseForm.date || new Date().toISOString().split("T")[0],
          supplierInvNo: `MPI/20/4/5/${purchaseForm.invoice_no || "19-Jan-25"}`,
          brokerName: purchaseForm.agent_name || "Sunil Jain",
        };

        console.log("Final transformed invoice data:", transformedData);

        // Additional debug: Check if FFA data is present
        console.log("FFA data check:", {
          obtain_ffa: transformedData.lab.obtain_ffa,
          ffa_rebate_rs: transformedData.lab.ffa_rebate_rs,
          oil_rebate_rs: transformedData.lab.oil_rebate_rs,
          labData: transformedData.lab,
        });

        setGeneratedInvoice(transformedData);
        setShowInvoice(true);
        showSuccess("Invoice generated successfully!");
      } else {
        console.error("No invoice data returned from server");
        showError("No invoice data returned from server");
      }
    } catch (err) {
      console.error("Invoice generation error:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });
      showError(
        "Failed to generate invoice: " + (err.message || "Unknown error")
      );
    }
  };

  // Add this helper function for number to words conversion
  const numberToWords = (num) => {
    const a = [
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
    const b = [
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

    if (num === 0) return "Zero";

    const convert = (n) => {
      if (n < 20) return a[n];
      const digit = n % 10;
      if (n < 100) return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " and " + convert(n % 100) : "")
        );
      if (n < 100000)
        return (
          convert(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + convert(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          convert(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + convert(n % 100000) : "")
        );
      return (
        convert(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + convert(n % 10000000) : "")
      );
    };

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let words = convert(integerPart) + " Rupees";
    if (decimalPart > 0) {
      words += " and " + convert(decimalPart) + " Paise";
    }

    return words + " Only";
  };

  const allSectionsSaved = Object.values(savedSections).every(Boolean);

  const getUserCompanyName = () => {
    if (!currentUser || companies.length === 0) {
      return "Select Company";
    }

    if (selectedCompany) {
      const selected = companies.find(
        (c) => (c._id || c.id) === selectedCompany
      );
      return selected ? selected.company_name : "Select Company";
    }

    return "Select Company";
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
              📋 Rice Bran Invoice Form
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
                      {savedSections.party && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
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
                    <Grid container spacing={1} sx={styles.compactGrid}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Party Name *"
                          value={partyForm.party_name}
                          onChange={(e) =>
                            setPartyForm({
                              ...partyForm,
                              party_name: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, contactPersonRef)}
                          inputRef={partyNameRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Contact Person"
                          value={partyForm.contact_person}
                          onChange={(e) =>
                            setPartyForm({
                              ...partyForm,
                              contact_person: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyMobileRef)}
                          inputRef={contactPersonRef}
                          fullWidth
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
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Address"
                          value={partyForm.address_line1}
                          onChange={(e) =>
                            setPartyForm({
                              ...partyForm,
                              address_line1: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyCityRef)}
                          inputRef={partyAddressRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="City"
                          value={partyForm.city}
                          onChange={(e) =>
                            setPartyForm({
                              ...partyForm,
                              city: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyStateRef)}
                          inputRef={partyCityRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="State"
                          value={partyForm.state}
                          onChange={(e) =>
                            setPartyForm({
                              ...partyForm,
                              state: toTitleCase(e.target.value),
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, partyPinRef)}
                          inputRef={partyStateRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Pin Code"
                          value={partyForm.pin}
                          onChange={(e) =>
                            setPartyForm({ ...partyForm, pin: e.target.value })
                          }
                          inputProps={{ maxLength: 6 }}
                          onKeyDown={(e) => handleKeyDown(e, partyGstRef)}
                          inputRef={partyPinRef}
                          fullWidth
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
                              setPartyForm({
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
                            onChange={(e) =>
                              setPartyForm({
                                ...partyForm,
                                gst: e.target.value,
                              })
                            }
                            onKeyDown={(e) => handleKeyDown(e, invoiceNoRef)}
                            inputRef={partyGstRef}
                            fullWidth
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: "right", mt: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveParty}
                            disabled={savedSections.party}
                            sx={styles.compactButton}
                          >
                            {savedSections.party ? "Saved" : "Save Party"}
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
                      {savedSections.purchase && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
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
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Invoice No *"
                          value={purchaseForm.invoice_no}
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              invoice_no: e.target.value,
                            })
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
                            setPurchaseForm({
                              ...purchaseForm,
                              date: e.target.value,
                            })
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
                            setPurchaseForm({
                              ...purchaseForm,
                              received_date: e.target.value,
                            })
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
                              setPurchaseForm({
                                ...purchaseForm,
                                product_name: e.target.value,
                              })
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
                            setPurchaseForm({
                              ...purchaseForm,
                              contracted_rate: newRate,
                            });

                            // Auto-calculate oil rebate/premium when rate changes
                            if (labForm.obtain_oil) {
                              const netWeight =
                                parseFloat(purchaseForm.net_weight_mt) || 0;
                              const oilCalc = calculateOilRebatePremium(
                                purchaseForm.product_name,
                                labForm.obtain_oil,
                                newRate,
                                netWeight
                              );
                              setLabForm((prev) => ({
                                ...prev,
                                oil_rebate_rs:
                                  oilCalc.rebate > 0
                                    ? oilCalc.rebate.toFixed(2)
                                    : "",
                                oil_premium_rs:
                                  oilCalc.premium > 0
                                    ? oilCalc.premium.toFixed(2)
                                    : "",
                              }));
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            ),
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
                              setPurchaseForm({
                                ...purchaseForm,
                                final_contracted_rate: finalRate,
                              });
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            fullWidth
                            // helperText="Only for Red Bran"
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
                            setPurchaseForm({
                              ...purchaseForm,
                              billed_weight_mt: billedWeight,
                            });
                          }}
                          fullWidth
                          // helperText="Separate from Actual Weight"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Actual Weight (MT)"
                          type="number"
                          value={purchaseForm.gross_weight_mt}
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              gross_weight_mt: e.target.value,
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, noOfBagsRef)}
                          inputRef={grossWeightRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="No. of Bags"
                          type="number"
                          value={purchaseForm.no_of_bags}
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              no_of_bags: e.target.value,
                            })
                          }
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
                              setPurchaseForm({
                                ...purchaseForm,
                                bag_type: e.target.value,
                              })
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
                              setPurchaseForm({
                                ...purchaseForm,
                                bran_type: e.target.value,
                              })
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
                              setPurchaseForm({
                                ...purchaseForm,
                                purchased_from: e.target.value,
                              })
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
                                setPurchaseForm({
                                  ...purchaseForm,
                                  agent_name: e.target.value,
                                })
                              }
                              fullWidth
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Agent Mobile No"
                              value={purchaseForm.agent_number}
                              onChange={(e) =>
                                handleMobileChange(
                                  e,
                                  "purchase_agent",
                                  setPurchaseForm
                                )
                              }
                              inputProps={{ maxLength: 10 }}
                              type="tel"
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
                            disabled={savedSections.purchase}
                            sx={{
                              ...styles.compactButton,
                              bgcolor: "success.main",
                            }}
                          >
                            {savedSections.purchase ? "Saved" : "Save Purchase"}
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
                      {savedSections.vehicle && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
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
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              vehicle_no: e.target.value,
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, ownerNameRef)}
                          inputRef={vehicleNoRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner Name"
                          value={vehicleForm.owner_name}
                          onChange={(e) =>
                            setVehicleForm({
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
                            setVehicleForm({
                              ...vehicleForm,
                              rice_mill_name: e.target.value,
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, destFromRef)}
                          inputRef={riceMillRef}
                          fullWidth
                          // helperText="Auto-filled from Party Name"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Destination From"
                          value={vehicleForm.destination_from}
                          onChange={(e) =>
                            setVehicleForm({
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
                            setVehicleForm({
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
                            setVehicleForm({
                              ...vehicleForm,
                              quantity_mt: quantity,
                            });
                          }}
                          onKeyDown={(e) => handleKeyDown(e, freightMtRef)}
                          inputRef={quantityMtRef}
                          fullWidth
                          // helperText="Auto-filled from Actual Weight"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Freight/MT (₹)"
                          type="number"
                          value={vehicleForm.freight_per_mt}
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              freight_per_mt: e.target.value,
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, advanceAmtRef)}
                          inputRef={freightMtRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Advance Amount (₹)"
                          type="number"
                          value={vehicleForm.advance_amount}
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              advance_amount: e.target.value,
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, bankAccRef)}
                          inputRef={advanceAmtRef}
                          fullWidth
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
                            setVehicleForm({
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
                            setVehicleForm({
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
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              ifsc: e.target.value,
                            })
                          }
                          onKeyDown={(e) => handleKeyDown(e, ownerAddrRef)}
                          inputRef={ifscRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner Address"
                          value={vehicleForm.owner_address_line1}
                          onChange={(e) =>
                            setVehicleForm({
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
                            setVehicleForm({
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
                            setVehicleForm({
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
                            setVehicleForm({
                              ...vehicleForm,
                              owner_pin: e.target.value,
                            })
                          }
                          inputProps={{ maxLength: 6 }}
                          onKeyDown={(e) => handleKeyDown(e, obtainFfaRef)}
                          inputRef={ownerPinRef}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <FormControl sx={styles.compactRadio}>
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
                            disabled={savedSections.vehicle || !purchaseId}
                            sx={{
                              ...styles.compactButton,
                              bgcolor: "info.main",
                            }}
                          >
                            {savedSections.vehicle ? "Saved" : "Save Vehicle"}
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
                      {savedSections.lab && (
                        <Chip
                          label="✓ Saved"
                          size="small"
                          color="success"
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
                                ffaValue
                              );
                              setLabForm({
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
                              setLabForm({
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
                              setLabForm((prev) => ({
                                ...prev,
                                obtain_oil: e.target.value,
                              }))
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
                            onClick={handleSMSClick}
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
                            disabled={savedSections.lab || !purchaseId}
                            sx={{
                              ...styles.compactButton,
                              bgcolor: "secondary.main",
                            }}
                          >
                            {savedSections.lab ? "Saved" : "Save Lab"}
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
                  {savedSections.billing && (
                    <Chip
                      label="✓ Saved"
                      size="small"
                      color="success"
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
                      // helperText="Final Contracted Rate - FFA Price"
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
                      // helperText="(Account Rate / Oil Standard) × Oil Difference"
                    />
                  </Grid>

                  {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Net Amount (₹)"
                      value={calculateNetAmount().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      // helperText="(Account Rate / Oil Standard) × Oil Difference"
                    />
                  </Grid> */}

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Material Amount (₹)"
                      value={calculateMaterialAmount().toFixed(2)}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      // helperText="Account Rate × Net Weight"
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
                      // helperText="Net Amount + Material Amount"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FormControl sx={styles.compactRadio}>
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
                      {partyForm.gst && (
                        <Chip
                          label={
                            billingForm.gst_type === "Inter"
                              ? "OD GST"
                              : "Other State"
                          }
                          size="small"
                          color={
                            billingForm.gst_type === "Inter"
                              ? "warning"
                              : "info"
                          }
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "11px" }}
                    >
                      {partyForm.gst
                        ? `GST: ${partyForm.gst}`
                        : "Enter GST to auto-select"}
                    </Typography>
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
                      // helperText="Gross Amount + GST"
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
                        setBillingForm({
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
                      // helperText="Billed Amount - Invoice Amount"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }} sx={{ textAlign: "right", mt: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveBilling}
                      disabled={savedSections.billing || !purchaseId}
                      sx={{ ...styles.compactButton, bgcolor: "error.main" }}
                    >
                      {savedSections.billing ? "Saved" : "Save Billing"}
                    </Button>
                  </Grid>
                </Grid>
              </Collapse>
            </CardContent>
          </Card>

          {/* Generate Invoice Button */}
          {allSectionsSaved && (
            <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
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
            </Box>
          )}
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
        vehicleData={savedVehicleData || vehicleForm}
        companyData={companies.find((c) => (c._id || c.id) === selectedCompany)}
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
