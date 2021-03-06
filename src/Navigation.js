import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  NavigationActions,
  addNavigationHelpers,
  StackNavigator,
  TabNavigator
} from "react-navigation";
import {
  createReduxBoundAddListener,
  createReactNavigationReduxMiddleware
} from "react-navigation-redux-helpers";
import { Text, View, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { graphql, compose } from "react-apollo";
import update from "immutability-helper";
import { map } from "lodash";
import { Buffer } from "buffer";

import Groups from "./screens/Groups";
import Messages from "./screens/Messages";
import NewGroup from "./screens/NewGroup";
import FinalizeGroup from "./screens/FinalizeGroup";
import GroupDetails from "./screens/GroupDetails";

import { wsClient } from "../App";

import { USER_QUERY } from "./graphql/user.query";
import MESSAGE_ADDED_SUBSCRIPTION from "./graphql/message-added.subscription";
import GROUP_ADDED_SUBSCRIPTION from "./graphql/group-added.subscription";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  tabText: {
    color: "#777",
    fontSize: 10,
    justifyContent: "center"
  },
  selected: {
    color: "blue"
  }
});
const TestScreen = title => () => (
  <View style={styles.container}>
    <Text>{title}</Text>
  </View>
);
// tabs in main screen
const MainScreenNavigator = TabNavigator(
  {
    Chats: { screen: Groups },
    Settings: { screen: TestScreen("Settings") }
  },
  {
    initialRouteName: "Chats"
  }
);
const AppNavigator = StackNavigator(
  {
    Main: { screen: MainScreenNavigator },
    Messages: { screen: Messages },
    GroupDetails: { screen: GroupDetails },
    NewGroup: { screen: NewGroup },
    FinalizeGroup: { screen: FinalizeGroup }
  },
  {
    mode: "card"
  }
);
// reducer initialization code
const initialState = AppNavigator.router.getStateForAction(
  NavigationActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: "Main"
      })
    ]
  })
);
export const navigationReducer = (state = initialState, action) => {
  const nextState = AppNavigator.router.getStateForAction(action, state);
  // Simply return the original `state` if `nextState` is null or undefined.
  return nextState || state;
};
// Note: createReactNavigationReduxMiddleware must be run before createReduxBoundAddListener
export const navigationMiddleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav
);
const addListener = createReduxBoundAddListener("root");
class AppWithNavigationState extends Component {
  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) {
      if (this.groupSubscription) {
        this.groupSubscription();
      }
      if (this.messagesSubscription) {
        this.messagesSubscription();
      }
      // clear the event subscription
      if (this.reconnected) {
        this.reconnected();
      }
    } else if (!this.reconnected) {
      this.reconnected = wsClient.onReconnected(() => {
        this.props.refetch(); // check for any data lost during disconnect
      }, this);
    }
    if (
      nextProps.user &&
      (!this.props.user ||
        nextProps.user.groups.length !== this.props.user.groups.length)
    ) {
      // unsubscribe from old
      if (typeof this.messagesSubscription === "function") {
        this.messagesSubscription();
      }
      // subscribe to new
      if (nextProps.user.groups.length) {
        this.messagesSubscription = nextProps.subscribeToMessages();
      }
    }
    if (!this.groupSubscription && nextProps.user) {
      this.groupSubscription = nextProps.subscribeToGroups();
    }
  }
  render() {
    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav,
          addListener
        })}
      />
    );
  }
}

AppWithNavigationState.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nav: PropTypes.object.isRequired,
  refetch: PropTypes.func,
  subscribeToGroups: PropTypes.func,
  subscribeToMessages: PropTypes.func,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    )
  })
};

const mapStateToProps = state => ({
  nav: state.nav
});

const userQuery = graphql(USER_QUERY, {
  options: () => ({ variables: { id: 1 } }), // fake the user for now
  props: ({ data: { loading, user, refetch, subscribeToMore } }) => ({
    loading,
    user,
    refetch,
    subscribeToMessages() {
      return subscribeToMore({
        document: MESSAGE_ADDED_SUBSCRIPTION,
        variables: {
          userId: 1, // fake the user for now
          groupIds: map(user.groups, "id")
        },
        updateQuery: (previousResult, { subscriptionData }) => {
          const previousGroups = previousResult.user.groups;
          const newMessage = subscriptionData.data.messageAdded;
          const groupIndex = map(previousGroups, "id").indexOf(
            newMessage.to.id
          );
          return update(previousResult, {
            user: {
              groups: {
                [groupIndex]: {
                  messages: {
                    edges: {
                      $set: [
                        {
                          __typename: "MessageEdge",
                          node: newMessage,
                          cursor: Buffer.from(
                            newMessage.id.toString()
                          ).toString("base64")
                        }
                      ]
                    }
                  }
                }
              }
            }
          });
        }
      });
    },
    subscribeToGroups() {
      return subscribeToMore({
        document: GROUP_ADDED_SUBSCRIPTION,
        variables: { userId: user.id },
        updateQuery: (previousResult, { subscriptionData }) => {
          const newGroup = subscriptionData.data.groupAdded;
          return update(previousResult, {
            user: {
              groups: { $push: [newGroup] }
            }
          });
        }
      });
    }
  })
});

export default compose(connect(mapStateToProps), userQuery)(
  AppWithNavigationState
);
