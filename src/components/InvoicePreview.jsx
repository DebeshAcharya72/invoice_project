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
              
              .billing-description {
                margin: 20px 0;
              }
              
              .billing-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 11px;
              }
              
              .gst-section {
                margin: 20px 0;
              }
              
              .amount-words {
                text-align: center;
                margin: 20px 0;
                font-size: 11px;
                font-weight: bold;
                padding: 8px 0;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      // Format as DD-MM-YYYY
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
                Mobile: {company.mobile_no || "6371195818"}
              </div>
            </div>

            {/* Final Remittance Title */}
            <div
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "20px",
                textDecoration: "underline",
              }}
            >
              Final Remittance
            </div>

            {/* Header Details in two columns */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >
              {/* Left Column */}
              <div style={{ width: "45%" }}>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Report Date:
                  </div>
                  <div>{formatDate(purchase.date) || "04-01-2026"}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Party Name:
                  </div>
                  <div>{party.party_name || ""}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Address:
                  </div>
                  <div>{party.address_line1 || ""}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    GST Number:
                  </div>
                  <div>{party.gst || "21AMJPP6577A124"}</div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ width: "45%" }}>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Serial No:
                  </div>
                  <div>{purchase.invoice_no || "FSR-7203"}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Invoice No:
                  </div>
                  <div>{purchase.invoice_no || "FSR-7203"}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Invoice Date:
                  </div>
                  <div>{formatDate(purchase.date) || "04-01-2026"}</div>
                </div>
                <div style={{ display: "flex", marginBottom: "4px" }}>
                  <div style={{ fontWeight: "bold", width: "100px" }}>
                    Vehicle No:
                  </div>
                  <div>{vehicle.vehicle_no || "OD15F 6232"}</div>
                </div>
              </div>
            </div>

            {/* Product Details Table */}
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
                  <th style={{ border: "1px solid #000", padding: "8px" }}>
                    Product Name
                  </th>
                  <th style={{ border: "1px solid #000", padding: "8px" }}>
                    Contracted Rate (₹)
                  </th>
                  <th style={{ border: "1px solid #000", padding: "8px" }}>
                    Account Rate (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {purchase.product_name || "Boiled Rice Bran"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(purchase.contracted_rate || 0)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(billing.account_rate || 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Billing Description */}
            <div style={{ margin: "20px 0" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Billing Description
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>Net Rate (₹):</div>
                <div>{formatCurrency(billing.net_rate || 0)}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>Material Amount (₹):</div>
                <div>{formatCurrency(billing.material_amount || 0)}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>Rebate For FFA (₹):</div>
                <div>
                  {formatCurrency(billing.ffa_rebate || billing.rebate_rs || 0)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>Rebate For Oil (₹):</div>
                <div>
                  {formatCurrency(
                    billing.oil_rebate || billing.oil_rebate_rs || 0
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>Premium For Oil (₹):</div>
                <div>
                  {formatCurrency(
                    billing.oil_premium || billing.oil_premium_rs || 0
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontWeight: "bold",
                  paddingTop: "5px",
                  borderTop: "1px solid #000",
                }}
              >
                <div>Gross Amount (₹):</div>
                <div>{formatCurrency(billing.gross_amount || 0)}</div>
              </div>
            </div>

            {/* Add the dynamic note section in its place */}
            {(() => {
              const billedAmount = parseFloat(billing.billed_amount) || 0;
              const invoiceAmount = parseFloat(billing.invoice_amount) || 0;
              const noteAmount = Math.abs(billedAmount - invoiceAmount);
              const isCreditNote = billedAmount > invoiceAmount;
              const revisedAmount = parseFloat(
                billing.revised_amount || billing.amount_payable || 0
              );

              if (noteAmount > 0) {
                return (
                  <div style={{ margin: "25px 0 15px 0" }}>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                        marginBottom: "15px",
                        textDecoration: "underline",
                      }}
                    >
                      {isCreditNote ? "CREDIT NOTE" : "DEBIT NOTE"}
                    </div>

                    <div
                      style={{
                        margin: "10px 0",
                        padding: "15px",
                        border: "1px solid #000",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.5",
                        }}
                      >
                        {isCreditNote
                          ? `As per our calculation billed amount is ₹${formatCurrency(
                              billedAmount
                            )}. Since billed amount is greater than invoice amount by ₹${formatCurrency(
                              noteAmount
                            )}, a credit note of ₹${formatCurrency(
                              noteAmount
                            )} is applicable which will be adjusted in future invoice. Revised amount after credit note is ₹${formatCurrency(
                              revisedAmount
                            )}.`
                          : `As per our calculation billed amount is ₹${formatCurrency(
                              billedAmount
                            )}. Since invoice amount is greater than billed amount by ₹${formatCurrency(
                              noteAmount
                            )}, a debit note of ₹${formatCurrency(
                              noteAmount
                            )} will be raised. Revised amount after debit note is ₹${formatCurrency(
                              revisedAmount
                            )}.`}
                      </div>

                      <div
                        style={{
                          marginTop: "10px",
                          padding: "8px",
                          backgroundColor: isCreditNote ? "#e8f5e9" : "#ffebee",
                          borderLeft: `4px solid ${
                            isCreditNote ? "#4caf50" : "#f44336"
                          }`,
                          fontWeight: "bold",
                          fontSize: "12px",
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
                );
              } else {
                // If no note, show regular "Note" title
                return (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "20px",
                      textDecoration: "underline",
                    }}
                  >
                    Note
                  </div>
                );
              }
            })()}

            {/* GST and Final Amounts */}
            <div style={{ margin: "20px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>
                  GST (
                  {billing.gst_type === "Intra" ? "CGST+SGST 5%" : "IGST 5%"}):
                </div>
                <div>{formatCurrency(totalGST)}</div>
              </div>

              {/* Add breakdown for Intra-state GST */}
              {billing.gst_type === "Intra" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                      fontSize: "10px",
                      paddingLeft: "20px",
                    }}
                  >
                    <div>CGST (2.5%):</div>
                    <div>{formatCurrency(billing.cgst || 0)}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                      fontSize: "10px",
                      paddingLeft: "20px",
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
                    marginBottom: "4px",
                    fontSize: "10px",
                    paddingLeft: "20px",
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
                  marginBottom: "4px",
                  fontWeight: "bold",
                }}
              >
                <div>Billed Amount (₹):</div>
                <div>{formatCurrency(billing.billed_amount || 0)}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>Invoice Amount (₹):</div>
                <div>{formatCurrency(billing.invoice_amount || 0)}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontWeight: "bold",
                  paddingTop: "5px",
                  borderTop: "1px solid #000",
                }}
              >
                <div>Revised Amount Against Bill (₹):</div>
                <div>
                  {formatCurrency(
                    billing.revised_amount || billing.amount_payable || 0
                  )}
                </div>
              </div>
            </div>

            {/* Amount in Words */}
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
              Amount In Words : INR{" "}
              {numberToWords(
                billing.revised_amount || billing.amount_payable || 0
              )}
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
