import AppWrapper from "@/components/appWrapper"
import { Outlet } from "react-router-dom"

const AppLayout = () => {
    return (
        <AppWrapper>
            <div className="h-full">
                <Outlet />
            </div>
        </AppWrapper>
    )
}

export default AppLayout