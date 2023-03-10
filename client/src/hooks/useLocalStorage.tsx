import { useEffect, useState } from "react";
import {
  contactType,
  conversationType,
  InitialStorageType,
  LocalStorageType,
} from "../types";

const PREFIX: string = "chat-buddy-";

const useLocalStorage = ({ key, initialValue }: LocalStorageType) => {
  const prefixedKey = PREFIX + key;
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedKey);
    if (jsonValue != null) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") {
      return initialValue();
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value]);

  return [value, setValue];
};

export const useLocalStorageId = (initialValue: InitialStorageType) => {
  return useLocalStorage({ key: "id", initialValue });
};

export const useLocalStorageContact = (initialValue: InitialStorageType) => {
  return useLocalStorage({ key: "contact", initialValue });
};

export const useLocalStorageConversation = (
  initialValue: InitialStorageType
) => {
  return useLocalStorage({ key: "conversation", initialValue });
};
