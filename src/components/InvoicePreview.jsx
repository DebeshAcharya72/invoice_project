import React, { useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { api } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoicePreview = ({ open, onClose, invoiceData }) => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  useEffect(() => {
    if (open && invoiceData) {
      loadCompanyInfo();
    }
  }, [open, invoiceData]);

  const loadCompanyInfo = async () => {
    if (!invoiceData?.company_id) {
      // Use default company info
      setCompanyInfo({
        company_name: "MANMATH PATTANAIK & CO",
        address_line1: "16- MAHANADI VIHAR CUTTACK-4",
        mobile_no: "9437025723 / 9178314411",
        gstin: "21AMJPP6577A124",
        email: "",
      });
      return;
    }

    setLoading(true);
    try {
      const company = await api.getCompany(invoiceData.company_id);
      setCompanyInfo(company);
    } catch (error) {
      console.error("Failed to load company info:", error);
      // Use default company info
      setCompanyInfo({
        company_name: invoiceData.companyName || "MANMATH PATTANAIK & CO",
        address_line1:
          invoiceData.companyAddress || "16- MAHANADI VIHAR CUTTACK-4",
        mobile_no: invoiceData.companyMobile || "9437025723 / 9178314411",
        gstin: invoiceData.companyGST || "21AMJPP6577A124",
        email: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintLoading(true);
    setTimeout(() => {
      const printContent = document.getElementById("invoice-print-content");
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <html>
          <head>
            <title>${invoiceData.reportType || "Purchase"} Invoice - ${
        invoiceData.invoiceNo || invoiceData.invoice_no || "N/A"
      }</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
                margin: 20px;
                font-size: 12px;
                color: #000;
                background: #fff;
                line-height: 1.4;
              }
              
              .invoice-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                background: #fff;
              }
              
              .header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 3px double #000;
              }
              
              .company-name {
                font-size: 20px;
                font-weight: 700;
                text-transform: uppercase;
                color: #1a237e;
                margin-bottom: 5px;
                letter-spacing: 1px;
              }
              
              .company-address {
                font-size: 12px;
                color: #333;
                margin-bottom: 5px;
              }
              
              .company-contact {
                font-size: 11px;
                color: #555;
                margin-bottom: 5px;
              }
              
              .company-codes {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 8px;
                flex-wrap: wrap;
              }
              
              .company-codes span {
                font-size: 10px;
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                border: 1px solid #ddd;
              }
              
              .title {
                text-align: center;
                font-size: 18px;
                font-weight: 700;
                text-decoration: underline;
                margin: 20px 0;
                color: #d32f2f;
              }
              
              .invoice-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
              }
              
              .info-box {
                border: 1px solid #000;
                padding: 12px;
                border-radius: 5px;
              }
              
              .info-title {
                font-weight: 700;
                margin-bottom: 8px;
                color: #1a237e;
                border-bottom: 1px solid #ddd;
                padding-bottom: 4px;
              }
              
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
              }
              
              .info-label {
                font-weight: 600;
                color: #555;
              }
              
              .info-value {
                font-weight: 500;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 11px;
                page-break-inside: avoid;
              }
              
              th {
                background: #e3f2fd;
                border: 1px solid #000;
                padding: 6px 4px;
                text-align: center;
                font-weight: 700;
                color: #1a237e;
              }
              
              td {
                border: 1px solid #000;
                padding: 6px 4px;
                text-align: left;
              }
              
              .text-right {
                text-align: right;
              }
              
              .text-center {
                text-align: center;
              }
              
              .text-bold {
                font-weight: 700;
              }
              
              .total-row {
                background: #f5f5f5;
                font-weight: 700;
              }
              
              .amount-section {
                margin-top: 20px;
                padding: 15px;
                border: 2px solid #1976d2;
                border-radius: 5px;
                background: #e3f2fd;
              }
              
              .amount-in-words {
                font-weight: 600;
                color: #1a237e;
                margin-bottom: 10px;
                font-style: italic;
              }
              
              .amount-breakdown {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 10px;
                margin-top: 10px;
              }
              
              .signature-section {
                margin-top: 40px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
              }
              
              .signature-box {
                text-align: center;
              }
              
              .signature-line {
                height: 1px;
                border-bottom: 1px dashed #000;
                margin-top: 60px;
                margin-bottom: 5px;
              }
              
              .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 10px;
                color: #666;
                text-align: center;
              }
              
              .note-box {
                margin-top: 15px;
                padding: 10px;
                border: 1px solid #ff9800;
                background: #fff3e0;
                border-radius: 4px;
              }
              
              .note-title {
                font-weight: 700;
                color: #ff9800;
                margin-bottom: 5px;
              }
              
              .highlight {
                background: #fff9c4;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 600;
              }
              
              .calculation-section {
                margin: 15px 0;
              }
              
              .calculation-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                padding: 2px 0;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .invoice-container {
                  border: none;
                  padding: 0;
                }
                
                .no-print {
                  display: none !important;
                }
                
                table {
                  page-break-inside: avoid;
                }
                
                .page-break {
                  page-break-before: always;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent.innerHTML}
            </div>
            <div class="no-print" style="margin-top:20px;text-align:center;padding:20px;">
              <button onclick="window.print()" style="padding:10px 20px;background:#4CAF50;color:white;border:none;cursor:pointer;border-radius:4px;font-size:14px;">
                🖨️ Print Invoice
              </button>
              <button onclick="window.close()" style="padding:10px 20px;background:#f44336;color:white;border:none;cursor:pointer;margin-left:10px;border-radius:4px;font-size:14px;">
                ✕ Close Window
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setPrintLoading(false);
    }, 500);
  };

  const handleDownloadPDF = async () => {
    try {
      setPrintLoading(true);
      const invoiceElement = document.getElementById("invoice-pdf-content");

      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit A4
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(
        `Invoice_${
          invoiceData?.invoiceNo || invoiceData?.invoice_no || "Unknown"
        }_${new Date().toISOString().split("T")[0]}.pdf`
      );
      setPrintLoading(false);
    } catch (error) {
      console.error("PDF generation error:", error);
      setPrintLoading(false);
      alert("Failed to generate PDF. Please try printing instead.");
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0.00";
    return parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getNoteDetails = () => {
    const amount = parseFloat(invoiceData?.amountPayable || 0);
    if (amount > 0) {
      return {
        type: "DEBIT NOTE",
        title: "DEBIT NOTE TO PARTY",
        color: "#ff9800",
        bgColor: "#fff3e0",
      };
    } else if (amount < 0) {
      return {
        type: "CREDIT NOTE",
        title: "CREDIT NOTE TO PARTY",
        color: "#4caf50",
        bgColor: "#e8f5e9",
      };
    }
    return {
      type: "FINAL SETTLEMENT",
      title: "FINAL SETTLEMENT",
      color: "#2196f3",
      bgColor: "#e3f2fd",
    };
  };

  const noteDetails = getNoteDetails();

  if (!invoiceData) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="error">No invoice data available</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh" },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" />
          <Typography variant="h6">
            {invoiceData.reportType || "Purchase"} Invoice -{" "}
            {invoiceData.invoiceNo || invoiceData.invoice_no || "N/A"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={noteDetails.type}
            size="small"
            sx={{
              bgcolor: noteDetails.color,
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box id="invoice-pdf-content">
            <div id="invoice-print-content" style={{ fontSize: "12px" }}>
              {/* Company Header */}
              <div className="header">
                <div className="company-name">
                  {companyInfo?.company_name ||
                    invoiceData.companyName ||
                    "MANMATH PATTANAIK & CO"}
                </div>
                <div className="company-address">
                  {companyInfo?.address_line1 ||
                    invoiceData.companyAddress ||
                    "16- MAHANADI VIHAR CUTTACK-4"}
                </div>
                <div className="company-contact">
                  {companyInfo?.mobile_no ||
                    invoiceData.companyMobile ||
                    "9437025723 / 9178314411"}
                  {companyInfo?.email ? ` | Email: ${companyInfo.email}` : ""}
                </div>
                <div className="company-codes">
                  <span>
                    GSTIN:{" "}
                    {companyInfo?.gstin ||
                      invoiceData.companyGST ||
                      "21AMJPP6577A124"}
                  </span>
                  <span>State: Odisha, Code: 21</span>
                  {companyInfo?.fssai && (
                    <span>FSSAI: {companyInfo.fssai}</span>
                  )}
                  {companyInfo?.cin && <span>CIN: {companyInfo.cin}</span>}
                </div>
              </div>

              {/* Main Title */}
              <div className="title">{noteDetails.title}</div>

              {/* Invoice and Party Information */}
              <div className="invoice-info">
                {/* Party Details */}
                <div className="info-box">
                  <div className="info-title">PARTY INFORMATION</div>
                  <div className="info-row">
                    <span className="info-label">Party Name:</span>
                    <span className="info-value">
                      {invoiceData.partyName || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Address:</span>
                    <span className="info-value">
                      {invoiceData.partyAddress || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">GSTIN:</span>
                    <span className="info-value">
                      {invoiceData.partyGST || "N/A"}
                    </span>
                  </div>
                  {invoiceData.brokerName && (
                    <div className="info-row">
                      <span className="info-label">Broker:</span>
                      <span className="info-value">
                        {invoiceData.brokerName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Invoice Details */}
                <div className="info-box">
                  <div className="info-title">INVOICE DETAILS</div>
                  <div className="info-row">
                    <span className="info-label">Invoice No:</span>
                    <span className="info-value">
                      {invoiceData.invoiceNo || invoiceData.invoice_no || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Invoice Date:</span>
                    <span className="info-value">
                      {invoiceData.invoiceDate ||
                        new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Serial No:</span>
                    <span className="info-value">
                      {invoiceData.serialNo || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Vehicle No:</span>
                    <span className="info-value">
                      {invoiceData.vehicleNo || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Route */}
              <div className="info-box" style={{ marginBottom: "15px" }}>
                <div className="info-title">TRANSPORT DETAILS</div>
                <div className="info-row">
                  <span className="info-label">From (Loading Point):</span>
                  <span className="info-value">
                    {invoiceData.destinationFrom ||
                      invoiceData.partyAddress ||
                      "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">To (Delivery Point):</span>
                  <span className="info-value">
                    {invoiceData.destinationTo ||
                      invoiceData.companyAddress ||
                      "N/A"}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <table>
                <thead>
                  <tr>
                    <th colSpan="6" style={{ textAlign: "center" }}>
                      PRODUCT DETAILS
                    </th>
                  </tr>
                  <tr>
                    <th>Product Name</th>
                    <th>Contracted Rate (₹/MT)</th>
                    <th>Account Rate (₹/MT)</th>
                    <th>Gross Weight (MT)</th>
                    <th>Net Weight (MT)</th>
                    <th>No. of Bags</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{invoiceData.productName || "Boiled Rice Bran"}</td>
                    <td className="text-right">
                      {formatCurrency(invoiceData.contractedRate)}
                    </td>
                    <td className="text-right">
                      {formatCurrency(invoiceData.accountRate)}
                    </td>
                    <td className="text-right">
                      {invoiceData.grossWeight || "0.000"}
                    </td>
                    <td className="text-right">
                      {invoiceData.netWeight || "0.000"}
                    </td>
                    <td className="text-right">
                      {invoiceData.plasticBags || 0}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Lab Analysis */}
              <table>
                <thead>
                  <tr>
                    <th colSpan="4" style={{ textAlign: "center" }}>
                      LABORATORY ANALYSIS
                    </th>
                  </tr>
                  <tr>
                    <th>Parameter</th>
                    <th>Standard</th>
                    <th>Obtained</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>FFA (%)</td>
                    <td className="text-center">
                      {invoiceData.ffaStandard || "7.00"}
                    </td>
                    <td className="text-center">
                      {invoiceData.ffaResult || "0.00"}
                    </td>
                    <td className="text-center">
                      {parseFloat(invoiceData.ffaDifference || 0) > 0
                        ? "+"
                        : ""}
                      {invoiceData.ffaDifference || "0.00"}
                    </td>
                  </tr>
                  <tr>
                    <td>OIL (%)</td>
                    <td className="text-center">
                      {invoiceData.oilStandard || "19.00"}
                    </td>
                    <td className="text-center">
                      {invoiceData.oilResult || "0.00"}
                    </td>
                    <td className="text-center">
                      {parseFloat(invoiceData.oilDifference || 0) > 0
                        ? "+"
                        : ""}
                      {invoiceData.oilDifference || "0.00"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Billing Calculations */}
              <div className="calculation-section">
                <table>
                  <thead>
                    <tr>
                      <th colSpan="2" style={{ textAlign: "center" }}>
                        BILLING CALCULATIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Account Rate (₹)</td>
                      <td className="text-right">
                        {formatCurrency(invoiceData.accountRate)}
                      </td>
                    </tr>
                    <tr>
                      <td>Net Rate (₹)</td>
                      <td className="text-right">
                        {formatCurrency(invoiceData.netRate)}
                      </td>
                    </tr>
                    <tr>
                      <td>Material Amount (₹)</td>
                      <td className="text-right">
                        {formatCurrency(invoiceData.materialAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td>Net Amount (₹)</td>
                      <td className="text-right">
                        {formatCurrency(invoiceData.netAmount)}
                      </td>
                    </tr>
                    <tr className="total-row">
                      <td>Gross Amount (₹)</td>
                      <td className="text-right">
                        {formatCurrency(invoiceData.grossAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* GST Calculations */}
                <table style={{ marginTop: "10px" }}>
                  <thead>
                    <tr>
                      <th colSpan="2" style={{ textAlign: "center" }}>
                        GST CALCULATIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>GST Type</td>
                      <td className="text-center">
                        <span className="highlight">
                          {invoiceData.gstType === "Inter"
                            ? "Inter-State (IGST)"
                            : "Intra-State (CGST+SGST)"}
                        </span>
                      </td>
                    </tr>
                    {invoiceData.gstType === "Intra" ? (
                      <>
                        <tr>
                          <td>CGST @ 2.5% (₹)</td>
                          <td className="text-right">
                            {formatCurrency(invoiceData.cgstAmount)}
                          </td>
                        </tr>
                        <tr>
                          <td>SGST @ 2.5% (₹)</td>
                          <td className="text-right">
                            {formatCurrency(invoiceData.sgstAmount)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td>IGST @ 5% (₹)</td>
                        <td className="text-right">
                          {formatCurrency(invoiceData.igstAmount)}
                        </td>
                      </tr>
                    )}
                    <tr className="total-row">
                      <td>Billed Amount (₹)</td>
                      <td className="text-right">
                        {formatCurrency(invoiceData.billedAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Final Settlement */}
              <div className="amount-section">
                <div className="amount-in-words">
                  <strong>Amount in Words:</strong>{" "}
                  {invoiceData.inWords || "Zero ONLY"}
                </div>

                <div className="amount-breakdown">
                  <div>
                    <div className="calculation-row">
                      <span>Billed Amount:</span>
                      <span>₹{formatCurrency(invoiceData.billedAmount)}</span>
                    </div>
                    <div className="calculation-row">
                      <span>Less: Invoice Amount:</span>
                      <span>₹{formatCurrency(invoiceData.invoiceAmount)}</span>
                    </div>
                    <div
                      className="calculation-row"
                      style={{
                        borderTop: "1px solid #000",
                        paddingTop: "5px",
                        marginTop: "5px",
                      }}
                    >
                      <strong>Amount Payable:</strong>
                      <strong
                        style={{
                          color:
                            parseFloat(invoiceData.amountPayable || 0) > 0
                              ? "#d32f2f"
                              : parseFloat(invoiceData.amountPayable || 0) < 0
                              ? "#388e3c"
                              : "#000",
                        }}
                      >
                        ₹{formatCurrency(invoiceData.amountPayable)}
                        {parseFloat(invoiceData.amountPayable || 0) > 0
                          ? " (To be paid by Party)"
                          : parseFloat(invoiceData.amountPayable || 0) < 0
                          ? " (To be paid to Party)"
                          : ""}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Box */}
              {noteDetails.type !== "FINAL SETTLEMENT" && (
                <div className="note-box">
                  <div className="note-title">
                    {noteDetails.type === "DEBIT NOTE"
                      ? "📝 DEBIT NOTE DETAILS"
                      : "📝 CREDIT NOTE DETAILS"}
                  </div>
                  <div className="calculation-row">
                    <span>Base Amount:</span>
                    <span>₹{formatCurrency(invoiceData.netAmount)}</span>
                  </div>
                  {invoiceData.gstType === "Intra" ? (
                    <>
                      <div className="calculation-row">
                        <span>CGST @ 2.5%:</span>
                        <span>₹{formatCurrency(invoiceData.cgstAmount)}</span>
                      </div>
                      <div className="calculation-row">
                        <span>SGST @ 2.5%:</span>
                        <span>₹{formatCurrency(invoiceData.sgstAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="calculation-row">
                      <span>IGST @ 5%:</span>
                      <span>₹{formatCurrency(invoiceData.igstAmount)}</span>
                    </div>
                  )}
                  <div
                    className="calculation-row"
                    style={{
                      borderTop: "1px solid #ff9800",
                      paddingTop: "5px",
                      marginTop: "5px",
                    }}
                  >
                    <strong>Total {noteDetails.type} Amount:</strong>
                    <strong>
                      ₹{formatCurrency(invoiceData.amountPayableAbs)}
                    </strong>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="signature-section">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div>Prepared By</div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    Name & Signature
                  </div>
                </div>

                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div>Checked By</div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    Name & Signature
                  </div>
                </div>

                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div>Authorized Signatory</div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    For {companyInfo?.company_name || "MANMATH PATTANAIK & CO"}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="footer">
                <div>
                  This is a computer generated invoice. No physical signature
                  required.
                </div>
                <div>Printed on: {new Date().toLocaleString()}</div>
                <div style={{ marginTop: "10px", fontStyle: "italic" }}>
                  For queries, contact:{" "}
                  {companyInfo?.mobile_no ||
                    invoiceData.companyMobile ||
                    "9437025723 / 9178314411"}
                </div>
              </div>
            </div>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          disabled={printLoading}
        >
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={
            printLoading ? <CircularProgress size={20} /> : <PrintIcon />
          }
          onClick={handlePrint}
          disabled={printLoading}
          color="primary"
        >
          {printLoading ? "Preparing..." : "Print Invoice"}
        </Button>
        <Button
          variant="contained"
          startIcon={
            printLoading ? <CircularProgress size={20} /> : <PdfIcon />
          }
          onClick={handleDownloadPDF}
          disabled={printLoading}
          color="success"
        >
          {printLoading ? "Generating..." : "Download PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreview;
