import { Outlet } from "react-router-dom"

interface Props {
    requireAuth?: boolean
}

// purpose = to check if the user is authenticated before allowing them to access the protected routes, if not redirect them to the sign in page 

const RouteGuard = (props: Props) => {
    console.log(props)
  return  <Outlet />
}

export default RouteGuard