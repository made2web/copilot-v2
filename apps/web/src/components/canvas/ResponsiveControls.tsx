"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScreenSizeStore } from "@/store/useScreenSizeStore";
import type React from "react";

export type ScreenSize = "desktop" | "tablet" | "mobile";

const ResponsiveControls: React.FC = () => {
  const { screenSize, setScreenSize } = useScreenSizeStore();

  return (
    <div className="mb-4">
      <Select
        value={screenSize}
        onValueChange={(value: ScreenSize) => setScreenSize(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select screen size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desktop">Desktop</SelectItem>
          <SelectItem value="tablet">Tablet</SelectItem>
          <SelectItem value="mobile">Mobile</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ResponsiveControls;
