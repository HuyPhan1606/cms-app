export interface ContentTypes {
    _id: string;
    title: string;
    blocks: { type: string; data: { tag: string; data: string } }[];
}
