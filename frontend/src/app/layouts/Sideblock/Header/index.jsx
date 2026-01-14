// Import Dependencies
import clsx from "clsx";
import { useState, useEffect } from "react";

// Local Imports
import { RightSidebar } from "components/template/RightSidebar";
import { LanguageSelector } from "components/template/LaguageSelector";
import { Notifications } from "components/template/Notifications";
import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import { Profile } from "../Profile";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------

export function Header() {
  const { cardSkin } = useThemeContext();

  // Radio button state for sales/purchase
  const [selectedType, setSelectedType] = useState(() => {
    // Load from localStorage on initial render
    const stored = localStorage.getItem("salesPurchaseType");
    return stored || "sales";
  });

  // Save to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem("salesPurchaseType", selectedType);
  }, [selectedType]);

  return (
    <header
      className={clsx(
        "app-header transition-content sticky top-0 z-20 flex h-[65px] items-center gap-1 border-b border-gray-200 bg-white/80 px-(--margin-x) backdrop-blur-sm backdrop-saturate-150 dark:border-dark-600 max-sm:justify-between",
        cardSkin === "bordered" ? "dark:bg-dark-900/80" : "dark:bg-dark-700/80",
      )}
    >
      <div className="contents xl:hidden">
        <SidebarToggleBtn />
      </div>

      <div className="flex items-center justify-between gap-2 sm:flex-1 w-full">
        <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-100 capitalize">
          {selectedType} Dashboard
        </div>

        <div className="flex items-center gap-2">
          {/* <Notifications /> */}
          {/* <RightSidebar /> */}
          {/* <LanguageSelector /> */}
          <Profile />
        </div>
      </div>
    </header>
  );
}
