import { KolorPola, Pole, WcisnieteKlawisze, PolePlanszy, Pozycja } from "./types"
import { Tabletka } from "./tabletka"
import { canvas, ctx, rysujKwadrat, rysujWirus, rysujPolowkeTabletki, rysujZbitaTabletke, rysujZbityWirus } from "./rysowanie"

const kolumny: number = 8
const wiersze: number = 19

export class Gra {
  plansza: PolePlanszy[][];
  aktualnaTabletka!: Tabletka;
  tabletkaSpadaSzybko: boolean;
  wcisnieteKlawisze: WcisnieteKlawisze;
  nastepneIdTabletki: number;
  punkty: number;
  rekord: number;
  liczbaWirusow: number;
  gameover: boolean;
  stagecompleted: boolean;
  licznikAnimacji: number;
  animacjaZbijania: boolean;
  polaDoAnimacjiZbicia: Pole[];
  aktywnaTabletka: boolean;
  nastepnaTabletkaKolory: [KolorPola, KolorPola]
  animacjaRzutuTrwa: boolean;
  klatkiReki: {
    part1: string | null;
    part2: string | null;
    part3: string | null;
    part4: string | null;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x3: number;
    y3: number;
    x4: number;
    y4: number;
  }[];
  aktualnaKlatkaReki: number;
  wirusyWLupie: {
    kolor: "red" | "blue" | "yellow";
    indeksPozycji: number;
    klatka: number;
    licznikKlatek: number;
    oczekujeRuchu: boolean;
  }[];
  pozycjeWirusowWLupie: { x: number; y: number }[];

  constructor() {
    this.plansza = [];
    this.nastepneIdTabletki = 1

    this.punkty = 0

    const zapisaneRekordy = localStorage.getItem("rekordDrMario")

    if (zapisaneRekordy === null) {
      this.rekord = 0
    }
    else {
      this.rekord = Number(zapisaneRekordy)
    }

    this.liczbaWirusow = 0
    this.gameover = false
    this.stagecompleted = false
    this.licznikAnimacji = 0

    for (let numerWiersza = 0; numerWiersza < wiersze; numerWiersza++) {
      const jedenWiersz: PolePlanszy[] = [];

      for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
        jedenWiersz.push({
          kolor: null,
          id: null,
          typ: null,
          wirus: false
        });
      }
      this.plansza.push(jedenWiersz);
    }

    this.stworzWirusy(4)

    this.wcisnieteKlawisze = {}
    this.tabletkaSpadaSzybko = false
    this.animacjaZbijania = false
    this.polaDoAnimacjiZbicia = []
    this.aktywnaTabletka = false
    this.animacjaRzutuTrwa = false
    this.klatkiReki = []
    this.aktualnaKlatkaReki = 0
    this.wirusyWLupie = []
    this.pozycjeWirusowWLupie = []

    this.nastepnaTabletkaKolory = [this.losujKolor(), this.losujKolor()]
    this.rysujPreviewTabletki()

    this.sterowanie()
    this.uruchomSpadanie()
    this.aktualizujPanel()
    this.rysujCalaGre()
    this.ustawPozycjeWirusowWLupie()
    this.stworzWirusyWLupie()
    this.rysujWirusyWLupie()
    this.uruchomAnimacjeLupy()

    this.rzucNowaTabletke()

    setInterval(() => {
      this.rysujCalaGre()
    }, 16)
  }

  zapiszRekordDoLocalStorage() {
    localStorage.setItem("rekordDrMario", String(this.rekord))
  }

  losujKolor(): KolorPola {
    const liczba = Math.floor(Math.random() * 3)

    if (liczba === 0) {
      return "red"
    }

    if (liczba === 1) {
      return "blue"
    }

    return "yellow"
  }

  czyMoznaPostawicWirusa(kolumna: number, wiersz: number): boolean {
    const polePlanszy = this.plansza[wiersz]![kolumna]

    if (polePlanszy.kolor !== null) {
      return false
    }

    return true
  }

  stworzWirusy(ileWirusow: number) {
    let dodaneWirusy = 0

    while (dodaneWirusy < ileWirusow) {
      const kolumna = Math.floor(Math.random() * kolumny)
      const wiersz = Math.floor(Math.random() * 10) + 6

      if (this.czyMoznaPostawicWirusa(kolumna, wiersz) === false) {
        continue
      }

      this.plansza[wiersz]![kolumna] = {
        kolor: this.losujKolor(),
        id: 1000 + dodaneWirusy,
        typ: null,
        wirus: true
      }
      dodaneWirusy = dodaneWirusy + 1
    }
    this.policzWirusy()
  }

  aktualizujPanel() {
    this.pokazLiczbe("rekordBox", this.rekord, 7)
    this.pokazLiczbe("punktyBox", this.punkty, 7)
    this.pokazLiczbe("wirusyBox", this.liczbaWirusow, 2)

    const gameOverImg = document.getElementById("gameOverImg") as HTMLImageElement | null
    const stageCompletedImg = document.getElementById("stageCompletedImg") as HTMLImageElement | null
    const doktorGrafika = document.getElementById("doktorGrafika") as HTMLImageElement | null
    const previewBox = document.getElementById("previewBox") as HTMLDivElement | null
    const handBox = document.getElementById("handBox") as HTMLDListElement | null

    if (gameOverImg !== null) {
      gameOverImg.style.display = this.gameover === true ? "block" : "none"
    }

    if (stageCompletedImg !== null) {
      stageCompletedImg.style.display = this.stagecompleted === true ? "block" : "none"
    }

    if (doktorGrafika !== null) {
      doktorGrafika.style.display = this.gameover === true ? "block" : "none"
    }

    if (handBox !== null) {
      handBox.style.display = this.gameover === true ? "none" : "block"
    }

    if (previewBox !== null) {
      previewBox.style.display = this.gameover === true ? "none" : "flex"
    }
  }

  rysujPreviewTabletki() {
    const previewBox = document.getElementById("previewBox")

    if (previewBox === null) {
      return
    }

    previewBox.innerHTML = ""

    const lewaPolowka = document.createElement("img")
    lewaPolowka.src = this.pobierzSrcPreview(this.nastepnaTabletkaKolory[0], "left")
    lewaPolowka.className = "previewPolowka"

    const prawaPolowka = document.createElement("img")
    prawaPolowka.src = this.pobierzSrcPreview(this.nastepnaTabletkaKolory[1], "right")
    prawaPolowka.className = "previewPolowka"

    previewBox.appendChild(lewaPolowka)
    previewBox.appendChild(prawaPolowka)
  }

  pobierzSrcPreview(kolor: KolorPola, typ: string): string {
    if (kolor === "red") {
      if (typ === "left") return "../dist/img/br_left.png"
      if (typ === "right") return "../dist/img/br_right.png"
      if (typ === "up") return "../dist/img/br_up.png"
      if (typ === "down") return "../dist/img/br_down.png"
    }

    if (kolor === "blue") {
      if (typ === "left") return "../dist/img/bl_left.png"
      if (typ === "right") return "../dist/img/bl_right.png"
      if (typ === "up") return "../dist/img/bl_up.png"
      if (typ === "down") return "../dist/img/bl_down.png"
    }
    
    if (kolor === "yellow") {
      if (typ === "left") return "../dist/img/yl_left.png"
      if (typ === "right") return "../dist/img/yl_right.png"
      if (typ === "up") return "../dist/img/yl_up.png"
      if (typ === "down") return "../dist/img/yl_down.png"
    }

    return ""
  }

  ustawKlatkiReki() {
    this.klatkiReki = [
      {
        part1: "../dist/img/hands/up_1.png",
        part2: "../dist/img/hands/up_2.png",
        part3: "../dist/img/hands/up_3.png",
        part4: null,
        x1: 38,
        y1: -4,
        x2: 38,
        y2: 14,
        x3: 39,
        y3: 32.2,
        x4: 0,
        y4: 0
      },
      {
        part1: "../dist/img/hands/middle11.png",
        part2: "../dist/img/hands/middle12.png",
        part3: "../dist/img/hands/middle21.png",
        part4: "../dist/img/hands/middle22.png",
        x1: 23,
        y1: 14,
        x2: 41,
        y2: 14,
        x3: 23,
        y3: 32,
        x4: 41,
        y4: 32.2
      },
      {
        part1: "../dist/img/hands/down_1.png",
        part2: "../dist/img/hands/down_2.png",
        part3: null,
        part4: null,
        x1: 40,
        y1: 32,
        x2: 41,
        y2: 42,
        x3: 0,
        y3: 0,
        x4: 0,
        y4: 0
      }
    ]

    this.aktualnaKlatkaReki = 0
  }

  rysujKlatkeReki() {
    const handPart1 = document.getElementById("rekaCzesc1") as HTMLImageElement | null
    const handPart2 = document.getElementById("rekaCzesc2") as HTMLImageElement | null
    const handPart3 = document.getElementById("rekaCzesc3") as HTMLImageElement | null
    const handPart4 = document.getElementById("rekaCzesc4") as HTMLImageElement | null

    if (handPart1 === null || handPart2 === null || handPart3 === null || handPart4 === null) {
      return
    }

    if (this.aktualnaKlatkaReki < 0 || this.aktualnaKlatkaReki >= this.klatkiReki.length) {
      return
    }

    const klatka = this.klatkiReki[this.aktualnaKlatkaReki]!

    if (klatka.part1 !== null) {
      handPart1.src = klatka.part1
      handPart1.style.left = klatka.x1 + "px"
      handPart1.style.top = klatka.y1 + "px"
      handPart1.style.display = "block"
    } else {
      handPart1.style.display = "none"
    }

    if (klatka.part2 !== null) {
      handPart2.src = klatka.part2
      handPart2.style.left = klatka.x2 + "px"
      handPart2.style.top = klatka.y2 + "px"
      handPart2.style.display = "block"
    } else {
      handPart2.style.display = "none"
    }

    if (klatka.part3 !== null) {
      handPart3.src = klatka.part3
      handPart3.style.left = klatka.x3 + "px"
      handPart3.style.top = klatka.y3 + "px"
      handPart3.style.display = "block"
    } else {
      handPart3.style.display = "none"
    }

    if (klatka.part4 !== null) {
      handPart4.src = klatka.part4
      handPart4.style.left = klatka.x4 + "px"
      handPart4.style.top = klatka.y4 + "px"
      handPart4.style.display = "block"
    } else {
      handPart4.style.display = "none"
    }
  }

  przywrocGrafikeDoktora() {
    const handPart1 = document.getElementById("rekaCzesc1") as HTMLImageElement | null
    const handPart2 = document.getElementById("rekaCzesc2") as HTMLImageElement | null
    const handPart3 = document.getElementById("rekaCzesc3") as HTMLImageElement | null
    const handPart4 = document.getElementById("rekaCzesc4") as HTMLImageElement | null

    if (handPart1 === null || handPart2 === null || handPart3 === null || handPart4 === null) {
      return
    }

    handPart1.src = "../dist/img/hands/up_1.png"
    handPart1.style.left = "38px"
    handPart1.style.top = "-4px"
    handPart1.style.display = "block"

    handPart2.src = "../dist/img/hands/up_2.png"
    handPart2.style.left = "38px"
    handPart2.style.top = "14px"
    handPart2.style.display = "block"

    handPart3.src = "../dist/img/hands/up_3.png"
    handPart3.style.left = "39px"
    handPart3.style.top = "32.2px"
    handPart3.style.display = "block"

    handPart4.style.display = "none"
  }

  pobierzSrcRzutu(kolor: KolorPola, typ: "left" | "right" | "up" | "down"): string {
    if (kolor === "red") {
      if (typ === "left") return "../dist/img/br_left.png"
      if (typ === "right") return "../dist/img/br_right.png"
      if (typ === "up") return "../dist/img/br_up.png"
      return "../dist/img/br_down.png"
    }

    if (kolor === "blue") {
      if (typ === "left") return "../dist/img/bl_left.png"
      if (typ === "right") return "../dist/img/bl_right.png"
      if (typ === "up") return "../dist/img/bl_up.png"
      return "../dist/img/bl_down.png"
    }

    if (typ === "left") return "../dist/img/yl_left.png"
    if (typ === "right") return "../dist/img/yl_right.png"
    if (typ === "up") return "../dist/img/yl_up.png"
    return "../dist/img/yl_down.png"
  }

  rzucNowaTabletke() {
    const gameScreen = document.getElementById("gameScreen")
    const previewBox = document.getElementById("previewBox")

    if (gameScreen === null) {
      this.stworzNowaTabletkeBezAnimacji()
      return
    }

    this.animacjaRzutuTrwa = true
    this.aktywnaTabletka = false
    this.ustawKlatkiReki()
    this.rysujKlatkeReki()

    if (previewBox !== null) {
      previewBox.style.visibility = "hidden"
    }

    const lewaPolowka = document.createElement("img")
    lewaPolowka.className = "animowanaTabletka"
    lewaPolowka.src = this.pobierzSrcPreview(this.nastepnaTabletkaKolory[0], "left")

    const prawaPolowka = document.createElement("img")
    prawaPolowka.className = "animowanaTabletka"
    prawaPolowka.src = this.pobierzSrcPreview(this.nastepnaTabletkaKolory[1], "right")

    gameScreen.appendChild(lewaPolowka)
    gameScreen.appendChild(prawaPolowka)

    const kolorA = this.nastepnaTabletkaKolory[0]
    const kolorB = this.nastepnaTabletkaKolory[1]

    const klatki = [
      { x1: 480, y1: 48,  x2: 496, y2: 48 },
      { x1: 480, y1: 48,  x2: 496, y2: 48 },
      { x1: 464, y1: 34,  x2: 480, y2: 34 },
      { x1: 464, y1: 32,  x2: 480, y2: 32 },
      { x1: 448, y1: 18,  x2: 464, y2: 18 },
      { x1: 448, y1: 18,  x2: 448, y2: 18 },
      { x1: 432, y1: 18,  x2: 448, y2: 18 },
      { x1: 432, y1: 18,  x2: 448, y2: 18 },
      { x1: 416, y1: 18,  x2: 432, y2: 18 },
      { x1: 416, y1: 18,  x2: 432, y2: 18 },
      { x1: 400, y1: 18,  x2: 416, y2: 18 },
      { x1: 400, y1: 18,  x2: 416, y2: 18 },
      { x1: 384, y1: 18,  x2: 400, y2: 18 },
      { x1: 384, y1: 18,  x2: 400, y2: 18 },
      { x1: 368, y1: 18,  x2: 384, y2: 18 },
      { x1: 368, y1: 18,  x2: 384, y2: 18 },
      { x1: 352, y1: 18,  x2: 366, y2: 18 },
      { x1: 352, y1: 18,  x2: 366, y2: 18 },
      { x1: 336, y1: 36,  x2: 350, y2: 36 },
      { x1: 336, y1: 36,  x2: 350, y2: 36 },
      { x1: 320, y1: 36,  x2: 334, y2: 36 },
      { x1: 320, y1: 54,  x2: 334, y2: 54 },
      { x1: 320, y1: 72,  x2: 334, y2: 72 },
      { x1: 320, y1: 90,  x2: 334, y2: 90 }
    ]

    const sprajty = [
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "up"),    src2: this.pobierzSrcRzutu(kolorA, "down"), dx2: 0, dy1: -14,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "left"),  src2: this.pobierzSrcRzutu(kolorA, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "up"),    src2: this.pobierzSrcRzutu(kolorB, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "up"),    src2: this.pobierzSrcRzutu(kolorA, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "left"),  src2: this.pobierzSrcRzutu(kolorA, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "up"),    src2: this.pobierzSrcRzutu(kolorB, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "up"),    src2: this.pobierzSrcRzutu(kolorA, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "left"),  src2: this.pobierzSrcRzutu(kolorA, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "up"),    src2: this.pobierzSrcRzutu(kolorB, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "up"),    src2: this.pobierzSrcRzutu(kolorA, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "left"),  src2: this.pobierzSrcRzutu(kolorA, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "up"),    src2: this.pobierzSrcRzutu(kolorB, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "up"),    src2: this.pobierzSrcRzutu(kolorA, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorB, "left"),  src2: this.pobierzSrcRzutu(kolorA, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "up"),    src2: this.pobierzSrcRzutu(kolorB, "down"),  dx2: 0,  dy1: -14, dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 16, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 14, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 14, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 14, dy1: 0,   dy2: 0  },
      { src1: this.pobierzSrcRzutu(kolorA, "left"),  src2: this.pobierzSrcRzutu(kolorB, "right"), dx2: 14, dy1: 0,   dy2: 0  }
    ]

    let index = 0

    const pokazKlatke = () => {
      if (this.gameover === true) {
        lewaPolowka.remove()
        prawaPolowka.remove()
        return
      }

      const klatka = klatki[index]!
      const sprite = sprajty[index]!

      if (index <= 3) {
        this.aktualnaKlatkaReki = 0
      }
      else if (index <= 6) {
        this.aktualnaKlatkaReki = 1
      }
      else if (index <= 18) {
        this.aktualnaKlatkaReki = 2
      }
      else {
        this.aktualnaKlatkaReki = 3
      }

      this.rysujKlatkeReki()

      lewaPolowka.src = sprite.src1
      prawaPolowka.src = sprite.src2

      lewaPolowka.style.left = klatka.x1 + "px"
      lewaPolowka.style.top = klatka.y1 + sprite.dy1 + "px"

      prawaPolowka.style.left = klatka.x1 + sprite.dx2 + "px"
      prawaPolowka.style.top = klatka.y1 + sprite.dy2 + "px"

      index = index + 1

      if (index < klatki.length) {
        setTimeout(pokazKlatke, 20)
      }
      else {
        lewaPolowka.remove()
        prawaPolowka.remove()

        this.przywrocGrafikeDoktora()
        this.stworzNowaTabletkeBezAnimacji()

        if (previewBox !== null) {
          previewBox.style.visibility = "visible"
        }

        this.animacjaRzutuTrwa = false
        this.rysujPreviewTabletki()
        this.rysujCalaGre()
      }
    }

    pokazKlatke()
  }

  pobierzKlatkeRzutu(index: number, kolorA: KolorPola, kolorB: KolorPola) {
    const cykl = index % 4

    if (cykl === 0) {
      return {
        src1: this.pobierzSrcRzutu(kolorA, "left"),
        src2: this.pobierzSrcRzutu(kolorB, "right"),
        dx2: 16,
        dy1: 0,
        dy2: 0
      }
    }

    if (cykl === 1) {
      return {
        src1: this.pobierzSrcRzutu(kolorB, "up"),
        src2: this.pobierzSrcRzutu(kolorA, "down"),
        dx2: 0,
        dy1: -14,
        dy2: 0
      }
    }

    if (cykl === 2) {
      return {
        src1: this.pobierzSrcRzutu(kolorB, "left"),
        src2: this.pobierzSrcRzutu(kolorA, "right"),
        dx2: 16,
        dy1: 0,
        dy2: 0
      }
    }

    return {
      src1: this.pobierzSrcRzutu(kolorA, "up"),
      src2: this.pobierzSrcRzutu(kolorB, "down"),
      dx2: 0,
      dy1: -14,
      dy2: 0
    }
  }
  
  pokazLiczbe(idElementu: string, liczba: number, ileCyfr: number) {
    const element = document.getElementById(idElementu)

    if (element === null) {
      return
    }

    element.innerHTML = ""

    const tekst = String(liczba).padStart(ileCyfr, "0")

    for (let i = 0; i < tekst.length; i++) {
      const cyfra = tekst[i]!
      const img = document.createElement("img")
      img.src = `../dist/img/cyfry/${cyfra}.png`
      img.alt = cyfra
      element.appendChild(img)
    }
  }
  
  ustawPozycjeWirusowWLupie() {
    this.pozycjeWirusowWLupie = [
      { x: 68, y: 18 },
      { x: 80, y: 22 },
      { x: 98, y: 34 },
      { x: 108, y: 54 },
      { x: 104, y: 78 },
      { x: 90, y: 96 },
      { x: 66, y: 108 },
      { x: 40, y: 104 },
      { x: 20, y: 92 },
      { x: 12, y: 74 },
      { x: 16, y: 50 },
      { x: 30, y: 30 },
      { x: 48, y: 20 }
    ]
  }

  stworzWirusyWLupie() {
    this.wirusyWLupie = [
      {
        kolor: "yellow",
        indeksPozycji: 0,
        klatka: 2,
        licznikKlatek: 0,
        oczekujeRuchu: false
      },
      {
        kolor: "blue",
        indeksPozycji: 4,
        klatka: 2,
        licznikKlatek: 0,
        oczekujeRuchu: false
      },
      {
        kolor: "red",
        indeksPozycji: 8,
        klatka: 2,
        licznikKlatek: 0,
        oczekujeRuchu: false
      }
    ]
  }

  pobierzSrcLupy(kolor: "red" | "blue" | "yellow", klatka: number): string {
    if (kolor === "red") {
      return `../dist/img/lupa/br/${klatka}.png`
    }

    if (kolor === "blue") {
      return `../dist/img/lupa/bl/${klatka}.png`
    }

    return `../dist/img/lupa/yl/${klatka}.png`
  }

  nastepnyIndeksLupyPrzeciwnieDoWskazowek(indeks: number): number {
    const przejscia: number[] = [
      12,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11
    ]

    return przejscia[indeks]!
  }

  rysujWirusyWLupie() {
    const lupaBox = document.getElementById("lupaBox")

    if (lupaBox === null) {
      return
    }

    lupaBox.innerHTML = ""

    for (let i = 0; i < this.wirusyWLupie.length; i++) {
      const wirus = this.wirusyWLupie[i]!
      const pozycja = this.pozycjeWirusowWLupie[wirus.indeksPozycji]!

      const img = document.createElement("img")
      img.src = this.pobierzSrcLupy(wirus.kolor, wirus.klatka)
      img.className = "wirusLupa"
      img.style.left = pozycja.x + "px"
      img.style.top = pozycja.y + "px"

      lupaBox.appendChild(img)
    }
  }

  aktualizujWirusyWLupie() {
    for (let i = 0; i < this.wirusyWLupie.length; i++) {
      const wirus = this.wirusyWLupie[i]!

      if (wirus.oczekujeRuchu === true) {
        wirus.indeksPozycji = this.nastepnyIndeksLupyPrzeciwnieDoWskazowek(wirus.indeksPozycji)
        wirus.klatka = 2
        wirus.oczekujeRuchu = false
        continue
      }

      if (wirus.klatka === 2 && wirus.licznikKlatek === 0) {
        wirus.klatka = 1
        wirus.licznikKlatek = 1
        continue
      }

      if (wirus.klatka === 1) {
        wirus.klatka = 2
        continue
      }

      if (wirus.klatka === 2 && wirus.licznikKlatek === 1) {
        wirus.klatka = 3
        wirus.licznikKlatek = 0
        continue
      }

      if (wirus.klatka === 3) {
        wirus.klatka = 2
        wirus.oczekujeRuchu = true
        continue
      }
    }
  }

  uruchomAnimacjeLupy() {
    let animacjaWirusow = setInterval(() => {
      if (this.gameover === true) {
        this.aktualizujWirusyWLupieGameOver()
        this.rysujWirusyWLupie()
        return
      }

      if (this.stagecompleted === true) {
        clearInterval(animacjaWirusow)
      }

      this.aktualizujWirusyWLupie()
      this.rysujWirusyWLupie()
    }, 200)
  }

  aktualizujWirusyWLupieGameOver() {
    for (let i = 0; i < this.wirusyWLupie.length; i++) {
      const wirus = this.wirusyWLupie[i]!

      wirus.licznikKlatek = wirus.licznikKlatek + 1

      if (wirus.licznikKlatek >= 2) {
        wirus.licznikKlatek = 0

        if (wirus.klatka === 2) {
          wirus.klatka = 4
        }
        else {
          wirus.klatka = 2
        }
      }
    }
  }

  rysujPlansze() {
    for (let numerWiersza = 0; numerWiersza < wiersze; numerWiersza++) {
      for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
        const polePlanszy = this.plansza[numerWiersza]![numerKolumny]!
        const kolorPola = polePlanszy.kolor

        if (kolorPola !== null) {
          if (this.poleJestWAnimacjiZbicia(numerKolumny, numerWiersza) === true) {
            if (polePlanszy.wirus === true) {
              rysujZbityWirus(numerKolumny, numerWiersza, kolorPola)
            }
            else {
              rysujZbitaTabletke(numerKolumny, numerWiersza, kolorPola)
            }
          }
          else if (polePlanszy.wirus === true) {
            rysujWirus(numerKolumny, numerWiersza, kolorPola)
          }
          else {
            const typGrafiki = this.pobierzTypGrafikiDlaPolaZTabeli(numerKolumny, numerWiersza)
            rysujPolowkeTabletki(numerKolumny, numerWiersza, kolorPola, typGrafiki)
          }
        }
      }
    }
  }

  rysujTabletke() {
    if (this.gameover === true || this.stagecompleted === true || this.aktywnaTabletka === false) {
      return
    }

    const polaTabletki = this.aktualnaTabletka.pobierzPolaTabletki();

    for (let i = 0; i < polaTabletki.length; i++) {
      const jednoPole = polaTabletki[i]!

      if (jednoPole.kolor === null) {
        continue
      }

      let typGrafiki = "left"

      if (this.aktualnaTabletka.kierunek === 0) {
        if (i === 0) typGrafiki = "left"
        if (i === 1) typGrafiki = "right"
      }

      if (this.aktualnaTabletka.kierunek === 1) {
        if (i === 0) typGrafiki = "up"
        if (i === 1) typGrafiki = "down"
      }

      if (this.aktualnaTabletka.kierunek === 2) {
        if (i === 0) typGrafiki = "right"
        if (i === 1) typGrafiki = "left"
      }

      if (this.aktualnaTabletka.kierunek === 3) {
        if (i === 0) typGrafiki = "down"
        if (i === 1) typGrafiki = "up"
      }

      rysujPolowkeTabletki(jednoPole.kolumna, jednoPole.wiersz, jednoPole.kolor, typGrafiki)
    }
  }

  poleJestWAnimacjiZbicia(numerKolumny: number, numerWiersza: number): boolean {
    for (let i = 0; i < this.polaDoAnimacjiZbicia.length; i++) {
      const jednoPole = this.polaDoAnimacjiZbicia[i]!

      if (jednoPole.kolumna === numerKolumny && jednoPole.wiersz === numerWiersza) {
        return true
      }
    }

    return false
  }
  
  rysujCalaGre() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.rysujPlansze();
    this.rysujTabletke();
  }

  ruszTabletkeWLewo() {
    this.aktualnaTabletka.kolumna = this.aktualnaTabletka.kolumna - 1;

    if (this.czyTabletkaMozeTuByc() === false) {
      this.aktualnaTabletka.kolumna = this.aktualnaTabletka.kolumna + 1;
    }
  }

  ruszTabletkeWPrawo() {
    this.aktualnaTabletka.kolumna = this.aktualnaTabletka.kolumna + 1;

    if (this.czyTabletkaMozeTuByc() === false) {
      this.aktualnaTabletka.kolumna = this.aktualnaTabletka.kolumna - 1
    }
  }

  ruszTabletkeWDol() {
    if (this.czyTabletkaMozeSpascNizej() === true) {
      this.aktualnaTabletka.wiersz = this.aktualnaTabletka.wiersz + 1
    }
    else {
      this.zapiszTabletkeDoPlanszy()
      this.aktywnaTabletka = false
      this.zbijanieIOpadanie()
    }
  }

  spuscTabletkeNaDol() {
    this.tabletkaSpadaSzybko = true

    const spadanie = setInterval(() => {
      if (this.czyTabletkaMozeSpascNizej() === true) {
        this.aktualnaTabletka.wiersz = this.aktualnaTabletka.wiersz + 1
        this.rysujCalaGre()
      }
      else {
        this.zapiszTabletkeDoPlanszy()
        this.aktywnaTabletka = false
        this.zbijanieIOpadanie()
        this.tabletkaSpadaSzybko = false
        this.rysujCalaGre()
        clearInterval(spadanie)
      }
    }, 40);
  }
    
  obrocTabletkeWPrawo() {
    const staryKierunek = this.aktualnaTabletka.kierunek
    const staraKolumna = this.aktualnaTabletka.kolumna

    this.aktualnaTabletka.kierunek = this.aktualnaTabletka.kierunek + 1;

    if (this.aktualnaTabletka.kierunek > 3) {
      this.aktualnaTabletka.kierunek = 0;
    }

    if (this.czyTabletkaMozeTuByc() === true) {
      return
    }

    this.aktualnaTabletka.kolumna = this.aktualnaTabletka.kolumna - 1

    if (this.czyTabletkaMozeTuByc() === true) {
      return
    }

    this.aktualnaTabletka.kierunek = staryKierunek
    this.aktualnaTabletka.kolumna = staraKolumna
  }

  obrocTabletkeWLewo() {
    const staryKierunek = this.aktualnaTabletka.kierunek;
    const staraKolumna = this.aktualnaTabletka.kolumna;

    this.aktualnaTabletka.kierunek = this.aktualnaTabletka.kierunek - 1;

    if (this.aktualnaTabletka.kierunek < 0) {
      this.aktualnaTabletka.kierunek = 3;
    }

    if (this.czyTabletkaMozeTuByc() === true) {
      return;
    }

    this.aktualnaTabletka.kolumna = this.aktualnaTabletka.kolumna - 1;

    if (this.czyTabletkaMozeTuByc() === true) {
      return;
    }

    this.aktualnaTabletka.kierunek = staryKierunek;
    this.aktualnaTabletka.kolumna = staraKolumna;
  }

  uruchomSpadanie() {
    setInterval(() => {
      if (this.animacjaZbijania === true) {
          return
      }

      if (this.animacjaRzutuTrwa === true) {
        return
      }

      if (this.gameover === true || this.stagecompleted === true) {
        this.rysujCalaGre()
        return
      } 

      if (this.tabletkaSpadaSzybko === true) {
        return
      }
      this.ruszTabletkeWDol()
      this.rysujCalaGre()
    }, 500);
  }

  sterowanie() {
    document.addEventListener("keydown", (e) => {

      if (this.animacjaRzutuTrwa === true) {
        return
      }

      if (this.animacjaZbijania === true) {
        return
      }

      if (this.gameover === true || this.stagecompleted === true) {
        return
      }

      if (this.tabletkaSpadaSzybko === true) {
        return
      }
  
      if (e.key === "ArrowLeft" || e.key === "a") {
        this.ruszTabletkeWLewo();
        this.rysujCalaGre();
      }
      
      if (e.key === "ArrowRight" || e.key === "d") {
        this.ruszTabletkeWPrawo();
        this.rysujCalaGre();
      }
      
      if (e.key === "ArrowDown" || e.key === "s") {
        this.spuscTabletkeNaDol();
      }

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "Shift") {
        if (this.wcisnieteKlawisze[e.key] === true) {
          return;
        }

        this.wcisnieteKlawisze[e.key] = true;

        if (e.key === "ArrowUp" || e.key === "w") {
          this.obrocTabletkeWLewo();
          this.rysujCalaGre();
        }

        if (e.key === "Shift") {
          this.obrocTabletkeWPrawo();
          this.rysujCalaGre();
        }
      }

    });

    document.addEventListener("keyup", (e) => {
      this.wcisnieteKlawisze[e.key] = false;
    });
  }

  czyTabletkaJestWPlanszy() {
    const polaTabletki = this.aktualnaTabletka.pobierzPolaTabletki();

    for (let i = 0; i < polaTabletki.length; i++) {
      const jednoPole = polaTabletki[i]!;
      
      if (jednoPole.kolumna < 0) {
        return false;
      }
      else if (jednoPole.kolumna >= kolumny) {
        return false
      }
      else if (jednoPole.wiersz < 0) {
        return false
      }
      else if (jednoPole.wiersz >= wiersze) {
        return false
      }
    }

    return true
  }

  czyTabletkaMozeSpascNizej() {
    const polaTabletki = this.aktualnaTabletka.pobierzPolaTabletki();

    for (let i = 0; i < polaTabletki.length; i++) {
      const jednoPole = polaTabletki[i]!;

      if (jednoPole.wiersz + 1 >= wiersze) {
        return false
      }
      
      const polePodSpodem = this.plansza[jednoPole.wiersz + 1]![jednoPole.kolumna]!;

      if (polePodSpodem.kolor !== null) {
        return false
      }
    }
      return true
  }

  zapiszTabletkeDoPlanszy() {
    const polaTabletki = this.aktualnaTabletka.pobierzPolaTabletki()

    for (let i = 0; i < polaTabletki.length; i++) {
      const jednoPole = polaTabletki[i]!;
      
      this.plansza[jednoPole.wiersz]![jednoPole.kolumna] = {
        kolor: jednoPole.kolor,
        id: this.aktualnaTabletka.id,
        typ: i + 1,
        wirus: false,
      }
    }
  }

  getElementById(id: number): Pozycja[] {
    const znalezionePola: Pozycja[] = []

    for (let numerWiersza = 0; numerWiersza < wiersze; numerWiersza++) {
      for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
        const polePlanszy = this.plansza[numerWiersza]![numerKolumny]!

        if (polePlanszy.id === id) {
          znalezionePola.push({
            kolumna: numerKolumny,
            wiersz: numerWiersza
          })
        }
      }
    }

    if (znalezionePola.length === 2) {
      const pierwszePole = znalezionePola[0]!
      const drugiePole = znalezionePola[1]!

      if (pierwszePole.wiersz < drugiePole.wiersz) {
        znalezionePola[0] = drugiePole
        znalezionePola[1] = pierwszePole
      }
    }
    return znalezionePola
  }

  pobierzTypGrafikiDlaPolaZTabeli(numerKolumny: number, numerWiersza: number): string {
    const polePlanszy = this.plansza[numerWiersza]![numerKolumny]!

    if (polePlanszy.id === null) {
      return "dot"
    }

    const polaElementu = this.getElementById(polePlanszy.id)

    if (polaElementu.length === 1) {
      return "dot"
    }

    const poleA = polaElementu[0]!
    const poleB = polaElementu[1]!

    if (poleA.wiersz === poleB.wiersz) {
      const lewaKolumna = Math.min(poleA.kolumna, poleB.kolumna)

      if (numerKolumny === lewaKolumna) {
        return "left"
      }

      return "right"
    }

    const gornyWiersz = Math.min(poleA.wiersz, poleB.wiersz)

    if (numerWiersza === gornyWiersz) {
      return "up"
    }

    return "down"
  }

  czyElementMozeOpasc(id: number): boolean {
    const polaElementu = this.getElementById(id)

    if (polaElementu.length === 0) {
      return false
    }

    const pierwszePole = polaElementu[0]!
    const pierwszePolePlanszy = this.plansza[pierwszePole.wiersz]![pierwszePole.kolumna]

    if (pierwszePolePlanszy.wirus === true) {
      return false
    }

    if (polaElementu.length === 1) {
      const jednoPole = polaElementu[0]!

      if (jednoPole.wiersz + 1 >= wiersze) {
        return false
      }

      const polePodSpodem = this.plansza[jednoPole.wiersz + 1]![jednoPole.kolumna]

      if (polePodSpodem.kolor !== null) {
        return false
      }
      return true;
    }
      
      if (polaElementu.length === 2) {
        const drugiePole = polaElementu[1]!

        if (pierwszePole.wiersz === drugiePole.wiersz) {
          if (pierwszePole.wiersz + 1 >= wiersze) {
            return false
          }

          const polePodPierwszym = this.plansza[pierwszePole.wiersz + 1]![pierwszePole.kolumna]
          const polePodDrugim = this.plansza[drugiePole.wiersz + 1]![drugiePole.kolumna]

          if (polePodPierwszym.kolor !== null) {
            return false
          }

          if (polePodDrugim.kolor !== null) {
            return false
          }

          return true
        }

        if (pierwszePole.wiersz + 1 >= wiersze) {
          return false
        }

        const polePodSpodem = this.plansza[pierwszePole.wiersz + 1]![pierwszePole.kolumna]

        if (polePodSpodem.kolor !== null) {
          return false
        }
        return true
      }
      return false
  }

  opuscElement(id: number) {
    const polaElementu = this.getElementById(id)

    if (polaElementu.length === 0) {
      return
    }

    const zapisanePola: PolePlanszy[] = []

    for (let i = 0; i < polaElementu.length; i++) {
      const jednoPole = polaElementu[i]
      const polePlanszy = this.plansza[jednoPole.wiersz]![jednoPole.kolumna]

      zapisanePola.push({
        kolor: polePlanszy.kolor,
        id: polePlanszy.id,
        typ: polePlanszy.typ,
        wirus: polePlanszy.wirus
      })
    }

    for (let i = 0; i < polaElementu.length; i++) {
      const jednoPole = polaElementu[i]

      this.plansza[jednoPole.wiersz]![jednoPole.kolumna] = {
        kolor: null,
        id: null,
        typ: null,
        wirus: false
      }
      
    }

    for (let i = 0; i < polaElementu.length; i++) {
      const jednoPole = polaElementu[i]!
      const zapisanePole = zapisanePola[i]!

      this.plansza[jednoPole.wiersz + 1]![jednoPole.kolumna] = {
        kolor: zapisanePole.kolor,
        id: zapisanePole.id,
        typ: zapisanePole.typ,
        wirus: zapisanePole.wirus
      }
      
    }
  }

  opuscWszystkoNaRaz(): boolean {
    let czyCosOpadlo = false

    const sprawdzoneId: number[] = []

    for (let numerWiersza = wiersze - 1; numerWiersza >= 0; numerWiersza--) {
      for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
        const polePlanszy = this.plansza[numerWiersza]![numerKolumny]

        if (polePlanszy.id === null) {
          continue
        }

        let byloId = false

        for (let i = 0; i < sprawdzoneId.length; i++) {
          if (sprawdzoneId[i] === polePlanszy.id) {
            byloId = true
          }
        }

          if (byloId === true) {
            continue
          }

          sprawdzoneId.push(polePlanszy.id)

          if (this.czyElementMozeOpasc(polePlanszy.id) === true) {
            this.opuscElement(polePlanszy.id)
            czyCosOpadlo = true
          }
      }
    }
      return czyCosOpadlo
  }

  opadnijWszystko(coDalej: () => void) {
    const czyCosOpadlo = this.opuscWszystkoNaRaz()
    this.rysujCalaGre()

    if (czyCosOpadlo === true) {
      setTimeout(() => {
        this.opadnijWszystko(coDalej)
      }, 120);
    }
    else {
      coDalej()
    }
  }

  zbijanieIOpadanie() {
    const wszystkieZbitePola = this.sprawdzCzyCosDoZbicia()

    if (wszystkieZbitePola.length === 0) {
      this.animacjaZbijania = false
      this.stworzNowaTabletke()
      this.rysujCalaGre()
      return
    }

    this.animacjaZbijania = true
    this.polaDoAnimacjiZbicia = wszystkieZbitePola
    this.rysujCalaGre()

    setTimeout(() => {
      this.usunZbiteTabletki()
      this.polaDoAnimacjiZbicia = []
      this.rysujCalaGre()

      this.opadnijWszystko(() => {
        const kolejneZbicia = this.sprawdzCzyCosDoZbicia()
        
        if (kolejneZbicia.length > 0) {
          this.zbijanieIOpadanie()
        }
        else {
          this.animacjaZbijania = false

          this.policzWirusy()

          if (this.liczbaWirusow === 0) {
            this.stagecompleted = true
            this.rysujCalaGre()
            this.aktualizujPanel()
            return
          }

          this.stworzNowaTabletke()
          this.rysujCalaGre()
        }
      })
    }, 100);
  }

  zapiszPunktyDoLocalStorage() {
    localStorage.setItem("punktyDrMario", String(this.punkty))
  }

  wyzerowaniePunktow() {
    this.punkty = 0
    this.zapiszPunktyDoLocalStorage()
    this.aktualizujPanel()
  }

  znajdzZbiciaWPoziomie(): Pole[] {
    const zbitePola: Pole[] = []

    for (let numerWirersza = 0; numerWirersza < wiersze; numerWirersza++) {
      let aktualnyKolor: KolorPola = null
      let ileTychSamych = 0;
      let startKolumny = 0;

      for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
        const polePlanszy = this.plansza[numerWirersza]![numerKolumny]!;
        const kolorPola = polePlanszy.kolor
        
        if (kolorPola !== null && kolorPola === aktualnyKolor) {
          ileTychSamych = ileTychSamych + 1
        }
        else {
          if (aktualnyKolor !== null && ileTychSamych >= 4) {
            for (let i = 0; i < ileTychSamych; i++) {
              zbitePola.push({
                kolumna: startKolumny + i,
                wiersz: numerWirersza,
                kolor: aktualnyKolor,
              })
            }
          }

          aktualnyKolor = kolorPola
          ileTychSamych = 1
          startKolumny = numerKolumny
        }
      }
      
      if (aktualnyKolor !== null && ileTychSamych >= 4) {
        for (let i = 0; i < ileTychSamych; i++) {
          zbitePola.push({
            kolumna: startKolumny + i,
            wiersz: numerWirersza,
            kolor: aktualnyKolor,
          })
        }
      }
    }
    return zbitePola;
  }

  znajdzZbiciaWPionie(): Pole[] {
    const zbitePola: Pole[] = []

    for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
      let aktualnyKolor: KolorPola = null
      let ileTychSamych = 0
      let startWiersza = 0
      
      for (let numerWiersza = 0; numerWiersza < wiersze; numerWiersza++) {
        const polePlanszy = this.plansza[numerWiersza]![numerKolumny]!
        const kolorPola = polePlanszy.kolor

        if (kolorPola !== null && kolorPola === aktualnyKolor) {
          ileTychSamych = ileTychSamych + 1
        }
        else {
          if (aktualnyKolor !== null && ileTychSamych >= 4) {
            for (let i = 0; i < ileTychSamych; i++) {
              zbitePola.push({
                kolumna: numerKolumny,
                wiersz: startWiersza + i,
                kolor: aktualnyKolor
              })
            }
          }

          aktualnyKolor = kolorPola
          ileTychSamych = 1
          startWiersza = numerWiersza
        }
      }

      if (aktualnyKolor !== null && ileTychSamych >= 4) {
        for (let i = 0; i < ileTychSamych; i++) {
          zbitePola.push({
            kolumna: numerKolumny,
            wiersz: startWiersza + i,
            kolor: aktualnyKolor
          })
        }
      }
    }
    return zbitePola
  }

  sprawdzCzyCosDoZbicia(): Pole[] {
    const zbiciaWPionie = this.znajdzZbiciaWPionie()
    const zbiciaWPoziomie = this.znajdzZbiciaWPoziomie()
    const wszystkieZbitePola: Pole[] = []

    for (let i = 0; i < zbiciaWPionie.length; i++) {
      wszystkieZbitePola.push(zbiciaWPionie[i]!)
    }

    for (let i = 0; i < zbiciaWPoziomie.length; i++) {
      wszystkieZbitePola.push(zbiciaWPoziomie[i]!)
    }

    return wszystkieZbitePola
  }

  dodajPunktyZaWirusy(ileWirusow: number) {
    this.punkty = this.punkty + ileWirusow * 100
    if (this.punkty > this.rekord) {
      this.rekord = this.punkty
      this.zapiszRekordDoLocalStorage()
    }
    this.zapiszPunktyDoLocalStorage()
    this.aktualizujPanel()
    console.log("Punkty: " + this.punkty)
    console.log("Rekord: " + this.rekord)
  }

  usunZbiteTabletki() {
  const wszystkieZbitePola = this.sprawdzCzyCosDoZbicia()
  let ileZbitychWirusow = 0

  for (let i = 0; i < wszystkieZbitePola.length; i++) {
    const jednoPole = wszystkieZbitePola[i]!
    const polePlanszy = this.plansza[jednoPole.wiersz]![jednoPole.kolumna]!

    if (polePlanszy.wirus === true) {
      ileZbitychWirusow = ileZbitychWirusow + 1
    }
  }

  this.dodajPunktyZaWirusy(ileZbitychWirusow)

  const idsDoSprawdzenia: number[] = []

    for (let i = 0; i < wszystkieZbitePola.length; i++) {
      const jednoPole = wszystkieZbitePola[i]!
      const polePlanszy = this.plansza[jednoPole.wiersz]![jednoPole.kolumna]!

      if (polePlanszy.id !== null) {
        let juzJest = false

        for (let j = 0; j < idsDoSprawdzenia.length; j++) {
          if (idsDoSprawdzenia[j] === polePlanszy.id) {
            juzJest = true
          }
        }

        if (juzJest === false) {
          idsDoSprawdzenia.push(polePlanszy.id)
        }
      }
    }

    for (let i = 0; i < wszystkieZbitePola.length; i++) {
      const jednoPole = wszystkieZbitePola[i]!

      this.plansza[jednoPole.wiersz]![jednoPole.kolumna] = {
        kolor: null,
        id: null,
        typ: null,
        wirus: false
      }
    }

    for (let i = 0; i < idsDoSprawdzenia.length; i++) {
      const id = idsDoSprawdzenia[i]!
      const polaElementu = this.getElementById(id)

      if (polaElementu.length === 1) {
        const jednoPole = polaElementu[0]!
        const polePlanszy = this.plansza[jednoPole.wiersz]![jednoPole.kolumna]!

        polePlanszy.id = this.nastepneIdTabletki
        this.nastepneIdTabletki = this.nastepneIdTabletki + 1
      }
    }

    this.policzWirusy()

    this.aktualizujPanel()
  }

  stworzNowaTabletkeBezAnimacji() {
    this.aktualnaTabletka = new Tabletka(
      this.nastepneIdTabletki,
      this.nastepnaTabletkaKolory[0],
      this.nastepnaTabletkaKolory[1]
    );

    this.nastepneIdTabletki = this.nastepneIdTabletki + 1
    this.nastepnaTabletkaKolory = [this.losujKolor(), this.losujKolor()]
    this.aktywnaTabletka = true
    this.rysujPreviewTabletki()

    if (this.czyTabletkaMozeTuByc() === false) {
      this.gameover = true
      this.aktywnaTabletka = false
      this.aktualizujPanel()
      return
    }

    this.aktualizujPanel()
  }

  stworzNowaTabletke() {
    this.rzucNowaTabletke()
  }

  czyTabletkaMozeTuByc() {
  const polaTabletki = this.aktualnaTabletka.pobierzPolaTabletki();

  for (let i = 0; i < polaTabletki.length; i++) {
    const jednoPole = polaTabletki[i]!;

    if (jednoPole.kolumna < 0) {
      return false;
    }

    if (jednoPole.kolumna >= kolumny) {
      return false;
    }

    if (jednoPole.wiersz < 0) {
      return false;
    }

    if (jednoPole.wiersz >= wiersze) {
      return false;
    }

    const poleNaPlanszy = this.plansza[jednoPole.wiersz]![jednoPole.kolumna]!;

    if (poleNaPlanszy.kolor !== null) {
      return false;
    }
  }
  
  return true;
  }

  policzWirusy() {
    let ileWirusow = 0

    for (let numerWiersza = 0; numerWiersza < wiersze; numerWiersza++) {
      for (let numerKolumny = 0; numerKolumny < kolumny; numerKolumny++) {
        const polePlanszy = this.plansza[numerWiersza]![numerKolumny]

        if (polePlanszy.wirus === true) {
          ileWirusow = ileWirusow + 1
        }
      }
    }
    
    this.liczbaWirusow = ileWirusow
  }
}