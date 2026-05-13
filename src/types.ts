export type KolorPola = "red" | "blue" | "yellow" | null;


export interface Pole {
  kolumna: number;
  wiersz: number;
  kolor: KolorPola;
}

export interface WcisnieteKlawisze {
  [klawisz: string]: boolean
}

export interface MaPola {
  pobierzPolaTabletki(): Pole[];
}

export interface PolePlanszy {
  kolor: KolorPola
  id: number | null
  typ: number | null
  wirus: boolean
}

export interface Pozycja {
  kolumna: number
  wiersz: number
}