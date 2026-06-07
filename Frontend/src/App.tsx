import { useEffect } from 'react'
import './App.css'
import Logo from './components/logo'
import { Spinner } from './components/ui/spinner'
import useAuth from './hooks/useAuth'
import AppRoutes from './routes'
import { useLocation } from 'react-router-dom'
import { isAuthRoute } from './routes/routes'
import { useSocket } from './hooks/useSocket'

function App() {

  const { pathname } = useLocation()

  const { user, isAuthStatus, isAuthStatusLoading } = useAuth()

  const isAuth = isAuthRoute(pathname) // check if the current route is an auth route (sign in or sign up)

  const { onlineUsers } = useSocket() // get the list of online users from the socket context
  console.log(onlineUsers, "online users" )
  
  useEffect(() => {
    isAuthStatus()  
  },[isAuthStatus]) // check the authentication status of the user when the app loads

  if(isAuthStatusLoading && !user && !isAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen ">
        <Logo imgClass='size-20' showText={false} />
        <Spinner className='w-6 h-6' />
      </div>
    )
  }

  return <AppRoutes />
}

export default App
