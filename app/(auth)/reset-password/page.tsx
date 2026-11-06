import { redirect } from "next/navigation";

/**
 * Recovery links from older Safekey builds land here. There is no mailed reset
 * flow any more, so send those visitors to the email-match-only form.
 */
export default function ResetPasswordPage() {
  redirect("/forgot-password");
}
