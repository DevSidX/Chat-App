import { ErrorRequestHandler } from "express";
import { httpStatus } from "../config/http.config";
import { AppError, InternalServerException } from "../utils/AppError";
import { errorCodes } from "../enums/errorCode.enum";



const errorHandler: ErrorRequestHandler = (err, req, res, next) : any => {
    console.log(`Error occured on ${req.path} : `, err);

    if(err instanceof AppError){
        return res
        .status(err.statusCode)
        .json(
            {
                message: err.message,
                errorCode: err.errorCode
            }
        )
    }
    
    return res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .json(
        {
            message: "Internal Server Error",
            error: err?.message || "Something went wrong",
            errorCode: errorCodes.ERR_INTERNAL
        }
    )
}

export { errorHandler }