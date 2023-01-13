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
  initialValue:
    | string
    | contactType[]
    | conversationType[]
    | (() => string | contactType[] | conversationType[]);
};
