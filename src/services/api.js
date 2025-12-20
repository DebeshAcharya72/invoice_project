// src/services/api.js
const API_BASE = "http://127.0.0.1:8000";
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const api = {
  // Party
  getParties: () => fetch(`${API_BASE}/parties/`).then(handleResponse),
  createParty: (data) =>
    fetch(`${API_BASE}/parties/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateParty: (id, data) =>
    fetch(`${API_BASE}/parties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteParty: (id) =>
    fetch(`${API_BASE}/parties/${id}`, { method: "DELETE" }).then(
      handleResponse
    ),
  getParty: (id) => fetch(`${API_BASE}/parties/${id}`).then(handleResponse),

  // Purchase
  getPurchases: () => fetch(`${API_BASE}/purchases/`).then(handleResponse),
  createPurchase: (data) =>
    fetch(`${API_BASE}/purchases/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updatePurchase: (id, data) =>
    fetch(`${API_BASE}/purchases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deletePurchase: (id) =>
    fetch(`${API_BASE}/purchases/${id}`, { method: "DELETE" }).then(
      handleResponse
    ),
  getPurchase: (id) =>
    fetch(`${API_BASE}/purchases/${id}`).then(handleResponse),

  // Vehicle
  getVehicles: () => fetch(`${API_BASE}/vehicles/`).then(handleResponse),
  createVehicle: (data) =>
    fetch(`${API_BASE}/vehicles/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateVehicle: (id, data) =>
    fetch(`${API_BASE}/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteVehicle: (id) =>
    fetch(`${API_BASE}/vehicles/${id}`, { method: "DELETE" }).then(
      handleResponse
    ),
  getVehicle: (id) => fetch(`${API_BASE}/vehicles/${id}`).then(handleResponse),
  getVehicleByPurchaseId: (purchaseId) =>
    fetch(`${API_BASE}/vehicles/purchase/${purchaseId}`).then(handleResponse),

  // Quantity
  getQuantities: () => fetch(`${API_BASE}/quantities/`).then(handleResponse),
  createQuantity: (data) =>
    fetch(`${API_BASE}/quantities/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateQuantity: (id, data) =>
    fetch(`${API_BASE}/quantities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteQuantity: (id) =>
    fetch(`${API_BASE}/quantities/${id}`, { method: "DELETE" }).then(
      handleResponse
    ),
  getQuantity: (id) =>
    fetch(`${API_BASE}/quantities/${id}`).then(handleResponse),
  getQuantityByPurchaseId: (purchaseId) =>
    fetch(`${API_BASE}/quantities/purchase/${purchaseId}`).then(handleResponse),

  // Lab
  getLabDetails: () => fetch(`${API_BASE}/lab-details/`).then(handleResponse),
  createLabDetail: (data) =>
    fetch(`${API_BASE}/lab-details/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateLabDetail: (id, data) =>
    fetch(`${API_BASE}/lab-details/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteLabDetail: (id) =>
    fetch(`${API_BASE}/lab-details/${id}`, { method: "DELETE" }).then(
      handleResponse
    ),
  getLabDetail: (id) =>
    fetch(`${API_BASE}/lab-details/${id}`).then(handleResponse),
  getLabDetailByPurchaseId: (purchaseId) =>
    fetch(`${API_BASE}/lab-details/purchase/${purchaseId}`).then(
      handleResponse
    ),

  // Billing
  getBillings: () => fetch(`${API_BASE}/billings/`).then(handleResponse),
  createBilling: (data) =>
    fetch(`${API_BASE}/billings/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateBilling: (id, data) =>
    fetch(`${API_BASE}/billings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteBilling: (id) =>
    fetch(`${API_BASE}/billings/${id}`, { method: "DELETE" }).then(
      handleResponse
    ),
  getBilling: (id) => fetch(`${API_BASE}/billings/${id}`).then(handleResponse),
  getBillingByPurchaseId: (purchaseId) =>
    fetch(`${API_BASE}/billings/purchase/${purchaseId}`).then(handleResponse),

  // Invoice
  generateInvoice: (data) =>
    fetch(`${API_BASE}/generate-invoice/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Admin Stats
  getAdminStats: () => fetch(`${API_BASE}/admin/stats/`).then(handleResponse),

  // Combined Form Operations
  getCompleteForm: (purchaseId) =>
    fetch(`${API_BASE}/forms/complete/${purchaseId}`).then(handleResponse),
  updateCompleteForm: (purchaseId, data) =>
    fetch(`${API_BASE}/forms/complete/${purchaseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),
};
