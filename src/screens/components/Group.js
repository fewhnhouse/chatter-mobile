import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image
} from "react-native";
import moment from "moment";
import { FontAwesome } from "@expo/vector-icons";

// format createdAt with moment
const formatCreatedAt = createdAt =>
  moment(createdAt).calendar(null, {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    nextWeek: "dddd",
    lastDay: "[Yesterday]",
    lastWeek: "dddd",
    sameElse: "DD/MM/YYYY"
  });

export default class Group extends Component {
  constructor(props) {
    super(props);
    this.goToMessages = this.props.goToMessages.bind(this, this.props.group);
  }
  render() {
    const { id, name, messages } = this.props.group;
    return (
      <TouchableHighlight key={id} onPress={this.goToMessages}>
        <View style={styles.groupContainer}>
          <Image
            style={styles.groupImage}
            source={{
              uri: "https://reactjs.org/logo-og.png"
            }}
          />
          <View style={styles.groupTextContainer}>
            <View style={styles.groupTitleContainer}>
              <Text style={styles.groupName}>{`${name}`}</Text>
              <Text style={styles.groupLastUpdated}>
                {messages.edges.length
                  ? formatCreatedAt(messages.edges[0].node.createdAt)
                  : ""}
              </Text>
            </View>
            <Text style={styles.groupUsername}>
              {messages.edges.length
                ? `${messages.edges[0].node.from.username}:`
                : ""}
            </Text>
            <Text style={styles.groupText} numberOfLines={1}>
              {messages.edges.length ? messages.edges[0].node.text : ""}
            </Text>
          </View>
          <FontAwesome name="angle-right" size={24} color={"#8c8c8c"} />
        </View>
      </TouchableHighlight>
    );
  }
}
Group.propTypes = {
  goToMessages: PropTypes.func.isRequired,
  group: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    messages: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          cursor: PropTypes.string,
          node: PropTypes.object
        })
      )
    })
  })
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },

  loading: {
    justifyContent: 'center',
    flex: 1,
  },

  groupContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  groupName: {
    fontWeight: 'bold',
    flex: 0.7,
  },
  groupTextContainer: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 6
  },
  groupText: {
    color: "#8c8c8c"
  },
  groupImage: {
    width: 54,
    height: 54,
    borderRadius: 27
  },
  groupTitleContainer: {
    flexDirection: "row"
  },
  groupLastUpdated: {
    flex: 0.3,
    color: "#8c8c8c",
    fontSize: 11,
    textAlign: "right"
  },
  groupUsername: {
    paddingVertical: 4
  }
});
