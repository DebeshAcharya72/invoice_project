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
}) => {
  const [smsOption, setSmsOption] = useState("party");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    obtain_ffa = "",
    obtain_oil = "",
    standard_ffa = "",
    standard_oil = "",
  } = labData || {};

  const {
    invoice_no = "",
    gross_weight_mt = 0,
    contracted_rate = 0,
  } = purchaseData || {};
  const partyName = partyData?.party_name || "N/A";
  const partyContact = partyData?.contact_person || partyData?.mobile_no || "";
  const agentContact = agentData?.agent_number || "";

  const defaultMessage = `Lab Results - Invoice ${invoice_no}:
FFA: ${obtain_ffa} (Std: ${standard_ffa})
OIL: ${obtain_oil}% (Std: ${standard_oil}%)
Net Weight: ${(parseFloat(gross_weight_mt) || 0).toFixed(3)} MT
Gross Amount: ₹${(
    (parseFloat(gross_weight_mt) || 0) * (parseFloat(contracted_rate) || 0)
  ).toFixed(2)}
- Manmath Pattanaik & Co`;

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
        (r) => r.phone && r.phone.length >= 10
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
              {/* <FormControlLabel
                value="party"
                control={<Radio />}
                label={`Party: ${partyName} (${partyContact || "No contact"})`}
                disabled={!partyContact}
              />
              <FormControlLabel
                value="agent"
                control={<Radio />}
                label={`Agent: ${agentData?.agent_name || "Agent"} (${
                  agentContact || "No contact"
                })`}
                disabled={!agentContact}
              />
              <FormControlLabel
                value="both"
                control={<Radio />}
                label="Send to Both"
                disabled={!partyContact || !agentContact}
              /> */}
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom>
            Recipients will receive:
          </Typography>

          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fafafa" }}>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-line", fontFamily: "monospace" }}
            >
              {customMessage.trim() || defaultMessage}
            </Typography>
          </Paper>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Customize Message (Optional)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder={defaultMessage}
            helperText="Leave empty to use default message"
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
