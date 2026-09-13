import { withBasePath } from "@/lib/base-path";

export type ContactLink = {
  id: "resume" | "email" | "github" | "instagram";
  label: string;
  /** Display value shown in the list. */
  value: string;
  /** null = asset not yet available. Never fabricate a placeholder file. */
  href: string | null;
  external: boolean;
};

export const contactLinks: ContactLink[] = [
  {
    id: "resume",
    label: "Resume",
    value: "View / Download",
    href: withBasePath("/resume.pdf"),
    external: true,
  },
  {
    id: "email",
    label: "Email",
    value: "wyw3932@gmail.com",
    href: "mailto:wyw3932@gmail.com",
    external: false,
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/Will946",
    href: "https://github.com/Will946",
    external: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    value: "@willis_da_asian",
    href: "https://instagram.com/willis_da_asian",
    external: true,
  },
];
