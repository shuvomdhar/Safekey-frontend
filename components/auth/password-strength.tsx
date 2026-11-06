"use client";

import { cn } from "@/lib/format";

export function passwordScore(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "Use at least 8 characters" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

const colors = ["bg-line-strong", "bg-[#c07a6b]", "bg-[#c9a25f]", "bg-[#a4b183]", "bg-[#6d8250]"];

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordScore(password);

  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              index < score ? colors[score] : "bg-line"
            )}
          />
        ))}
      </div>
      <span className="text-[11.5px] text-faint">{label}</span>
    </div>
  );
}
