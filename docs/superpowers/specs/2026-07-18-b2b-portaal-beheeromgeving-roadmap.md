# Roadmap: Echte B2B-portaal & Beheeromgeving (toekomstig, niet voor directe bouw)

## Status

**Dit is GEEN spec voor een deelproject dat nu gebouwd wordt.** Dit document legt requirements vast die de klant heeft aangegeven, zodat ze niet verloren gaan — maar de bouw ervan vereist een fundamenteel andere architectuur (echte backend, database, authenticatie, facturatie) dan de huidige, volledig statische site (`output: 'export'`, geen server, geen middleware). Dit hoort bij de "B2B-portaal" en "Beheeromgeving" uit de oorspronkelijke afspraken, die toen al bewust als aparte, latere deelprojecten zijn benoemd.

Zodra dit deelproject aan de beurt is, doorloopt het alsnog het volledige traject: brainstorm → architectuurkeuze (auth-provider, database, hosting die een backend ondersteunt) → spec → implementatieplan.

## Website — paginastructuur en functionaliteit

Voor een compleet beeld: dit is de volledige paginastructuur en functionaliteit die de website moet bieden. De echte backend/beheeromgeving hieronder moet al deze onderdelen ondersteunen, niet alleen de nieuwe beheerfunctie-punten.

- **Homepage** — hero met korte pitch, "Over ons"-sectie, "Waarom Glassart & Design" met USP-iconen en een overzicht van materiaalsoorten, uitgelichte werken, contactsamenvatting.
- **Collecties-pagina** — overzicht van kunstwerken, gefilterd per segment (Hotel, Restaurant, Wellness, Kantoor, Abstract, Artist Collections). Klikken op een kunstwerk opent een detailweergave (maat kiezen, aantal, toevoegen aan winkelmandje).
- **Winkelmandje** — icoon met aantal-badge in de navigatiebalk, overzicht van gekozen items, bestelling plaatsen (resulteert in een orderaanvraag met status "Aangevraagd").
- **Contactpagina** — bezoekadres met routebeschrijving, contactpersonen per doelgroep (projecten/hotels vs. zakelijke klanten), e-mail, WhatsApp, openingstijden, bedrijfsgegevens (KvK, BTW, IBAN), contactformulier.
- **"Word klant"-pagina** — aanvraagformulier voor een nieuw klantaccount: keuze Zakelijk/Particulier (Zakelijk standaard), bedrijfsgegevens (naam, KvK, contactpersoon), adres met optioneel afwijkend aflever- en factuuradres, e-mailadres, telefoonnummer, wachtwoord (met bevestiging), voorkeur voor contactvorm (e-mail/telefonisch/WhatsApp).
- **Klant-accountpagina** — bereikbaar via het account-icoon na inloggen, met een linker menu en zes onderdelen: Bestellingen, Te betalen facturen, Betaalde facturen, Retourneren (bestelling selecteren + reden en toelichting opgeven), Gesprekgeschiedenis (WhatsApp-gesprekken), Instellingen (klantgegevens, wachtwoord, contactvoorkeur en taalvoorkeur wijzigen).
- **Taalkeuze** — bezoeker kan schakelen tussen Nederlands, Engels, Duits en Frans; de hele site, inclusief alle bovenstaande pagina's, moet in alle vier de talen beschikbaar zijn.
- **Merkidentiteit** — logo en merknaam in de navigatiebalk, consistente huisstijl (zwart/zilver met goud accent) door de hele site heen.

## Beheerfunctie (voor het bedrijf)

- Beoordelen van nieuwe klantaanvragen (goedkeuren/afwijzen, koppelen aan een prijsgroep — zie de oorspronkelijke afspraken) en daarmee vrijgeven dat die klant prijzen mag zien (prijzen blijven verborgen/afgeschermd totdat een klant is goedgekeurd).
- Beoordelen van nieuwe orderaanvragen (de bestellingen die klanten vanuit het winkelmandje plaatsen, status "Aangevraagd").
- Een order aanmaken voor de drukker op basis van een aangevraagde bestelling.
- Zodra een bestelling is doorgezet naar de drukker: status wijzigt automatisch van "Aangevraagd" naar "In productie".
- Factuur maken voor een bestelling, met keuze van prijsgroep (hoe dit zich verhoudt tot de per-klant-prijsgroep uit de goedkeuringsstap moet nog worden uitgewerkt bij de daadwerkelijke brainstorm/spec).
- Betaling van een factuur kunnen afhandelen: status van de factuur wijzigen naar "Betaald" (open vraag voor de daadwerkelijke brainstorm: gebeurt dit handmatig na een bankoverschrijving, of via een koppeling met een online betaalprovider zoals iDEAL/Mollie die de status automatisch bijwerkt?).
- Afhandelen van retouren die klanten via hun accountpagina aanmelden (de mock-versie in de huidige site registreert alleen de aanvraag zelf — een echte beheerkant om retouren te beoordelen/verwerken ontbreekt nog).
- Rollen/rechten voor medewerkers die in de beheeromgeving werken (bv. iemand die alleen orders mag verwerken vs. iemand die ook klanten mag goedkeuren) — exacte rolindeling nog uit te werken.
- Koppeling met een boekhoudpakket (bv. Exact, Moneybird) voor facturen/omzet/BTW, of blijft dit handmatig — nog te bepalen.
- Automatische notificaties naar de klant bij statuswijzigingen (bv. "bestelling in productie", "factuur verstuurd", "retour verwerkt") — kanaal (e-mail/WhatsApp) nog te bepalen.

### Beheer maten, kunstwerken, segmenten en materiaalsoorten

- **Maten:** beheerfunctie om maten (afmetingen) aan te maken/wijzigen, en te koppelen aan specifieke kunstwerken (niet elk kunstwerk is per se in elke maat leverbaar).
- **Kunstwerken:** beheerfunctie om kunstwerken te beheren, inclusief een beschrijving per kunstwerk. Naast de webafbeelding (met watermerk, zie hieronder) moet ook het hoge-resolutie productiebestand voor de drukker beheerd/geüpload kunnen worden — dit is een apart bestand, niet dezelfde afbeelding als de (verwaterde) webweergave.
- **Segmenten:** beheerfunctie om segmenten (Hotel, Restaurant, Wellness, etc.) te beheren met een beschrijving; een kunstwerk moet aan één of meerdere segmenten gekoppeld kunnen worden (dus een N-op-N-relatie, geen kunstwerk gebonden aan precies één segment).
- **Materiaalsoorten:** beheerfunctie om materiaalsoorten (4mm veiligheidsglas, acryl 3/5/10mm, dibond, akoestische stof, etc.) te beheren, én om per kunstwerk vast te leggen welke materiaalsoorten daarvoor mogelijk zijn (niet elk kunstwerk is in elk materiaal leverbaar).
- **Prijzen:** prijs kunnen toekennen aan een kunstwerk (basisprijs), plus extra kosten (toeslag) voor andere/grotere maten bovenop die basisprijs. Hoe dit precies samenhangt met de prijsgroepen (bv. is de basisprijs zelf al per prijsgroep verschillend, of is de prijsgroep een percentage/korting op één vaste basisprijs) moet nog worden uitgewerkt bij de daadwerkelijke brainstorm/spec.
- **Copyright-watermerk:** kunstwerkafbeeldingen die getoond worden (in ieder geval publiek, buiten het afgeschermde bestelproces) moeten een watermerk krijgen ter bescherming van het copyright — exacte plek/uitvoering (bv. alleen op preview-afbeeldingen, of ook op de uiteindelijke besteldata) nog uit te werken bij de daadwerkelijke brainstorm/spec.

## Datamodel (voorlopige tabellen)

Zodra dit deelproject een echte backend krijgt, zijn in ieder geval de volgende tabellen nodig (exact schema/kolommen nog te ontwerpen bij de daadwerkelijke brainstorm/spec):

- **Maten** — de beschikbare afmetingen.
- **Orders** — met een status (bv. Aangevraagd / In productie / Verzonden / Geleverd / Retour aangemeld).
- **Orderitems** — de regels binnen een order (kunstwerk, maat, materiaalsoort, aantal).
- **Facturen** — met een status (bv. Te betalen / Betaald).
- **Klanten**.
- **Prijsgroepen**.
- **Koppeltabel prijsgroep ↔ klanten** (welke klant hoort bij welke prijsgroep).
- **Prijzen** — basisprijs per kunstwerk, plus toeslagen per maat (en mogelijk per materiaalsoort/prijsgroep — exacte opzet nog te ontwerpen).
- **Rollen** (voor medewerkers in de beheeromgeving) en een koppeling medewerker ↔ rol.
- Impliciet, volgend uit de beheerfunctie hierboven: **Kunstwerken**, **Segmenten** en **Materiaalsoorten** als eigen tabellen, plus koppeltabellen kunstwerk↔segment (N-op-N) en kunstwerk↔materiaalsoort (N-op-N), en een koppeling kunstwerk↔maat.

## Klantaccount (voor de klant, ingelogd)

- Overzicht van bestellingen met status en een "opnieuw bestellen"-knop (functioneel al gemockt in de huidige site met neptdata in `localStorage`; moet in de echte versie backend-data worden).
- Overzicht van te betalen facturen.
- Overzicht van betaalde facturen.
- Gesprekken via WhatsApp (vermoedelijk een geïntegreerde weergave van WhatsApp-conversaties met het bedrijf; exacte werking — eigen inbox vs. koppeling met WhatsApp Business API — moet nog worden uitgewerkt).
- Gegevens wijzigen: wachtwoord, taalvoorkeur, contactpersoon, bedrijfsnaam, e-mailadres, telefoonnummer, adres, afleveradres.

## Taalvoorkeur gekoppeld aan account

- Zodra er echte klantaccounts zijn: taalvoorkeur opslaan bij het account (niet alleen lokaal in de browser, zoals nu), zodat een klant bij het inloggen automatisch in de eerder gekozen taal terechtkomt.
- Tot die tijd blijft taalkeuze werken zoals nu: per bezoek/browser, via de taalkeuze-knop in de navigatiebalk (zie het aparte deelproject "Taalkeuze-dropdown met vlaggen").

## Privacy / AVG

- Zodra er echte klantgegevens worden opgeslagen: een klant moet zijn account/gegevens kunnen laten verwijderen (recht op verwijdering onder de AVG). Exacte uitwerking (zelfbediening vs. aanvraag bij het bedrijf, bewaartermijn voor facturen i.v.m. boekhoudplicht) nog uit te werken bij de daadwerkelijke brainstorm/spec.

## Niet in scope van dit document

- Concrete technische keuzes (database, auth-provider, hosting) — dat gebeurt bij de daadwerkelijke brainstorm voor dit deelproject, niet hier.
- Een tijdlijn of prioriteit t.o.v. de overige openstaande deelprojecten (mandje, contactpagina, registratiepagina, logo, visuele polijst, taal-dropdown) — deze blijven vóór dit deelproject staan, zoals eerder afgesproken.
