import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretRightIcon, FileIcon, FolderIcon } from "@phosphor-icons/react";

type FileTreeItem = { name: string } | { name: string; items: FileTreeItem[] };

export const FolderStructure = () => {
  const fileTree: FileTreeItem[] = [
    {
      name: "components",
      items: [
        {
          name: "products",
          items: [
            { name: "ProductName.tsx" },
            { name: "ProductImage.tsx" },
            { name: "ProductPrice.tsx" },
            { name: "ProductDescription.tsx" },
          ],
        },
        {
          name: "cart",
          items: [{ name: "AddToCartButton.tsx" }, { name: "CartItem.tsx" }],
        },
        {
          name: "payment",
          items: [{ name: "PayButton.tsx" }],
        },
        {
          name: "shared",
          items: [{ name: "Logo.tsx" }],
        },
      ],
    },
    {
      name: "hooks",
      items: [
        {
          name: "products",
          items: [{ name: "useProduct.ts" }],
        },
        {
          name: "cart",
          items: [{ name: "useAddToCard.ts" }],
        },
        {
          name: "payment",
          items: [{ name: "usePay.ts" }],
        },
      ],
    },
    {
      name: "types",
      items: [
        {
          name: "products",
          items: [{ name: "Product.ts" }],
        },
        {
          name: "cart",
          items: [{ name: "CartItem.ts" }],
        },
        {
          name: "payment",
          items: [{ name: "Payment.ts" }],
        },
      ],
    },
    { name: "main.tsx" },
    { name: "globals.css" },
    { name: "package.json" },
    { name: "tsconfig.json" },
    { name: "README.md" },
  ];

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
