import { Outlet } from "react-router-dom"

const BaseLayout = () => {
  return (
    <div className='flex flex-col h-auto w-full'>
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-full mx-auto h-auto">
                <Outlet />
            </div>
        </div>
    </div>
  )
}

export default BaseLayout