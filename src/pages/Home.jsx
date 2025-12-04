import React, { useState, useEffect } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Select,
  InputLabel,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Chip,
  Tooltip,
  Stack,
  Avatar,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ScaleIcon from "@mui/icons-material/Scale";
import ScienceIcon from "@mui/icons-material/Science";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const steps = [
  "Party Details",
  "Purchase Details",
  "Vehicle Details",
  "Quantity Details",
  "Laboratory Details",
  "Billing Details",
];

const stepIcons = [
  <AccountCircleIcon />,
  <InventoryIcon />,
  <LocalShippingIcon />,
  <ScaleIcon />,
  <ScienceIcon />,
  <AttachMoneyIcon />,
];

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Data states
  const [parties, setParties] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [labDetails, setLabDetails] = useState([]);
  const [billings, setBillings] = useState([]);

  // Form states
  const [partyForm, setPartyForm] = useState({
    partyName: "",
    address: "",
    contactPerson: "",
    gst: "",
    customerType: "",
    description: "",
  });

  const [purchaseForm, setPurchaseForm] = useState({
    reportType: "normal",
    partyName: "",
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    productName: "",
    contractedRate: "",
    branType: "type1",
    grossWeight: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNo: "",
    ownerName: "",
    ownerAddress: "",
    mobileNo: "",
    transportName: "",
    transportAddress: "",
    driverName: "",
    dlNo: "",
    driverNo: "",
  });

  const [quantityForm, setQuantityForm] = useState({
    grossWeight: "",
    noOfBags: "",
    bagType: "plastic",
    bagWeight: "",
    netWeight: "",
  });

  const [labForm, setLabForm] = useState({
    standard: "",
    obtain: "",
    account: "",
    penaltyPercent: "",
    penaltyRs: "",
    premium: "",
    total: "",
  });

  const [billingForm, setBillingForm] = useState({
    accountRate: "",
    netRate: "",
    totalAmount: "",
    grossAmount: "",
    autoGST: "",
    billAmount: "",
    invoiceAmount: "",
    amountPayable: "",
  });

  // Calculate derived values
  useEffect(() => {
    // Calculate net weight
    if (
      quantityForm.grossWeight &&
      quantityForm.bagWeight &&
      quantityForm.noOfBags
    ) {
      const gross = parseFloat(quantityForm.grossWeight) || 0;
      const bagWeight = parseFloat(quantityForm.bagWeight) || 0;
      const noOfBags = parseInt(quantityForm.noOfBags) || 0;
      const net = gross - bagWeight * noOfBags;
      setQuantityForm((prev) => ({ ...prev, netWeight: net.toFixed(2) }));
    }
  }, [quantityForm.grossWeight, quantityForm.bagWeight, quantityForm.noOfBags]);

  useEffect(() => {
    // Calculate billing totals
    const accountRate = parseFloat(billingForm.accountRate) || 0;
    const netRate = parseFloat(billingForm.netRate) || 0;
    const totalAmount = accountRate * netRate;
    const gst = totalAmount * 0.18; // 18% GST
    const billAmount = totalAmount + gst;

    setBillingForm((prev) => ({
      ...prev,
      totalAmount: totalAmount.toFixed(2),
      autoGST: gst.toFixed(2),
      billAmount: billAmount.toFixed(2),
      invoiceAmount: billAmount.toFixed(2),
      amountPayable: billAmount.toFixed(2),
    }));
  }, [billingForm.accountRate, billingForm.netRate]);

  // Handlers
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSaveAndNext = () => {
    if (validateCurrentStep()) {
      saveStepData();
      setSnackbar({
        open: true,
        message: `Step ${activeStep + 1} saved successfully!`,
        severity: "success",
      });

      if (activeStep < steps.length - 1) {
        handleNext();
      } else {
        handleSubmitAll();
      }
    }
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return parties.length > 0 || showError("Please add at least one party");
      case 1:
        return (
          purchases.length > 0 ||
          showError("Please add at least one purchase detail")
        );
      case 2:
        return (
          vehicles.length > 0 || showError("Please add at least one vehicle")
        );
      default:
        return true;
    }
  };

  const showError = (message) => {
    setSnackbar({ open: true, message, severity: "error" });
    return false;
  };

  const saveStepData = () => {
    const savedSteps = JSON.parse(localStorage.getItem("formSteps") || "{}");
    savedSteps[activeStep] = {
      step: activeStep,
      data: getCurrentStepData(),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("formSteps", JSON.stringify(savedSteps));
  };

  const getCurrentStepData = () => {
    switch (activeStep) {
      case 0:
        return { parties };
      case 1:
        return { purchases };
      case 2:
        return { vehicles };
      case 3:
        return { quantities };
      case 4:
        return { labDetails };
      case 5:
        return { billings };
      default:
        return {};
    }
  };

  const handleOpenDialog = (type, id = null) => {
    setDialogType(type);
    setEditingId(id);

    if (id) {
      loadDataForEditing(type, id);
    } else {
      resetFormForDialog(type);
    }

    setOpenDialog(true);
  };

  const loadDataForEditing = (type, id) => {
    let data;
    switch (type) {
      case "party":
        data = parties.find((p) => p.id === id);
        break;
      case "purchase":
        data = purchases.find((p) => p.id === id);
        break;
      case "vehicle":
        data = vehicles.find((v) => v.id === id);
        break;
      case "quantity":
        data = quantities.find((q) => q.id === id);
        break;
      case "lab":
        data = labDetails.find((l) => l.id === id);
        break;
      case "billing":
        data = billings.find((b) => b.id === id);
        break;
    }
    if (data) {
      const setForm = {
        party: setPartyForm,
        purchase: setPurchaseForm,
        vehicle: setVehicleForm,
        quantity: setQuantityForm,
        lab: setLabForm,
        billing: setBillingForm,
      }[type];
      setForm(data);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    resetFormForDialog(dialogType);
  };

  const resetFormForDialog = (type) => {
    const resetForms = {
      party: () =>
        setPartyForm({
          partyName: "",
          address: "",
          contactPerson: "",
          gst: "",
          customerType: "",
          description: "",
        }),
      purchase: () =>
        setPurchaseForm({
          reportType: "normal",
          partyName: "",
          invoiceNo: "",
          date: new Date().toISOString().split("T")[0],
          productName: "",
          contractedRate: "",
          branType: "type1",
          grossWeight: "",
        }),
      vehicle: () =>
        setVehicleForm({
          vehicleNo: "",
          ownerName: "",
          ownerAddress: "",
          mobileNo: "",
          transportName: "",
          transportAddress: "",
          driverName: "",
          dlNo: "",
          driverNo: "",
        }),
      quantity: () =>
        setQuantityForm({
          grossWeight: "",
          noOfBags: "",
          bagType: "plastic",
          bagWeight: "",
          netWeight: "",
        }),
      lab: () =>
        setLabForm({
          standard: "",
          obtain: "",
          account: "",
          penaltyPercent: "",
          penaltyRs: "",
          premium: "",
          total: "",
        }),
      billing: () =>
        setBillingForm({
          accountRate: "",
          netRate: "",
          totalAmount: "",
          grossAmount: "",
          autoGST: "",
          billAmount: "",
          invoiceAmount: "",
          amountPayable: "",
        }),
    };
    resetForms[type]?.();
  };

  const handleSaveDialog = () => {
    if (!validateDialogForm()) return;

    const newItem = { id: editingId || Date.now(), ...getFormData() };
    const setters = {
      party: setParties,
      purchase: setPurchases,
      vehicle: setVehicles,
      quantity: setQuantities,
      lab: setLabDetails,
      billing: setBillings,
    };
    const data = {
      party: parties,
      purchase: purchases,
      vehicle: vehicles,
      quantity: quantities,
      lab: labDetails,
      billing: billings,
    }[dialogType];

    if (editingId) {
      setters[dialogType](
        data.map((item) => (item.id === editingId ? newItem : item))
      );
    } else {
      setters[dialogType]((prev) => [...prev, newItem]);
    }

    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} ${
        editingId ? "updated" : "added"
      } successfully!`,
      severity: "success",
    });
  };

  const validateDialogForm = () => {
    const validations = {
      party: () =>
        !partyForm.partyName.trim() && showError("Party name is required"),
      purchase: () =>
        !purchaseForm.invoiceNo.trim() &&
        showError("Invoice number is required"),
      vehicle: () =>
        !vehicleForm.vehicleNo.trim() &&
        showError("Vehicle number is required"),
    };
    return validations[dialogType] ? !validations[dialogType]() : true;
  };

  const getFormData = () => {
    const forms = {
      party: partyForm,
      purchase: purchaseForm,
      vehicle: vehicleForm,
      quantity: quantityForm,
      lab: labForm,
      billing: billingForm,
    };
    return forms[dialogType];
  };

  const handleDelete = (type, id) => {
    const setters = {
      party: setParties,
      purchase: setPurchases,
      vehicle: setVehicles,
      quantity: setQuantities,
      lab: setLabDetails,
      billing: setBillings,
    };
    const data = {
      party: parties,
      purchase: purchases,
      vehicle: vehicles,
      quantity: quantities,
      lab: labDetails,
      billing: billings,
    }[type];

    setters[type](data.filter((item) => item.id !== id));
    setSnackbar({
      open: true,
      message: "Item deleted successfully",
      severity: "info",
    });
  };

  const handleSubmitAll = () => {
    const allData = {
      parties,
      purchases,
      vehicles,
      quantities,
      labDetails,
      billings,
      submittedAt: new Date().toISOString(),
      invoiceNo: `INV-${Date.now()}`,
    };
    localStorage.setItem("formSubmission", JSON.stringify(allData));
    setSnackbar({
      open: true,
      message: "Form submitted successfully! Message sent to party.",
      severity: "success",
    });
    setTimeout(() => window.location.reload(), 2000);
  };

  const filteredParties = parties.filter(
    (party) =>
      party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.gst.includes(searchTerm)
  );

  // Render Step Content with Grid v3
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Party Details
        return (
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("party")}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Add Party
              </Button>
              <TextField
                placeholder="Search parties..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: { xs: "100%", sm: 300 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {filteredParties.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No parties added yet. Click "Add Party" to get started.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sl.No</TableCell>
                      <TableCell>Party Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Contact Person</TableCell>
                      <TableCell>GST</TableCell>
                      <TableCell>Customer Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredParties.map((party, index) => (
                      <TableRow key={party.id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{party.partyName}</TableCell>
                        <TableCell>{party.address}</TableCell>
                        <TableCell>{party.contactPerson}</TableCell>
                        <TableCell>{party.gst}</TableCell>
                        <TableCell>
                          <Chip
                            label={party.customerType}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenDialog("party", party.id)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete("party", party.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      case 1: // Purchase Details
        return (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog("purchase")}
              >
                Add Purchase Details
              </Button>
              <Badge badgeContent={purchases.length} color="primary">
                <Typography variant="subtitle1">Purchases</Typography>
              </Badge>
            </Stack>

            <Grid container spacing={3}>
              {purchases.map((purchase) => (
                <Grid size={{ xs: 12, md: 6 }} key={purchase.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {purchase.invoiceNo}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            Party: {purchase.partyName}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            Date: {purchase.date}
                          </Typography>
                          <Typography color="textSecondary" variant="body2">
                            Product: {purchase.productName}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenDialog("purchase", purchase.id)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDelete("purchase", purchase.id)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">
                            Rate: ₹{purchase.contractedRate}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">
                            Weight: {purchase.grossWeight} kg
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <Chip
                            label={purchase.reportType.toUpperCase()}
                            size="small"
                            color={
                              purchase.reportType === "urgent"
                                ? "error"
                                : "default"
                            }
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {purchases.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No purchase details added yet.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 2: // Vehicle Details
        return (
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("vehicle")}
              sx={{ mb: 3 }}
            >
              Add Vehicle Detail
            </Button>

            <Grid container spacing={3}>
              {vehicles.map((vehicle) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={vehicle.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom color="primary">
                            {vehicle.vehicleNo}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Owner: {vehicle.ownerName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Driver: {vehicle.driverName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Mobile: {vehicle.mobileNo}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenDialog("vehicle", vehicle.id)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDelete("vehicle", vehicle.id)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {vehicles.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No vehicle details added yet.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 3: // Quantity Details
        return (
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("quantity")}
              sx={{ mb: 3 }}
            >
              Add Quantity
            </Button>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quantity Entries
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {quantities.length > 0 ? (
                      <Grid container spacing={2}>
                        {quantities.map((qty, index) => (
                          <Grid size={12} key={qty.id}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Box>
                                  <Typography variant="subtitle2">
                                    Entry {index + 1}
                                  </Typography>
                                  <Typography variant="body2">
                                    Gross: {qty.grossWeight} kg
                                  </Typography>
                                  <Typography variant="body2">
                                    Net: {qty.netWeight} kg
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleOpenDialog("quantity", qty.id)
                                      }
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDelete("quantity", qty.id)
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="textSecondary" align="center">
                        No quantity details added
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {quantities.length > 0 ? (
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Total Gross Weight
                          </Typography>
                          <Typography variant="h5">
                            {quantities
                              .reduce(
                                (sum, q) =>
                                  sum + parseFloat(q.grossWeight || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            kg
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Total Net Weight
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {quantities
                              .reduce(
                                (sum, q) => sum + parseFloat(q.netWeight || 0),
                                0
                              )
                              .toFixed(2)}{" "}
                            kg
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Total Bags
                          </Typography>
                          <Typography variant="h6">
                            {quantities.reduce(
                              (sum, q) => sum + parseInt(q.noOfBags || 0),
                              0
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Typography color="textSecondary">
                        Add quantity details to see summary
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 4: // Laboratory Details
        return (
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("lab")}
              sx={{ mb: 3 }}
            >
              Add Lab Details
            </Button>

            <Grid container spacing={3}>
              {labDetails.map((lab) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={lab.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {lab.standard} / {lab.obtain}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Account: {lab.account}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog("lab", lab.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete("lab", lab.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <Divider sx={{ my: 1.5 }} />
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">
                            Penalty: {lab.penaltyPercent}%
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">
                            ₹{lab.penaltyRs}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">
                            Premium: ₹{lab.premium}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography
                            variant="body2"
                            color="primary"
                            fontWeight="bold"
                          >
                            Total: ₹{lab.total}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {labDetails.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No laboratory details added yet.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      case 5: // Billing Details
        return (
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("billing")}
              sx={{ mb: 3 }}
            >
              Add Billing Details
            </Button>

            <Grid container spacing={3}>
              {billings.map((billing) => (
                <Grid size={12} key={billing.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">Billing Summary</Typography>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenDialog("billing", billing.id)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDelete("billing", billing.id)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={{ xs: 1, sm: 2 }}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Account Rate
                          </Typography>
                          <Typography>₹{billing.accountRate}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Net Rate
                          </Typography>
                          <Typography>₹{billing.netRate}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            Total Amount
                          </Typography>
                          <Typography>₹{billing.totalAmount}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <Typography variant="body2" color="textSecondary">
                            GST (18%)
                          </Typography>
                          <Typography>₹{billing.autoGST}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            Bill Amount
                          </Typography>
                          <Typography variant="h5" color="primary">
                            ₹{billing.billAmount}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="textSecondary">
                            Amount Payable
                          </Typography>
                          <Typography variant="h5" color="error">
                            ₹{billing.amountPayable}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {billings.length === 0 && (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="textSecondary">
                  No billing details added yet.
                </Typography>
              </Paper>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Render Dialog Content with Grid v3
  const renderDialogContent = () => {
    const dialogTitle = `${editingId ? "Edit" : "Add"} ${
      dialogType.charAt(0).toUpperCase() + dialogType.slice(1)
    }`;

    const renderForm = () => {
      switch (dialogType) {
        case "party":
          return (
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Party Name *"
                  value={partyForm.partyName}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, partyName: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={partyForm.address}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, address: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={partyForm.contactPerson}
                  onChange={(e) =>
                    setPartyForm({
                      ...partyForm,
                      contactPerson: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={partyForm.gst}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, gst: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Customer Type</InputLabel>
                  <Select
                    value={partyForm.customerType}
                    label="Customer Type"
                    onChange={(e) =>
                      setPartyForm({
                        ...partyForm,
                        customerType: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="regular">Regular</MenuItem>
                    <MenuItem value="premium">Premium</MenuItem>
                    <MenuItem value="wholesale">Wholesale</MenuItem>
                    <MenuItem value="retail">Retail</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={partyForm.description}
                  onChange={(e) =>
                    setPartyForm({ ...partyForm, description: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          );

        case "purchase":
          return (
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormControl>
                  <FormLabel>Report Type *</FormLabel>
                  <RadioGroup
                    row
                    value={purchaseForm.reportType}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        reportType: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="normal"
                      control={<Radio />}
                      label="Normal"
                    />
                    <FormControlLabel
                      value="urgent"
                      control={<Radio />}
                      label="Urgent"
                    />
                    <FormControlLabel
                      value="priority"
                      control={<Radio />}
                      label="Priority"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Party Name *</InputLabel>
                  <Select
                    value={purchaseForm.partyName}
                    label="Party Name"
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        partyName: e.target.value,
                      })
                    }
                    required
                  >
                    {parties.map((party) => (
                      <MenuItem key={party.id} value={party.partyName}>
                        {party.partyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Invoice No *"
                  value={purchaseForm.invoiceNo}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      invoiceNo: e.target.value,
                    })
                  }
                  required
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
                    value={purchaseForm.productName}
                    label="Product Name"
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        productName: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="rice">Rice</MenuItem>
                    <MenuItem value="wheat">Wheat</MenuItem>
                    <MenuItem value="sugar">Sugar</MenuItem>
                    <MenuItem value="pulses">Pulses</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contracted Rate (₹)"
                  type="number"
                  value={purchaseForm.contractedRate}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      contractedRate: e.target.value,
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
                <FormControl>
                  <FormLabel>Bran Type</FormLabel>
                  <RadioGroup
                    row
                    value={purchaseForm.branType}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        branType: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="type1"
                      control={<Radio />}
                      label="Type 1"
                    />
                    <FormControlLabel
                      value="type2"
                      control={<Radio />}
                      label="Type 2"
                    />
                    <FormControlLabel
                      value="type3"
                      control={<Radio />}
                      label="Type 3"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Gross Weight (kg)"
                  type="number"
                  value={purchaseForm.grossWeight}
                  onChange={(e) =>
                    setPurchaseForm({
                      ...purchaseForm,
                      grossWeight: e.target.value,
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          );

        case "vehicle":
          return (
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Vehicle Number *"
                  value={vehicleForm.vehicleNo}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      vehicleNo: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  value={vehicleForm.ownerName}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      ownerName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={vehicleForm.mobileNo}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, mobileNo: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Owner Address"
                  multiline
                  rows={2}
                  value={vehicleForm.ownerAddress}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      ownerAddress: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Transport Name"
                  value={vehicleForm.transportName}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      transportName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Driver Name"
                  value={vehicleForm.driverName}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      driverName: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="DL Number"
                  value={vehicleForm.dlNo}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, dlNo: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Driver Number"
                  value={vehicleForm.driverNo}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, driverNo: e.target.value })
                  }
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Transport Address"
                  multiline
                  rows={2}
                  value={vehicleForm.transportAddress}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      transportAddress: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          );

        case "quantity":
          return (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Gross Weight (kg) *"
                  type="number"
                  value={quantityForm.grossWeight}
                  onChange={(e) =>
                    setQuantityForm({
                      ...quantityForm,
                      grossWeight: e.target.value,
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="No. of Bags *"
                  type="number"
                  value={quantityForm.noOfBags}
                  onChange={(e) =>
                    setQuantityForm({
                      ...quantityForm,
                      noOfBags: e.target.value,
                    })
                  }
                  required
                />
              </Grid>
              <Grid size={12}>
                <FormControl>
                  <FormLabel>Type of Bags</FormLabel>
                  <RadioGroup
                    row
                    value={quantityForm.bagType}
                    onChange={(e) =>
                      setQuantityForm({
                        ...quantityForm,
                        bagType: e.target.value,
                      })
                    }
                  >
                    <FormControlLabel
                      value="plastic"
                      control={<Radio />}
                      label="Plastic"
                    />
                    <FormControlLabel
                      value="jute"
                      control={<Radio />}
                      label="Jute"
                    />
                    <FormControlLabel
                      value="paper"
                      control={<Radio />}
                      label="Paper"
                    />
                    <FormControlLabel
                      value="cloth"
                      control={<Radio />}
                      label="Cloth"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bag Weight (kg)"
                  type="number"
                  value={quantityForm.bagWeight}
                  onChange={(e) =>
                    setQuantityForm({
                      ...quantityForm,
                      bagWeight: e.target.value,
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Net Weight (kg)"
                  type="number"
                  value={quantityForm.netWeight}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  helperText="Calculated automatically"
                />
              </Grid>
            </Grid>
          );

        case "lab":
          return (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Standard"
                  value={labForm.standard}
                  onChange={(e) =>
                    setLabForm({ ...labForm, standard: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Obtain"
                  value={labForm.obtain}
                  onChange={(e) =>
                    setLabForm({ ...labForm, obtain: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Account"
                  value={labForm.account}
                  onChange={(e) =>
                    setLabForm({ ...labForm, account: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Penalty (%)"
                  type="number"
                  value={labForm.penaltyPercent}
                  onChange={(e) =>
                    setLabForm({ ...labForm, penaltyPercent: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Penalty (₹)"
                  type="number"
                  value={labForm.penaltyRs}
                  onChange={(e) =>
                    setLabForm({ ...labForm, penaltyRs: e.target.value })
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
                  label="Premium"
                  type="number"
                  value={labForm.premium}
                  onChange={(e) =>
                    setLabForm({ ...labForm, premium: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Total"
                  type="number"
                  value={labForm.total}
                  onChange={(e) =>
                    setLabForm({ ...labForm, total: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          );

        case "billing":
          return (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Account Rate (₹)"
                  type="number"
                  value={billingForm.accountRate}
                  onChange={(e) =>
                    setBillingForm({
                      ...billingForm,
                      accountRate: e.target.value,
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
                  label="Net Rate (₹)"
                  type="number"
                  value={billingForm.netRate}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, netRate: e.target.value })
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
                  label="Total Amount"
                  type="number"
                  value={billingForm.totalAmount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                    readOnly: true,
                  }}
                  helperText="Calculated: Account Rate × Net Rate"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Gross Amount"
                  type="number"
                  value={billingForm.grossAmount}
                  onChange={(e) =>
                    setBillingForm({
                      ...billingForm,
                      grossAmount: e.target.value,
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
                  label="Auto GST (18%)"
                  type="number"
                  value={billingForm.autoGST}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bill Amount"
                  type="number"
                  value={billingForm.billAmount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Invoice Amount"
                  type="number"
                  value={billingForm.invoiceAmount}
                  onChange={(e) =>
                    setBillingForm({
                      ...billingForm,
                      invoiceAmount: e.target.value,
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
                  label="Amount Payable"
                  type="number"
                  value={billingForm.amountPayable}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          );

        default:
          return null;
      }
    };

    return (
      <>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>{renderForm()}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDialog} variant="contained">
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid size={12}>
            <Typography
              variant="h4"
              align="center"
              color="primary"
              gutterBottom
            >
              📋 Purchase Management System
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
            >
              Complete all 6 sections step by step. Click "Save & Next" after
              each section.
            </Typography>
          </Grid>
        </Grid>

        {/* Stepper */}
        <Box sx={{ mb: 6 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  icon={React.cloneElement(stepIcons[index], {
                    sx: { fontSize: { xs: 24, sm: 28 } },
                  })}
                >
                  <Typography
                    variant="body2"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Current Step Content */}
        <Box sx={{ mt: 4 }}>
          <Grid container alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 8, sm: 10 }}>
              <Typography variant="h5">{steps[activeStep]}</Typography>
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <Chip
                label={`Step ${activeStep + 1} of ${steps.length}`}
                color="primary"
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Grid
          container
          spacing={2}
          sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
            >
              Back
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                saveStepData();
                setSnackbar({
                  open: true,
                  message: "Progress saved",
                  severity: "info",
                });
              }}
            >
              Save Progress
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSaveAndNext}
              endIcon={
                activeStep === steps.length - 1 ? (
                  <CheckCircleIcon />
                ) : (
                  <ArrowForwardIcon />
                )
              }
            >
              {activeStep === steps.length - 1
                ? "Submit & Generate Invoice"
                : "Save & Next"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Info Card */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "primary.light",
          color: "primary.contrastText",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              📝 Note 1
            </Typography>
            <Typography variant="body2">
              Message sent to party after completion
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              👑 Note 2
            </Typography>
            <Typography variant="body2">
              Admin has full access to all details
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ⏰ Note 3
            </Typography>
            <Typography variant="body2">
              Employee can't edit after 24 hours
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              🧾 Note 4
            </Typography>
            <Typography variant="body2">
              Invoice generated with Credit/Debit note
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        {renderDialogContent()}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
