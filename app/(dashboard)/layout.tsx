import Sidebar from "@/components/sidebar";

const DashboardLayout = async({children}: {children: React.ReactNode;}) => {
    return (
        <div className="flex h-full">
            <div className="hidden h-full md:flex md:w-[300px] md:flex-col md:fixed md:inset-y-0 border-r">
                <Sidebar/>
            </div>
            <div className="flex-1 ml-[300px]">
                {children}
            </div>
            
        </div>
    )
}
export default DashboardLayout;