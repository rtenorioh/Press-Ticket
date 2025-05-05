import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import LoggedInLayout from "../layout";
import Api from "../pages/Api/";
import ApiDocs from "../pages/ApiDocs/";
import ApiKey from "../pages/ApiKey/";
import Connections from "../pages/Connections/";
import Contacts from "../pages/Contacts/";
import CpuUsage from "../pages/CpuUsage/";
import Dashboard from "../pages/Dashboard/";
import DiskSpace from "../pages/DiskSpace/";
import MemoryUsage from "../pages/MemoryUsage/";
import ErrorLogs from "../pages/ErrorLogs/";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login/";
import Queues from "../pages/Queues/";
import QuickAnswers from "../pages/QuickAnswers/";
import ResetPassword from "../pages/ResetPassword";
import Settings from "../pages/Settings/";
import Signup from "../pages/Signup/";
import Tags from "../pages/Tags";
import Tickets from "../pages/Tickets/";
import Users from "../pages/Users";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

const AppRoutes = ({ toggleTheme, onThemeConfigUpdate }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/signup" element={<PublicRoute element={<Signup />} />} />
          <Route path="/forgot-password" element={<PublicRoute element={<ForgotPassword />} />} />
          <Route path="/reset-password" element={<PublicRoute element={<ResetPassword />} />} />
          
          <Route path="/" element={
            <PrivateRoute element={
              <WhatsAppsProvider>
                <LoggedInLayout toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate}>
                  <Outlet />
                </LoggedInLayout>
              </WhatsAppsProvider>
            } />
          }>
            <Route index element={<Dashboard />} />
            <Route path="tickets/:ticketId?" element={<Tickets />} />
            <Route path="connections" element={<Connections />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="users" element={<Users />} />
            <Route path="quickAnswers" element={<QuickAnswers />} />
            <Route path="Settings" element={<Settings toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate} />} />
            <Route path="api" element={<Api />} />
            <Route path="apidocs" element={<ApiDocs />} />
            <Route path="apikey" element={<ApiKey />} />
            <Route path="Queues" element={<Queues />} />
            <Route path="Tags" element={<Tags />} />
            <Route path="errorLogs" element={<ErrorLogs />} />
            <Route path="diskSpace" element={<DiskSpace />} />
            <Route path="memoryUsage" element={<MemoryUsage />} />
            <Route path="cpuUsage" element={<CpuUsage />} />
          </Route>
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;