export type contactType = {
  id: string;
  name: string;
  initials: string;
  isSelected: boolean;
};

export type conversationType = {
  id: number;
  contacts: contactType[];
  messages: { sender: string; text: string; time: string }[];
};

export type LocalStorageType = {
  key: string;
  initialValue: InitialStorageType;
};

export type InitialStorageType =
  | string
  | contactType[]
  | conversationType[]
  | (() => string | contactType[] | conversationType[]);


  export type SocketProviderProps = {
    id: string;
    children: React.ReactNode;
  }

  export type PayloadType = {
    recipients: string[];
    sender: string;
    text: string;
  }