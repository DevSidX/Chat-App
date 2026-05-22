const httpConfig = () => ({
    // success responses
    OK: 200,
    CREATED: 201,

    // client errors responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    
    // server errors responses
    INTERNAL_SERVER_ERROR: 500,      
})

export const httpStatus =  httpConfig()

export type HttpStatusCodeType = (typeof httpStatus)[keyof typeof httpStatus];  // creates a type that only allows valid HTTP status codes from your HttpStatus object.