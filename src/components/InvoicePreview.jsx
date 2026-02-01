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

const InvoicePreview = ({ open, onClose, invoiceData, onAfterPrint }) => {
  const [printLoading, setPrintLoading] = useState(false);
  const [gstBreakdown, setGstBreakdown] = useState({
    baseAmount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
  });

  // Mask mobile number: show last 4 digits, hide rest with X
  const maskMobileNumber = (number) => {
    if (!number) return "N/A";
    const numStr = number.toString();
    if (numStr.length <= 4) return numStr;
    const visibleDigits = numStr.slice(-4);
    const maskedPart = "X".repeat(numStr.length - 4);
    return `${maskedPart}${visibleDigits}`;
  };

  // Calculate GST breakdown
  useEffect(() => {
    if (invoiceData) {
      const data = invoiceData.data || invoiceData;
      const billing = data.billing || {};

      // Get the revised amount (net payable)
      const revisedAmount = parseFloat(
        billing.revised_amount || billing.amount_payable || 0,
      );

      // Get GST type from billing data
      const gstType = billing.gst_type || "Intra";

      // Calculate GST breakdown based on your formula
      const baseAmount = revisedAmount / 1.05;

      if (gstType === "Intra") {
        const cgst = baseAmount * 0.025;
        const sgst = baseAmount * 0.025;
        setGstBreakdown({
          baseAmount,
          cgst,
          sgst,
          igst: 0,
        });
      } else if (gstType === "Inter") {
        const igst = baseAmount * 0.05;
        setGstBreakdown({
          baseAmount,
          cgst: 0,
          sgst: 0,
          igst,
        });
      }
    }
  }, [invoiceData]);

  const handlePrint = () => {
    setPrintLoading(true);
    // Prevent any state changes that might cause re-render
    const printContent = document.getElementById(
      "invoice-print-content",
    ).innerHTML;
    //  const invoiceNo = invoiceData?.purchase?.invoice_no || "N/A";
    setTimeout(() => {
      // const printContent = document.getElementById("invoice-print-content");
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow popups for this site to print the invoice.");
        setPrintLoading(false);
        return;
      }

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
                font-size: "11px",
                margin-bottom: 15px,
              }
              
              .final-remittance {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 20px;
                text-decoration: underline;
              }
              
              .header-columns {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
              }
              
              .header-left {
                width: 45%;
              }
              
              .header-right {
                width: 45%;
              }
              
              .header-row {
                display: flex;
                margin-bottom: 4px;
                font-size: 11px;
              }
              
              .header-label {
                font-weight: bold;
                min-width: 100px;
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
              
              .weight-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
              }
              
              .weight-table th,
              .weight-table td {
                border: 1px solid #000;
                padding: 6px;
                text-align: center;
                font-size: 11px;
              }
              
              .gst-breakdown-table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 11px;
              }
              
              .gst-breakdown-table th,
              .gst-breakdown-table td {
                border: 1px solid #000;
                padding: 6px;
                text-align: left;
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
             ${printContent}
            </div>
            <div class="no-print" style="margin-top:20px;text-align:center;padding:20px;">
              <button onclick="window.print()" style="padding:10px 20px;background:#4CAF50;color:white;border:none;cursor:pointer;border-radius:4px;font-size:14px;">
                🖨️ Print Invoice
              </button>
              <button onclick="window.close()" style="padding:10px 20px;background:#f44336;color:white;border:none;cursor:pointer;margin-left:10px;border-radius:4px;font-size:14px;">
                ✕ Close Window
              </button>
            </div>

            <script>
              // Function to notify parent window
              function notifyParent() {
                try {
                  if (window.opener) {
                    window.opener.postMessage('invoicePrinted', '*');
                  }
                } catch(e) {
                  console.log('Notification failed:', e);
                }
              }
              
              // Auto-print after short delay
              setTimeout(() => {
                window.print();
                
                // Set up afterprint event listener
                window.onafterprint = function() {
                  notifyParent();
                  setTimeout(() => {
                    window.close();
                  }, 500);
                };
                
                // Also notify if user manually prints
                window.matchMedia('print').addListener(function(mql) {
                  if (!mql.matches) {
                    // Print dialog closed
                    setTimeout(() => {
                      notifyParent();
                      setTimeout(() => {
                        window.close();
                      }, 500);
                    }, 1000);
                  }
                });
                
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      // setPrintLoading(false);
      // setTimeout(() => {
      //   printWindow.print();
      //   printLoading && setPrintLoading(false);
      // }, 500);
    }, 500);
  };

  // Add event listener for print completion message
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === "invoicePrinted") {
        setPrintLoading(false);
        if (onAfterPrint) {
          onAfterPrint(); // Call the callback
        }
        // Optionally close the dialog
        onClose();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onAfterPrint, onClose]);

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
        imgHeight * ratio,
      );
      pdf.save(
        `Invoice_${invoiceData?.purchase?.invoice_no || "Unknown"}_${
          new Date().toISOString().split("T")[0]
        }.pdf`,
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

  const formatWeight = (weight) => {
    if (weight === undefined || weight === null || isNaN(weight))
      return "0.000";
    return parseFloat(weight).toLocaleString("en-IN", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
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
  const data = invoiceData.data || invoiceData;
  const company = data.company || {};
  const party = data.party || {};
  const purchase = data.purchase || {};
  const vehicle = data.vehicle || {};
  const quantity = data.quantity || {};
  const lab = data.lab || {};
  const billing = data.billing || {};

  // Calculate total GST
  const totalGST =
    (parseFloat(billing.cgst) || 0) +
    (parseFloat(billing.sgst) || 0) +
    (parseFloat(billing.igst) || 0);

  const billedAmount = parseFloat(billing.billed_amount) || 0;
  const invoiceAmount = parseFloat(billing.invoice_amount) || 0;
  const noteAmount = Math.abs(billedAmount - invoiceAmount);
  const isCreditNote = billedAmount > invoiceAmount;
  const revisedAmount = parseFloat(
    billing.revised_amount || billing.amount_payable || 0,
  );

  // Get weight data
  const grossWeight =
    quantity?.gross_weight_mt || purchase?.gross_weight_mt || 0;
  const netWeight = quantity?.net_weight_mt || 0;
  const noOfBags = quantity?.no_of_bags || purchase?.no_of_bags || 0;
  const bagType = quantity?.bag_type || purchase?.bag_type || "Poly";

  // Get bag weight (Poly = 0.0002 MT, Jute = 0.0005 MT)
  const bagWeight = bagType === "Poly" ? 0.0002 : 0.0005;
  const totalBagWeight = noOfBags * bagWeight;

  // Get lab data with defaults
  const standardFFA = lab?.standard_ffa || 7;
  const obtainedFFA = lab?.obtain_ffa || 0;
  const ffaRebate = lab?.rebate_rs || lab?.ffa_rebate_rs || 0;
  const ffaPremium = lab?.premium_rs || lab?.ffa_premium_rs || 0;

  const standardOil = lab?.standard_oil || 19;
  const obtainedOil = lab?.obtain_oil || 0;
  const oilRebate = lab?.oil_rebate_rs || 0;
  const oilPremium = lab?.oil_premium_rs || 0;

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
              fontSize: "11px",
              padding: "10px",
            }}
          >
            {/* Company Header - Compact */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "3px",
                  letterSpacing: "1px",
                }}
              >
                {company.company_name || "MANMATH PATTANAIK & CO"}
              </div>

              <div
                style={{
                  fontSize: "10px",
                  marginBottom: "3px",
                }}
              >
                {company.address_line1 || "bantila, Charampa, Bhadrak"}
              </div>
              {/* Company Email - Add this */}
              {company.email && (
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    fontWeight: "500",
                  }}
                >
                  Email: {company.email}
                </div>
              )}
              <div
                style={{
                  fontSize: "10px",
                  marginBottom: "10px",
                }}
              >
                Mobile: {company.mobile_no || "6371195818"}
              </div>
              {/* Company GST Number - Add this */}
              {(company.gst_number || company.gst) && (
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    fontWeight: "500",
                    textTransform: "uppercase",
                  }}
                >
                  GST: {(company.gst_number || company.gst).toUpperCase()}
                </div>
              )}
            </div>

            {/* Final Remittance Title - Compact */}
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "15px",
                textDecoration: "underline",
              }}
            >
              Final Remittance
            </div>

            {/* Header Details in two columns - Compact */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              {/* Left Column */}
              <div style={{ width: "48%" }}>
                <div style={{ display: "flex", marginBottom: "3px" }}>
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Report Date:
                  </div>
                  <div>{formatDate(purchase.date) || "04-01-2026"}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "3px" }}>
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Party Name:
                  </div>
                  <div>{party.party_name || ""}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "3px" }}>
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Address:
                  </div>
                  <div>
                    {party.address_line1 || ""}
                    {(party.city || party.state || party.pin) && (
                      <span>
                        {party.address_line1 ? ", " : ""}
                        {party.city || ""}
                        {party.city && (party.state || party.pin) ? ", " : ""}
                        {party.state || ""}
                        {party.state && party.pin ? " - " : ""}
                        {party.pin || ""}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", marginBottom: "3px" }}>
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    GST Number:
                  </div>
                  <div>{party.gst || "21AMJPP6577A124"}</div>
                </div>
              </div>

              {/* Right Column */}
              <div
                style={{
                  width: "48%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    marginBottom: "3px",
                    textAlign: "left",
                    width: "180px",
                  }}
                >
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Serial No:
                  </div>
                  <div>{purchase.invoice_no || "FSR-7203"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "3px",
                    textAlign: "left",
                    width: "180px",
                  }}
                >
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Invoice No:
                  </div>
                  <div>{purchase.invoice_no || "FSR-7203"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "3px",
                    textAlign: "left",
                    width: "180px",
                  }}
                >
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Invoice Date:
                  </div>
                  <div>{formatDate(purchase.date) || "04-01-2026"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "3px",
                    textAlign: "left",
                    width: "180px",
                  }}
                >
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Receive Date:
                  </div>
                  <div>{formatDate(purchase.received_date) || "N/A"}</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginBottom: "3px",
                    textAlign: "left",
                    width: "180px",
                  }}
                >
                  <div style={{ fontWeight: "bold", width: "90px" }}>
                    Vehicle No:
                  </div>
                  <div>{vehicle.vehicle_no || "OD15F 6232"}</div>
                </div>
                {purchase.agent_name && (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "3px",
                      textAlign: "left",
                      width: "180px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", width: "90px" }}>
                      Agent Name:
                    </div>
                    <div>{purchase.agent_name}</div>
                  </div>
                )}
                {/* {purchase.agent_number && (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "3px",
                      textAlign: "left",
                      width: "180px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", width: "90px" }}>
                      Agent Number:
                    </div>
                    <div>{purchase.agent_number}</div>
                  </div>
                )} */}

                {purchase.agent_number && (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "3px",
                      textAlign: "left",
                      width: "180px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", width: "90px" }}>
                      Agent Number:
                    </div>
                    <div>{maskMobileNumber(purchase.agent_number)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Weight and Lab Analysis in one row - Compact */}
            <div style={{ display: "flex", width: "100%", margin: "5px 0" }}>
              {/* Weight Details Table - Compact */}
              <div style={{ flex: 1, marginRight: "5px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "2px",
                    textAlign: "center",
                  }}
                >
                  Weight Details
                </div>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "9px",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        Particulars
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        Details
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        Weight (MT)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        Gross Weight
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        -
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {formatWeight(grossWeight)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                        rowSpan="3"
                      >
                        Deductions
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        Bag Type:{" "}
                        {bagType === "Poly" ? "Poly Bags" : "Jute Bags"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {formatWeight(bagWeight)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        No. of Bags: {noOfBags}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {formatWeight(totalBagWeight)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        Total Bag Weight
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "500",
                        }}
                      >
                        {formatWeight(totalBagWeight)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        Net Weight
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        (Gross - Total Bag Weight)
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {formatWeight(netWeight)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Laboratory Analysis Section - Compact */}
              <div style={{ flex: 1.5 }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "2px",
                    textAlign: "center",
                  }}
                >
                  Laboratory Analysis
                </div>

                <div style={{ width: "100%" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "9px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          Particulars
                        </th>
                        <th
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          Standards
                        </th>
                        <th
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          Result
                        </th>
                        <th
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          Account
                        </th>
                        <th
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          Differences
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            fontWeight: "500",
                            textAlign: "center",
                          }}
                        >
                          FFA
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {standardFFA}%
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {obtainedFFA}%
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {obtainedFFA < standardFFA
                            ? "0.00"
                            : `${obtainedFFA}%`}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                            color:
                              obtainedFFA > standardFFA ? "#f44336" : "#4caf50",
                          }}
                        >
                          {obtainedFFA < standardFFA
                            ? "0.00"
                            : `${(obtainedFFA - standardFFA).toFixed(2)}%`}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            fontWeight: "500",
                            textAlign: "center",
                          }}
                        >
                          OIL
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {standardOil}%
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {obtainedOil}%
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                          }}
                        >
                          {obtainedOil}%
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "center",
                            color:
                              obtainedOil > standardOil ? "#4caf50" : "#f44336",
                          }}
                        >
                          {(obtainedOil - standardOil).toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Product Details Table - Compact */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    margin: "9px 0 1px",
                    fontSize: "10px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #000", padding: "6px" }}>
                        Product Name
                      </th>
                      <th style={{ border: "1px solid #000", padding: "6px" }}>
                        Contracted Rate (₹)
                      </th>
                      <th style={{ border: "1px solid #000", padding: "6px" }}>
                        Account Rate (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "6px" }}>
                        {purchase.product_name || "Boiled Rice Bran"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(purchase.contracted_rate || 0)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(billing.account_rate || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billed Amount Section - Compact */}
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "5px",
                textDecoration: "underline",
              }}
            >
              Billed Amount
            </div>

            <div
              style={{
                border: "1px solid #000",
                padding: "5px",
                marginBottom: "10px",
              }}
            >
              {/* Billing Description - Compact */}
              <div style={{ margin: "3px 0" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "3px",
                  }}
                >
                  Billing Description
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                    fontSize: "10px",
                  }}
                >
                  <div>Net Rate (₹):</div>
                  <div>{formatCurrency(billing.net_rate || 0)}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                    fontSize: "10px",
                  }}
                >
                  <div>Material Amount (₹):</div>
                  <div>{formatCurrency(billing.material_amount || 0)}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                    fontSize: "10px",
                  }}
                >
                  <div>Rebate For FFA (₹):</div>
                  <div>
                    {formatCurrency(
                      billing.ffa_rebate || billing.rebate_rs || 0,
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                    fontSize: "10px",
                  }}
                >
                  <div>Rebate For Oil (₹):</div>
                  <div>
                    {formatCurrency(
                      billing.oil_rebate || billing.oil_rebate_rs || 0,
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "2px",
                    fontSize: "10px",
                  }}
                >
                  <div>Premium For Oil (₹):</div>
                  <div>
                    {formatCurrency(
                      billing.oil_premium || billing.oil_premium_rs || 0,
                    )}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "3px",
                      fontWeight: "bold",
                      paddingTop: "3px",
                      fontSize: "10px",
                    }}
                  >
                    <div>Gross Amount (₹):</div>
                    <div>{formatCurrency(billing.gross_amount || 0)}</div>
                  </div>
                </div>

                {/* GST and Final Amounts - Compact */}
                <div style={{ margin: "10px 0" }}>
                  {billing.gst_type === "Intra" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "1px",
                          fontSize: "9px",
                          paddingLeft: "15px",
                        }}
                      >
                        <div>CGST (2.5%):</div>
                        <div>{formatCurrency(billing.cgst || 0)}</div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "2px",
                          fontSize: "9px",
                          paddingLeft: "15px",
                        }}
                      >
                        <div>SGST (2.5%):</div>
                        <div>{formatCurrency(billing.sgst || 0)}</div>
                      </div>
                    </>
                  )}

                  {billing.gst_type === "Inter" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "2px",
                        fontSize: "9px",
                        paddingLeft: "15px",
                      }}
                    >
                      <div>IGST (5%):</div>
                      <div>{formatCurrency(billing.igst || 0)}</div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    <div>Billed Amount (₹):</div>
                    <div>{formatCurrency(billing.billed_amount || 0)}</div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                      fontSize: "10px",
                    }}
                  >
                    <div>Invoice Amount (₹):</div>
                    <div>{formatCurrency(billing.invoice_amount || 0)}</div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "3px",
                      fontWeight: "bold",
                      paddingTop: "3px",
                      borderTop: "1px solid #000",
                      fontSize: "10px",
                    }}
                  >
                    <div>Net Payable (₹):</div>
                    <div>
                      {formatCurrency(
                        billing.revised_amount || billing.amount_payable || 0,
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount in Words - Compact */}
                <div
                  style={{
                    textAlign: "center",
                    margin: "5px 0",
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "3px 0",
                    borderTop: "1px solid #000",
                  }}
                >
                  Amount In Words : INR{" "}
                  {numberToWords(
                    billing.revised_amount || billing.amount_payable || 0,
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Note Section - Compact */}
            {noteAmount > 0 && (
              <div style={{ margin: "10px 0 8px 0" }}>
                {/* CREDIT/DEBIT NOTE HEADER - Yellow Marked Area */}
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "2px",
                    textDecoration: "underline",

                    padding: "3px",
                    // border: "1px solid #000",
                  }}
                >
                  {isCreditNote ? "CREDIT NOTE" : "DEBIT NOTE"}
                </div>
                <div
                  style={{
                    margin: "5px 0",
                    padding: "8px",
                    border: "1px solid #000",
                    backgroundColor: "#f9f9f9",
                    fontSize: "10px",
                  }}
                >
                  {/* GST Breakdown Table - Compact */}
                  <div style={{ marginTop: "2px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        margin: "5px 0",
                        fontSize: "10px",
                        border: "1px solid #000",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "5px",
                              textAlign: "left",
                              width: "60%",
                            }}
                          >
                            Particulars
                          </th>
                          <th
                            style={{
                              border: "1px solid #000",
                              padding: "5px",
                              textAlign: "right",
                              width: "40%",
                            }}
                          >
                            Amount (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              border: "1px solid #000",
                              padding: "5px",
                            }}
                          >
                            {purchase.product_name || "Boiled Rice Bran"}
                          </td>
                          <td
                            style={{
                              border: "1px solid #000",
                              padding: "5px",
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(gstBreakdown.baseAmount)}
                          </td>
                        </tr>

                        {billing.gst_type === "Intra" && (
                          <>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #000",
                                  padding: "5px",
                                }}
                              >
                                CGST @ 2.5%
                              </td>
                              <td
                                style={{
                                  border: "1px solid #000",
                                  padding: "5px",
                                  textAlign: "right",
                                }}
                              >
                                {formatCurrency(gstBreakdown.cgst)}
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #000",
                                  padding: "5px",
                                }}
                              >
                                SGST @ 2.5%
                              </td>
                              <td
                                style={{
                                  border: "1px solid #000",
                                  padding: "5px",
                                  textAlign: "right",
                                }}
                              >
                                {formatCurrency(gstBreakdown.sgst)}
                              </td>
                            </tr>
                          </>
                        )}

                        {billing.gst_type === "Inter" && (
                          <tr>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "5px",
                              }}
                            >
                              IGST @ 5%
                            </td>
                            <td
                              style={{
                                border: "1px solid #000",
                                padding: "5px",
                                textAlign: "right",
                              }}
                            >
                              {formatCurrency(gstBreakdown.igst)}
                            </td>
                          </tr>
                        )}

                        <tr style={{ fontWeight: "bold" }}>
                          <td
                            style={{
                              border: "1px solid #000",
                              padding: "5px",
                            }}
                          >
                            Revised Amount Against Bill
                          </td>
                          <td
                            style={{
                              border: "1px solid #000",
                              padding: "5px",
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(revisedAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Amount in Words for GST Breakdown - Compact */}
                    <div
                      style={{
                        textAlign: "center",
                        // margin: "5px 0",
                        fontSize: "10px",
                        fontWeight: "bold",
                        // padding: "4px 0",
                        // borderTop: "1px solid #000",
                        borderBottom: "1px solid #000",
                      }}
                    >
                      Amount In Words: INR {numberToWords(revisedAmount)}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        lineHeight: "1.4",
                      }}
                    >
                      {isCreditNote
                        ? `As per our calculation billed amount is ₹${formatCurrency(
                            billedAmount,
                          )}. Since billed amount is greater than invoice amount by ₹${formatCurrency(
                            noteAmount,
                          )}, a credit note of ₹${formatCurrency(
                            noteAmount,
                          )} is applicable which will be adjusted in future invoice. Revised amount after credit note is ₹${formatCurrency(
                            revisedAmount,
                          )}.`
                        : `As per our calculation billed amount is ₹${formatCurrency(
                            billedAmount,
                          )}. Since invoice amount is greater than billed amount by ₹${formatCurrency(
                            noteAmount,
                          )}, a debit note of ₹${formatCurrency(
                            noteAmount,
                          )} will be raised. Revised amount after debit note is ₹${formatCurrency(
                            revisedAmount,
                          )}.`}
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        padding: "5px",
                        backgroundColor: isCreditNote ? "#e8f5e9" : "#ffebee",
                        borderLeft: `3px solid ${
                          isCreditNote ? "#4caf50" : "#f44336"
                        }`,
                        fontWeight: "bold",
                        fontSize: "10px",
                        textAlign: "center",
                      }}
                    >
                      {isCreditNote
                        ? "Credit Note Amount"
                        : "Debit Note Amount"}
                      : ₹{formatCurrency(noteAmount)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Signatures - Compact */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
              }}
            >
              <div style={{ textAlign: "center", width: "30%" }}>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "120px",
                    margin: "0 auto 3px",
                    height: "1px",
                  }}
                ></div>
                <div>Prepared By</div>
              </div>
              <div style={{ textAlign: "center", width: "30%" }}>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "120px",
                    margin: "0 auto 3px",
                    height: "1px",
                  }}
                ></div>
                <div>Checked By</div>
              </div>
              <div style={{ textAlign: "center", width: "30%" }}>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "120px",
                    margin: "0 auto 3px",
                    height: "1px",
                  }}
                ></div>
                <div>Authorised Signatory</div>
                <div style={{ marginTop: "3px", fontSize: "9px" }}>
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
