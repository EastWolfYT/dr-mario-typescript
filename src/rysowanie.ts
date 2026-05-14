export const canvas = document.getElementById("game") as HTMLCanvasElement
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
export const rozmiarPolaX: number = 16
export const rozmiarPolaY: number = 14

export const wirusBrazowy = new Image()
wirusBrazowy.src = "/dr-mario-typescript/dist/img/covid_brown.png"

export const wirusNiebieski = new Image()
wirusNiebieski.src = "/dr-mario-typescript/dist/img/covid_blue.png"

export const wirusZolty = new Image()
wirusZolty.src = "/dr-mario-typescript/dist/img/covid_yellow.png"

export function rysujKwadrat(kolumna: number, wiersz: number, kolor: string) {
  const x = kolumna * rozmiarPolaX
  const y = wiersz * rozmiarPolaY

  ctx.fillStyle = kolor
  ctx.fillRect(x, y, rozmiarPolaX, rozmiarPolaY)

  ctx.strokeStyle = "black"
  ctx.strokeRect(x, y, rozmiarPolaX, rozmiarPolaY)
}

export function rysujWirus(kolumna: number, wiersz: number, kolor: string) {
  const x = kolumna * rozmiarPolaX
  const y = wiersz * rozmiarPolaY

  if (kolor === "red") {
    ctx.drawImage(wirusBrazowy, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  if (kolor === "blue") {
    ctx.drawImage(wirusNiebieski, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  if (kolor === "yellow") {
    ctx.drawImage(wirusZolty, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  rysujKwadrat(kolumna, wiersz, kolor)
}

export const brazowyLeft = new Image()
brazowyLeft.src = "/dr-mario-typescript/dist/img/br_left.png"

export const brazowyRight = new Image()
brazowyRight.src = "/dr-mario-typescript/dist/img/br_right.png"

export const brazowyUp = new Image()
brazowyUp.src = "/dr-mario-typescript/dist/img/br_up.png"

export const brazowyDown = new Image()
brazowyDown.src = "/dr-mario-typescript/dist/img/br_down.png"

export const brazowyDot = new Image()
brazowyDot.src = "/dr-mario-typescript/dist/img/br_dot.png"

export const zoltyLeft = new Image()
zoltyLeft.src = "/dr-mario-typescript/dist/img/yl_left.png"

export const zoltyRight = new Image()
zoltyRight.src = "/dr-mario-typescript/dist/img/yl_right.png"

export const zoltyUp = new Image()
zoltyUp.src = "/dr-mario-typescript/dist/img/yl_up.png"

export const zoltyDown = new Image()
zoltyDown.src = "/dr-mario-typescript/dist/img/yl_down.png"

export const zoltyDot = new Image()
zoltyDot.src = "/dr-mario-typescript/dist/img/yl_dot.png"

export const niebieskiLeft = new Image()
niebieskiLeft.src = "/dr-mario-typescript/dist/img/bl_left.png"

export const niebieskiRight = new Image()
niebieskiRight.src = "/dr-mario-typescript/dist/img/bl_right.png"

export const niebieskiUp = new Image()
niebieskiUp.src = "/dr-mario-typescript/dist/img/bl_up.png"

export const niebieskiDown = new Image()
niebieskiDown.src = "/dr-mario-typescript/dist/img/bl_down.png"

export const niebieskiDot = new Image()
niebieskiDot.src = "/dr-mario-typescript/dist/img/bl_dot.png"

export const brazowyX = new Image()
brazowyX.src = "/dr-mario-typescript/dist/img/br_x.png"

export const zoltyX = new Image()
zoltyX.src = "/dr-mario-typescript/dist/img/yl_x.png"

export const niebieskiX = new Image()
niebieskiX.src = "/dr-mario-typescript/dist/img/bl_x.png"

export const brazowyO = new Image()
brazowyO.src = "/dr-mario-typescript/dist/img/br_o.png"

export const zoltyO = new Image()
zoltyO.src = "/dr-mario-typescript/dist/img/yl_o.png"

export const niebieskiO = new Image()
niebieskiO.src = "/dr-mario-typescript/dist/img/bl_o.png"

export function pobierzObrazekTabletki(kolor: string, typ: string): HTMLImageElement | null {
  if (kolor === "red") {
    if (typ === "left") return brazowyLeft
    if (typ === "right") return brazowyRight
    if (typ === "up") return brazowyUp
    if (typ === "down") return brazowyDown
    if (typ === "dot") return brazowyDot
  }

  if (kolor === "yellow") {
    if (typ === "left") return zoltyLeft
    if (typ === "right") return zoltyRight
    if (typ === "up") return zoltyUp
    if (typ === "down") return zoltyDown
    if (typ === "dot") return zoltyDot
  }

  if (kolor === "blue") {
    if (typ === "left") return niebieskiLeft
    if (typ === "right") return niebieskiRight
    if (typ === "up") return niebieskiUp
    if (typ === "down") return niebieskiDown
    if (typ === "dot") return niebieskiDot
  }

  return null
}

export function rysujPolowkeTabletki(kolumna: number, wiersz: number, kolor: string, typ: string) {
  const x = kolumna * rozmiarPolaX
  const y = wiersz * rozmiarPolaY

  const obrazek = pobierzObrazekTabletki(kolor, typ)

  if (obrazek !== null) {
    ctx.drawImage(obrazek, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  rysujKwadrat(kolumna, wiersz, kolor)
}

export function rysujZbitaTabletke(kolumna: number, wiersz: number, kolor: string) {
  const x = kolumna * rozmiarPolaX
  const y = wiersz * rozmiarPolaY

  if (kolor === "red") {
    ctx.drawImage(brazowyO, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  if (kolor === "blue") {
    ctx.drawImage(niebieskiO, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  if (kolor === "yellow") {
    ctx.drawImage(zoltyO, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  rysujKwadrat(kolumna, wiersz, kolor)
}

export function rysujZbityWirus(kolumna: number, wiersz: number, kolor: string) {
  const x = kolumna * rozmiarPolaX
  const y = wiersz * rozmiarPolaY

  if (kolor === "red") {
    ctx.drawImage(brazowyX, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  if (kolor === "blue") {
    ctx.drawImage(niebieskiX, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  if (kolor === "yellow") {
    ctx.drawImage(zoltyX, x, y, rozmiarPolaX, rozmiarPolaY)
    return
  }

  rysujKwadrat(kolumna, wiersz, kolor)
}