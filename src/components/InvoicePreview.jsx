import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Print as PrintIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoicePreview = ({ open, onClose, invoiceData }) => {
  const [printLoading, setPrintLoading] = useState(false);

  const handlePrint = () => {
    setPrintLoading(true);
    setTimeout(() => {
      const printContent = document.getElementById("invoice-print-content");
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${
              invoiceData?.purchase?.invoice_no || "N/A"
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
                font-size: 11px;
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
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #000;
              }
              
              .company-name {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 3px;
                letter-spacing: 0.5px;
              }
              
              .company-address {
                font-size: 11px;
                margin-bottom: 3px;
              }
              
              .company-contact {
                font-size: 11px;
                margin-bottom: 3px;
              }
              
              .invoice-header {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
                font-size: 11px;
              }
              
              .left-header {
                width: 50%;
              }
              
              .right-header {
                width: 50%;
                text-align: right;
              }
              
              .product-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              
              .product-table th,
              .product-table td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
                font-size: 11px;
              }
              
              .lab-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              
              .lab-table th,
              .lab-table td {
                border: 1px solid #000;
                padding: 8px;
                text-align: center;
                font-size: 11px;
              }
              
              .billing-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              
              .billing-table td {
                border: 1px solid #000;
                padding: 8px;
                font-size: 11px;
              }
              
              .billing-label {
                width: 60%;
                font-weight: bold;
              }
              
              .billing-value {
                width: 40%;
                text-align: right;
              }
              
              .amount-in-words {
                text-align: center;
                margin: 15px 0;
                font-size: 11px;
                font-weight: bold;
                padding: 8px 0;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
              }
              
              .signature-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
              }
              
              .signature-box {
                text-align: center;
                width: 30%;
              }
              
              .signature-line {
                border-bottom: 1px solid #000;
                margin-top: 40px;
                margin-bottom: 5px;
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
        `Invoice_${invoiceData?.purchase?.invoice_no || "Unknown"}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
      setPrintLoading(false);
    } catch (error) {
      console.error("PDF generation error:", error);
      setPrintLoading(false);
      alert("Failed to generate PDF. Please try printing instead.");
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0.00";
    return parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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

    if (num === 0 || isNaN(num)) return "Zero";

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

  if (!invoiceData) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography>No invoice data available</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Extract data directly from API - NO CALCULATIONS
  const company = invoiceData.company || {};
  const party = invoiceData.party || {};
  const purchase = invoiceData.purchase || {};
  const vehicle = invoiceData.vehicle || {};
  const quantity = invoiceData.quantity || {};
  const lab = invoiceData.lab || {};
  const billing = invoiceData.billing || {};

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB");
    } catch {
      return dateStr;
    }
  };

  // Get FFA and Oil difference (simple display calculation only)
  const ffaDifference =
    lab.obtain_ffa && lab.standard_ffa
      ? (parseFloat(lab.obtain_ffa) - parseFloat(lab.standard_ffa)).toFixed(2)
      : "0.00";

  const oilDifference =
    lab.obtain_oil && lab.standard_oil
      ? (parseFloat(lab.obtain_oil) - parseFloat(lab.standard_oil)).toFixed(2)
      : "0.00";

  // For display - get the correct amount for words
  const amountForWords = billing.revised_amount || billing.billed_amount || 0;

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
            Invoice - {purchase.invoice_no || "N/A"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label="INVOICE"
            size="small"
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box id="invoice-pdf-content">
          <div
            id="invoice-print-content"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              padding: "20px",
            }}
          >
            {/* Company Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "15px",
                borderBottom: "1px solid #000",
                paddingBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "3px",
                }}
              >
                {company.company_name || "Company Name"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                {company.address_line1 || "Address"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                Mobile No: {company.mobile_no || "Mobile No"}
              </div>
            </div>

            {/* Invoice Header - Two Columns */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                fontSize: "11px",
              }}
            >
              <div style={{ width: "50%" }}>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Report Date:</strong>{" "}
                  {formatDate(purchase.date) || ""}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Party Name:</strong> {party.party_name || ""}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Address:</strong>{" "}
                  {[party.address_line1, party.city, party.state, party.pin]
                    .filter(Boolean)
                    .join(", ") || ""}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>GST Number:</strong> {party.gst || ""}
                </div>
              </div>

              <div style={{ width: "50%", textAlign: "right" }}>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Serial No:</strong> {purchase.invoice_no || ""}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Invoice No:</strong> {purchase.invoice_no || ""}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Invoice Date:</strong>{" "}
                  {formatDate(purchase.date) || ""}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Vehicle No:</strong> {vehicle.vehicle_no || ""}
                </div>
              </div>
            </div>

            {/* Product Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: "15px 0",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Product Name
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Contracted Rate (₹)
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Account Rate (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {purchase.product_name || ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(purchase.contracted_rate)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(billing.account_rate)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Quantity Details */}
            <div style={{ margin: "20px 0" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  textDecoration: "underline",
                }}
              >
                Quantity Details
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  marginBottom: "5px",
                }}
              >
                <div>
                  <strong>Gross Weight:</strong>{" "}
                  {quantity.gross_weight_mt
                    ? parseFloat(quantity.gross_weight_mt).toFixed(3) + " MT"
                    : "0.000 MT"}
                </div>
                <div>
                  <strong>Bag Type:</strong> {quantity.bag_type || "Poly"}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                }}
              >
                <div>
                  <strong>Bags Weight:</strong>{" "}
                  {quantity.bag_weight_mt
                    ? parseFloat(quantity.bag_weight_mt).toFixed(6) + " MT"
                    : "0.000000 MT"}
                </div>
                <div>
                  <strong>Net Weight:</strong>{" "}
                  {quantity.net_weight_mt
                    ? parseFloat(quantity.net_weight_mt).toFixed(3) + " MT"
                    : "0.000 MT"}
                </div>
              </div>
            </div>

            {/* Laboratory Details */}
            <div style={{ margin: "20px 0" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  textAlign: "center",
                  textDecoration: "underline",
                }}
              >
                Laboratory Details
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "11px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "25%",
                      }}
                    ></th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "25%",
                      }}
                    >
                      Standard
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "25%",
                      }}
                    >
                      Obtained
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                        width: "25%",
                      }}
                    >
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      FFA
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {lab.standard_ffa || "0.00"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {lab.obtain_ffa || "0.00"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {ffaDifference}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      OIL
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {lab.standard_oil || "0.00"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {lab.obtain_oil || "0.00"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "center",
                      }}
                    >
                      {oilDifference}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Billing Description */}
            <div style={{ margin: "20px 0" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  textDecoration: "underline",
                }}
              >
                Billing Description
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "11px",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Net Rate (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(billing.net_rate)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Material Amount (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(billing.material_amount)}
                    </td>
                  </tr>
                  {(lab.ffa_rebate_rs || lab.rebate_rs) && (
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px",
                          fontWeight: "bold",
                          color: "red",
                        }}
                      >
                        Rebate For FFA (₹)
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px",
                          textAlign: "right",
                          color: "red",
                        }}
                      >
                        {formatCurrency(lab.ffa_rebate_rs || lab.rebate_rs)}
                      </td>
                    </tr>
                  )}
                  {lab.oil_rebate_rs && (
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px",
                          fontWeight: "bold",
                          color: "red",
                        }}
                      >
                        Rebate For Oil (₹)
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px",
                          textAlign: "right",
                          color: "red",
                        }}
                      >
                        {formatCurrency(lab.oil_rebate_rs)}
                      </td>
                    </tr>
                  )}
                  {lab.oil_premium_rs && (
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px",
                          fontWeight: "bold",
                          color: "green",
                        }}
                      >
                        Premium For Oil (₹)
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px",
                          textAlign: "right",
                          color: "green",
                        }}
                      >
                        {formatCurrency(lab.oil_premium_rs)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Gross Amount (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(billing.gross_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Debit/Credit Note
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                      }}
                    >
                      {invoiceData.debitNoteNo || purchase.invoice_no || ""}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      GST (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                      }}
                    >
                      {billing.gst_type === "Intra"
                        ? `CGST: ${formatCurrency(
                            billing.cgst
                          )}, SGST: ${formatCurrency(billing.sgst)}`
                        : `IGST: ${formatCurrency(billing.igst)}`}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Billed Amount (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(billing.billed_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Invoice Amount (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(billing.invoice_amount)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        fontWeight: "bold",
                      }}
                    >
                      Revised Amount Against Bill (₹)
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {formatCurrency(
                        billing.revised_amount || billing.amount_payable
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Amount in Words */}
            <div
              style={{
                textAlign: "center",
                margin: "20px 0",
                fontSize: "11px",
                fontWeight: "bold",
                padding: "10px 0",
                borderTop: "1px solid #000",
                borderBottom: "1px solid #000",
              }}
            >
              INR {numberToWords(amountForWords)}
            </div>

            {/* Signatures */}
            <div
              style={{
                marginTop: "40px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
              }}
            >
              <div style={{ textAlign: "center", width: "30%" }}>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "150px",
                    margin: "0 auto 5px",
                    height: "1px",
                  }}
                ></div>
                <div>Prepared By</div>
              </div>
              <div style={{ textAlign: "center", width: "30%" }}>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "150px",
                    margin: "0 auto 5px",
                    height: "1px",
                  }}
                ></div>
                <div>Checked By</div>
              </div>
              <div style={{ textAlign: "center", width: "30%" }}>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "150px",
                    margin: "0 auto 5px",
                    height: "1px",
                  }}
                ></div>
                <div>Authorised Signatory</div>
                <div style={{ marginTop: "5px", fontSize: "10px" }}>
                  for {company.company_name || "Company Name"}
                </div>
              </div>
            </div>
          </div>
        </Box>
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
