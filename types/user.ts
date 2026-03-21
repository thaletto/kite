export type User = {
    id: number
    name: string
    email: string
}

export type newUser = Omit<User, "id">