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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Company states
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Dialog States
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
    product_name: "Boiled Rice Bran",
    contracted_rate: "",
    bran_type: "Good",
    gross_weight_mt: "",
    no_of_bags: "",
    bag_type: "Poly",
    bag_weight_mt: "0.000200",
    net_weight_mt: "",
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
    rebate_rs: "",
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
    lab: false,
    billing: false,
  });

  // Saved data states
  const [savedVehicleData, setSavedVehicleData] = useState(null);
  const [savedLabData, setSavedLabData] = useState(null);
  const [savedPurchaseData, setSavedPurchaseData] = useState(null);
  const [savedPartyData, setSavedPartyData] = useState(null);

  // Load companies and parties on mount
  useEffect(() => {
    loadCompanies();
    loadParties();
  }, []);

  // Add this useEffect in Home.jsx
  useEffect(() => {
    // Auto-fill destination_from from selected party
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

  useEffect(() => {
    // Auto-fill destination_to from selected company
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

  // Load companies from backend
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);

      // Everyone sees all companies
      const companiesData = await api.getMyCompanies();
      console.log("Loaded companies for dropdown:", companiesData);

      setCompanies(companiesData);

      // Set default selected company
      if (companiesData.length > 0) {
        // Priority 1: User's previously selected/assigned company
        if (currentUser?.company_id) {
          const userCompany = companiesData.find(
            (c) => (c._id || c.id) === currentUser.company_id
          );
          if (userCompany) {
            setSelectedCompany(userCompany._id || userCompany.id);
            console.log("Selected user's company:", userCompany.company_name);
          } else {
            // Priority 2: Default company (first one)
            const firstCompany = companiesData[0];
            setSelectedCompany(firstCompany._id || firstCompany.id);
            console.log("Selected first company:", firstCompany.company_name);
          }
        } else {
          // No company assigned, use first one
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

  // Auto-calculate bag weight and net weight
  useEffect(() => {
    const bagWeight = purchaseForm.bag_type === "Poly" ? 0.0002 : 0.0005;
    const bagWeightStr = bagWeight.toFixed(6);

    const grossWeight = parseFloat(purchaseForm.gross_weight_mt) || 0;
    const noOfBags = parseInt(purchaseForm.no_of_bags) || 0;
    const netWeight = grossWeight - noOfBags * bagWeight;
    const netWeightStr = netWeight >= 0 ? netWeight.toFixed(6) : "0.000000";

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
      setBillingForm((prev) => ({
        ...prev,
        gst_type: isOdisha ? "Inter" : "Intra",
      }));
    }
  }, [partyForm.gst]);

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

    // Get company name for display
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

  // FORM HANDLERS
  const handleSaveParty = async () => {
    try {
      // Add company_id to party data if a company is selected
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
        company_id: selectedCompany,
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
      const labData = {
        ...labForm,
        purchase_id: purchaseId,
        // Convert empty strings to null
        obtain_ffa: labForm.obtain_ffa ? parseFloat(labForm.obtain_ffa) : null,
        obtain_oil: labForm.obtain_oil ? parseFloat(labForm.obtain_oil) : null,
        rebate_rs: labForm.rebate_rs ? parseFloat(labForm.rebate_rs) : null,
        premium_rs: labForm.premium_rs ? parseFloat(labForm.premium_rs) : null,
      };

      // Ensure standard values are always numbers
      labData.standard_ffa = parseFloat(labForm.standard_ffa) || 0;
      labData.standard_oil = parseFloat(labForm.standard_oil) || 0;

      const savedLab = await api.createLabDetail(labData);
      setSavedLabData(savedLab);
      setSavedSections((prev) => ({ ...prev, lab: true }));
      showSuccess("Laboratory details saved!");
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

  const handleGenerateInvoice = async () => {
    try {
      if (!purchaseId) {
        showError("Please save purchase details first");
        return;
      }

      const response = await api.generateInvoice(purchaseId);

      if (response && response.data) {
        const raw = response.data;

        // Transform backend data to match InvoicePreview expectations
        const transformedData = {
          // Company Info (from backend)
          companyName: raw.company?.company_name || "MANMATH PATTANAIK & CO",
          companyAddress:
            raw.company?.address_line1 || "16- MAHANADI VIHAR CUTTACK-4",
          companyMobile: raw.company?.mobile_no || "9437025723 / 9178314411",
          companyGST: raw.company?.gstin || "21AMJPP6577A124",

          // Party Info
          partyName: raw.party?.party_name || "N/A",
          partyAddress:
            [
              raw.party?.address_line1,
              raw.party?.city,
              raw.party?.state,
              raw.party?.pin,
            ]
              .filter(Boolean)
              .join(", ") || "N/A",
          partyGST: raw.party?.gst || "N/A",

          // Purchase Info
          reportType: raw.purchase?.report_type || "Purchase",
          invoiceNo: raw.purchase?.invoice_no || "N/A",
          invoiceDate:
            raw.purchase?.date || new Date().toISOString().split("T")[0],
          productName: raw.purchase?.product_name || "Boiled Rice Bran",
          contractedRate: parseFloat(raw.purchase?.contracted_rate) || 0,
          grossWeight: parseFloat(raw.purchase?.gross_weight_mt) || 0,

          // Vehicle Info
          vehicleNo: raw.vehicle?.vehicle_no || "N/A",
          destinationFrom: raw.vehicle?.destination_from || "N/A",
          destinationTo: raw.vehicle?.destination_to || "N/A",

          // Quantity Info
          plasticBags: parseInt(raw.quantity?.no_of_bags) || 0,
          bagWeight: parseFloat(raw.quantity?.bag_weight_mt) || 0.0002,
          netWeight: parseFloat(raw.quantity?.net_weight_mt) || 0,

          // Lab Info
          ffaStandard: parseFloat(raw.lab?.standard_ffa) || 7,
          ffaResult: parseFloat(raw.lab?.obtain_ffa) || 0,
          ffaDifference: (
            parseFloat(raw.lab?.obtain_ffa || 0) -
            parseFloat(raw.lab?.standard_ffa || 0)
          ).toFixed(2),
          oilStandard: parseFloat(raw.lab?.standard_oil) || 19,
          oilResult: parseFloat(raw.lab?.obtain_oil) || 0,
          oilDifference: (
            parseFloat(raw.lab?.obtain_oil || 0) -
            parseFloat(raw.lab?.standard_oil || 0)
          ).toFixed(2),

          // Billing Info
          gstType: raw.billing?.gst_type || "Intra",
          accountRate: parseFloat(raw.billing?.account_rate) || 0,
          netRate: parseFloat(raw.billing?.net_rate) || 0,
          materialAmount: parseFloat(raw.billing?.material_amount) || 0,
          netAmount: parseFloat(raw.billing?.net_amount) || 0,
          grossAmount: parseFloat(raw.billing?.gross_amount) || 0,
          cgstAmount: parseFloat(raw.billing?.cgst) || 0,
          sgstAmount: parseFloat(raw.billing?.sgst) || 0,
          igstAmount: parseFloat(raw.billing?.igst) || 0,
          billedAmount: parseFloat(raw.billing?.billed_amount) || 0,
          invoiceAmount: parseFloat(raw.billing?.invoice_amount) || 0,
          amountPayable: parseFloat(raw.billing?.amount_payable) || 0,
          amountPayableAbs: Math.abs(
            parseFloat(raw.billing?.amount_payable) || 0
          ).toFixed(2),

          // Serial No (generate or use invoice no)
          serialNo: `SRM/G-${new Date().getFullYear()}${String(
            new Date().getMonth() + 1
          ).padStart(2, "0")}/${Math.floor(Math.random() * 1000)}`,

          // In Words (add number-to-words function if needed)
          inWords: "Zero ONLY", // You can implement this later
        };

        setGeneratedInvoice(transformedData);
        setShowInvoice(true);
        showSuccess("Invoice generated successfully!");
      } else {
        showError("No invoice data returned from server");
      }
    } catch (err) {
      console.error("Invoice generation error:", err);
      showError("Failed to generate invoice: " + err.message);
    }
  };

  // Add helper function to get oil standard
  const getOilStandard = (product) => {
    const mapping = {
      "Boiled Rice Bran": 19.0,
      "Raw Rice Bran": 16.0,
      "Rough Rice Bran": 7.0,
    };
    return mapping[product] || 19.0;
  };

  // Also update the calculateAccountRate function to handle edge cases:
  const calculateAccountRate = (product, contractedRate, ffa) => {
    // Ensure valid numbers
    const rate = parseFloat(contractedRate) || 0;
    const ffaValue = parseFloat(ffa) || 0;

    let deduction = 0;
    let remainingFFA = ffaValue;

    if (product === "Boiled Rice Bran") {
      if (remainingFFA > 45) {
        deduction = 4000.0;
      } else if (remainingFFA > 30) {
        deduction = 3500.0;
      } else if (remainingFFA > 25) {
        deduction = 2500.0;
      } else if (remainingFFA > 20) {
        deduction = 2000.0;
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
      // For other products
      if (remainingFFA > 55) {
        deduction = 1000.0;
      } else if (remainingFFA > 50) {
        deduction = 700.0;
      } else if (remainingFFA > 45) {
        deduction = 600.0;
      } else if (remainingFFA > 40) {
        deduction = 500.0;
      } else if (remainingFFA > 35) {
        deduction = 400.0;
      } else if (remainingFFA > 30) {
        deduction = 300.0;
      } else if (remainingFFA > 25) {
        deduction = 200.0;
      } else if (remainingFFA > 20) {
        deduction = 100.0;
      }
    }

    const result = Math.max(0, rate - deduction);
    return parseFloat(result.toFixed(2));
  };

  // Ensure numberToWords function exists
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

    // Handle decimals (paise)
    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);

    let words = "";

    // Convert whole part
    let n = wholePart;

    if (n >= 100) {
      words += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      words += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      words += teens[n - 10] + " ";
      n = 0;
    }

    if (n > 0) {
      words += units[n] + " ";
    }

    words = words.trim();

    // Add "Rupees" if there's a whole part
    if (wholePart > 0) {
      words += " Rupees";
    }

    // Add paise if there's a decimal part
    if (decimalPart > 0) {
      if (wholePart > 0) {
        words += " and ";
      }

      if (decimalPart >= 20) {
        words += tens[Math.floor(decimalPart / 10)] + " ";
        const unit = decimalPart % 10;
        if (unit > 0) {
          words += units[unit] + " ";
        }
      } else if (decimalPart >= 10) {
        words += teens[decimalPart - 10] + " ";
      } else if (decimalPart > 0) {
        words += units[decimalPart] + " ";
      }

      words += "Paise";
    }

    return words + " ONLY";
  };

  const allSectionsSaved = Object.values(savedSections).every(Boolean);

  // Add this useEffect to log and check the currentUser
  useEffect(() => {
    console.log("Current User in Home:", currentUser);
    console.log("Companies available:", companies);
  }, [currentUser, companies]);

  // Update the getUserCompanyName function to be more robust
  const getUserCompanyName = () => {
    if (!currentUser || companies.length === 0) {
      return "Select Company";
    }

    // Get the currently selected company name
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
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={1}
        sx={{ bgcolor: "white", color: "text.primary" }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <HomeIcon color="primary" />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            >
              Rice Bran Invoice System
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={userRole === "admin" ? "Administrator" : "User"}
              color={userRole === "admin" ? "secondary" : "primary"}
              size="small"
              variant="outlined"
            />
            {userRole !== "admin" && (
              <Chip
                label={getUserCompanyName()}
                color="info"
                size="small"
                variant="outlined"
              />
            )}
            <IconButton color="primary" onClick={onLogout} size="small">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "#f5f5f5",
          p: 1,
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
                        {company.user_count && company.form_count && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: "text.secondary" }}
                          >
                            ({company.user_count} users, {company.form_count}{" "}
                            forms)
                          </Typography>
                        )}
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
                              party_name: e.target.value,
                            })
                          }
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
                              contact_person: e.target.value,
                            })
                          }
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
                              address_line1: e.target.value,
                            })
                          }
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
                            setPartyForm({ ...partyForm, city: e.target.value })
                          }
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
                              state: e.target.value,
                            })
                          }
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
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Date"
                          type="date"
                          value={purchaseForm.date}
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              date: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              contracted_rate: e.target.value,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                ₹
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Gross Weight (MT)"
                          type="number"
                          value={purchaseForm.gross_weight_mt}
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              gross_weight_mt: e.target.value,
                            })
                          }
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
                          // helperText="Auto-calculated"
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
                          // helperText="Auto-calculated"
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
                              owner_name: e.target.value,
                            })
                          }
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
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Rice Mill Name"
                          value={vehicleForm.rice_mill_name}
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              rice_mill_name: e.target.value,
                            })
                          }
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
                            setVehicleForm({
                              ...vehicleForm,
                              destination_from: e.target.value,
                            })
                          }
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
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Quantity (MT)"
                          type="number"
                          value={vehicleForm.quantity_mt}
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              quantity_mt: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setVehicleForm({
                              ...vehicleForm,
                              freight_per_mt: e.target.value,
                            })
                          }
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
                              bank_name: e.target.value,
                            })
                          }
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
                              owner_address_line1: e.target.value,
                            })
                          }
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
                              owner_city: e.target.value,
                            })
                          }
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
                              owner_state: e.target.value,
                            })
                          }
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
                      {/* Two Column Layout for Lab Details */}
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
                            onChange={(e) =>
                              setLabForm({
                                ...labForm,
                                obtain_ffa: e.target.value,
                              })
                            }
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="Rebate Amount (₹)"
                            type="number"
                            value={labForm.rebate_rs}
                            onChange={(e) =>
                              setLabForm({
                                ...labForm,
                                rebate_rs: e.target.value,
                              })
                            }
                            InputProps={{
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
                              setLabForm({
                                ...labForm,
                                obtain_oil: e.target.value,
                              })
                            }
                            fullWidth
                          />
                          <TextField
                            size="small"
                            sx={styles.compactField}
                            label="Premium Amount (₹)"
                            type="number"
                            value={labForm.premium_rs}
                            onChange={(e) =>
                              setLabForm({
                                ...labForm,
                                premium_rs: e.target.value,
                              })
                            }
                            InputProps={{
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
                    5. Billing Details (Auto-Calculated)
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
                      value={calculateAccountRate(
                        purchaseForm.product_name,
                        parseFloat(purchaseForm.contracted_rate) || 0,
                        parseFloat(labForm.obtain_ffa) || 0
                      ).toFixed(2)}
                      InputProps={{ readOnly: true }}
                      // helperText="Contracted Rate - FFA Price"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Net Rate (₹)"
                      value={(() => {
                        const accountRate = calculateAccountRate(
                          purchaseForm.product_name,
                          parseFloat(purchaseForm.contracted_rate) || 0,
                          parseFloat(labForm.obtain_ffa) || 0
                        );
                        const oilStandard =
                          parseFloat(labForm.standard_oil) || 19;
                        const oilObtained =
                          parseFloat(labForm.obtain_oil) || oilStandard;
                        const oilDiff = oilObtained - oilStandard;
                        return oilStandard > 0
                          ? ((accountRate / oilStandard) * oilDiff).toFixed(2)
                          : "0.00";
                      })()}
                      InputProps={{ readOnly: true }}
                      // helperText="(Account Rate/Oil Standard) × Oil Difference"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Net Amount (₹)"
                      value={(() => {
                        const accountRate = calculateAccountRate(
                          purchaseForm.product_name,
                          parseFloat(purchaseForm.contracted_rate) || 0,
                          parseFloat(labForm.obtain_ffa) || 0
                        );
                        const oilStandard =
                          parseFloat(labForm.standard_oil) || 19;
                        const oilObtained =
                          parseFloat(labForm.obtain_oil) || oilStandard;
                        const oilDiff = oilObtained - oilStandard;
                        const netRate =
                          oilStandard > 0
                            ? (accountRate / oilStandard) * oilDiff
                            : 0;
                        const netWeight =
                          parseFloat(purchaseForm.net_weight_mt) || 0;
                        return (netRate * accountRate).toFixed(2);
                      })()}
                      InputProps={{ readOnly: true }}
                      // helperText="Net Rate × Account Rate"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Material Amount (₹)"
                      value={(() => {
                        const accountRate = calculateAccountRate(
                          purchaseForm.product_name,
                          parseFloat(purchaseForm.contracted_rate) || 0,
                          parseFloat(labForm.obtain_ffa) || 0
                        );
                        const netWeight =
                          parseFloat(purchaseForm.net_weight_mt) || 0;
                        return (accountRate * netWeight).toFixed(2);
                      })()}
                      InputProps={{ readOnly: true }}
                      // helperText="Account Rate × Net Weight"
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Gross Amount (₹)"
                      value={(() => {
                        const accountRate = calculateAccountRate(
                          purchaseForm.product_name,
                          parseFloat(purchaseForm.contracted_rate) || 0,
                          parseFloat(labForm.obtain_ffa) || 0
                        );
                        const oilStandard =
                          parseFloat(labForm.standard_oil) || 19;
                        const oilObtained =
                          parseFloat(labForm.obtain_oil) || oilStandard;
                        const oilDiff = oilObtained - oilStandard;
                        const netRate =
                          oilStandard > 0
                            ? (accountRate / oilStandard) * oilDiff
                            : 0;
                        const netWeight =
                          parseFloat(purchaseForm.net_weight_mt) || 0;
                        const netAmount = netRate * accountRate;
                        const materialAmount = accountRate * netWeight;
                        return (netAmount + materialAmount).toFixed(2);
                      })()}
                      InputProps={{ readOnly: true }}
                      // helperText="Net Amount + Material Amount"
                      fullWidth
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
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      size="small"
                      sx={styles.compactField}
                      label="Amount Payable (₹)"
                      value={(() => {
                        // Calculate billed amount
                        const accountRate = calculateAccountRate(
                          purchaseForm.product_name,
                          parseFloat(purchaseForm.contracted_rate) || 0,
                          parseFloat(labForm.obtain_ffa) || 0
                        );
                        const oilStandard =
                          parseFloat(labForm.standard_oil) || 19;
                        const oilObtained =
                          parseFloat(labForm.obtain_oil) || oilStandard;
                        const oilDiff = oilObtained - oilStandard;
                        const netRate =
                          oilStandard > 0
                            ? (accountRate / oilStandard) * oilDiff
                            : 0;
                        const netWeight =
                          parseFloat(purchaseForm.net_weight_mt) || 0;
                        const netAmount = netRate * accountRate;
                        const materialAmount = accountRate * netWeight;
                        const grossAmount = netAmount + materialAmount;

                        // Calculate GST
                        let gstAmount = 0;
                        if (billingForm.gst_type === "Intra") {
                          gstAmount = grossAmount * 0.05; // 2.5% CGST + 2.5% SGST
                        } else if (billingForm.gst_type === "Inter") {
                          gstAmount = grossAmount * 0.05; // 5% IGST
                        }

                        const billedAmount = grossAmount + gstAmount;
                        const invoiceAmount =
                          parseFloat(billingForm.invoice_amount) || 0;
                        return (billedAmount - invoiceAmount).toFixed(2);
                      })()}
                      InputProps={{ readOnly: true }}
                      // helperText="Billed Amount - Invoice Amount"
                      fullWidth
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
