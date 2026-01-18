// src/components/SMSDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Paper,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  PhoneAndroid as PhoneIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

const SMSDialog = ({
  open,
  onClose,
  labData,
  purchaseData,
  partyData,
  agentData,
  vehicleData,
  companyData,
}) => {
  const [smsOption, setSmsOption] = useState("party");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Extract data from props
  const {
    obtain_ffa = "",
    obtain_oil = "",
    standard_ffa = "",
    standard_oil = "",
  } = labData || {};

  // Helper function to format oil/ffa values
  const formatOilFFA = (value) => {
    const numValue = parseFloat(value) || 0;

    // Split into integer and decimal parts
    const [integerPart, decimalPart = "00"] = numValue.toFixed(2).split(".");

    return `${integerPart}.${decimalPart.padStart(2, "0")}`;
  };

  const {
    invoice_no = "",
    date = "",
    gross_weight_mt = 0,
    contracted_rate = 0,
    no_of_bags = "",
    bag_type = "",
    product_name = "",
  } = purchaseData || {};

  const partyName = partyData?.party_name || "N/A";
  const partyContact = partyData?.contact_person || partyData?.mobile_no || "";
  const agentContact = agentData?.agent_number || "";

  // Vehicle data
  const vehicleNo = vehicleData?.vehicle_no || "N/A";

  // Company data
  const companyName = companyData?.company_name || "N/A";

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split("T")[0];
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Generate G.R. number (you might want to get this from your database)
  const generateGRNo = () => {
    // This should come from your database/backend
    // For now, generate a random 3-digit number
    return Math.floor(Math.random() * 900) + 100;
  };

  // Format the message as requested
  const defaultMessage = `${partyName}
Date.- ${formatDate(date)}
G.R.no.- ${generateGRNo()}
Tr. No.- ${vehicleNo}
Bags.- ${no_of_bags || "0"}
Bag Type:- ${
    bag_type === "Poly" ? "Poly" : bag_type === "Jute" ? "Jute" : "Poly/Jute"
  }
Weight.- ${(parseFloat(gross_weight_mt) || 0).toFixed(2)}
Rate.- ${parseFloat(contracted_rate) || 0}
Oil.- ${formatOilFFA(obtain_oil || standard_oil)}
FFA.- ${formatOilFFA(obtain_ffa || standard_ffa)}
${companyName}
Thank you for your business!`;

  const getRecipients = () => {
    const recipients = [];
    if (smsOption === "party" || smsOption === "both") {
      recipients.push({
        type: "Party",
        name: partyName,
        phone: partyContact,
      });
    }
    if (smsOption === "agent" || smsOption === "both") {
      recipients.push({
        type: "Agent",
        name: agentData?.agent_name || "Agent",
        phone: agentContact,
      });
    }
    return recipients;
  };

  const handleSendSMS = async () => {
    try {
      setLoading(true);
      setError("");

      const recipients = getRecipients();
      const validRecipients = recipients.filter(
        (r) => r.phone && r.phone.length >= 10,
      );

      if (validRecipients.length === 0) {
        throw new Error("No valid phone numbers found for selected recipients");
      }

      const phoneNumbers = validRecipients.map((r) => r.phone);
      const message = customMessage.trim() || defaultMessage;

      // Call your backend API to send SMS
      const response = await api.sendSMS({
        phone_numbers: phoneNumbers,
        message: message,
        invoice_no: invoice_no,
        recipients: validRecipients.map((r) => r.type),
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCustomMessage("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to send SMS");
    } finally {
      setLoading(false);
    }
  };

  const recipients = getRecipients();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneIcon color="primary" />
          Send Lab Results via SMS
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              SMS sent successfully!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Select Recipients</FormLabel>
            <RadioGroup
              value={smsOption}
              onChange={(e) => setSmsOption(e.target.value)}
            >
              <FormControlLabel
                value="party"
                control={<Radio />}
                label="Send to Party"
                disabled={!partyContact}
              />
              <FormControlLabel
                value="agent"
                control={<Radio />}
                label="Send to Agent"
                disabled={!agentContact}
              />
              <FormControlLabel
                value="both"
                control={<Radio />}
                label="Send to Both"
                disabled={!partyContact || !agentContact}
              />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom>
            Message Format:
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fafafa" }}>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-line",
                fontFamily: "monospace",
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              {customMessage.trim() || defaultMessage}
            </Typography>
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 2, display: "block" }}
          >
            Format: Party Name → Date → G.R.no → Tr.No → Bags → Bag Type →
            Weight → Rate → Oil → FFA → Company Name
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Customize Message (Optional)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={defaultMessage}
            helperText="Leave empty to use default message format"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Will be sent to:
            </Typography>
            {recipients.map((recipient, index) => (
              <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                • {recipient.type}: {recipient.name} (
                {recipient.phone || "No phone"})
              </Typography>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSendSMS}
          disabled={loading || recipients.length === 0}
          color="primary"
        >
          {loading ? "Sending..." : "Send SMS"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SMSDialog;
