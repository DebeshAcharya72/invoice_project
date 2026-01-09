import React, { useState, useEffect } from "react";
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
  const [noteType, setNoteType] = useState(""); // 'debit' or 'credit'
  const [noteAmount, setNoteAmount] = useState(0);

  // Calculate note type based on billed amount vs invoice amount
  useEffect(() => {
    if (invoiceData?.billing) {
      const billedAmount = parseFloat(invoiceData.billing.billed_amount) || 0;
      const invoiceAmount =
        parseFloat(invoiceData.billing.material_amount) || 0;

      // Calculate the difference
      const difference = billedAmount - invoiceAmount;

      if (difference > 0) {
        // Billed amount > Invoice amount = Credit Note
        setNoteType("credit");
        setNoteAmount(Math.abs(difference));
      } else if (difference < 0) {
        // Billed amount < Invoice amount = Debit Note
        setNoteType("debit");
        setNoteAmount(Math.abs(difference));
      } else {
        // Equal amounts = No note
        setNoteType("");
        setNoteAmount(0);
      }
    }
  }, [invoiceData]);

  const handlePrint = () => {
    setPrintLoading(true);
    setTimeout(() => {
      const printContent = document.getElementById("invoice-print-content");
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <html>
          <head>
            <title>${getDocumentType()} - ${
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
              
              .company-name-large {
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                letter-spacing: 1px;
              }
              
              .company-address {
                text-align: center;
                font-size: 11px;
                margin-bottom: 5px;
              }
              
              .company-contact {
                text-align: center;
                font-size: 11px;
                margin-bottom: 15px;
              }
              
              .final-remittance {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 20px;
                text-decoration: underline;
              }
              
              .party-details {
                margin-bottom: 15px;
              }
              
              .details-row {
                display: flex;
                margin-bottom: 4px;
                font-size: 11px;
              }
              
              .details-label {
                font-weight: bold;
                min-width: 120px;
              }
              
              .invoice-table {
                width: "100%";
                border-collapse: collapse;
                margin: 15px 0;
              }
              
              .invoice-table th,
              .invoice-table td {
                border: 1px solid #000;
                padding: 6px;
                text-align: center;
                font-size: 11px;
              }
              
              .rebate-table {
                width: "100%";
                border-collapse: collapse;
                margin: 15px 0;
              }
              
              .rebate-table th,
              .rebate-table td {
                border: 1px solid #000;
                padding: 6px;
                font-size: 11px;
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
              
              .calculation-section {
                margin: 20px 0;
              }
              
              .calculation-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 11px;
              }
              
              .calculation-total {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 11px;
                fontWeight: bold;
                padding-top: 5px;
                border-top: 1px solid #000;
              }
              
              .debit-note-section {
                margin: 25px 0 15px 0;
              }
              
              .debit-note-title {
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 15px;
              }
              
              .debit-note-row {
                display: flex;
                margin-bottom: 4px;
                font-size: 11px;
              }
              
              .debit-note-label {
                min-width: 180px;
                font-weight: bold;
              }
              
              .debit-note-divider {
                border-top: 1px solid #000;
                margin: 10px 0;
              }
              
              .signature-section {
                margin-top: 40px;
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
                margin: 40px auto 5px;
                width: 150px;
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
                🖨️ Print ${getDocumentType()}
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
        `${getDocumentType()}_${
          invoiceData?.purchase?.invoice_no || "Unknown"
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

  // Get document type based on noteType
  const getDocumentType = () => {
    if (noteType === "debit") return "Debit Note";
    if (noteType === "credit") return "Credit Note";
    return "Invoice";
  };

  // Get document label for sections
  const getDocumentLabel = () => {
    if (noteType === "debit") return "Debit Note/Sett.";
    if (noteType === "credit") return "Credit Note/Sett.";
    return "Invoice";
  };

  // Get dynamic title for the note section
  const getNoteTitle = () => {
    if (noteType === "debit") return "Debit Note";
    if (noteType === "credit") return "Credit Note";
    return "Invoice";
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

  // Extract data
  const company = invoiceData.company || {};
  const party = invoiceData.party || {};
  const purchase = invoiceData.purchase || {};
  const vehicle = invoiceData.vehicle || {};
  const quantity = invoiceData.quantity || {};
  const lab = invoiceData.lab || {};
  const billing = invoiceData.billing || {};

  // Extract existing notes (if any)
  const debitNotes = invoiceData.debitNotes || [];
  const creditNotes = invoiceData.creditNotes || [];

  // Calculate amounts
  const billedAmount = parseFloat(billing.billed_amount) || 0;
  const invoiceAmount = parseFloat(billing.material_amount) || 0;
  const netPayable = parseFloat(billing.gross_amount) || 0;
  const igst = billing.gst_type === "Inter" ? parseFloat(billing.igst) || 0 : 0;
  const roundOff = parseFloat(billing.round_off) || 0;
  const freight = parseFloat(billing.freight) || 0;

  // Calculate final amount including notes
  const finalAmount = billedAmount;

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
            {getDocumentType()} - {purchase.invoice_no || "N/A"}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={getDocumentType().toUpperCase()}
            size="small"
            sx={{
              bgcolor:
                noteType === "debit"
                  ? "#1976d2"
                  : noteType === "credit"
                  ? "#2e7d32"
                  : "#f57c00",
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
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  letterSpacing: "1px",
                }}
              >
                {company.company_name || "MANMATH PATTANAIK & CO"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  marginBottom: "5px",
                }}
              >
                {company.address_line1 || "bantila, Charampa, Bhadrak"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  marginBottom: "15px",
                }}
              >
                {company.mobile_no || "6371195818"}
              </div>
            </div>

            {/* Dynamic Title */}
            <div
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "20px",
                textDecoration: "underline",
              }}
            >
              {/* {getDocumentType()} */}
              Final Remittance
            </div>
            <div style={{ display: "flex" }}>
              {/* Party Details */}
              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    Party Name:
                  </div>
                  <div>{party.party_name || ""}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    Address :
                  </div>
                  <div>
                    {[party.address_line1, party.city, party.state, party.pin]
                      .filter(Boolean)
                      .join(", ") ||
                      "Manasa Place Gandarpur, Cuttack, Odisha, 753003"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    State Name :
                  </div>
                  <div>{party.state || "Odisha"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    GSTIN :
                  </div>
                  <div>{party.gst || "21AMJPP6577A124"}</div>
                </div>
                {/* <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    Broker Name:
                  </div>
                  <div>{purchase.broker_name || "Sunil Jain"}</div>
                </div> */}
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    Purchase Date :
                  </div>
                  <div>{formatDate(purchase.date) || "04-01-2026"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "120px" }}>
                    Contact Number :
                  </div>
                  <div>
                    {party.mobile || party.contact_number || "9876543210"}
                  </div>
                </div>
              </div>
              {/* Dynamic Document Details */}
              <div style={{ marginBottom: "15px", marginLeft: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "150px" }}>
                    {getDocumentLabel()} No.:
                  </div>
                  <div>{purchase.invoice_no || "FSR-7203"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "150px" }}>
                    {getDocumentLabel()} Date:
                  </div>
                  <div>{formatDate(purchase.date) || "04-01-2026"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "150px" }}>
                    Vehicle No. :
                  </div>
                  <div>{vehicle.vehicle_no || "OD15F 6232"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "150px" }}>
                    Contact Person :
                  </div>
                  <div>{party.contact_person || "Mr. Mammath Pattnaik"}</div>
                </div>
              </div>
            </div>
            {/* Divider */}
            {/* <div
              style={{ borderTop: "1px solid #000", margin: "15px 0" }}
            ></div> */}

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
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    S.No.
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    Bags
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    Gross Weight
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    Net Weight
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "right",
                    }}
                  >
                    Rate
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "right",
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
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    1
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    {purchase.product_name || "Boiled Rice Bran"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    {quantity.total_bags || "2810"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    {quantity.gross_weight_mt
                      ? parseFloat(quantity.gross_weight_mt).toFixed(3) + " MT"
                      : "140.000 MT"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    {quantity.net_weight_mt
                      ? parseFloat(quantity.net_weight_mt).toFixed(3) + " MT"
                      : "139.438 MT"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(
                      billing.account_rate ||
                        purchase.contracted_rate ||
                        "3392.20"
                    )}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(invoiceAmount || "474908.00")}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Rebate & Premium Table */}
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
                    colSpan="2"
                    style={{
                      // border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
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
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    FFA ({lab.obtain_ffa || "675.00"})
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    OIL ({lab.obtain_oil || "32.80"})
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    Amount
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "6px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(netPayable || "474200.20")}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* First Amount in Words */}
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
              INR {numberToWords(netPayable || 474200.2)}
            </div>

            {/* Calculation Section */}
            <div style={{ margin: "20px 0" }}>
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  fontSize: "11px",
                }}
              >
                Depth of Interest:
              </div>

              {/* Net Payable */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "11px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Net Payable</div>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                  {formatCurrency(netPayable)}
                </div>
              </div>

              {/* Input IGST */}
              {billing.gst_type === "Inter" && igst > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div>Input GST (5%)</div>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(igst)}
                  </div>
                </div>
              )}

              {/* Round Off */}
              {roundOff !== 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div>Round Off</div>
                  <div style={{ textAlign: "right" }}>
                    {formatCurrency(roundOff)}
                  </div>
                </div>
              )}

              {/* Freight */}
              {freight > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div>Less Freight</div>
                  <div style={{ textAlign: "right" }}>
                    - {formatCurrency(freight)}
                  </div>
                </div>
              )}

              {/* Dynamic Note Display based on comparison */}
              {noteAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <strong>{getDocumentType()}:</strong>{" "}
                    {noteType === "debit"
                      ? "Additional charges/debits"
                      : "Credit/Adjustment"}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      color: noteType === "credit" ? "#2e7d32" : "inherit",
                    }}
                  >
                    {noteType === "debit" ? "+ " : "- "}
                    {formatCurrency(noteAmount)}
                  </div>
                </div>
              )}

              {/* Final Amount */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  paddingTop: "5px",
                  borderTop: "1px solid #000",
                }}
              >
                <div>Net Amount</div>
                <div style={{ textAlign: "right" }}>
                  {formatCurrency(finalAmount)}
                </div>
              </div>
            </div>

            {/* Dynamic Note Section - Only show if there's a note */}
            {noteAmount > 0 && (
              <div style={{ margin: "25px 0 15px 0" }}>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                  }}
                >
                  {getNoteTitle()}
                </div>

                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: "bold", minWidth: "180px" }}>
                    Party Name :
                  </div>
                  <div>{party.party_name || "Mammath Pattnaik & Co"}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ minWidth: "180px" }}>
                    {purchase.product_name || "Boiled Rice Bran"}
                  </div>
                  <div style={{ textAlign: "right", flexGrow: 1 }}>
                    {formatCurrency(invoiceAmount || "474,908.00")}
                  </div>
                </div>

                {billing.gst_type === "Inter" && igst > 0 && (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ minWidth: "180px" }}>Input GST (5%)</div>
                    <div style={{ textAlign: "right", flexGrow: 1 }}>
                      {formatCurrency(igst)}
                    </div>
                  </div>
                )}

                {roundOff !== 0 && (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ minWidth: "180px" }}>RoundOff</div>
                    <div style={{ textAlign: "right", flexGrow: 1 }}>
                      {formatCurrency(roundOff)}
                    </div>
                  </div>
                )}

                {/* Show the Note Amount */}
                <div
                  style={{
                    display: "flex",
                    marginBottom: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ minWidth: "180px" }}>{getDocumentType()}</div>
                  <div style={{ textAlign: "right", flexGrow: 1 }}>
                    {noteType === "debit" ? "+ " : "- "}
                    {formatCurrency(noteAmount)}
                  </div>
                </div>

                <div
                  style={{ borderTop: "1px solid #000", margin: "10px 0" }}
                ></div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    marginTop: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    Revised Amount Against Bills
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {formatCurrency(finalAmount)}
                  </div>
                </div>
              </div>
            )}

            {/* Final Amount in Words */}
            <div
              style={{
                textAlign: "center",
                margin: "20px 0",
                fontSize: "11px",
                fontWeight: "bold",
                padding: "8px 0",
                borderTop: "1px solid #000",
                borderBottom: "1px solid #000",
              }}
            >
              Amount In Words : INR {numberToWords(finalAmount)}
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
                  for {company.company_name || "MANMATH PATTANAIK & CO"}
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
          {printLoading ? "Preparing..." : `Print ${getDocumentType()}`}
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
          {printLoading ? "Generating..." : `Download ${getDocumentType()}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePreview;
