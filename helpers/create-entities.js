export const CreateEntities = (arr, fn) => {
    return arr.reduce(fn, {});
};