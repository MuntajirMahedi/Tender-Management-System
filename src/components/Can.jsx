// src/components/Can.jsx
import React from "react";
import useAuth from "../hooks/useAuth";

const Can = ({ permission, ownerOnly = false, fallback = null, children }) => {
  const { isOwner, hasPermission } = useAuth();

  if (ownerOnly && !isOwner) return fallback;
  if (permission && !hasPermission(permission)) return fallback;

  return <>{children}</>;
};

export default Can;
