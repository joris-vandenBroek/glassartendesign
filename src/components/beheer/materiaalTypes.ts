export interface Materiaalsoort {
  id: string;
  omschrijving: string;
}

export interface Materiaal {
  id: string;
  materiaalsoortId: string;
  materiaaldikte: number;
  omschrijving: string;
}

export interface Maat {
  id: string;
  breedte: number;
  hoogte: number;
}
