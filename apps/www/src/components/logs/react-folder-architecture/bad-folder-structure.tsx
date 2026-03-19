import {
  FolderStructure,
  type FileTreeItem,
} from "@/components/logs/react-folder-architecture/folder-structure";

export const BadFolderStructure = () => {
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
          items: [{ name: "useAddToCart.ts" }],
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

  return <FolderStructure fileTree={fileTree} />;
};
