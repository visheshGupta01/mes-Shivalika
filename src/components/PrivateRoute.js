// src/components/PrivateRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, allowedUserTypes }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // User is not authenticated
    return <Navigate to="/login" />;
  }

  if (!allowedUserTypes.includes(user.userType)) {
    // User is authenticated but not authorized for this route
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
