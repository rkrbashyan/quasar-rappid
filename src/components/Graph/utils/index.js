export const embedElement = (model, sourceElement) => {
  const coordinates = sourceElement.getBBox().center()
  const parent = findElementBelow(model, coordinates, sourceElement)

  // Prevent recursive embedding.
  if (parent && parent.get('parent') !== sourceElement.id) {
    parent.embed(sourceElement)
  }
}

export const findElementBelow = (model, coordinates, elementAbove) => {
  const elementsBelow = model
    .findModelsFromPoint(coordinates)
    .filter(el => el.id !== elementAbove.id)

  if (elementsBelow.length === 0) {
    return null
  }

  if (elementsBelow.length === 1) {
    return elementsBelow[0]
  }

  // matreshka case
  for (const el of elementsBelow) {
    const embeds = el.get('embeds')

    if (!embeds || embeds.length === 0) return el

    // find the most inner parent
    if (
      !elementsBelow
        .filter(e => e.id !== el.id)
        .some(el => embeds.includes(el.id))
    ) {
      return el
    }
  }
}
