import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { NetWorthOverview } from "../components/net-worth/net-worth-overview";

const PAGE_NAME = "Net worth";

export const Route = createFileRoute("/net-worth")({
  component: NetWorthRoute,
  head: () => ({
    meta: [{ title: PAGE_NAME }],
  }),
});

function NetWorthRoute() {
  return (
    <Dashboard title={PAGE_NAME}>
      <NetWorthOverview />
    </Dashboard>
  );
}
