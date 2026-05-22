import bcrypt from "bcrypt"

const hashPassword = (password: string, saltRounds = 10) => {
    return bcrypt.hash(password, saltRounds)
}

const comparePassword = (password: string, hashedValue: string) => {
    return bcrypt.compare(password, hashedValue)
}

export { hashPassword, comparePassword }