// src/pages/EditForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Science as ScienceIcon,
  AttachMoney as AttachMoneyIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

// Compact Field Styles (same as Home.jsx)
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

const EditForm = ({ onLogout, currentUser }) => {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
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

  const [expandedSections, setExpandedSections] = useState({
    party: true,
    purchase: true,
    vehicle: true,
    lab: true,
    billing: true,
  });

  // Load form data
  useEffect(() => {
    loadFormData();
  }, [purchaseId]);

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
          product_name: formData.purchase.product_name || "Boiled Rice Bran",
          contracted_rate: formData.purchase.contracted_rate || "",
          bran_type: formData.purchase.bran_type || "Good",
          gross_weight_mt: formData.purchase.gross_weight_mt || "",
          no_of_bags: formData.purchase.no_of_bags || "",
          bag_type: "Poly",
          bag_weight_mt: "0.000200",
          net_weight_mt: formData.purchase.net_weight_mt || "",
        });
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
      }

      // Populate lab form
      if (formData.lab) {
        setLabForm({
          standard_ffa: formData.lab.standard_ffa?.toString() || "7",
          standard_oil: formData.lab.standard_oil?.toString() || "19",
          obtain_ffa: formData.lab.obtain_ffa?.toString() || "",
          obtain_oil: formData.lab.obtain_oil?.toString() || "",
          rebate_rs: formData.lab.rebate_rs?.toString() || "",
          premium_rs: formData.lab.premium_rs?.toString() || "",
        });
      }

      // Populate billing form
      if (formData.billing) {
        setBillingForm({
          gst_type: formData.billing.gst_type || "Intra",
          invoice_amount: formData.billing.invoice_amount?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Failed to load form data:", error);
      showError("Failed to load form data");
      navigate("/home");
    } finally {
      setLoading(false);
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

  // Handle mobile number input
  const handleMobileChange = (e, setForm) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setForm((prev) => ({ ...prev, mobile_no: value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update all sections
      const updates = [];

      // Update purchase
      if (purchaseForm) {
        const purchaseData = {
          ...purchaseForm,
          contracted_rate: parseFloat(purchaseForm.contracted_rate),
          gross_weight_mt: parseFloat(purchaseForm.gross_weight_mt),
        };
        updates.push(api.updatePurchase(purchaseId, purchaseData));
      }

      // Update party (need to find party ID first)
      if (partyForm.party_name) {
        try {
          const parties = await api.getParties();
          const party = parties.find(
            (p) => p.party_name === partyForm.party_name
          );
          if (party) {
            updates.push(api.updateParty(party._id, partyForm));
          }
        } catch (err) {
          console.error("Failed to update party:", err);
        }
      }

      // Update vehicle (need to find vehicle ID first)
      if (vehicleForm.vehicle_no) {
        try {
          const vehicles = await api.getVehicles();
          const vehicle = vehicles.find((v) => v.purchase_id === purchaseId);
          if (vehicle) {
            updates.push(api.updateVehicle(vehicle._id, vehicleForm));
          }
        } catch (err) {
          console.error("Failed to update vehicle:", err);
        }
      }

      // Update lab (need to find lab ID first)
      if (labForm.obtain_ffa || labForm.obtain_oil) {
        try {
          const labs = await api.getLabDetails();
          const lab = labs.find((l) => l.purchase_id === purchaseId);
          if (lab) {
            const labData = {
              ...labForm,
              obtain_ffa: labForm.obtain_ffa
                ? parseFloat(labForm.obtain_ffa)
                : null,
              obtain_oil: labForm.obtain_oil
                ? parseFloat(labForm.obtain_oil)
                : null,
              rebate_rs: labForm.rebate_rs
                ? parseFloat(labForm.rebate_rs)
                : null,
              premium_rs: labForm.premium_rs
                ? parseFloat(labForm.premium_rs)
                : null,
            };
            updates.push(api.updateLabDetail(lab._id, labData));
          }
        } catch (err) {
          console.error("Failed to update lab:", err);
        }
      }

      // Update billing (need to find billing ID first)
      if (billingForm.gst_type) {
        try {
          const billings = await api.getBillings();
          const billing = billings.find((b) => b.purchase_id === purchaseId);
          if (billing) {
            const billingData = {
              ...billingForm,
              invoice_amount: billingForm.invoice_amount
                ? parseFloat(billingForm.invoice_amount)
                : null,
            };
            updates.push(api.updateBilling(billing._id, billingData));
          }
        } catch (err) {
          console.error("Failed to update billing:", err);
        }
      }

      // Execute all updates
      await Promise.all(updates);

      showSuccess("Form updated successfully!");
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 1500);
    } catch (error) {
      console.error("Failed to save form:", error);
      showError("Failed to save form: " + error.message);
    } finally {
      setSaving(false);
    }
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
      {/* Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={1}
        sx={{ bgcolor: "white", color: "text.primary" }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "56px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={() => navigate(-1)}>
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
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            color="primary"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            ✏️ Edit Rice Bran Invoice Form
          </Typography>

          {/* Party and Purchase Details Side by Side */}
          <Grid container spacing={1} sx={styles.compactGrid}>
            {/* PARTY DETAILS - Left Column */}
            <Grid item xs={12} md={6}>
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
                      <Grid item xs={12}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Mobile No *"
                          value={partyForm.mobile_no}
                          onChange={(e) => handleMobileChange(e, setPartyForm)}
                          inputProps={{ maxLength: 10 }}
                          type="tel"
                          helperText="10 digits only"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>

            {/* PURCHASE DETAILS - Right Column */}
            <Grid item xs={12} md={6}>
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Party Name"
                          value={purchaseForm.party_name}
                          onChange={(e) =>
                            setPurchaseForm({
                              ...purchaseForm,
                              party_name: e.target.value,
                            })
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12}>
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
                      <Grid item xs={12}>
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
                          <Grid item xs={12} sm={6}>
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
                          <Grid item xs={12} sm={6}>
                            <TextField
                              size="small"
                              sx={styles.compactField}
                              label="Agent Mobile No"
                              value={purchaseForm.agent_number}
                              onChange={(e) =>
                                handleMobileChange(e, setPurchaseForm)
                              }
                              inputProps={{ maxLength: 10 }}
                              type="tel"
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Vehicle and Lab Details Side by Side */}
          <Grid container spacing={1} sx={styles.compactGrid}>
            {/* VEHICLE DETAILS - Left Column */}
            <Grid item xs={12} md={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          sx={styles.compactField}
                          label="Owner Mobile No"
                          value={vehicleForm.mobile_no}
                          onChange={(e) =>
                            handleMobileChange(e, setVehicleForm)
                          }
                          inputProps={{ maxLength: 10 }}
                          type="tel"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12}>
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
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>

            {/* LABORATORY DETAILS - Right Column */}
            <Grid item xs={12} md={6}>
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
                      <Grid item xs={12} sm={6}>
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

                      <Grid item xs={12} sm={6}>
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
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* BILLING DETAILS Row */}
          <Card
            elevation={1}
            sx={{ borderRadius: 2, ...styles.compactCard, mt: 1 }}
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
                    5. Billing Details
                  </Typography>
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
                <Grid container spacing={1} sx={styles.compactGrid}>
                  <Grid item xs={12} sm={6} md={4}>
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
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
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
                </Grid>
              </Collapse>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3,
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={styles.compactButton}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
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
        </Paper>
      </Box>

      {/* Snackbar */}
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

export default EditForm;
