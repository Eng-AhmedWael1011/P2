import React from "react";

/**
 * ErrorAlert — Dismissible error alert component.
 * Uses design tokens for danger state. Accessible close button with 44px target.
 */
export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-alert" role="alert">
      <span className="error-alert-icon" aria-hidden="true">⚠️</span>
      <span className="error-alert-message">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="error-alert-close"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
}
