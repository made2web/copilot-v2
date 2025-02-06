"use client";
import { useBlockStore } from "@/store/useBlockStore";
import { usePageStore } from "@/store/usePageStore";
import { useScreenSizeStore } from "@/store/useScreenSizeStore";
import type React from "react";
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import BlockRenderer from "./BlockRenderer";
import HoverToolbar from "./HoverToolbar";

const Canvas: React.FC = () => {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const {
    blocks,
    moveBlock,
    removeBlock,
    duplicateBlock,
    selectBlock,
    replaceBlock,
  } = useBlockStore();
  const { currentPageId } = usePageStore();
  const { screenSize } = useScreenSizeStore();

  const currentPageBlocks = blocks[currentPageId] || [];

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    moveBlock(result.source.index, result.destination.index);
  };

  const getCanvasStyle = () => {
    switch (screenSize) {
      case "tablet":
        return "max-w-[768px] mx-auto bg-white";
      case "mobile":
        return "max-w-[375px] mx-auto bg-white";
      default:
        return "w-full bg-white";
    }
  };

  return (
    <div className={`flex-1 p-4 bg-gray-600 overflow-auto ${getCanvasStyle()}`}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="canvas">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {currentPageBlocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mb-4 relative"
                      style={{ zIndex: 1 }}
                      onClick={(e) => {
                        if (
                          !(e.target as HTMLElement).closest(
                            "[data-hover-toolbar]",
                          )
                        ) {
                          selectBlock(block.id);
                        }
                      }}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                    >
                      <BlockRenderer
                        block={block}
                        className="pointer-events-auto"
                      />
                      {hoveredBlockId === block.id && (
                        <HoverToolbar
                          onDelete={() => removeBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block.id)}
                          onReplace={() => replaceBlock(block.id)}
                          onAIEdit={(prompt) =>
                            console.log(
                              `AI Edit requested for block ${block.id} with prompt: ${prompt}`,
                            )
                          }
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Canvas;
