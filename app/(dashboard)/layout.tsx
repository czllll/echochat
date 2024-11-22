"use client";

import Sidebar from "@/components/sidebar";
import { useState } from "react";

const DashboardLayout = ({children}: {children: React.ReactNode;}) => {
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen h-screen">
            <Sidebar 
                isRightSidebarOpen={isRightSidebarOpen}
                onRightSidebarToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
            />
            <main className="flex-1 transition-all duration-300 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;