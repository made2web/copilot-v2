import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlockStore } from "@/store/useBlockStore";
import { usePageStore } from "@/store/usePageStore";
import { ChevronRight, Edit } from "lucide-react";
import type React from "react";

interface BlockListProps {
  onEditBlock: (blockType: string) => void;
}

const BlockList: React.FC<BlockListProps> = ({ onEditBlock }) => {
  const { blocks } = useBlockStore();
  const { pages } = usePageStore();

  const groupedBlocks = Object.entries(blocks).reduce(
    (acc, [pageId, pageBlocks]) => {
      pageBlocks.forEach((block) => {
        if (!acc[block.type]) {
          acc[block.type] = { pages: new Set(), count: 0 };
        }
        acc[block.type].pages.add(pageId);
        acc[block.type].count++;
      });
      return acc;
    },
    {} as Record<string, { pages: Set<string>; count: number }>,
  );

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <h3 className="mb-4 text-lg font-semibold">Blocks in Project</h3>
      {Object.entries(groupedBlocks).map(
        ([blockType, { pages: pageIds, count }]) => (
          <Collapsible key={blockType} className="mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>
                  {blockType} ({count})
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  Used in:{" "}
                  {Array.from(pageIds)
                    .map((id) => pages.find((p) => p.id === id)?.name)
                    .join(", ")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => onEditBlock(blockType)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Block
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ),
      )}
    </ScrollArea>
  );
};

export default BlockList;
