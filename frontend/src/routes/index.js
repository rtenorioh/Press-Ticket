import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Api from "../pages/Api/";
import ApiDocs from "../pages/ApiDocs/";
import ApiKey from "../pages/ApiKey/";
import Connections from "../pages/Connections/";
import Contacts from "../pages/Contacts/";
import Dashboard from "../pages/Dashboard/";
import Integrations from "../pages/Integrations";
import Login from "../pages/Login/";
import Queues from "../pages/Queues/";
import QuickAnswers from "../pages/QuickAnswers/";
import Settings from "../pages/Settings/";
import Signup from "../pages/Signup/";
import Tags from "../pages/Tags";
import Tickets from "../pages/Tickets/";
import Users from "../pages/Users";

import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <WhatsAppsProvider>
            <LoggedInLayout>
              <Route exact path="/" component={Dashboard} isPrivate />
              <Route exact path="/tickets/:ticketId?" component={Tickets} isPrivate />
              <Route exact path="/connections" component={Connections} isPrivate />
              <Route exact path="/contacts" component={Contacts} isPrivate />
              <Route exact path="/users" component={Users} isPrivate />
              <Route exact path="/quickAnswers" component={QuickAnswers} isPrivate />
              <Route exact path="/Settings" component={Settings} isPrivate />
              <Route exact path="/api" component={Api} isPrivate />
              <Route exact path="/apidocs" component={ApiDocs} isPrivate />
              <Route exact path="/apikey" component={ApiKey} isPrivate />
              <Route exact path="/Queues" component={Queues} isPrivate />
              <Route exact path="/Tags" component={Tags} isPrivate />
              <Route exact path="/Integrations" component={Integrations} isPrivate />
            </LoggedInLayout>
          </WhatsAppsProvider>
        </Switch>
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;