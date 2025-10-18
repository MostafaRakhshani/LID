"use client";
import React from "react";

export default function ConfirmGuard({
  children,
  message = "حذف شود؟",
}: {
  children: React.ReactElement<HTMLFormElement>;
  message?: string;
}) {
  return React.cloneElement(children, {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      if (!confirm(message)) e.preventDefault();
    },
  });
}
