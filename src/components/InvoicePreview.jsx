// src/components/InvoicePreview.jsx
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
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

const InvoicePreview = ({ open, onClose, invoiceData }) => {
  if (!invoiceData) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const printContent = document.getElementById("invoice-print-content");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceData.invoiceNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .content { font-size: 14px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            .total-row { font-weight: bold; }
            .signature { margin-top: 50px; }
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

  const handleDownloadPDF = () => {
    // Implement PDF download using jsPDF or similar library
    alert("PDF download feature will be implemented with jsPDF library");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" />
          FINAL REMITTANCE STATEMENT
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box id="invoice-print-content" sx={{ mt: 2 }}>
          {/* Company Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              MANMATH PATTANAIK & CO
            </Typography>
            <Typography variant="body2">
              16- MAHANADI VIHAR CUTTACK-4
            </Typography>
            <Typography variant="body2">
              Mob: 9437025723 / 9178314411 | Email: manpat_ronu@rediffmail.com
            </Typography>
            <Typography variant="body2">
              Tin: 21203000147 | GST NO: 21AMJPP6577A1Z4
            </Typography>
          </Box>

          {/* Invoice Info */}
          <Grid container spacing={2} sx={{ mb: 2, fontSize: "0.875rem" }}>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Party Name:</strong> {invoiceData.partyName}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Invoice No:</strong> {invoiceData.invoiceNo}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Serial No:</strong> {invoiceData.serialNo}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Address:</strong> {invoiceData.address}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Invoice Date:</strong> {invoiceData.invoiceDate}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>GST No:</strong> {invoiceData.gstNumber}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Product:</strong> {invoiceData.productName}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>HSN Code:</strong> 2302
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>Report Type:</strong> {invoiceData.reportType}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, borderBottomWidth: 2 }} />

          {/* Quantity & Lab Analysis */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                QUANTITY PARTICULARS
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Gross Weight</TableCell>
                      <TableCell>{invoiceData.grossWeight} MT</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Plastic Bags</TableCell>
                      <TableCell>
                        {invoiceData.plasticBags} × 0.20 ={" "}
                        {invoiceData.bagWeight} MT
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Net Weight</TableCell>
                      <TableCell>{invoiceData.netWeight} MT</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                LABORATORY ANALYSIS
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Std</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Diff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>FFA</TableCell>
                      <TableCell>{invoiceData.ffaStandard}</TableCell>
                      <TableCell>{invoiceData.ffaResult}</TableCell>
                      <TableCell>{invoiceData.ffaDifference}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>OIL</TableCell>
                      <TableCell>{invoiceData.oilStandard}</TableCell>
                      <TableCell>{invoiceData.oilResult}</TableCell>
                      <TableCell>{invoiceData.oilDifference}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          {/* Billing Details */}
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            BILLING DETAILS
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Contracted Rate</TableCell>
                  <TableCell align="right">
                    ₹{invoiceData.contractedRate}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Account Rate</TableCell>
                  <TableCell align="right">
                    ₹{invoiceData.accountRate}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Net Rate</TableCell>
                  <TableCell align="right">₹{invoiceData.netRate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Net Amount</TableCell>
                  <TableCell align="right">₹{invoiceData.netAmount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Material Amount</TableCell>
                  <TableCell align="right">
                    ₹{invoiceData.materialAmount}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gross Amount</TableCell>
                  <TableCell align="right">
                    ₹{invoiceData.grossAmount}
                  </TableCell>
                </TableRow>
                {parseFloat(invoiceData.sgstAmount) > 0 && (
                  <TableRow>
                    <TableCell>SGST (2.5%)</TableCell>
                    <TableCell align="right">
                      ₹{invoiceData.sgstAmount}
                    </TableCell>
                  </TableRow>
                )}
                {parseFloat(invoiceData.cgstAmount) > 0 && (
                  <TableRow>
                    <TableCell>CGST (2.5%)</TableCell>
                    <TableCell align="right">
                      ₹{invoiceData.cgstAmount}
                    </TableCell>
                  </TableRow>
                )}
                {parseFloat(invoiceData.igstAmount) > 0 && (
                  <TableRow>
                    <TableCell>IGST (5%)</TableCell>
                    <TableCell align="right">
                      ₹{invoiceData.igstAmount}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="total-row">
                  <TableCell>
                    <strong>Billed Amount</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>₹{invoiceData.billedAmount}</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Invoice Amount</TableCell>
                  <TableCell align="right">
                    ₹{invoiceData.invoiceAmount}
                  </TableCell>
                </TableRow>
                <TableRow className="total-row">
                  <TableCell>
                    <strong>Net Payable</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>₹{invoiceData.amountPayable}</strong>
                    {invoiceData.amountPayable.startsWith("-") && " (Credit)"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Notes Section */}
          {invoiceData.noteType !== "NO_NOTE" && (
            <Box
              sx={{
                p: 2,
                border: "2px solid",
                borderColor:
                  invoiceData.noteType === "DEBIT_NOTE" ? "#ff9800" : "#4caf50",
                borderRadius: 1,
                bgcolor:
                  invoiceData.noteType === "DEBIT_NOTE" ? "#fff8e1" : "#e8f5e9",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color={
                  invoiceData.noteType === "DEBIT_NOTE" ? "#ff9800" : "#4caf50"
                }
                gutterBottom
              >
                {invoiceData.noteType === "DEBIT_NOTE"
                  ? "DEBIT NOTE"
                  : "CREDIT NOTE"}
              </Typography>
              <Typography variant="body2">
                <strong>Party:</strong> {invoiceData.partyName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Amount:</strong> ₹{invoiceData.amountPayableAbs}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                Rupees in words: {invoiceData.inWords}
              </Typography>
            </Box>
          )}

          {/* Signatures */}
          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid item xs={4} textAlign="center">
              <Typography variant="caption">Prepared By</Typography>
              <Box sx={{ height: "40px", border: "1px dashed #ccc", mt: 1 }} />
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="caption">Checked By</Typography>
              <Box sx={{ height: "40px", border: "1px dashed #ccc", mt: 1 }} />
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="caption">Authorised Signatory</Typography>
              <Box sx={{ height: "40px", border: "1px dashed #ccc", mt: 1 }} />
              <Typography variant="caption">
                For Manmath Pattanaik & Co.
              </Typography>
            </Grid>
          </Grid>

          {/* Footer Notes */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px dotted #000",
              fontSize: "0.75rem",
            }}
          >
            <Typography variant="body2">
              • Second test report if any should reach us within 10 days of our
              result.
            </Typography>
            <Typography variant="body2">
              • Declaration: Subject to Cuttack Jurisdiction only.
            </Typography>
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
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          color="success"
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreview;
