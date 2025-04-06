import { Outlet } from "react-router"
import Sidebar from "./components/Sidebar"
import { ModeToggle } from "./components/ui/mode-toggle"

type Props = {}

const Dashboard = (props: Props) => {
    return (
        <div className="w-screen h-screen p-10 bg-gradient-to-tr from-primary via-rose-500 to-primary-foreground">
            <div className="max-w-[2200px] bg-background relative rounded-3xl overflow-hidden mx-auto h-full w-full flex flex-row">
                <div className="absolute top-4 right-4 z-50">
                    <ModeToggle />
                </div>
                <Sidebar />
                <div className="flex-1 ">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Dashboard