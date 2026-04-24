import { HomeClient } from "./HomeClient";
import { getItems } from "./items";

export const dynamic = "force-static";

export default function Home() {
  const items = getItems();

  return <HomeClient items={items} />;
}
