"use client";

import type { ElementType, ReactNode } from "react";

import type { CopyKey } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

type TextProps<T extends ElementType> = {
  as?: T;
  copyKey: CopyKey;
  className?: string;
  children?: ReactNode;
};

export function Text<T extends ElementType = "span">({ as, copyKey, className }: TextProps<T>) {
  const Component = as ?? "span";
  const { text } = useLanguage();

  return <Component className={className}>{text(copyKey)}</Component>;
}
