"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface CopywritingSidebarProps {
  children: ReactNode;
  params: {
    organization: string;
    project: string;
  };
}

const sidebarItems = [
  {
    label: "Blog",
    href: "/blog",
    icon: "📝",
  },
  {
    label: "Social",
    href: "/social",
    icon: "🌐",
  },
  {
    label: "Email",
    href: "/email",
    icon: "📧",
  },
];

export default function CopywritingLayout({
  children,
  params,
}: CopywritingSidebarProps) {
  const pathname = usePathname();
  const { organization, project } = params;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 h-full">
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const href = `/${organization}/${project}/copywriting${item.href}`;
            const isActive = pathname === href;

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  isActive ? "bg-primary text-white" : "hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
