import { _ } from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { FlatList, ActivityIndicator, StyleSheet, View } from "react-native";
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
  }
});
// create fake data to populate our ListView
const fakeData = () =>
  _.times(100, i => ({
    id: i,
    name: `Group ${i}`
  }));

class Groups extends Component {
  static navigationOptions = {
    title: "Chats"
  };
  constructor(props) {
    super(props);
    this.goToMessages = this.goToMessages.bind(this);
  }

  goToMessages(group) {
    const { navigate } = this.props.navigation;
    navigate("Messages", { groupId: group.id, title: group.name });
  }

  keyExtractor = item => item.id.toString();

  renderItem = ({ item }) => (
    <Group group={item} goToMessages={this.goToMessages} />
  );

  render() {
    const { loading, user } = this.props;
    console.log(loading, user);
    // render loading placeholder while we fetch messages
    if (loading) {
      return (
        <View style={[styles.loading, styles.container]}>
          <ActivityIndicator />
        </View>
      );
    }
    // render list of groups for user
    return (
      <View style={styles.container}>
        <FlatList
          data={fakeData()}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderItem}
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
  props: ({ data: { loading, user } }) => ({
    loading,
    user
  })
});

// Groups props will now have a 'data' paramater with the results from graphql (e.g. this.props.data.user)
export default userQuery(Groups);
