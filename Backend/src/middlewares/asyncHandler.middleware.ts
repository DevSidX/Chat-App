import { Request, Response, NextFunction } from "express"

type AsyncControllerType = ( req: Request, res: Response, next: NextFunction ) => Promise<any>

// function that takes another function
const AsyncHandler = (controller : AsyncControllerType) : AsyncControllerType => async (req, res, next) => {
    try {
        await controller(req, res, next)
    } catch (error) {
        next(error)
    }
}

export { AsyncHandler }