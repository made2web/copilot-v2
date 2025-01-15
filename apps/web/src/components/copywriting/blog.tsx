"use client";

import { useI18n } from "@/locales/client";
import { useQueryState } from "nuqs";

export function CopywritingBlog() {
  const t = useI18n();

  return (
    <div className="w-full px-8">
      <h2 className="text-lg p-8 pb-4 pl-0 pt-6 font-normal font-mono">Blog</h2>
    </div>
  );
}
