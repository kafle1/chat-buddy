import {
  Paper,
  Typography,
  makeStyles,
  TextField,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";

type LoginFormProps = {
  onIdSubmit: (id: string) => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ onIdSubmit }) => {
  const [id, setId] = useState("");

  const handleSubmit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    onIdSubmit(id);
  };

  return (
    <Paper
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        margin: "25px",
      }}
    >
      <Typography variant="h4" style={{ margin: "20px 0" }}>
        Chat App
      </Typography>

      <TextField
        fullWidth
        required
        label="Id"
        value={id}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setId(event.target.value)
        }
        style={{ margin: "10px 0" }}
      />

      <Button
        onClick={(e) => handleSubmit(e)}
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        style={{ margin: "20px 0" }}
      >
        Login
      </Button>

      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        onClick={() => onIdSubmit(uuidV4())}
      >
        Create new ID
      </Button>
    </Paper>
  );
};

export default LoginForm;
