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
  Tabs,
  Tab,
  Checkbox,
  Box,
} from "@mui/material";
import {
  AddCircle,
  DoorBack,
  ExitToAppRounded,
  Send as SendIcon,
} from "@mui/icons-material";
import io, { Socket } from "socket.io-client";
import useLocalStorage from "../hooks/useLocalStorage";
import { LocalStorageType, contactType, conversationType } from "../types";

const Dashboard = ({ id }: { id: string }) => {
  const [tabValue, setTabValue] = useState(0);
  const [newContactName, setNewContactName] = useState("");
  const [newContactId, setNewContactId] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<conversationType | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
  };

  const [existingContacts, setExistingContacts] = useState<contactType[]>([
    { id: "57545", name: "Alice", initials: "A", isSelected: false },
    { id: "6574254534", name: "Bob", initials: "B", isSelected: false },
    { id: "45543", name: "Charlie", initials: "C", isSelected: false },
  ]);

  const [conversations, setConversations] = useState<conversationType[]>([]);

  const handleSelectContact = (contact: contactType) => {
    console.log("Selected contact:", contact);
    // code here to handle the selection of the contact
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactId) {
      return;
    }
    const newContact = {
      name: newContactName,
      id: newContactId,
      initials: newContactName[0],
      isSelected: false,
    };
    setExistingContacts([...existingContacts, newContact]);
    setNewContactName("");
    setNewContactId("");
  };

  const handleCheckboxClick = (contact: contactType) => {
    const updatedContacts = existingContacts.map((c: contactType) => {
      if (c.id === contact.id) {
        return {
          ...c,
          isSelected: !c.isSelected,
        };
      }
      return c;
    });
    setExistingContacts(updatedContacts);
  };

  const handleCreateConversation = () => {
    const selectedContacts = existingContacts.filter(
      (contact: contactType) => contact.isSelected
    );
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to create a conversation.");
      return;
    }

    console.log("Selected contacts:", selectedContacts);

    const newConversation: conversationType = {
      id: conversations.length + 1,
      contacts: selectedContacts,
      messages: [
        {
          sender: "Alice",
          text: "Hey Bob, how are you doing?",
          time: "4:12 PM",
        },
        {
          sender: "user",
          text: "Hey Alice, I am doing good. How about you?",
          time: "4:13 PM",
        },
      ],
    };
    setConversations([...conversations, newConversation]);

    setExistingContacts(
      existingContacts.map((c: contactType) => ({
        ...c,
        isSelected: false,
      }))
    );
  };

  const handleSendMessage = (
    e: any,
    selectedConversation: conversationType
  ) => {
    e.preventDefault();
    if (!newMessage) {
      return;
    }
    if (!selectedConversation) {
      return;
    }

    console.log({ newMessage });
    console.log(selectedConversation);

    //set the new message to messages of selectedConversation
    const message = {
      sender: "user",
      text: newMessage,
      time: new Date().toString(),
    };

    selectedConversation.messages.push(message);

    setSelectedConversation(selectedConversation);
    setNewMessage("");
  };
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Chat Buddy</Typography>
          <Typography variant="body2" style={{ marginLeft: "auto" }}>
            Your id is: {id}
          </Typography>
        </Toolbar>
      </AppBar>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Conversation" />
        <Tab label="Contacts" />
      </Tabs>
      {tabValue === 0 && (
        <div>
          {selectedConversation ? (
            <div>
              <Box display="flex" alignItems="center" m={1}>
                <Typography variant="h6">
                  {selectedConversation.contacts.map((c) => c.name).join(", ")}
                </Typography>
                <Box flexGrow={1} />
                <IconButton onClick={() => setSelectedConversation(null)}>
                  <ExitToAppRounded color="error" />
                </IconButton>
              </Box>

              <Paper style={{ height: "65vh", overflowY: "scroll" }}>
                <List>
                  {selectedConversation.messages.map((message, index) => {
                    const isUser = message.sender === "user";
                    return (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>{isUser ? "U" : message.sender[0]}</Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={message.text}
                          secondary={message.time}
                          style={{
                            backgroundColor: isUser ? "#e6e6e6" : "#ffffff",
                            padding: "8px",
                            borderRadius: "8px",
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>

              <form>
                <Paper style={{ padding: "20px", display: "flex" }}>
                  <TextField
                    fullWidth
                    label="Type a message"
                    variant="outlined"
                    style={{ marginRight: "20px" }}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    endIcon={<SendIcon />}
                    type="submit"
                    onClick={(e) => {
                      handleSendMessage(e, selectedConversation);
                    }}
                  >
                    Send
                  </Button>
                </Paper>
              </form>
            </div>
          ) : (
            <List>
              {conversations.map((conversation: conversationType) => (
                <Paper sx={{ margin: "8px" }}>
                  <ListItem
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <ListItemText
                      primary={conversation.contacts
                        .map((c) => c.name)
                        .join(", ")}
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </div>
      )}

      {tabValue === 1 && (
        <div>
          <List>
            {existingContacts &&
              existingContacts.map((contact: contactType) => (
                <ListItem
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                >
                  <ListItemAvatar>
                    <Avatar>{contact.initials}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={contact.name} secondary={contact.id} />
                  <Checkbox
                    edge="start"
                    onClick={() => handleCheckboxClick(contact)}
                    checked={contact.isSelected}
                  />
                </ListItem>
              ))}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleCreateConversation()}
              >
                Create Conversation
              </Button>
            </div>
          </List>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px",
            }}
          >
            <TextField
              label="Name"
              variant="outlined"
              value={newContactName}
              style={{ marginRight: "20px" }}
              onChange={(e) => setNewContactName(e.target.value)}
            />
            <TextField
              label="Id"
              variant="outlined"
              value={newContactId}
              style={{ marginRight: "20px" }}
              onChange={(e) => setNewContactId(e.target.value)}
            />
            <Button
              variant="contained"
              size="medium"
              color="primary"
              endIcon={<AddCircle />}
              onClick={() => handleAddContact()}
            >
              Add Contact
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
