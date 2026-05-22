import { errorCodes, ErrorCodesType } from "../enums/errorCode.enum"
import { HttpStatusCodeType } from "../config/http.config"
import { httpStatus } from "../config/http.config"

class AppError extends Error {
    public statusCode: HttpStatusCodeType 
    public errorCode?: ErrorCodesType 

    constructor(
        message: string,
        errorCode: ErrorCodesType = errorCodes.ERR_INTERNAL ,
        statusCode: HttpStatusCodeType = httpStatus.INTERNAL_SERVER_ERROR
    ) {
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode 

        Error.captureStackTrace(this, this.constructor)
    }
}

class InternalServerException extends AppError {

    constructor(message = "Internal Server Error") {
        super(
            message,
            errorCodes.ERR_INTERNAL,
            httpStatus.INTERNAL_SERVER_ERROR
        )
    }
}

class NotFoundException extends AppError {

    constructor(message = "Resource Not Found") {
        super(
            message,
            errorCodes.ERR_NOT_FOUND,
            httpStatus.NOT_FOUND
        )
    }
}

class BadRequestException extends AppError {

    constructor(message = "Bad Request") {
        super(
            message,
            errorCodes.ERR_BAD_REQUEST,
            httpStatus.BAD_REQUEST
        )
    }
}

class UnauthorizedException extends AppError {

    constructor(message = "Unauthorized") {
        super(
            message,
            errorCodes.ERR_UNAUTHORIZED,
            httpStatus.UNAUTHORIZED
        )
    }
}


export {
    AppError,
    InternalServerException,
    NotFoundException,
    BadRequestException,
    UnauthorizedException
}