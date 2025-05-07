import { ReactNode } from "react";

export interface Content {
    author: ReactNode;
    _id: string;
    title: string;
    blocks: { type: string; data: { tag: string; data: string } }[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
