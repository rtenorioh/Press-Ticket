import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const AdminRoute = ({ element }) => {
  const { isAuth, loading, user } = useContext(AuthContext);

  if (loading) {
    return <BackdropLoading />;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (user?.profile?.toUpperCase() !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default AdminRoute;
