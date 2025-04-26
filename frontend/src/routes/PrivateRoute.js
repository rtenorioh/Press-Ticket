import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const PrivateRoute = ({ element }) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (loading) {
    return <BackdropLoading />;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return element || <Outlet />;
};

export default PrivateRoute;
