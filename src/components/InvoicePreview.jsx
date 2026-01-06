// src/components/InvoicePreview.jsx
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
            <title>Invoice - ${invoiceData?.debitNoteNo || "N/A"}</title>
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
              
              .title {
                text-align: center;
                font-size: 16px;
                font-weight: 700;
                margin: 10px 0;
              }
              
              .party-info {
                margin: 10px 0;
                font-size: 11px;
              }
              
              .data-table {
                width: 100%;
                margin: 10px 0;
                font-size: 10px;
                page-break-inside: avoid;
              }
              
              .data-row {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #ddd;
              }
              
              .data-label {
                font-weight: bold;
                width: 40%;
              }
              
              .data-value {
                width: 60%;
                text-align: right;
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
              
              .amount-section {
                margin-top: 15px;
                padding: 10px;
                background: #f9f9f9;
              }
              
              .signature-section {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
              }
              
              .signature-box {
                text-align: center;
                width: 30%;
              }
              
              .signature-line {
                height: 1px;
                border-bottom: 1px solid #000;
                margin-top: 40px;
                margin-bottom: 5px;
              }
              
              .debit-note {
                margin-top: 20px;
                padding-top: 10px;
              }
              
              .footer {
                margin-top: 20px;
                padding-top: 10px;
                font-size: 9px;
                color: #666;
                text-align: center;
              }
              
              .invoice-table {
                width: 100%;
                margin: 10px 0;
                border-collapse: collapse;
              }
              
              .invoice-table th,
              .invoice-table td {
                border: 1px solid #000;
                padding: 4px 8px;
                text-align: center;
              }
              
              .invoice-table td {
                vertical-align: top;
              }
              
              .highlight-box {
                background: #f0f0f0;
                padding: 8px;
                border-radius: 4px;
                margin: 10px 0;
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
        `Invoice_${invoiceData?.debitNoteNo || "Unknown"}_${
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
    if (amount === undefined || amount === null) return "0.00";
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

    if (num === 0) return "Zero";

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

  // Get GST type from invoice data (default to "Intra")
  const gstType = invoiceData?.billing?.gst_type || "Intra";

  // Calculate values from invoiceData
  const materialAmount = parseFloat(invoiceData.billing?.material_amount) || 0;
  const ffaRebate =
    parseFloat(invoiceData.lab?.ffa_rebate_rs || invoiceData.lab?.rebate_rs) ||
    0;
  const oilRebate = parseFloat(invoiceData.lab?.oil_rebate_rs) || 0;
  const oilPremium = parseFloat(invoiceData.lab?.oil_premium_rs) || 0;

  // Calculate Net Amount after rebates
  const netAmountAfterRebates =
    materialAmount - ffaRebate - oilRebate + oilPremium;

  // GST Calculations based on type
  let inputCGST = 0;
  let inputSGST = 0;
  let inputIGST = 0;
  let debitNoteCGST = 0;
  let debitNoteSGST = 0;
  let debitNoteIGST = 0;

  if (gstType === "Intra") {
    // Intra State: 2.5% CGST + 2.5% SGST
    inputCGST = materialAmount * 0.025;
    inputSGST = materialAmount * 0.025;
    debitNoteCGST = materialAmount * 0.025;
    debitNoteSGST = materialAmount * 0.025;
  } else {
    // Inter State: 5% IGST
    inputIGST = materialAmount * 0.05;
    debitNoteIGST = materialAmount * 0.05;
  }

  // Other calculations
  const depthOfInterest = materialAmount;
  const roundOff = -0.24;
  const lessFreight = 16000.0;
  const netPayable = netAmountAfterRebates - lessFreight + roundOff;

  // Debit Note values
  const boiledBranAmount = materialAmount;
  const roundOffDebit = 0.04;

  // Calculate total debit note based on GST type
  let totalDebitNote = 0;
  if (gstType === "Intra") {
    totalDebitNote =
      boiledBranAmount + debitNoteCGST + debitNoteSGST + roundOffDebit;
  } else {
    totalDebitNote = boiledBranAmount + debitNoteIGST + roundOffDebit;
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
            Invoice - {invoiceData.debitNoteNo || "N/A"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label="FINAL REMITTANCE"
            size="small"
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              fontWeight: "bold",
            }}
          />
          {/* <Chip
            label={gstType === "Intra" ? "INTRA STATE" : "INTER STATE"}
            size="small"
            sx={{
              bgcolor: gstType === "Intra" ? "#4caf50" : "#ff9800",
              color: "white",
              fontWeight: "bold",
              ml: 1,
            }}
          /> */}
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
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "3px",
                }}
              >
                {invoiceData.company?.company_name || "N/A"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                {invoiceData.company?.address_line1 ||
                  "bantila, Charampa, Bhadrak"}
              </div>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>
                {invoiceData.company?.mobile_no || "6371195818"}
              </div>
            </div>

            {/* FINAL SETTLEMENT Title */}
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "bold",
                margin: "15px 0",
                textDecoration: "underline",
              }}
            >
              FINAL REMITTANCE
            </div>

            {/* Party Details */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                gap: "10px",
              }}
            >
              <div
                style={{ marginBottom: "15px", fontSize: "11px", width: "50%" }}
              >
                <div style={{ marginBottom: "3px" }}>
                  <strong>Party Name:</strong>{" "}
                  {invoiceData.party?.party_name || "Mammath Pattnaik & Co"}
                </div>
                <div style={{ marginBottom: "3px" }}>
                  <strong>Address :</strong>{" "}
                  {[
                    invoiceData.party?.address_line1,
                    invoiceData.party?.city,
                    invoiceData.party?.state,
                    invoiceData.party?.pin,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                    "Manasa Place Gandarpur, Cuttack, Odisha, 753003"}
                </div>
                <div style={{ marginBottom: "3px" }}>
                  <strong>State Name :</strong>{" "}
                  {invoiceData.party?.state || "Odisha"}
                </div>
                <div style={{ marginBottom: "3px" }}>
                  <strong>GSTIN :</strong>{" "}
                  {invoiceData.party?.gst || "21AMJPP6577A124"}
                </div>
                <div style={{ marginBottom: "3px" }}>
                  <strong>Broker Name:</strong>{" "}
                  {invoiceData.brokerName || "Sunil Jain"}
                </div>
                <div style={{ marginBottom: "3px" }}>
                  <strong>Purchase Date :</strong>{" "}
                  {invoiceData.purchaseDate || "2026-01-04"}
                </div>
                <div style={{ marginBottom: "3px" }}>
                  <strong>Contact Number :</strong>{" "}
                  {invoiceData.party?.mobile_no || "9876543210"}
                </div>
              </div>

              {/* Invoice Details Section */}
              <div
                style={{
                  marginBottom: "15px",
                  fontSize: "10px",
                  textAlign: "right",
                  padding: "8px",
                  width: "50%",
                }}
              >
                <div style={{ marginBottom: "5px" }}>
                  <strong>Debit Note/Sett. No.:</strong>{" "}
                  {invoiceData.debitNoteNo || "FSR-7203"}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Debit Note/Sett. Date:</strong>{" "}
                  {invoiceData.purchaseDate?.split("-").reverse().join("-") ||
                    "04-01-2026"}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Supp.Inv.No./Date :</strong>{" "}
                  {invoiceData.supplierInvNo || "MPI/20/46/7203"}
                </div>
                <div style={{ marginBottom: "5px" }}>
                  <strong>Vehicle No. :</strong>{" "}
                  {invoiceData.vehicle?.vehicle_no || "O015F 6232"}
                </div>
                <div>
                  <strong>Contact Person :</strong>{" "}
                  {invoiceData.party?.contact_person || "Mr. Mammath Pathnak"}
                </div>
                {/* <div
                  style={{
                    marginTop: "5px",
                    fontSize: "10px",
                    color: gstType === "Intra" ? "#4caf50" : "#ff9800",
                    fontWeight: "bold",
                  }}
                >
                  {gstType === "Intra"
                    ? "INTRA STATE TRANSACTION"
                    : "INTER STATE TRANSACTION"}
                </div> */}
              </div>
            </div>

            {/* Product Table and Rebate Table - SIDE BY SIDE */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                gap: "10px",
              }}
            >
              {/* Left Column - Product Table */}
              <div style={{ width: "70%" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        S.No.
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Type
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Bags
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Gross Weight
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Net Weight
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Rate
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        1
                      </td>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        {invoiceData.purchase?.product_name ||
                          "Boiled Rice Bran"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {invoiceData.quantity?.no_of_bags || "2810"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {invoiceData.purchase?.gross_weight_mt
                          ? parseFloat(
                              invoiceData.purchase.gross_weight_mt
                            ).toFixed(3)
                          : "140.000"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {invoiceData.quantity?.net_weight_mt
                          ? parseFloat(
                              invoiceData.quantity.net_weight_mt
                            ).toFixed(3)
                          : "139.438"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {invoiceData.billing?.account_rate
                          ? parseFloat(
                              invoiceData.billing.account_rate
                            ).toFixed(2)
                          : "3392.20"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {invoiceData.billing?.material_amount
                          ? formatCurrency(invoiceData.billing.material_amount)
                          : "4,74,908.00"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Right Column - Rebate & Premium Table */}
              <div style={{ width: "30%" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10px",
                    border: "1px solid #000",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        colSpan="4"
                        style={{
                          borderBottom: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Rebate & Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          color: "red",
                          letterSpacing: "1px",
                        }}
                      >
                        FFA Rebate ({formatCurrency(ffaRebate)})
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          color: "red",
                          letterSpacing: "1px",
                        }}
                      >
                        Oil Rebate ({formatCurrency(oilRebate)})
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="2"
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          color: "green",
                          letterSpacing: "1px",
                        }}
                      >
                        Oil Premium ({formatCurrency(oilPremium)})
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        Amount
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {formatCurrency(netAmountAfterRebates)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amount in Words */}
            <div
              style={{
                textAlign: "center",
                margin: "15px 0",
                fontSize: "11px",
                fontWeight: "bold",
                padding: "8px 0",
                borderTop: "1px solid #000",
                borderBottom: "1px solid #000",
              }}
            >
              INR {numberToWords(netPayable)}
            </div>

            {/* Calculation Summary */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                  Depth of Interest:
                </div>
                <div style={{ fontSize: "10px", textAlign: "right" }}>
                  {formatCurrency(depthOfInterest)}
                </div>
              </div>

              {/* Conditional GST Display */}
              {gstType === "Intra" ? (
                // Show CGST and SGST for Intra-State
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <div style={{ fontSize: "10px" }}>Input CGST (2.5%)</div>
                    <div style={{ fontSize: "10px", textAlign: "right" }}>
                      {formatCurrency(inputCGST)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <div style={{ fontSize: "10px" }}>Input SGST (2.5%)</div>
                    <div style={{ fontSize: "10px", textAlign: "right" }}>
                      {formatCurrency(inputSGST)}
                    </div>
                  </div>
                </>
              ) : (
                // Show IGST for Inter-State
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <div style={{ fontSize: "10px" }}>Input IGST (5%)</div>
                  <div style={{ fontSize: "10px", textAlign: "right" }}>
                    {formatCurrency(inputIGST)}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <div style={{ fontSize: "10px" }}>Round Off</div>
                <div style={{ fontSize: "10px", textAlign: "right" }}>
                  {formatCurrency(roundOff)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <div style={{ fontSize: "10px" }}>Less Freight</div>
                <div style={{ fontSize: "10px", textAlign: "right" }}>
                  {formatCurrency(lessFreight)}
                </div>
              </div>

              {/* Net Payable with separator line */}
              <div
                style={{
                  borderTop: "1px solid #000",
                  marginTop: "10px",
                  paddingTop: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                  Net Payable
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(netPayable)}
                </div>
              </div>
            </div>

            {/* Debit Note Section */}
            <div
              style={{
                marginTop: "20px",
                paddingTop: "10px",
                borderTop: "1px solid #000",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  fontSize: "12px",
                }}
              >
                Debit Note
              </div>

              <div style={{ marginBottom: "10px", fontSize: "10px" }}>
                <strong>Party Name :</strong>{" "}
                {invoiceData.party?.party_name || "Mammath Pattnaik & Co"}
              </div>

              {/* Debit Note Items */}
              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <div style={{ fontSize: "10px" }}>Boiled Bran</div>
                  <div style={{ fontSize: "10px", textAlign: "right" }}>
                    {formatCurrency(boiledBranAmount)}
                  </div>
                </div>

                {/* Conditional GST Display for Debit Note */}
                {gstType === "Intra" ? (
                  // Show CGST and SGST for Intra-State
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <div style={{ fontSize: "10px" }}>Input CGST (2.5%)</div>
                      <div style={{ fontSize: "10px", textAlign: "right" }}>
                        {formatCurrency(debitNoteCGST)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <div style={{ fontSize: "10px" }}>Input SGST (2.5%)</div>
                      <div style={{ fontSize: "10px", textAlign: "right" }}>
                        {formatCurrency(debitNoteSGST)}
                      </div>
                    </div>
                  </>
                ) : (
                  // Show IGST for Inter-State
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <div style={{ fontSize: "10px" }}>Input IGST (5%)</div>
                    <div style={{ fontSize: "10px", textAlign: "right" }}>
                      {formatCurrency(debitNoteIGST)}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <div style={{ fontSize: "10px" }}>RoundOff</div>
                  <div style={{ fontSize: "10px", textAlign: "right" }}>
                    {formatCurrency(roundOffDebit)}
                  </div>
                </div>

                {/* Total with separator line */}
                <div
                  style={{
                    borderTop: "1px solid #000",
                    marginTop: "10px",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "bold" }}>
                    Revised Amount Against Bills
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(totalDebitNote)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                Amount In Words :{" "}
                <strong>INR {numberToWords(totalDebitNote)}</strong>
              </div>
            </div>

            {/* Signatures */}
            <div
              style={{
                marginTop: "40px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
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
                <div style={{ marginTop: "5px", fontSize: "9px" }}>
                  for {invoiceData.company?.company_name || "N/A"}
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
