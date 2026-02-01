// src/pages/ReportPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { api } from "../services/api";
import * as XLSX from "xlsx";

const styles = {
  pageTitle: {
    fontWeight: 700,
    color: "#1a237e",
    marginBottom: "16px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "16px",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    "& th": {
      fontWeight: 600,
      color: "#333",
      fontSize: "12px",
    },
  },
  tableRow: {
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  },
  amountCell: {
    fontWeight: 500,
    color: "#1a237e",
  },
  statusChip: {
    fontWeight: 500,
    fontSize: "12px",
    height: "24px",
  },
  filterCard: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
};

const ReportPage = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, dateRange, reportData]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAllFormsEnhanced();

      // Transform data based on your actual API response
      const transformedData = Array.isArray(response)
        ? response.map((item, index) => ({
            slno: index + 1,
            invoiceNo: item.invoice_no || "-",
            partyName: item.party_name || "-",
            product: item.product || "Boiled Rice Bran",
            vehicleNo: item.vehicle_no || "N/A",
            weightMt: item.weight_mt || 0,
            amount: item.amount || 0,
            amountPayable: item.amount_payable || 0,
            status: item.status || "Pending",
            createdAt: item.created_at || new Date().toISOString(),
            createdByUser: item.created_by_user || "-",
            createdByEmail: item.created_by_email || "-",
            company: item.company || "-",
            companyAddress: item.company_address || "-",
            companyMobile: item.company_mobile || "-",
            purchaseId: item.purchase_id || "",
          }))
        : [];

      setReportData(transformedData);
      setFilteredData(transformedData);
    } catch (err) {
      console.error("Error loading report data:", err);
      setError(`Failed to load report data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...reportData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.invoiceNo.toLowerCase().includes(term) ||
          item.partyName.toLowerCase().includes(term) ||
          item.product.toLowerCase().includes(term) ||
          item.vehicleNo.toLowerCase().includes(term) ||
          item.company.toLowerCase().includes(term) ||
          item.createdByUser.toLowerCase().includes(term),
      );
    }

    if (dateRange.startDate || dateRange.endDate) {
      result = result.filter((item) => {
        try {
          const itemDate = new Date(item.createdAt);
          if (dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            return itemDate >= startDate && itemDate <= endDate;
          }
          if (dateRange.startDate) {
            return itemDate >= new Date(dateRange.startDate);
          }
          if (dateRange.endDate) {
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            return itemDate <= endDate;
          }
          return true;
        } catch {
          return true;
        }
      });
    }

    setFilteredData(result);
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredData.map((item) => ({
        "SL NO": item.slno,
        "INVOICE NO": item.invoiceNo,
        "PARTY NAME": item.partyName,
        PRODUCT: item.product,
        "VEHICLE NO": item.vehicleNo,
        "WEIGHT (MT)": item.weightMt,
        AMOUNT: item.amount,
        "AMOUNT PAYABLE": item.amountPayable,
        STATUS: item.status,
        "CREATED AT": item.createdAt,
        "CREATED BY USER": item.createdByUser,
        "CREATED BY EMAIL": item.createdByEmail,
        COMPANY: item.company,
        "COMPANY ADDRESS": item.companyAddress,
        "COMPANY MOBILE": item.companyMobile,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reports");

      const totalAmount = filteredData.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0,
      );
      const totalPayable = filteredData.reduce(
        (sum, item) => sum + parseFloat(item.amountPayable || 0),
        0,
      );
      const totalRow = [
        "TOTALS",
        "",
        "",
        "",
        "",
        totalAmount,
        totalPayable,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];

      XLSX.utils.sheet_add_aoa(ws, [[""]], { origin: -1 });
      XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: -1 });

      XLSX.writeFile(
        wb,
        `Reports_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export report");
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount))
      return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateRange({ startDate: "", endDate: "" });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={styles.pageTitle}>
          Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={exportToExcel}
          size="small"
          color="success"
        >
          Export Excel
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ ...styles.card, ...styles.filterCard, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by Invoice, Party, Product, Vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadReportData}
                size="small"
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Summary */}
      {filteredData.length > 0 && (
        <Paper sx={{ ...styles.card, p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Total Records
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {filteredData.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Total Amount
              </Typography>
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatCurrency(
                  filteredData.reduce(
                    (sum, item) => sum + (item.amount || 0),
                    0,
                  ),
                )}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="textSecondary">
                Total Payable
              </Typography>
              <Typography variant="h6" fontWeight={600} color="secondary">
                {formatCurrency(
                  filteredData.reduce(
                    (sum, item) => sum + (item.amountPayable || 0),
                    0,
                  ),
                )}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Table */}
      <Paper sx={styles.card}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredData.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No data found
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead sx={styles.tableHeader}>
                <TableRow>
                  <TableCell>SL NO</TableCell>
                  <TableCell>INVOICE NO</TableCell>
                  <TableCell>PARTY NAME</TableCell>
                  <TableCell>PRODUCT</TableCell>
                  <TableCell>VEHICLE NO</TableCell>
                  <TableCell align="right">WEIGHT (MT)</TableCell>
                  <TableCell align="right">AMOUNT</TableCell>
                  <TableCell align="right">PAYABLE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>CREATED BY</TableCell>
                  {/* <TableCell>COMPANY</TableCell>
                  <TableCell>MOBILE</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow
                    key={row.purchaseId || row.slno}
                    sx={styles.tableRow}
                  >
                    <TableCell>{row.slno}</TableCell>
                    <TableCell>{row.invoiceNo}</TableCell>
                    <TableCell>{row.partyName}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.vehicleNo}</TableCell>
                    <TableCell align="right">{row.weightMt}</TableCell>
                    <TableCell align="right" sx={styles.amountCell}>
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell align="right" sx={styles.amountCell}>
                      {formatCurrency(row.amountPayable)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === "Completed" ? "success" : "warning"
                        }
                        sx={styles.statusChip}
                      />
                    </TableCell>
                    <TableCell>{row.createdByUser}</TableCell>
                    {/* <TableCell>{row.company}</TableCell>
                    <TableCell>{row.companyMobile}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ReportPage;
