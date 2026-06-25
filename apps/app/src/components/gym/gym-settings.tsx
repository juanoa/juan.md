import { CirclesThreeIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

export function GymSettings() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Settings</h2>
      <ul className="text-sm">
        <li>
          <Link
            to="/gym/exercises"
            className="hover:bg-muted/60 flex items-center gap-2 p-2 transition-colors">
            <CirclesThreeIcon /> Manage exercises
          </Link>
        </li>
      </ul>
    </div>
  );
}
