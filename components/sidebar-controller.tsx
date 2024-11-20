"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";

export const SidebarController = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-full">
            <div className={cn(
                "h-full flex flex-col fixed inset-y-0 border-r transition-all duration-300",
                isCollapsed ? "w-[80px]" : "w-[300px]"
            )}>
                <Sidebar />
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute right-[-12px] top-4 bg-white border rounded-full p-1"
                >
                    {isCollapsed ? ">" : "<"}
                </button>
            </div>
            <div className={cn(
                "flex-1 transition-all duration-300",
                isCollapsed ? "ml-[80px]" : "ml-[300px]"
            )} />
        </div>
    );
};