import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import LoggedInLayout from "../layout";
import Api from "../pages/Api/";
import ApiDocs from "../pages/ApiDocs/";
import ApiKey from "../pages/ApiKey/";
import Documentation from "../pages/Documentation/";
import Channels from "../pages/Channels/";
import Contacts from "../pages/Contacts/";
import BlockedContacts from "../pages/BlockedContacts/";
import CpuUsage from "../pages/CpuUsage/";
import Dashboard from "../pages/Dashboard/";
import VersionCheck from "../pages/VersionCheck/";
import DiskSpace from "../pages/DiskSpace/";
import MemoryUsage from "../pages/MemoryUsage/";
import ErrorLogs from "../pages/ErrorLogs/";
import FileManager from "../pages/FileManager/";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login/";
import Queues from "../pages/Queues/";
import QuickAnswers from "../pages/QuickAnswers/";
import ResetPassword from "../pages/ResetPassword";
import Settings from "../pages/Settings/";
import Backup from "../pages/Backup";
import ActivityLogs from "../pages/ActivityLogs";
import NetworkStatus from "../pages/NetworkStatus";
import QueueMonitor from "../pages/QueueMonitor";
import UserMonitor from "../pages/UserMonitor";
import DatabaseStatus from "../pages/DatabaseStatus";
import SystemHealth from "../pages/SystemHealth";
import SystemUpdate from "../pages/SystemUpdate";
import Signup from "../pages/Signup/";
import Tags from "../pages/Tags";
import ClientStatus from "../pages/ClientStatus";
import Tickets from "../pages/Tickets/";
import Users from "../pages/Users";
import Videos from "../pages/Videos";
import HealthCheck from "../pages/HealthCheck";
import GroupManagement from "../pages/GroupManagement";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import MasterAdminRoute from "./MasterAdminRoute";
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
            <Route path="documentation" element={<Documentation />} />
            <Route path="tickets/:ticketId?" element={<Tickets />} />
            <Route path="channels" element={<Channels />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="blocked-contacts" element={<AdminRoute element={<BlockedContacts />} />} />
            <Route path="users" element={<Users />} />
            <Route path="quickAnswers" element={<QuickAnswers />} />
            <Route path="Settings" element={<Settings toggleTheme={toggleTheme} onThemeConfigUpdate={onThemeConfigUpdate} />} />
            <Route path="api" element={<Api />} />
            <Route path="apidocs" element={<ApiDocs />} />
            <Route path="apikey" element={<ApiKey />} />
            <Route path="Queues" element={<Queues />} />
            <Route path="Tags" element={<Tags />} />
            <Route path="ClientStatus" element={<ClientStatus />} />
            <Route path="errorLogs" element={<ErrorLogs />} />
            <Route path="diskSpace" element={<DiskSpace />} />
            <Route path="file-manager" element={<FileManager />} />
            <Route path="memoryUsage" element={<MemoryUsage />} />
            <Route path="cpuUsage" element={<CpuUsage />} />
            <Route path="backup" element={<Backup />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="network-status" element={<NetworkStatus />} />
            <Route path="queue-monitor" element={<QueueMonitor />} />
            <Route path="user-monitor" element={<UserMonitor />} />
            <Route path="databaseStatus" element={<DatabaseStatus />} />
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="system-update" element={<MasterAdminRoute element={<SystemUpdate />} />} />
            <Route path="versionCheck" element={<MasterAdminRoute element={<VersionCheck />} />} />
            <Route path="videos" element={<Videos />} />
            <Route path="health-check" element={<HealthCheck />} />
            <Route path="group-management" element={<GroupManagement />} />
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