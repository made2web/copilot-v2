"use client";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type React from "react";
import Canvas from "./Canvas";
import PageManagement from "./PageManagement";
import ResponsiveControls from "./ResponsiveControls";
import RightSidebar from "./RightSidebar";
import Sidebar from "./Sidebar";
import UndoRedoControls from "./UndoRedoControls";

const AppContent: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
          <PageManagement />
          <div className="flex items-center space-x-4">
            <ResponsiveControls />
            <UndoRedoControls />
          </div>
        </div>
        <Canvas />
      </div>
      <RightSidebar />
    </div>
  );
};

export default AppContent;
