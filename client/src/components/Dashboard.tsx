import { useEffect, useState } from "react";
import io from "socket.io-client";
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
  DeleteForeverRounded,
  ExitToAppRounded,
  Send as SendIcon,
} from "@mui/icons-material";

import {
  useLocalStorageContact,
  useLocalStorageConversation,
} from "../hooks/useLocalStorage";
import { PayloadType, contactType, conversationType } from "../types";
import { useSocket } from "../context/SocketProvider";

const Dashboard = ({ id }: { id: string }) => {
  //states
  const [tabValue, setTabValue] = useState(0);
  const [newContactName, setNewContactName] = useState("");
  const [newContactId, setNewContactId] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<conversationType | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const [existingContacts, setExistingContacts] = useLocalStorageContact([
    {
      id: "6860d347-2460-4043-98f2-4bc7524c06e2",
      name: "Niraj",
      initials: "NI",
      isSelected: false,
    },
  ]);

  const [conversations, setConversations] = useLocalStorageConversation([]);

  //context
  const socket = useSocket();

  //receive messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (payload: PayloadType) => {
      console.log(payload);

      const message = {
        sender: payload.sender,
        text: payload.text,
        time: new Date().toLocaleString(),
      };

      //check if the conversation already exists with the all those recipients, create new conversation even if there is any personal conversation with any recipients
      const conversation = conversations.find((c: conversationType) => {
        const recipients = payload.recipients.filter(
          (r: string) => r !== id
        ) as string[];
        return recipients.every((r: string) =>
          c.contacts.find((contact: contactType) => contact.id === r)
        );
      });

      if (conversation) {
        //if conversation exists, add the message to the conversation
        conversation.messages.push(message);
        setConversations([...conversations]);
      } else {
        // if recipients is in existing contacts, create a new conversation with recipients with their names
        const recipients = payload.recipients.filter(
          (r: string) => r !== id
        ) as string[];
        const newContacts = recipients.map((r: string) => {
          const contact = existingContacts.find((c: contactType) => c.id === r);
          if (contact) {
            return contact;
          }
          return {
            id: r,
            name: r,
            initials: r[0],
            isSelected: false,
          };
        });

        const newConversation: conversationType = {
          id: conversations.length + 1,
          contacts: newContacts,
          messages: [message],
        };
        setConversations([...conversations, newConversation]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, conversations, selectedConversation]);

  //handlers
  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
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

    //if the new contact is already in a conversation, change the name of the contact in the conversation to the new name and set the initials to the first letter of the name
    const updatedConversations = conversations.map((c: conversationType) => {
      const contact = c.contacts.find(
        (contact: contactType) => contact.id === newContact.id
      );
      if (contact) {
        contact.name = newContact.name;
        contact.initials = newContact.initials;
      }
      return c;
    });
    setConversations(updatedConversations);
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

    const newConversation: conversationType = {
      id: conversations.length + 1,
      contacts: selectedContacts,
      messages: [],
    };
    setConversations([...conversations, newConversation]);

    setExistingContacts(
      existingContacts.map((c: contactType) => ({
        ...c,
        isSelected: false,
      }))
    );

    setTabValue(0);
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

    if (!socket) {
      console.log("Error connecting to socket");
      return;
    }

    //send message to server
    socket.emit(
      "sendMessage",
      {
        recipients: selectedConversation.contacts.map((c) => c.id),
        text: newMessage,
      },
      () => {
        console.log("Message sent");
      }
    );
    //set the new message to messages of selectedConversation
    const message = {
      sender: "user",
      text: newMessage,
      time: new Date().toLocaleString(),
    };
    selectedConversation.messages.push(message);
    setSelectedConversation(selectedConversation);
    setNewMessage("");
  };

  const handleDeleteConversation = (conversation: conversationType) => {
    //delete the conversation from state
    const updatedConversations = conversations.filter(
      (c: conversationType) => c.id !== conversation.id
    );
    setConversations(updatedConversations);
    setSelectedConversation(null);

    window.location.reload();
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
                <IconButton
                  size="large"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ExitToAppRounded color="info" />
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
                    <IconButton
                      size="large"
                      onClick={() => handleDeleteConversation(conversation)}
                    >
                      <DeleteForeverRounded color="error" />
                    </IconButton>
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
                  onClick={() => handleCheckboxClick(contact)}
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
