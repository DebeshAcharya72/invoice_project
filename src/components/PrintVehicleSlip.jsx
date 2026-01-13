// src/components/PrintVehicleSlip.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Sms as SmsIcon,
} from "@mui/icons-material";
import { api } from "../services/api";

const PrintVehicleSlip = ({
  open,
  onClose,
  vehicleData = {},
  purchaseData = {},
  companyData = {},
}) => {
  const [advanceDate, setAdvanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  console.log("Vehicle slip received data:", {
    vehicleData,
    hasBankName: !!vehicleData.bank_name,
    hasBankAccount: !!vehicleData.bank_account,
    hasIfsc: !!vehicleData.ifsc,
    allFields: Object.keys(vehicleData),
  });

  // Extract ALL data from vehicleData
  const {
    vehicle_no = "",
    rice_mill_name = "",
    destination_from = "",
    destination_to = "",
    quantity_mt = "0",
    freight_per_mt = "0",
    advance_amount = "0",
    bank_name = "",
    bank_account = "",
    ifsc = "",
    owner_name = "",
    mobile_no = "",
    paid_by = "Buyer",
  } = vehicleData;

  const totalFreight =
    (parseFloat(quantity_mt) || 0) * (parseFloat(freight_per_mt) || 0);
  const toPay = totalFreight - (parseFloat(advance_amount) || 0);

  const handlePrint = () => {
    const printContent = document.getElementById("print-vehicle-slip");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vehicle Slip - ${vehicle_no}</title>
        <style>
          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 5mm;
              font-size: 12px;
              font-family: 'Arial', sans-serif;
            }
            .no-print {
              display: none !important;
            }
          }
          
          body {
            font-family: 'Arial', sans-serif;
            margin: 10px;
            padding: 0;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            line-height: 1.2;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          
          .company-address {
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
          }
          
          td {
            border: 1px solid #000;
            padding: 6px 8px;
            vertical-align: top;
          }
          
          .signature-section {
            margin-top: 20px;
            font-size: 11px;
          }
          
          .signature-line {
            border-bottom: 1px dashed #000;
            width: 100%;
            margin-top: 20px;
          }
          
          .bank-details {
            font-size: 11px;
            line-height: 1.3;
          }
          
          .no-print {
            text-align: center;
            padding: 20px;
            margin-top: 20px;
          }
          
          .paid-by {
            font-size: 11px;
            font-weight: bold;
            margin-top: 5px;
            color: #d32f2f;
          }
          
          .advance-details {
            font-size: 11px;
            margin-top: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">${
              companyData?.company_name || "MANMATH PATTANAIK & CO"
            }</div>
            <div class="company-address">${
              companyData?.address_line1 ||
              "PLOT NO-746/3061_MANSA PALACE_NUASAHI, GANDARPUR, CUTTACK-753003"
            }</div>
          </div>
          
          <table>
            <tr>
              <td style="width: 50%;">
                <strong>VEHICLE NO-</strong><br/>
                ${vehicle_no || "_______________"}
              </td>
              <td style="width: 50%;">
                <div><strong>Date of Loading</strong><br/>${new Date().toLocaleDateString()}</div>
                <div style="margin-top: 8px;"><strong>Date of unloading</strong><br/>_______________</div>
              </td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td style="width: 25%;"><strong>Rice Mill Name</strong></td>
              <td style="width: 25%;"><strong>Bank Details</strong></td>
              <td style="width: 12.5%; text-align: center;"><strong>Quantity</strong></td>
              <td style="width: 12.5%; text-align: center;"><strong>Per MT</strong></td>
              <td style="width: 25%; text-align: center;"><strong>Amount</strong></td>
            </tr>
            <tr>
              <td style="height: 50px; vertical-align: middle;">${
                rice_mill_name || "_______________"
              }</td>
              <td style="height: 50px; vertical-align: middle;" class="bank-details">
                ${bank_name ? `${bank_name}<br/>` : ""}
                ${bank_account ? `A/C: ${bank_account}<br/>` : ""}
                ${ifsc ? `IFSC: ${ifsc}` : ""}
                ${!bank_name && !bank_account && !ifsc ? "_______________" : ""}
              </td>
              <td style="height: 50px; text-align: center; vertical-align: middle;">${
                quantity_mt || "0"
              } MT</td>
              <td style="height: 50px; text-align: center; vertical-align: middle;">₹${
                freight_per_mt || "0"
              }</td>
              <td style="height: 50px; text-align: center; vertical-align: middle; font-weight: bold;">₹${totalFreight.toFixed(
                2
              )}</td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td style="width: 50%;"><strong>FROM</strong></td>
              <td style="width: 50%;"><strong>TO</strong></td>
            </tr>
            <tr>
              <td style="height: 35px;">${
                destination_from || "_______________"
              }</td>
              <td style="height: 35px;">${
                destination_to || "_______________"
              }</td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td style="width: 25%;"><strong>Advance Date</strong></td>
              <td style="width: 25%;"><strong>Advance Amount</strong></td>
              <td style="width: 25%;"><strong>Paid By</strong></td>
              <td style="width: 25%;"><strong>To Pay</strong></td>
            </tr>
            <tr>
              <td style="height: 35px; text-align: center;">${advanceDate}</td>
              <td style="height: 35px; text-align: center; font-weight: bold;">₹${
                advance_amount || "0"
              }</td>
              <td style="height: 35px; text-align: center; color: #d32f2f; font-weight: bold;">${paid_by}</td>
              <td style="height: 35px; text-align: center; font-weight: bold;">₹${toPay.toFixed(
                2
              )}</td>
            </tr>
          </table>
          
          <div class="signature-section">
            <div style="margin-bottom: 15px;">
              <strong>Date of Submission</strong><br/>
              ${new Date().toLocaleDateString()}
            </div>
            
            <div style="margin-bottom: 10px;">
              <strong>Carrage Inward/RiceMill A/C</strong>
              <div class="signature-line"></div>
            </div>
            
            <div style="margin-bottom: 10px;">
              <strong>Unloading Staff Signature</strong>
              <div class="signature-line"></div>
            </div>
            
            <div style="margin-bottom: 10px;">
              <strong>Date of Freight</strong>
              <div class="signature-line"></div>
            </div>
            
            <div style="margin-bottom: 10px;">
              <strong>Account staff Signature</strong>
              <div class="signature-line"></div>
            </div>
          </div>
        </div>
        
        <div class="no-print">
          <button onclick="window.print()" style="padding:8px 16px;background:#4CAF50;color:white;border:none;cursor:pointer;margin:5px;">
            🖨️ Print Now
          </button>
          <button onclick="window.close()" style="padding:8px 16px;background:#f44336;color:white;border:none;cursor:pointer;margin:5px;">
            ✕ Close Window
          </button>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  const handleSendSMS = async () => {
    try {
      setLoading(true);

      if (!mobile_no || mobile_no.length < 10) {
        showError("Valid mobile number is required to send SMS");
        return;
      }

      // Create the SMS message with all challan details
      const message =
        `Vehicle Challan Details:\n\n` +
        `Vehicle No: ${vehicle_no}\n` +
        `Rice Mill: ${rice_mill_name}\n` +
        `From: ${destination_from}\n` +
        `To: ${destination_to}\n` +
        `Quantity: ${quantity_mt} MT\n` +
        `Freight/MT: ₹${freight_per_mt}\n` +
        `Total Freight: ₹${totalFreight.toFixed(2)}\n` +
        `Advance Date: ${advanceDate}\n` +
        `Advance Amount: ₹${advance_amount}\n` +
        `Paid By: ${paid_by}\n` +
        `Balance to Pay: ₹${toPay.toFixed(2)}\n\n` +
        `Bank Details:\n` +
        `${bank_name ? `Bank: ${bank_name}\n` : ""}` +
        `${bank_account ? `A/C: ${bank_account}\n` : ""}` +
        `${ifsc ? `IFSC: ${ifsc}\n` : ""}\n` +
        `Thank you for your service. Have a nice day.`;

      const smsData = {
        phone_numbers: [mobile_no],
        message: message,
        invoice_no: purchaseData?.invoice_no || "N/A",
        recipients: ["Vehicle Owner"],
        purchase_id: purchaseData?._id || null,
      };

      await api.sendSMS(smsData);

      showSuccess("SMS sent successfully to vehicle owner!");
    } catch (error) {
      console.error("SMS sending error:", error);
      showError("Failed to send SMS: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "error" });
  const showSuccess = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "success" });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PrintIcon color="primary" />
            <Typography variant="h6">Vehicle Transportation Slip</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleSendSMS}
              disabled={loading || !mobile_no}
              color="info"
              size="small"
              title="Send SMS to Vehicle Owner"
            >
              <SmsIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Hidden div for printing */}
        <Box id="print-vehicle-slip" sx={{ display: "none" }}>
          Printing content
        </Box>

        {/* Advance Date Selection */}
        <Box sx={{ mb: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Advance Date Selection
          </Typography>
          <input
            type="date"
            value={advanceDate}
            onChange={(e) => setAdvanceDate(e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            (Date when advance was given)
          </Typography>
        </Box>

        {/* Preview in dialog */}
        <Box
          sx={{ mt: 2, border: "1px solid #ccc", padding: 2, bgcolor: "white" }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: "bold",
                mb: 0.5,
                textTransform: "uppercase",
              }}
            >
              {companyData?.company_name || "MANMATH PATTANAIK & CO"}
            </Typography>
            <Typography sx={{ fontSize: "12px", lineHeight: 1.2 }}>
              {companyData?.address_line1 ||
                "PLOT NO-746/3061_MANSA PALACE_NUASAHI, GANDARPUR, CUTTACK-753003"}
            </Typography>
          </Box>

          {/* Vehicle No and Dates */}
          <Box sx={{ display: "flex", mb: 2 }}>
            <Box
              sx={{ flex: 1, border: "1px solid black", padding: "6px 8px" }}
            >
              <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
                VEHICLE NO-
              </Typography>
              <Typography sx={{ fontSize: "13px", mt: 0.5 }}>
                {vehicle_no || "_______________"}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                border: "1px solid black",
                borderLeft: "none",
                padding: "6px 8px",
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
                  Date of Loading
                </Typography>
                <Typography sx={{ fontSize: "12px", mt: 0.5 }}>
                  {formatDate(new Date())}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
                  Date of unloading
                </Typography>
                <Typography sx={{ fontSize: "12px", mt: 0.5 }}>
                  _______________
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Table */}
          <Box sx={{ border: "1px solid black" }}>
            {/* Header Row */}
            <Box sx={{ display: "flex", borderBottom: "1px solid black" }}>
              <Box
                sx={{
                  width: "25%",
                  p: 1,
                  fontWeight: "bold",
                  fontSize: "11px",
                  borderRight: "1px solid black",
                }}
              >
                Rice Mill Name
              </Box>
              <Box
                sx={{
                  width: "25%",
                  p: 1,
                  fontWeight: "bold",
                  fontSize: "11px",
                  borderRight: "1px solid black",
                }}
              >
                Bank Details
              </Box>
              <Box
                sx={{
                  width: "12.5%",
                  p: 1,
                  fontWeight: "bold",
                  fontSize: "11px",
                  borderRight: "1px solid black",
                  textAlign: "center",
                }}
              >
                Quantity
              </Box>
              <Box
                sx={{
                  width: "12.5%",
                  p: 1,
                  fontWeight: "bold",
                  fontSize: "11px",
                  borderRight: "1px solid black",
                  textAlign: "center",
                }}
              >
                Per MT
              </Box>
              <Box
                sx={{
                  width: "25%",
                  p: 1,
                  fontWeight: "bold",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                Amount
              </Box>
            </Box>

            {/* Data Row */}
            <Box sx={{ display: "flex" }}>
              <Box
                sx={{
                  width: "25%",
                  p: 1.5,
                  borderRight: "1px solid black",
                  minHeight: "50px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {rice_mill_name || "_______________"}
              </Box>

              {/* BANK DETAILS CELL */}
              <Box
                sx={{
                  width: "25%",
                  p: 1.5,
                  borderRight: "1px solid black",
                  minHeight: "50px",
                  fontSize: "11px",
                  lineHeight: 1.4,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {bank_name && (
                  <Typography sx={{ fontSize: "11px" }}>{bank_name}</Typography>
                )}
                {bank_account && (
                  <Typography sx={{ fontSize: "11px", mt: 0.5 }}>
                    A/C: {bank_account}
                  </Typography>
                )}
                {ifsc && (
                  <Typography sx={{ fontSize: "11px", mt: 0.5 }}>
                    IFSC: {ifsc}
                  </Typography>
                )}
                {!bank_name && !bank_account && !ifsc && (
                  <Typography
                    sx={{ fontSize: "11px", color: "text.secondary" }}
                  >
                    _______________
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  width: "12.5%",
                  p: 1.5,
                  borderRight: "1px solid black",
                  minHeight: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {quantity_mt || "0"} MT
              </Box>
              <Box
                sx={{
                  width: "12.5%",
                  p: 1.5,
                  borderRight: "1px solid black",
                  minHeight: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ₹{freight_per_mt || "0"}
              </Box>
              <Box
                sx={{
                  width: "25%",
                  p: 1.5,
                  minHeight: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                ₹{totalFreight.toFixed(2)}
              </Box>
            </Box>
          </Box>

          {/* FROM/TO Section */}
          <Box
            sx={{
              display: "flex",
              border: "1px solid black",
              borderTop: "none",
            }}
          >
            <Box sx={{ width: "50%", borderRight: "1px solid black" }}>
              <Box
                sx={{
                  p: 1,
                  borderBottom: "1px solid black",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                FROM
              </Box>
              <Box sx={{ p: 1.5, minHeight: "35px", fontSize: "11px" }}>
                {destination_from || "_______________"}
              </Box>
            </Box>
            <Box sx={{ width: "50%" }}>
              <Box
                sx={{
                  p: 1,
                  borderBottom: "1px solid black",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                TO
              </Box>
              <Box sx={{ p: 1.5, minHeight: "35px", fontSize: "11px" }}>
                {destination_to || "_______________"}
              </Box>
            </Box>
          </Box>

          {/* Advance Details Section */}
          <Box
            sx={{
              display: "flex",
              border: "1px solid black",
              borderTop: "none",
            }}
          >
            <Box sx={{ width: "25%", borderRight: "1px solid black" }}>
              <Box
                sx={{
                  p: 1,
                  borderBottom: "1px solid black",
                  fontWeight: "bold",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                Advance Date
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  minHeight: "35px",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                {formatDate(advanceDate)}
              </Box>
            </Box>
            <Box sx={{ width: "25%", borderRight: "1px solid black" }}>
              <Box
                sx={{
                  p: 1,
                  borderBottom: "1px solid black",
                  fontWeight: "bold",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                Advance Amount
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  minHeight: "35px",
                  fontSize: "11px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#d32f2f",
                }}
              >
                ₹{advance_amount || "0"}
              </Box>
            </Box>
            <Box sx={{ width: "25%", borderRight: "1px solid black" }}>
              <Box
                sx={{
                  p: 1,
                  borderBottom: "1px solid black",
                  fontWeight: "bold",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                Paid By
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  minHeight: "35px",
                  fontSize: "11px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#1976d2",
                  textTransform: "uppercase",
                }}
              >
                {paid_by || "Buyer"}
              </Box>
            </Box>
            <Box sx={{ width: "25%" }}>
              <Box
                sx={{
                  p: 1,
                  borderBottom: "1px solid black",
                  fontWeight: "bold",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                To Pay
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  minHeight: "35px",
                  fontSize: "11px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#388e3c",
                }}
              >
                ₹{toPay.toFixed(2)}
              </Box>
            </Box>
          </Box>

          {/* Signatures */}
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: "11px", fontWeight: "bold", mb: 1 }}>
              Date of Submission
            </Typography>
            <Typography sx={{ fontSize: "11px", mb: 3 }}>
              {formatDate(new Date())}
            </Typography>

            <Box sx={{ fontSize: "10px" }}>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Carrage Inward/RiceMill A/C
                </Typography>
                <Box sx={{ borderBottom: "1px dashed black", mt: 1 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Unloading Staff Signature
                </Typography>
                <Box sx={{ borderBottom: "1px dashed black", mt: 1 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Date of Freight
                </Typography>
                <Box sx={{ borderBottom: "1px dashed black", mt: 1 }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
                  Account staff Signature
                </Typography>
                <Box sx={{ borderBottom: "1px dashed black", mt: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />} disabled={loading}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<SmsIcon />}
          onClick={handleSendSMS}
          disabled={loading || !mobile_no}
          color="info"
        >
          {loading ? "Sending..." : "Send SMS"}
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={loading}
          color="primary"
        >
          Open for Printing
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </Dialog>
  );
};

export default PrintVehicleSlip;
