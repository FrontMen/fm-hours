export const CreateSelectOptions = (array, firstOptionLabel) => {
  const firstOption = CreateDefaultSelectOption(firstOptionLabel)
  const options = array.map(entry => CreateSingleSelectOption(entry.id, entry.name))
  return [
    firstOption,
    ...options
  ]
}

export const CreateDefaultSelectOption = (firstOptionLabel) => {
  return CreateSingleSelectOption(null, firstOptionLabel)
}

export const CreateSingleSelectOption = (value, label, disabled = false) => {
  return { value, text: label, disabled }
}
