import React from "react";

/**
 * LoadingSpinner — Custom spinner using design tokens.
 * No Bootstrap dependency. Accessible status role.
 */
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-state" role="status">
      <div className="spinner" aria-hidden="true"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}
