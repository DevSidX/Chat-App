// purpose = This hook provides a centralized way to access and update the authentication state across the application, making it easier to manage user sessions and authentication-related actions. 

import { create } from 'zustand'
import { persist } from "zustand/middleware"
import type { LoginType, RegisterType, UserType } from '@/@Types/auth.type'
import { API } from '../lib/axiosClient'
import { toast } from 'sonner'
import { useSocket } from './useSocket'

interface AuthState {
    user: UserType | null,
    isLoggingIn: boolean,
    isSigningUp: boolean,
    isAuthStatusLoading: boolean,
    
    register: (data: RegisterType) => void,
    login: (data: LoginType) => void,
    logout: () => void,
    isAuthStatus: () => void,
}

const useAuth = create<AuthState>()(
    persist( // persist the auth state in localStorage so that it persists across page reloads
        (set) => ({ // initial state and actions
            user: null,
            isSigningUp: false,
            isLoggingIn: false,
            isAuthStatusLoading: false,

            register: async (data: RegisterType) => {
                set({ isSigningUp: true })

                try {
                    const response = await API.post('/auth/register', data)

                    set({
                        user: response.data.registeredUser, // user object returned from the server after successful registration
                    })

                    useSocket.getState().connectSocket() // connect to socket after successful registration
                    toast.success("Registration successful")
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Registration failed")
                } finally {
                    set({ isSigningUp: false })
                }

            },

            login: async (data: LoginType) => {
                set({ isLoggingIn: true })

                try {
                    const response = await API.post('/auth/login', data)
                    
                    set({
                        user: response.data.loginedUser, // user object returned from the server after successful login
                    })

                    useSocket.getState().connectSocket() // connect to socket after successful login
                    toast.success("Login successful")
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Login failed")
                } finally {
                    set({ isLoggingIn: false })
                }

            },

            logout: async () => {
                try {
                    await API.post('/auth/logout') // make a request to the server to clear the session cookie
                    set({ user: null }) // clear the user state on the client
                    useSocket.getState().disconnectSocket() // disconnect from socket on logout
                    toast.success("Logout successful")
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Logout failed")
                }
            },

            isAuthStatus: async () => { // check if the user is authenticated by making a request to the server
                set({ isAuthStatusLoading: true })

                try {
                    const response = await API.get('/auth/status')
                    set({ 
                        user: response.data.user, // user object returned from the server if authenticated
                    })
                    useSocket.getState().connectSocket() // connect to socket if authenticated
                } catch (error: any) {
                    toast.error(error.response?.data?.message || "Failed to check authentication status")
                    console.log(error)
                    // set({ user: null }) // clear the user state if not authenticated or if there's an error
                } finally {
                    set({ isAuthStatusLoading: false })
                }
            }
            
        }), 
        {
            name: 'talk: root'
        } 
    )
)

export default useAuth