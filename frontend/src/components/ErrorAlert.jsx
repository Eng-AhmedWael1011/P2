import React from "react";

/**
 * ErrorAlert — Dismissible error alert component.
 */
export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center shadow-sm" role="alert">
      <span className="me-2 fs-5">⚠️</span>
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="btn-close" onClick={onDismiss} aria-label="Close"></button>
      )}
    </div>
  );
}
