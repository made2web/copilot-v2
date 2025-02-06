"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePageStore } from "@/store/usePageStore";
import { ChevronDown, Plus, Trash } from "lucide-react";
import type React from "react";
import { useState } from "react";

const PageManagement: React.FC = () => {
  const { pages, currentPageId, addPage, switchPage, renamePage, deletePage } =
    usePageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState("");

  const handleRename = (pageId: string) => {
    setIsEditing(true);
    setEditingPageId(pageId);
    setEditingPageName(pages.find((p) => p.id === pageId)?.name || "");
  };

  const handleSaveRename = () => {
    if (editingPageId && editingPageName.trim()) {
      renamePage(editingPageId, editingPageName.trim());
      setIsEditing(false);
      setEditingPageId(null);
    }
  };

  const currentPage = pages.find((p) => p.id === currentPageId);

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            {currentPage?.name}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <div className="flex flex-col">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => switchPage(page.id)}
                className="flex items-center justify-between w-full"
              >
                {isEditing && editingPageId === page.id ? (
                  <Input
                    value={editingPageName}
                    onChange={(e) => setEditingPageName(e.target.value)}
                    onBlur={handleSaveRename}
                    onKeyPress={(e) => e.key === "Enter" && handleSaveRename()}
                    autoFocus
                  />
                ) : (
                  <>
                    <span>{page.name}</span>
                    <div className="flex space-x-1">
                      <div
                        role="button"
                        tabIndex={0}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(page.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleRename(page.id);
                          }
                        }}
                      >
                        ✏️
                      </div>
                      {pages.length > 1 && (
                        <div
                          role="button"
                          tabIndex={0}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              deletePage(page.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button onClick={addPage}>
        <Plus className="mr-2 h-4 w-4" />
        Add Page
      </Button>
    </div>
  );
};

export default PageManagement;
