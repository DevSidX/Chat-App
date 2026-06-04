import SignIn from "@/pages/auth/signIn"
import SignUp from "@/pages/auth/signUp"
import Chat from "@/pages/chat"
import SingleChat from "@/pages/chat/chatId"

const AUTH_ROUTE = {
    SIGN_IN: "/",
    SIGN_UP: "/signUp"
}

const PROTECTED_ROUTE = {
    CHAT: '/chat',
    SINGLE_CHAT: '/chat/:chatId',
}

const authRoutesPath = [
    {
        path: AUTH_ROUTE.SIGN_IN,
        element: <SignIn />
    },
    {
        path: AUTH_ROUTE.SIGN_UP,
        element: <SignUp />
    },
]

const protectedRoutesPath = [
    {
        path: PROTECTED_ROUTE.CHAT,
        element: <Chat />
    },
    {
        path: PROTECTED_ROUTE.SINGLE_CHAT,
        element: <SingleChat />
    },
]

export const isAuthRoute = (pathname: string) => { // Check if the pathname matches any of the auth routes
    return Object.values(AUTH_ROUTE).includes(pathname)
}

export { AUTH_ROUTE, PROTECTED_ROUTE, authRoutesPath, protectedRoutesPath }