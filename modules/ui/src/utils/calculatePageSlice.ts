export const calculatePageSlice = (page: number, perPage: number, dataSize: number) => {
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, dataSize);
    return { start, end };
}