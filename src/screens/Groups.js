import { _ } from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  StyleSheet,
  View,
  Button,
  Text,
  Modal,
  Image
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NewGroup from "./NewGroup";
import Group from "./components/Group";
import { graphql, compose } from "react-apollo";
import { USER_QUERY } from "../graphql/user.query";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1
  },
  loading: {
    justifyContent: "center",
    flex: 1
  },
  newGroupPanel: {
    backgroundColor: "white",
    height: 30,
    borderBottomWidth: 1,
    borderColor: "#eee",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  header: {
    alignItems: "flex-end",
    padding: 6,
    borderColor: "#eee",
    borderBottomWidth: 1
  },
  warning: {
    textAlign: "center",
    padding: 12
  }
});
const Header = ({ onPress }) => (
  <View style={styles.header}>
    <Button title={"New Group"} onPress={onPress} />
  </View>
);

Header.propTypes = {
  onPress: PropTypes.func.isRequired
};
class Groups extends Component {
  static navigationOptions = {
    title: "Chats"
  };
  constructor(props) {
    super(props);
    this.goToMessages = this.goToMessages.bind(this);
    this.goToNewGroup = this.goToNewGroup.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
  }

  onRefresh() {
    this.props.refetch();
  }

  goToMessages(group) {
    const { navigate } = this.props.navigation;
    navigate("Messages", { groupId: group.id, title: group.name });
  }

  goToNewGroup() {
    const { navigate } = this.props.navigation;
    navigate("NewGroup");
  }

  keyExtractor = item => item.id.toString();

  renderItem = ({ item }) => (
    <Group group={item} goToMessages={this.goToMessages} />
  );

  render() {
    const { loading, user, networkStatus } = this.props;
    // render loading placeholder while we fetch messages

    if (loading) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }

    if (user && !user.groups.length) {
      return (
        <View style={styles.container}>
          <Header onPress={this.goToNewGroup} />

          <Text style={styles.warning}>{"You do not have any groups."}</Text>
        </View>
      );
    }

    // render list of groups for user

    return (
      <View style={styles.container}>
        <FlatList
          data={user.groups}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
          ListHeaderComponent={() => <Header onPress={this.goToNewGroup} />}
          onRefresh={this.onRefresh}
          refreshing={networkStatus === 4}
        />
      </View>
    );
  }
}

Groups.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func
  }),
  loading: PropTypes.bool,
  networkStatus: PropTypes.number,
  refetch: PropTypes.func,
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

// graphql() returns a func that can be applied to a React component
// set the id variable for USER_QUERY using the component's existing props
const userQuery = graphql(USER_QUERY, {
  options: () => ({ variables: { id: 1 } }), // fake the user for now
  props: ({ data: { loading, networkStatus, refetch, user } }) => ({
    loading,
    networkStatus,
    refetch,
    user
  })
});

// Groups props will now have a 'data' paramater with the results from graphql (e.g. this.props.data.user)
export default userQuery(Groups);
