import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretRightIcon, FileIcon, FolderIcon } from "@phosphor-icons/react";

export type FileTreeItem =
  | { name: string }
  | { name: string; items: FileTreeItem[] };

export const FolderStructure = ({ fileTree }: { fileTree: FileTreeItem[] }) => {
  const renderItem = (fileItem: FileTreeItem) => {
    if ("items" in fileItem) {
      return (
        <Collapsible key={fileItem.name}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group hover:bg-accent hover:text-accent-foreground w-full scale-none! justify-start transition-none"
            >
              <CaretRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
              <FolderIcon />
              {fileItem.name}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="style-lyra:ml-4 mt-1 ml-5">
            <div className="flex flex-col gap-1">
              {fileItem.items.map((child) => renderItem(child))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }
    return (
      <Button
        key={fileItem.name}
        variant="link"
        size="sm"
        className="text-foreground w-full scale-none! justify-start gap-2"
      >
        <FileIcon />
        <span>{fileItem.name}</span>
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="mx-auto w-full max-w-[18rem] gap-2" size="sm">
        <CardContent>
          <div className="flex flex-col gap-1">
            {fileTree.map((item) => renderItem(item))}
          </div>
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-center text-xs italic">
        Open and close the folders to discover all the files.
      </p>
    </div>
  );
};
