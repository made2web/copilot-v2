"use client";
import { Button } from "@/components/ui/button";
import { useBlockStore } from "@/store/useBlockStore";
import { Edit } from "lucide-react";
import type React from "react";
import { useState } from "react";
import BlockList from "./BlockList";
import FullScreenBlockEditModal from "./FullScreenBlockEditModal";
import PropertyEditor from "./PropertyEditor";

const RightSidebar: React.FC = () => {
  const { getSelectedBlock, updateBlockProperties, updateSectionProperties } =
    useBlockStore();
  const selectedBlock = getSelectedBlock();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlockType, setEditingBlockType] = useState<string | null>(null);

  const handleEditBlock = (blockType: string) => {
    setEditingBlockType(blockType);
    setIsEditModalOpen(true);
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 overflow-auto">
      <h2 className="text-xl font-bold mb-4">Properties</h2>
      {selectedBlock && (
        <>
          <PropertyEditor
            block={selectedBlock}
            updateBlockProperties={updateBlockProperties}
            updateSectionProperties={updateSectionProperties}
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => handleEditBlock(selectedBlock.type)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Block
          </Button>
        </>
      )}
      <div className="mt-8">
        <BlockList onEditBlock={handleEditBlock} />
      </div>
      {editingBlockType && (
        <FullScreenBlockEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          blockType={editingBlockType}
        />
      )}
    </div>
  );
};

export default RightSidebar;
