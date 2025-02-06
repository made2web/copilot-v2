import Canvas from "@/components/canvas/Canvas";
import PageManagement from "@/components/canvas/PageManagement";
import ResponsiveControls from "@/components/canvas/ResponsiveControls";
import RightSidebar from "@/components/canvas/RightSidebar";
import Sidebar from "@/components/canvas/Sidebar";
import UndoRedoControls from "@/components/canvas/UndoRedoControls";

export default function WebsitePage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b">
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
}
