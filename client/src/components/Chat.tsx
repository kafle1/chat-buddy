import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import io, { Socket } from "socket.io-client";

type MessagePayload = {
  data: string;
  id: string;
};
const socket = io("http://localhost:3000");
const Chat = () => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessagePayload[]>([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected!");
    });
    socket.on("onMessage", (latestMessage: MessagePayload) => {
      setMessages((prev) => [...prev, latestMessage]);
    });
    return () => {
      socket.off("connect");
      socket.off("onMessage");
    };
  }, []);

  const onSubmit = (e: any) => {
    e.preventDefault();
    socket.emit("newMessage", newMessage, () => {
      console.log("Message sent!");
    });
    setNewMessage("");
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Chat App</Typography>
        </Toolbar>
      </AppBar>
      <Paper style={{ height: "70vh", overflowY: "scroll" }}>
        <List>
          {messages &&
            messages.map((message: MessagePayload) => (
              <ListItem key={message.data}>
                <ListItemAvatar>
                  <Avatar>{message.id.slice(0, 2).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={message.data} secondary={message.id} />
              </ListItem>
            ))}
        </List>
      </Paper>
      <form>
        <Paper style={{ padding: "20px", display: "flex" }}>
          <TextField
            fullWidth
            label="Type a message"
            variant="outlined"
            value={newMessage}
            style={{ marginRight: "20px" }}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            variant="contained"
            size="small"
            color="primary"
            endIcon={<SendIcon />}
            type="submit"
            onClick={(e) => onSubmit(e)}
          >
            Send
          </Button>
        </Paper>
      </form>
    </div>
  );
};

export default Chat;
