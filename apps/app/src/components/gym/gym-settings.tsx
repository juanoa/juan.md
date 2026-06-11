import { CirclesThreeIcon } from "@phosphor-icons/react";

export function GymSettings() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Settings</h2>
      <ul className="text-sm">
        <li className="flex items-center gap-2"><CirclesThreeIcon /> Manage exercises</li>
      </ul>
    </div>
  )
}