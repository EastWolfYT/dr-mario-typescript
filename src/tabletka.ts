import { KolorPola, Pole, MaPola } from "./types";

export class Tabletka implements MaPola {
  id: number; 
  kolumna: number;
  wiersz: number;
  kierunek: number;
  kolorPierwszejCzesci: KolorPola;
  kolorDrugiejCzesci: KolorPola;

  constructor(id: number, kolor1: KolorPola, kolor2: KolorPola) {
    this.id = id;
    this.kolumna = 3;
    this.wiersz = 1;
    this.kierunek = 0;
    this.kolorPierwszejCzesci = kolor1
    this.kolorDrugiejCzesci = kolor2
  }

  pobierzPolaTabletki(): Pole[] {
    if (this.kierunek === 0) {
      return [
        {
          kolumna: this.kolumna,
          wiersz: this.wiersz,
          kolor: this.kolorPierwszejCzesci
        },
        {
          kolumna: this.kolumna + 1,
          wiersz: this.wiersz,
          kolor: this.kolorDrugiejCzesci
        },
      ]
    }

    if (this.kierunek === 1) {
      return [
        {
          kolumna: this.kolumna,
          wiersz: this.wiersz - 1,
          kolor: this.kolorPierwszejCzesci
        },
        {
          kolumna: this.kolumna,
          wiersz: this.wiersz,
          kolor: this.kolorDrugiejCzesci
        }
      ]
    }

    if (this.kierunek === 2) {
      return [
        {
          kolumna: this.kolumna + 1,
          wiersz: this.wiersz,
          kolor: this.kolorPierwszejCzesci
        },
        {
          kolumna: this.kolumna,
          wiersz: this.wiersz,
          kolor: this.kolorDrugiejCzesci
        }
      ]
    }

    return [
      {
        kolumna: this.kolumna,
        wiersz: this.wiersz,
        kolor: this.kolorPierwszejCzesci,
      },
      {
        kolumna: this.kolumna,
        wiersz: this.wiersz - 1,
        kolor: this.kolorDrugiejCzesci
      }
    ]
  }
}