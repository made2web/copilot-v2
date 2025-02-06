"use client";

import { useSidebar } from "@/components/ui/sidebar";

export function HeaderTrigger({ children }: { children: React.ReactNode }) {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  return <>{open ? children : null}</>;
}
