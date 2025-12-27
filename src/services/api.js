// src/services/api.js
const API_BASE = "http://localhost:8000";
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Token management
let authToken = localStorage.getItem("authToken") || "";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const api = {
  // Authentication
  setToken: (token) => {
    authToken = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  },

  getToken: () => authToken,

  clearToken: () => {
    authToken = "";
    localStorage.removeItem("authToken");
  },

  // Auth endpoints
  register: (data) =>
    fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  login: (data) =>
    fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getCurrentUser: () =>
    fetch(`${API_BASE}/users/me`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // User Management (Admin only)
  getUsers: () =>
    fetch(`${API_BASE}/users/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createUser: (data) =>
    fetch(`${API_BASE}/users/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateUser: (id, data) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteUser: (id) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  assignCompanyToUser: (userId, companyId) =>
    fetch(`${API_BASE}/users/${userId}/assign-company`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ company_id: companyId }),
    }).then(handleResponse),

  // ============ SIMPLIFIED COMPANY ENDPOINTS ============
  getCompaniesSimple: () =>
    fetch(`${API_BASE}/companies/simple`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createCompanySimple: (data) =>
    fetch(`${API_BASE}/companies/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  assignUserToCompany: (companyId, userData) =>
    fetch(`${API_BASE}/companies/${companyId}/assign-user`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    }).then(handleResponse),

  getAllFormsEnhanced: () =>
    fetch(`${API_BASE}/admin/all-forms-enhanced/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // GET COMPLETE FORM DATA
  getFormComplete: (purchaseId) =>
    fetch(`${API_BASE}/forms/${purchaseId}/complete`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Original Company endpoints (kept for backward compatibility)
  getCompanies: () =>
    fetch(`${API_BASE}/companies/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createCompany: (data) =>
    fetch(`${API_BASE}/companies/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateCompany: (id, data) =>
    fetch(`${API_BASE}/companies/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteCompany: (id) =>
    fetch(`${API_BASE}/companies/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getCompany: (id) =>
    fetch(`${API_BASE}/companies/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Get user's companies
  getMyCompanies: () =>
    fetch(`${API_BASE}/users/me/companies`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Party endpoints
  getParties: () =>
    fetch(`${API_BASE}/parties/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createParty: (data) =>
    fetch(`${API_BASE}/parties/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateParty: (id, data) =>
    fetch(`${API_BASE}/parties/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteParty: (id) =>
    fetch(`${API_BASE}/parties/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getParty: (id) =>
    fetch(`${API_BASE}/parties/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Purchase endpoints
  getPurchases: () =>
    fetch(`${API_BASE}/purchases/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createPurchase: (data) =>
    fetch(`${API_BASE}/purchases/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updatePurchase: (id, data) =>
    fetch(`${API_BASE}/purchases/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deletePurchase: (id) =>
    fetch(`${API_BASE}/purchases/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getPurchase: (id) =>
    fetch(`${API_BASE}/purchases/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Vehicle endpoints
  getVehicles: () =>
    fetch(`${API_BASE}/vehicles/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createVehicle: (data) =>
    fetch(`${API_BASE}/vehicles/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateVehicle: (id, data) =>
    fetch(`${API_BASE}/vehicles/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteVehicle: (id) =>
    fetch(`${API_BASE}/vehicles/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getVehicle: (id) =>
    fetch(`${API_BASE}/vehicles/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Quantity endpoints
  getQuantities: () =>
    fetch(`${API_BASE}/quantities/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createQuantity: (data) =>
    fetch(`${API_BASE}/quantities/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateQuantity: (id, data) =>
    fetch(`${API_BASE}/quantities/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteQuantity: (id) =>
    fetch(`${API_BASE}/quantities/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getQuantity: (id) =>
    fetch(`${API_BASE}/quantities/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Lab endpoints
  getLabDetails: () =>
    fetch(`${API_BASE}/lab-details/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createLabDetail: (data) =>
    fetch(`${API_BASE}/lab-details/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateLabDetail: (id, data) =>
    fetch(`${API_BASE}/lab-details/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteLabDetail: (id) =>
    fetch(`${API_BASE}/lab-details/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getLabDetail: (id) =>
    fetch(`${API_BASE}/lab-details/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Billing endpoints
  getBillings: () =>
    fetch(`${API_BASE}/billings/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createBilling: (data) =>
    fetch(`${API_BASE}/billings/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateBilling: (id, data) =>
    fetch(`${API_BASE}/billings/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteBilling: (id) =>
    fetch(`${API_BASE}/billings/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getBilling: (id) =>
    fetch(`${API_BASE}/billings/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // SMS endpoint
  sendSMS: (smsData) =>
    fetch(`${API_BASE}/send-sms`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(smsData),
    }).then(handleResponse),

  // Generate Invoice
  generateInvoice: (purchaseId) =>
    fetch(`${API_BASE}/generate-invoice/${purchaseId}`, {
      method: "POST",
      headers: getHeaders(),
    }).then(handleResponse),

  // Admin endpoints
  getAdminStats: () =>
    fetch(`${API_BASE}/admin/stats/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAllForms: () =>
    fetch(`${API_BASE}/admin/all-forms/`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getFormsByUser: (userId) =>
    fetch(`${API_BASE}/admin/forms-by-user/${userId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getFormsByCompany: (companyId) =>
    fetch(`${API_BASE}/admin/forms-by-company/${companyId}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // User stats
  getMyStats: () =>
    fetch(`${API_BASE}/users/me/stats`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Health check
  healthCheck: () =>
    fetch(`${API_BASE}/health`, {
      headers: getHeaders(),
    }).then(handleResponse),
};
