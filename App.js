import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import Root from "./src/Root";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { ApolloProvider } from "react-apollo";
import { composeWithDevTools } from "redux-devtools-extension";
import { createHttpLink } from "apollo-link-http";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import { ReduxCache, apolloReducer } from "apollo-cache-redux";
import ReduxLink from "apollo-link-redux";
import { onError } from "apollo-link-error";

const URL = "localhost:8080"; // set your comp's url here
const store = createStore(
  combineReducers({
    apollo: apolloReducer
  }),
  {}, // initial state
  composeWithDevTools()
);
const cache = new ReduxCache({ store });
const reduxLink = new ReduxLink(store);
const errorLink = onError(errors => {
  console.log(errors);
});
const httpLink = createHttpLink({ uri: `http://${URL}/graphql` });
const link = ApolloLink.from([reduxLink, errorLink, httpLink]);
export const client = new ApolloClient({
  link,
  cache
});
export default class App extends Component {
  render() {
    const instructions = "test";
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
            <Root />
        </Provider>
      </ApolloProvider>
    );
  }
}

