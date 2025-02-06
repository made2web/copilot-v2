import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useBlockStore } from "@/store/useBlockStore";
import { X } from "lucide-react";
import type React from "react";
import BlockRenderer from "./BlockRenderer";

interface FullScreenBlockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockType: string;
}

const FullScreenBlockEditModal: React.FC<FullScreenBlockEditModalProps> = ({
  isOpen,
  onClose,
  blockType,
}) => {
  const { blocks } = useBlockStore();

  // Find the first block of the given type
  const block = Object.values(blocks)
    .flat()
    .find((b) => b.type === blockType);

  if (!block) return null;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-full h-screen p-0">
        <div className="flex h-full">
          <div className="w-1/2 p-4 border-r">
            <h2 className="text-2xl font-bold mb-4">Edit {blockType}</h2>
            {/* Placeholder for chat interface */}
            <div className="bg-gray-100 h-[calc(100%-3rem)] p-4 rounded">
              Chat interface placeholder
            </div>
          </div>
          <div className="w-1/2 p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-semibold mb-4">Block Preview</h3>
            <div className="border p-4 rounded">
              <BlockRenderer block={block} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenBlockEditModal;
