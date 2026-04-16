import React from "react";

/**
 * LoadingSpinner — Animated loading indicator shown during API calls.
 */
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-glow mb-3">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <p className="text-muted mt-2 fs-6">{message}</p>
    </div>
  );
}
