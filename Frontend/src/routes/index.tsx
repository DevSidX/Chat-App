import BaseLayout from "@/layouts/baseLayout"
import { Route, Routes } from "react-router-dom"
import { authRoutesPath, protectedRoutesPath } from "./routes"
import AppLayout from "@/layouts/appLayout"
import RouteGuard from "./route-guard"

const AppRoutes = () => {
    return (
        <Routes>

            // auth / public routes
            <Route
                path="/"
                element={<RouteGuard requireAuth={false} />} // RouteGuard will check if the user is authenticated before allowing them to access the protected routes
            >
                <Route element={<BaseLayout />}> // BaseLayout will be used for all auth routes
                    {
                        authRoutesPath?.map((route) => ( // Map through the auth routes and create a Route for each one 
                            <Route
                                key={route.path}
                                path={route.path}
                                element={route.element}
                            />
                        ))
                    }
                </Route>
            </Route>

            // protected routes
            <Route
                path="/"
                element={<RouteGuard requireAuth={true} />}
            >
                <Route element={<AppLayout />}> // appLayout will be used for all protected routes
                    {
                        protectedRoutesPath?.map((route) => ( // Map through the protected routes and create a Route for each one 
                            <Route
                                key={route.path}
                                path={route.path}
                                element={route.element}
                            />
                        ))
                    }
                </Route>
            </Route>

        </Routes>
    )
}

export default AppRoutes