type RGBColor = [number, number, number]

export function randomByte () {
  return Math.floor(Math.random() * 255)
}

export function randomRGB (): RGBColor {
  return [randomByte(), randomByte(), randomByte()]
}

export function isSameColors (first: RGBColor, second: RGBColor) {
  for (let i = 0; i < 3; i++) {
    if (first[i] !== second[i]) {
      return false
    }
  }
  return true
}
