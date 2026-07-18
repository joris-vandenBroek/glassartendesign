# Design: Navigatie + Collectiepagina's per segment

## Context

Dit is het eerste van drie deelprojecten die de statische visitekaartje-pagina uitbreiden richting de volledige publieke website (zie de oorspronkelijke afspraken: collectiepagina's per segment, materialen, over ons, contact, "word klant"-aanvraagformulier). De andere twee deelprojecten — de contactpagina en de klantregistratiepagina — worden apart gespecificeerd en gebouwd, in die volgorde, na dit deelproject.

De bestaande site (Next.js 14, statische export, NL/EN/DE/FR, "Glass Reflection" zwart/zilver stijl) bestaat nu uit één pagina (Hero, Over ons, Uitgelichte werken, Contact-sectie). Dit deelproject voegt een echte navigatiestructuur en zes segment-collectiepagina's toe.

## Doel

Bezoekers kunnen via een navigatiemenu naar collectiepagina's per marktsegment (hotel, restaurant, wellness, office, abstract, artist collections), elk met een korte introductie en sfeerbeelden, met een duidelijke call-to-action richting het worden van klant.

## Segmenten

Zes vaste segmenten, met vaste (niet-vertaalde) URL-slugs:

| Segment | Slug |
|---|---|
| Hotel | `hotel` |
| Restaurant | `restaurant` |
| Wellness | `wellness` |
| Office | `office` |
| Abstract | `abstract` |
| Artist Collections | `artist-collections` |

## Routing

- `/[locale]/collecties` — overzichtspagina met 6 tegels (titel + 1 sfeerbeeld per segment), doorlinkend naar de segmentpagina's.
- `/[locale]/collecties/[segment]` — één generieke, data-gedreven pagina-template voor alle 6 segmenten, met `generateStaticParams` over de 6 segmenten × 4 talen (24 statische pagina's). Onbekende segment-slugs geven een 404 (`notFound()`), consistent met de bestaande locale-validatie.
- URL-slugs zijn identiek over alle 4 talen (bv. `/de/collecties/hotel`, niet `/de/collecties/hotel-de` of vertaald) — alleen de zichtbare tekst wordt vertaald, niet de URL-structuur. Dit houdt de routing eenvoudig en consistent met de bestaande architectuur (geen middleware, alles via `generateStaticParams`).

## Navigatie

Nieuwe, op alle pagina's zichtbare navigatiebalk (in dezelfde zwart/zilver "Glass Reflection"-stijl als de rest van de site), met:

- **Home** — terug naar de bestaande homepage.
- **Collecties** — dropdown met de 6 segmenten; klikken op "Collecties" zelf gaat naar de overzichtspagina.
- **Contact** — naar de (los te bouwen) contactpagina.
- **Word klant** — naar de (los te bouwen) registratiepagina.

De bestaande taalkeuzeknop (rechtsboven, altijd zichtbaar) blijft ongewijzigd en functioneert samen met deze nieuwe navigatiebalk.

## Content per segmentpagina

Elke segmentpagina bevat:

1. **Titel + korte introductietekst** — per segment, in alle 4 talen, in dezelfde toon als de bestaande "Over ons"-tekst (kort, zakelijk, uitnodigend).
2. **Galerij met 6 sfeerbeelden** — rechtenvrije stockfoto's (Unsplash/Pexels, expliciet vrij voor commercieel gebruik), passend bij de sfeer van het segment (bv. rustige spa-beelden bij Wellness, moderne kantoorinterieurs bij Office). Deze worden tijdens de implementatie per segment opgezocht en als directe afbeeldings-URL opgenomen (geen download/opslag in de repo) — later eenvoudig te vervangen door eigen fotografie van echte projecten, zonder structuurwijziging.
3. **CTA-knop "Word klant"** — linkt door naar de registratiepagina (deelproject 3).

De overzichtspagina (`/collecties`) toont voor elk van de 6 segmenten een tegel met titel en het eerste sfeerbeeld van dat segment, doorlinkend naar de bijbehorende segmentpagina.

## Visueel ontwerp

Consistent met de bestaande "Glass Reflection"-stijl: doorlopende zwart-naar-antraciet achtergrond, glasmorphism overlay-panelen (hergebruik van de bestaande `GlassPanel`-component), zilverkleurige tekst-accenten. De sfeerbeelden worden getoond binnen dezelfde soort afgeronde, subtiel omrande panelen als de huidige "Uitgelichte werken"-tegels, nu gevuld met echte foto's in plaats van gradient-placeholders.

## Niet in scope (voor dit deelproject)

- De contactpagina en de klantregistratiepagina zelf (aparte deelprojecten, hierna).
- Prijzen of bestelmogelijkheden (blijven achter login, zoals in de oorspronkelijke afspraken).
- Downloaden/lokaal opslaan van de stockfoto's — er wordt gelinkt naar de externe URL's.
- Vertaalde URL-slugs per taal.

## Risico's / aandachtspunten

- Omdat de site `output: 'export'` gebruikt met `images: { unoptimized: true }`, worden externe afbeeldingen als gewone `<img>`-tags ingeladen (geen Next.js Image-optimalisatie) — dit is consistent met de bestaande aanpak en vereist geen extra configuratie.
- De gekozen stockfoto's moeten expliciet vrij zijn voor commercieel gebruik (Unsplash/Pexels-licenties voldoen hieraan); dit wordt bij de implementatie per gekozen foto geverifieerd.
- 24 statische pagina's (6 segmenten × 4 talen) plus de overzichtspagina (4 talen) vergroten de build enigszins, maar blijven binnen de bestaande statische-export architectuur (geen middleware, geen server nodig).
