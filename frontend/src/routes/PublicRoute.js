import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const PublicRoute = ({ element }) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (loading) {
    return <BackdropLoading />;
  }

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return element || <Outlet />;
};

export default PublicRoute;
