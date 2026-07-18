# Roadmap: Echte B2B-portaal & Beheeromgeving (toekomstig, niet voor directe bouw)

## Status

**Dit is GEEN spec voor een deelproject dat nu gebouwd wordt.** Dit document legt requirements vast die de klant heeft aangegeven, zodat ze niet verloren gaan — maar de bouw ervan vereist een fundamenteel andere architectuur (echte backend, database, authenticatie, facturatie) dan de huidige, volledig statische site (`output: 'export'`, geen server, geen middleware). Dit hoort bij de "B2B-portaal" en "Beheeromgeving" uit de oorspronkelijke afspraken, die toen al bewust als aparte, latere deelprojecten zijn benoemd.

Zodra dit deelproject aan de beurt is, doorloopt het alsnog het volledige traject: brainstorm → architectuurkeuze (auth-provider, database, hosting die een backend ondersteunt) → spec → implementatieplan.

## Beheerfunctie (voor het bedrijf)

- Beoordelen van nieuwe klantaanvragen (goedkeuren/afwijzen, koppelen aan een prijsgroep — zie de oorspronkelijke afspraken).
- Beoordelen van aangevraagde bestellingen (de bestellingen die klanten vanuit het winkelmandje plaatsen, status "Aangevraagd").
- Een order aanmaken voor de drukker op basis van een aangevraagde bestelling.
- Zodra een bestelling is doorgezet naar de drukker: status wijzigt automatisch van "Aangevraagd" naar "In productie".
- Factuur maken voor een bestelling, met keuze van prijsgroep (hoe dit zich verhoudt tot de per-klant-prijsgroep uit de goedkeuringsstap moet nog worden uitgewerkt bij de daadwerkelijke brainstorm/spec).

## Klantaccount (voor de klant, ingelogd)

- Overzicht van bestellingen met status en een "opnieuw bestellen"-knop (functioneel al gemockt in de huidige site met neptdata in `localStorage`; moet in de echte versie backend-data worden).
- Overzicht van te betalen facturen.
- Overzicht van betaalde facturen.
- Gesprekken via WhatsApp (vermoedelijk een geïntegreerde weergave van WhatsApp-conversaties met het bedrijf; exacte werking — eigen inbox vs. koppeling met WhatsApp Business API — moet nog worden uitgewerkt).
- Gegevens wijzigen: wachtwoord, taalvoorkeur, contactpersoon, bedrijfsnaam, e-mailadres, telefoonnummer, adres, afleveradres.

## Taalvoorkeur gekoppeld aan account

- Zodra er echte klantaccounts zijn: taalvoorkeur opslaan bij het account (niet alleen lokaal in de browser, zoals nu), zodat een klant bij het inloggen automatisch in de eerder gekozen taal terechtkomt.
- Tot die tijd blijft taalkeuze werken zoals nu: per bezoek/browser, via de taalkeuze-knop in de navigatiebalk (zie het aparte deelproject "Taalkeuze-dropdown met vlaggen").

## Niet in scope van dit document

- Concrete technische keuzes (database, auth-provider, hosting) — dat gebeurt bij de daadwerkelijke brainstorm voor dit deelproject, niet hier.
- Een tijdlijn of prioriteit t.o.v. de overige openstaande deelprojecten (mandje, contactpagina, registratiepagina, logo, visuele polijst, taal-dropdown) — deze blijven vóór dit deelproject staan, zoals eerder afgesproken.
