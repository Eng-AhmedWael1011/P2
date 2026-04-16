/**
 * api.js — Centralized API service for backend communication.
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * POST /predict — Make an income prediction.
 */
export const predictIncome = async (features) => {
  const response = await api.post("/predict", features);
  return response.data;
};

/**
 * GET /metrics — Fetch model evaluation metrics.
 */
export const getMetrics = async () => {
  const response = await api.get("/metrics");
  return response.data;
};

/**
 * GET /data-summary — Fetch dataset summary.
 */
export const getDataSummary = async () => {
  const response = await api.get("/data-summary");
  return response.data;
};

/**
 * GET /feature-importance — Fetch SHAP feature importance.
 */
export const getFeatureImportance = async () => {
  const response = await api.get("/feature-importance");
  return response.data;
};

export default api;
