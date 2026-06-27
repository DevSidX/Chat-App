import AppWrapper from "@/components/appWrapper"
import ChatList from "@/components/chat/ChatList"
import { cn } from "@/lib/utils"
import { Outlet } from "react-router-dom"

const AppLayout = () => {
    return (
        <AppWrapper>
            <div className="h-full">

                {/* chatlist */}
                <div className="block">
                    <ChatList />
                </div>

                <div className={cn("lg:!pl-95 pl-7")}>
                    <Outlet /> {/* This will render the matched child route component*/}
                </div>

            </div>
        </AppWrapper>
    )
}

export default AppLayout