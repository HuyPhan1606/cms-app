export interface User {
    _id: string;
    email: string;
    name: string;
    password: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserLogin {
    id: string;
    email: string;
    role: string;
}
