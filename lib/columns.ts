import type { ColumnType } from "./types";

export const COLUMN_TYPES: ColumnType[] = [
  "text",
  "password",
  "username",
  "email",
  "url",
  "note",
  "number",
  "date"
];

export const COLUMN_TYPE_META: Record<ColumnType, { label: string; hint: string }> = {
  text: { label: "Text", hint: "Anything you can type." },
  password: { label: "Password / secret", hint: "Encrypted at rest and masked in lists." },
  username: { label: "Username", hint: "A handle or account name." },
  email: { label: "Email", hint: "An email address." },
  url: { label: "Website / URL", hint: "A link to the site or dashboard." },
  note: { label: "Long note", hint: "Recovery codes, hints, anything longer." },
  number: { label: "Number", hint: "Account or card numbers." },
  date: { label: "Date", hint: "Issue or expiry dates." }
};

export function inputTypeFor(type: ColumnType): string {
  switch (type) {
    case "email":
      return "email";
    case "url":
      return "url";
    case "number":
      return "number";
    case "date":
      return "date";
    default:
      return "text";
  }
}
