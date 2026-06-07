
type RegisterType = {
    name: string,
    email: string,
    password: string,
    avatar?: string | null
}

type LoginType = {
    email: string,
    password: string,
}

type UserType = {
    _id: string,
    name: string,
    email: string,
    avatar?: string | null,
    createdAt: string,
    updatedAt: string,
}

export type {
    RegisterType,
    LoginType,
    UserType,
}