"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ContactIcon } from "@/components/contact/contact-icon";
import { TechnicalLabel } from "@/components/ui/technical-label";
import { cn } from "@/lib/utils";
import { duration, ease } from "@/lib/motion";
import type { ContactLink as ContactLinkData } from "@/lib/contact";

type ContactLinkProps = {
  link: ContactLinkData;
  index: number;
  onActivate: () => void;
  onDeactivate: () => void;
};

export function ContactLinkRow({ link, index, onActivate, onDeactivate }: ContactLinkProps) {
  const [copied, setCopied] = useState(false);
  const number = String(index + 1).padStart(2, "0");

  const content = (
    <>
      <span className="font-mono text-label text-fg-subtle">{number}</span>
      <ContactIcon id={link.id} className="text-fg-subtle transition-colors group-hover:text-signal" />
      <span className="w-24 shrink-0 font-mono text-label uppercase tracking-label text-fg-muted sm:w-32">
        {link.label}
      </span>
      <span
        className={cn(
          "flex-1 text-body-lg text-fg",
          "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-no-repeat bg-left-bottom",
          "transition-[background-size] duration-(--duration-base) ease-(--ease-signal)",
          "group-hover:bg-[length:100%_1px]",
        )}
      >
        {link.id === "email" && copied ? "Copied" : link.value}
      </span>
      <span
        aria-hidden="true"
        className="text-fg-subtle opacity-0 transition-all duration-(--duration-base) ease-(--ease-signal) group-hover:translate-x-1 group-hover:opacity-100"
      >
        →
      </span>
    </>
  );

  const rowClasses = "group flex min-h-11 w-full items-center gap-4 border-b border-border py-4 outline-none focus-visible:border-signal";

  if (!link.href) {
    return (
      <div className={cn(rowClasses, "cursor-default opacity-50")}>
        <span className="font-mono text-label text-fg-subtle">{number}</span>
        <ContactIcon id={link.id} className="text-fg-subtle" />
        <span className="w-24 shrink-0 font-mono text-label uppercase tracking-label text-fg-muted sm:w-32">
          {link.label}
        </span>
        <span className="flex-1 text-body-lg text-fg-subtle">{link.value}</span>
        <TechnicalLabel tone="amber">Pending</TechnicalLabel>
      </div>
    );
  }

  function handleClick() {
    if (link.id !== "email") return;
    navigator.clipboard?.writeText(link.value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <motion.a
      href={link.href}
      onClick={handleClick}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noopener noreferrer" : undefined}
      aria-label={`${link.label}: ${link.value}${link.external ? " (opens in a new tab)" : ""}`}
      className={rowClasses}
      transition={{ duration: duration.fast, ease: ease.signal }}
    >
      {content}
    </motion.a>
  );
}
