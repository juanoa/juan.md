import {
  FolderStructure,
  type FileTreeItem,
} from "@/components/logs/react-folder-architecture/folder-structure";

export const GoodFolderStructure = () => {
  const fileTree: FileTreeItem[] = [
    {
      name: "modules",
      items: [
        {
          name: "products",
          items: [
            {
              name: "components",
              items: [
                { name: "ProductName.tsx" },
                { name: "ProductImage.tsx" },
                { name: "ProductPrice.tsx" },
                { name: "ProductDescription.tsx" },
              ],
            },
            {
              name: "hooks",
              items: [{ name: "useProduct.ts" }],
            },
            {
              name: "types",
              items: [{ name: "Product.ts" }],
            },
          ],
        },
        {
          name: "cart",
          items: [
            {
              name: "components",
              items: [
                { name: "AddToCartButton.tsx" },
                { name: "CartItem.tsx" },
              ],
            },
            {
              name: "hooks",
              items: [{ name: "useAddToCart.ts" }],
            },
            {
              name: "types",
              items: [{ name: "CartItem.ts" }],
            },
          ],
        },
        {
          name: "payment",
          items: [
            {
              name: "components",
              items: [{ name: "PayButton.tsx" }],
            },
            {
              name: "hooks",
              items: [{ name: "usePay.ts" }],
            },
            {
              name: "types",
              items: [{ name: "Payment.ts" }],
            },
          ],
        },
        {
          name: "shared",
          items: [
            {
              name: "components",
              items: [{ name: "Logo.tsx" }],
            },
          ],
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
