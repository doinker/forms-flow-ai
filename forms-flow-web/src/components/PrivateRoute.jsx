import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import UserService from "../services/UserService";
import Form from "./Form";
import Task from "./Task";
import { setUserAuth } from "../actions/bpmActions";
import {CLIENT, STAFF_REVIEWER} from "../constants/constants";
import Loading from "../containers/Loading";
import DashboardPage from "./Dashboard";
import InsightsPage from "./Insights";
import Application from "./Application";

class PrivateRoute extends Component {
  UNSAFE_componentWillMount() {
    UserService.initKeycloak(this.props.store, (err, res) => {
      this.props.setUserAuth(res.authenticated);
    });
  }
  ReviewerRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        this.props.userRoles.includes(STAFF_REVIEWER) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to="/" />
        )
      }
    />
  );

  ClientReviewerRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={(props) =>
        this.props.userRoles.includes(STAFF_REVIEWER) || this.props.userRoles.includes(CLIENT) ? (
          <Component {...props} />
        ) : (
          <Redirect exact to="/" />
        )
      }
    />
  );

  render() {
    return (
      <>
        {this.props.isAuth ? (
          <>
            <Route path="/form" component={Form} />
            <this.ClientReviewerRoute path="/application" component={Application} />
            <this.ReviewerRoute path="/metrics" component={DashboardPage} />
            <this.ReviewerRoute path="/task" component={Task} />
            <Route exact path="/">
              <Redirect to="/form" />
            </Route>
            <this.ReviewerRoute path="/insights" component={InsightsPage} />
          </>
        ) : (
          <Loading />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userRoles: state.user.roles || [],
    isAuth: state.user.isAuthenticated,
  };
};

const mapStateToDispatch = (dispatch) => {
  return {
    setUserAuth: (value) => {
      dispatch(setUserAuth(value));
    },
  };
};

export default connect(mapStateToProps, mapStateToDispatch)(PrivateRoute);
