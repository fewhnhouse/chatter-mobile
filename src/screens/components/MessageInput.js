import { FontAwesome } from "@expo/vector-icons";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { StyleSheet, TextInput, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    backgroundColor: "#f5f1ee",
    borderColor: "#dbdbdb",
    borderTopWidth: 1,
    flexDirection: "row"
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  input: {
    backgroundColor: "white",
    borderColor: "#dbdbdb",
    borderRadius: 15,
    borderWidth: 1,
    color: "black",
    height: 32,
    paddingHorizontal: 8
  },
  sendButtonContainer: {
    paddingRight: 0,
    paddingVertical: 0,
    width: 32,
    height: 32,
    backgroundColor: "blue",
    borderRadius: 50,
    margin: 5
  },
  sendButton: {
    height: 32,
    width: 32,
    position: "relative",
    top: 8,
    left: 7
  },
  iconStyle: {
    marginRight: 0 // default is 12
  }
});
const sendButton = send => (
  <FontAwesome
    backgroundColor={"blue"}
    borderRadius={16}
    color={"white"}
    iconStyle={styles.iconStyle}
    name="send"
    onPress={send}
    size={16}
    style={styles.sendButton}
  />
);
class MessageInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.send = this.send.bind(this);
  }
  send() {
    this.props.send(this.state.text);
    this.textInput.clear();
    this.textInput.blur();
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref => {
              this.textInput = ref;
            }}
            onChangeText={text => this.setState({ text })}
            style={styles.input}
            placeholder="Type your message here!"
          />
        </View>
        <View style={styles.sendButtonContainer}>{sendButton(this.send)}</View>
      </View>
    );
  }
}
MessageInput.propTypes = {
  send: PropTypes.func.isRequired
};
export default MessageInput;
