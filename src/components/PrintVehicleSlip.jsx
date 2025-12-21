// src/components/PrintVehicleSlip.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";
import { Print as PrintIcon, Close as CloseIcon } from "@mui/icons-material";

const PrintVehicleSlip = ({ open, onClose, vehicleData, purchaseData }) => {
  const {
    vehicle_no,
    rice_mill_name,
    destination_from,
    destination_to,
    quantity_mt,
    freight_per_mt,
    advance_amount,
    owner_name,
    mobile_no,
  } = vehicleData || {};

  const { bank_name, bank_account } = purchaseData || {};

  const totalFreight =
    (parseFloat(quantity_mt) || 0) * (parseFloat(freight_per_mt) || 0);
  const toPay = totalFreight - (parseFloat(advance_amount) || 0);

  const handlePrint = () => {
    const printContent = document.getElementById("print-vehicle-slip");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Transportation Slip - ${vehicle_no}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .content { font-size: 14px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            .signature-box { margin-top: 40px; }
            .signature-line { height: 1px; border-bottom: 1px dashed #000; margin-top: 60px; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="no-print" style="margin-top:20px;text-align:center;">
            <button onclick="window.print()" style="padding:10px 20px;background:#4CAF50;color:white;border:none;cursor:pointer;">
              Print
            </button>
            <button onclick="window.close()" style="padding:10px 20px;background:#f44336;color:white;border:none;cursor:pointer;margin-left:10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PrintIcon color="primary" />
          Vehicle Transportation Slip
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box id="print-vehicle-slip" sx={{ mt: 2 }}>
          {/* Company Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              MANMATH PATTANAIK & CO
            </Typography>
            <Typography variant="body2">
              PLOT NO-746/3061, MANSA PALACE, NUASAHI, GANDARPUR, CUTTACK-753003
            </Typography>
          </Box>

          {/* Vehicle Details */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>VEHICLE NO:</strong>
                  </TableCell>
                  <TableCell>{vehicle_no || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Owner Name:</strong>
                  </TableCell>
                  <TableCell>{owner_name || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Mobile No:</strong>
                  </TableCell>
                  <TableCell>{mobile_no || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Date of Loading:</strong>
                  </TableCell>
                  <TableCell>{new Date().toLocaleDateString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Date of unloading:</strong>
                  </TableCell>
                  <TableCell>_________________</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Main Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>Rice Mill Name</strong>
                  </TableCell>
                  <TableCell>{rice_mill_name || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Bank Details</strong>
                  </TableCell>
                  <TableCell>
                    {bank_name || "N/A"}
                    <br />
                    {bank_account ? `A/C: ${bank_account}` : ""}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Quantity</strong>
                  </TableCell>
                  <TableCell>{quantity_mt || "0"} MT</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Per MT</strong>
                  </TableCell>
                  <TableCell>₹{freight_per_mt || "0"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Amount</strong>
                  </TableCell>
                  <TableCell>₹{totalFreight.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Route & Payment */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>FROM</strong>
                  </TableCell>
                  <TableCell>{destination_from || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>TO</strong>
                  </TableCell>
                  <TableCell>{destination_to || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Advance Date</strong>
                  </TableCell>
                  <TableCell>_________________</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Advance Amount</strong>
                  </TableCell>
                  <TableCell>₹{advance_amount || "0"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>To Pay</strong>
                  </TableCell>
                  <TableCell>₹{toPay.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Signatures */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Date of Submission:</strong>{" "}
              {new Date().toLocaleDateString()}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2">
                Carriage Inward/RiceMill A/C: _________________
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Unloading Staff Signature: _________________
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Date of Freight: _________________
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Account Staff Signature: _________________
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          color="primary"
        >
          Open for Printing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintVehicleSlip;
