"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHistoryStore } from "@/store/useHistoryStore";
import { Redo2, Undo2 } from "lucide-react";
import type React from "react";

const UndoRedoControls: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useHistoryStore();
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifierKey = isMac ? "⌘" : "Ctrl";

  return (
    <TooltipProvider>
      <div className="flex space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo ({modifierKey}+Z)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
              <span className="sr-only">Redo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Redo ({modifierKey}+Y or {modifierKey}+Shift+Z)
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default UndoRedoControls;
