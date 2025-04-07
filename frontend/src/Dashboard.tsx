import { Outlet } from "react-router"
import Sidebar from "./components/Sidebar"
import { ModeToggle } from "./components/ui/mode-toggle"
import { Toaster } from "@/components/ui/sonner"

const Dashboard = () => {
    return (
        <div className="w-screen h-screen p-4 bg-gradient-to-tr from-primary via-rose-500 to-primary-foreground">
            <div className="max-w-[2200px] shadow-black/30 shadow-2xl bg-background relative rounded-3xl overflow-hidden mx-auto h-full w-full flex flex-row">
                <div className="absolute top-4 right-4 z-50">
                    <ModeToggle />
                </div>
                <Sidebar />
                <div className="flex-1 overflow-y-auto relative pb-[60px]">
                    <Outlet />
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default Dashboard