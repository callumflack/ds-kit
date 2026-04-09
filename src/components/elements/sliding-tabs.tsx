"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/classes";

interface Tab {
  label: ReactNode;
  value: string;
}

interface SlidingTabsProps {
  activeTabClassName?: string;
  className?: string;
  disabled?: boolean;
  inactiveTabClassName?: string;
  indicatorClassName?: string;
  indicatorLayoutId?: string;
  listClassName?: string;
  listItemClassName?: string;
  onValueChange: (value: string) => void;
  tabClassName?: string;
  tabs: Tab[];
  value: string;
}

export function SlidingTabs({
  tabs,
  value,
  onValueChange,
  className,
  listClassName,
  listItemClassName,
  tabClassName,
  activeTabClassName,
  inactiveTabClassName,
  indicatorClassName,
  disabled,
  indicatorLayoutId = "selected-indicator",
}: SlidingTabsProps) {
  return (
    <nav className={cn("relative", className)}>
      <ul className={cn("flex", listClassName)}>
        {tabs.map((tab) => {
          const isSelected = value === tab.value;

          return (
            <li className={cn("relative", listItemClassName)} key={tab.value}>
              {isSelected && (
                <motion.div
                  className={cn("absolute z-0", indicatorClassName)}
                  layoutId={indicatorLayoutId}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 37,
                  }}
                />
              )}
              <motion.button
                aria-selected={isSelected}
                className={cn(
                  "relative z-10 cursor-pointer transition-colors disabled:cursor-not-allowed",
                  tabClassName,
                  isSelected ? activeTabClassName : inactiveTabClassName
                )}
                disabled={disabled}
                onClick={() => onValueChange(tab.value)}
                role="tab"
                type="button"
                whileTap={disabled ? undefined : { scale: 0.97 }}
              >
                {tab.label}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
