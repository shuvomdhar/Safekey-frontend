export type User = {
  id: number;
  email: string;
  fullName: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
  createdAt: string;
};

export type FolderColor = "olive" | "sage" | "clay" | "sand" | "slate" | "plum";

export type FolderIcon =
  | "folder"
  | "key"
  | "globe"
  | "bank"
  | "briefcase"
  | "user"
  | "cloud"
  | "gamepad"
  | "mail"
  | "lock"
  | "code"
  | "camera";

export type ColumnType =
  | "text"
  | "password"
  | "email"
  | "username"
  | "url"
  | "note"
  | "number"
  | "date";

export type TemplateKey = "blank" | "login" | "social" | "api" | "banking" | "identity";

export type Column = {
  id: number;
  name: string;
  type: ColumnType;
  isSecret: boolean;
  isRequired: boolean;
  position: number;
};

export type FolderSummary = {
  id: number;
  name: string;
  description: string | null;
  color: FolderColor;
  icon: FolderIcon;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  columnNames: string[];
};

export type Folder = FolderSummary & {
  columns: Column[];
};

export type ItemValue = {
  columnId: number;
  value: string | null;
  hasValue: boolean;
};

export type Item = {
  id: number;
  title: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  values: ItemValue[];
  folderId?: number;
  folderName?: string;
};

/** A cross-vault entry search result from `GET /api/search`. */
export type SearchHit = {
  id: number;
  title: string;
  notes: string | null;
  folderId: number;
  folderName: string;
  folderColor: FolderColor;
  folderIcon: FolderIcon;
  updatedAt: string;
  matchedField: string | null;
};

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type FieldOption = {
  value: ColumnType;
  label: string;
  hint: string;
};
