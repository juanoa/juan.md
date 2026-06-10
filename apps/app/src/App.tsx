import { TooltipProvider } from "@juan/ui/components/ui/tooltip";

import { Dashboard } from "./components/dashboard";

export default function App() {
  return (
    <TooltipProvider>
      <Dashboard />
    </TooltipProvider>
  );
}
