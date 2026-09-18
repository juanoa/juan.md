import { Button } from "@/components/ui/button";
import { Item, ItemActions } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BeerBottleIcon,
  DropIcon,
  ShoppingBagIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

export const StoreWeb = () => {
  const [numberOfBottles, setNumberOfBottles] = useState<number>(0);
  const [paymentState, setPaymentState] = useState<"idle" | "pending" | "done">(
    "idle",
  );

  const handleAddToCart = () => setNumberOfBottles((prev) => prev + 1);

  const handlePay = () => {
    setPaymentState("pending");
    setTimeout(() => {
      setPaymentState("done");
      setNumberOfBottles(0);
    }, 1000);
    setTimeout(() => setPaymentState("idle"), 3000);
  };

  return (
    <div className="space-y-4">
      <TooltipProvider delay={500}>
        <div className="flex gap-2 border text-sm">
          <div className="flex flex-2 flex-col gap-4 p-4">
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="inline-flex w-fit items-center gap-1 bg-amber-300 px-2 py-1">
                    <DropIcon />
                    <span>WATER-COMMERCE</span>
                  </div>
                }
              />
              <TooltipContent>Logo.tsx</TooltipContent>
            </Tooltip>

            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="flex flex-1 items-center justify-center border bg-amber-50">
                      <BeerBottleIcon className="size-1/2 text-amber-900" />
                    </div>
                  }
                />
                <TooltipContent side="left">ProductImage.tsx</TooltipContent>
              </Tooltip>
              <div className="flex-1">
                <Tooltip>
                  <TooltipTrigger render={<p>Bottle of water</p>} />
                  <TooltipContent>ProductName.tsx</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={<p className="text-muted-foreground w-fit">$2</p>}
                  />
                  <TooltipContent side="right">ProductPrice.tsx</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button className="mt-6" onClick={handleAddToCart}>
                        Add to cart
                      </Button>
                    }
                  />
                  <TooltipContent side="right">
                    AddToCartButton.tsx
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <p className="text-muted-foreground mt-10 mb-2 hidden text-xs lg:block">
                        100% mineral water
                      </p>
                    }
                  />
                  <TooltipContent>ProductDescription.tsx</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between border-l p-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <ShoppingBagIcon />
                <span>Cart</span>
              </div>
              {numberOfBottles > 0 && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Item variant="outline">
                        <p>Bottle of water</p>
                        <ItemActions>x{numberOfBottles}</ItemActions>
                      </Item>
                    }
                  />
                  <TooltipContent side="bottom">CartItem.tsx</TooltipContent>
                </Tooltip>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="secondary"
                    onClick={handlePay}
                    disabled={paymentState !== "idle" || numberOfBottles === 0}
                  >
                    {paymentState === "idle" && "Pay"}
                    {paymentState === "pending" && <Spinner />}
                    {paymentState === "done" && "Complete"}
                  </Button>
                }
              />
              <TooltipContent>PayButton.tsx</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
      <p className="text-muted-foreground text-center text-xs italic">
        Try adding items to the cart and then, pay. Hover to discover the
        component names.
      </p>
    </div>
  );
};
