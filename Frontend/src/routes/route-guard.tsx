import useAuth from "@/hooks/useAuth"
import { Navigate, Outlet } from "react-router-dom"

interface Props {
    requireAuth?: boolean
}

// purpose = to check if the user is authenticated before allowing them to access the protected routes, if not redirect them to the sign in page 

const RouteGuard = ({ requireAuth }: Props) => {

  const { user } = useAuth()

  if(requireAuth && !user) { // if the route requires authentication and the user is not authenticated, redirect to sign in page
    return <Navigate to="/" replace/> 
  
  }
  if(!requireAuth && user) { // if the route does not require authentication and the user is authenticated, redirect to home page
    return <Navigate to="/chat" replace/> 
  }

  console.log(requireAuth)

  return  <Outlet />
}

export default RouteGuard