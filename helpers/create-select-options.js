export const CreateSelectOptions = (array, firstOptionLabel) => {
    const firstOption = { value: null, text: firstOptionLabel };
    const options = array.map((entry) => {
        return {
            value: entry.id,
            text: entry.name
        }
    });
    return [
        firstOption,
        ...options,
    ];
}