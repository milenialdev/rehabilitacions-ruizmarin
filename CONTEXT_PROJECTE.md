# Projecte: Web Rehabilitacions Ruíz Marín

> Document de context per continuar el projecte a Claude Code o VS Code.
> Última actualització: reflecteix l'estat amb Decap CMS ja funcionant.

## Resum
Web per a una empresa familiar de rehabilitació de façanes a Badalona (Catalunya). Projecte real per a un amic, que també serveix com a peça de portfolio. Stack: vanilla HTML/CSS/JS (sense frameworks) + Decap CMS + Netlify + GitHub.

## Client
- **Nom empresa:** Rehabilitacions Ruíz Marín
- **Serveis:** Rehabilitació de façanes, impermeabilitzacions, treballs en altura
- **Zona:** Badalona i província de Barcelona
- **Telèfon:** 689 24 29 68
- **Email:** rehabilitacionsruizmarin@gmail.com
- **Idioma de la web:** Català
- **Logo:** Logo azul.svg (color teal/turquesa #18B4CC)
- **Important:** el client NO té coneixements tècnics → el panell d'administració ha de ser el més senzill possible.

## Infraestructura (TOT JA CONFIGURAT I FUNCIONANT)
- **Repositori GitHub:** `milenialdev/rehabilitacions-ruizmarin` (públic)
- **Hosting:** Netlify, projecte `rehabilitacions-ruizmarin`
- **URL en viu:** https://rehabilitacions-ruizmarin.netlify.app
- **Compte de Netlify:** creat amb el correu de l'empresa (no el personal del desenvolupador)
- **Deploy:** automàtic a cada `git push` a la branca `main` (sense build command ni publish directory, és HTML pur)

## Estat del CMS (FUNCIONANT)
- **Decap CMS** instal·lat via CDN (`decap-cms@^3.0.0`), versió que carrega 3.16.0.
- Fitxers creats:
  - `/admin/index.html` — carrega l'script de Decap des de CDN (NOMÉS l'script dins del `<body>`, sense cap `<div id="nc-root">` — afegir-lo trencava el panell)
  - `/admin/config.yml` — defineix la col·lecció "treballs"
- **Netlify Identity:** activat. Convidat l'usuari `carlosbenitoandev@gmail.com`, que ha confirmat invitació i creat contrasenya. (El camp "No role set" és normal i NO impedeix l'accés — no calen rols.)
- **Git Gateway:** activat i autoritzat contra GitHub. Va donar l'error "Git Gateway backend is not returning valid settings" fins que es va fer un **redeploy** (Trigger deploy) que va aprovisionar l'endpoint `/.netlify/git/settings`. Després va funcionar.
- **Widget de Netlify Identity** afegit a `index.html` principal:
  - `<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>` abans de `</head>`
  - Script de redirecció a `/admin/` al `login`, abans de `</body>`
- **PROVAT:** el client pot entrar a `/admin`, crear un treball, pujar foto i publicar. Es guarda correctament a GitHub.

### config.yml actual (funcionant, NO afegir-hi `roles` ni duplicar `media_folder`)
```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "imatges"
public_folder: "/imatges"

collections:
  - name: "treballs"
    label: "Treballs realitzats"
    folder: "_treballs"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Títol", name: "title", widget: "string", required: true }
      - { label: "Categoria", name: "categoria", widget: "select", options: ["Façanes", "Impermeabilitzacions", "Treballs en altura"], required: true }
      - { label: "Ubicació", name: "ubicacio", widget: "string", required: true }
      - { label: "Foto", name: "foto", widget: "image", required: true }
      - { label: "Descripció", name: "descripcio", widget: "text" }
```

### Exemple de treball guardat (a `_treballs/*.md`)
```
---
title: Test
categoria: Façanes
ubicacio: Badalona
foto: /imatges/mur-474x203.webp
descripcio: Obra test a badalona
---
```
Les imatges es guarden a la carpeta `/imatges/` del repositori.

## EL PAS PENDENT ARA MATEIX (la peça que falta)
El CMS **guarda** treballs correctament, però la web **encara no els mostra**. La secció de treballs de l'`index.html` (`<div class="treballs-grid rv">`, cap a la línia 607) encara conté les targetes placeholder estàtiques escrites a mà.

**Cal connectar la lectura:** una web estàtica vanilla no pot llistar la carpeta `_treballs` per si sola. Com que el repo és públic, la solució triada és **llegir els `.md` via l'API pública de GitHub** des del navegador (sense token).

### Solució acordada (PENDENT D'APLICAR I PROVAR)
1. Substituir el contingut de `<div class="treballs-grid rv">` per un contenidor amb `id="treballs-grid"` i un placeholder de "Carregant treballs...".
2. Afegir un script abans de `</body>` que:
   - Fa `fetch` a `https://api.github.com/repos/milenialdev/rehabilitacions-ruizmarin/contents/_treballs`
   - Filtra els `.md`, descarrega cada `download_url`, parseja el frontmatter (title, categoria, ubicacio, foto, descripcio)
   - Genera les targetes `.t-card` dins del grid bento (reaprofitant els spans existents del CSS)
   - Si no hi ha treballs o falla, manté els placeholders
3. `git add . && commit && push`, esperar deploy, recarregar i verificar que el treball "Test" apareix amb la foto.

**Nota tècnica:** l'API pública de GitHub té límit de 60 peticions/hora per IP sense autenticar. Per pocs treballs és suficient, però si en el futur hi ha molts treballs o molt trànsit, convindria migrar a un generador estàtic (Eleventy/Hugo) o generar un `treballs.json` índex. De moment, per l'escala del client, l'API de GitHub n'hi ha prou.

## Disseny actual de la web
- Estètica moderna inspirada en la referència "Visune": hero fosc, tipografia serif elegant (Instrument Serif + Instrument Sans), targetes amb cantonades arrodonides, botons pill.
- Seccions: Nav, Hero (amb stats), Serveis (3 targetes amb 3 variants de fons: clar/fosc/fosc-mig), Treballs (bento grid), bloc CTA fosc gran "Tens un projecte? Parlem." que enllaça a contacte, Nosaltres, Contacte (formulari + dades), Footer.
- Color corporatiu: teal #18B4CC.
- L'usuari considera l'`index.html` actual com un "mockup" base: vol seguir millorant el disseny iterativament.

## Pendents més enllà del pas actual
1. **[URGENT] Mostrar els treballs reals a la web** (script API GitHub, descrit a dalt)
2. Formulari de contacte: encara no envia res de debò. Cal connectar-lo a **Netlify Forms** (el més senzill, ja que estem a Netlify) o Formspree/EmailJS. Recordar afegir `data-netlify="true"` si s'usa Netlify Forms.
3. Pujar fotos reals dels treballs (pendents que el client en faci)
4. Continuar millorant el disseny iterativament
5. **Domini .cat** (FASE FINAL): comprar a **SW Hosting** (millor preu: alta 5,75€ / renovació 17,75€). Raó d'ús per puntCAT ja redactada ("empresa de rehabilitació de façanes a Badalona, web en català"). Després apuntar DNS a Netlify (Domain settings → Add custom domain). Es deixa per al final expressament.

## Preferències de l'usuari (Carlos)
- En transició cap a tech (frontend + data analyst), ve d'educació i disseny gràfic.
- Prefereix entendre el "per què" de cada decisió, no copiar-enganxar sense més.
- Treballa a Windows amb Git Bash + VS Code.
- Vol fer servir Claude Code / VS Code per continuar el desenvolupament local.
- Idioma de treball: castellà (la web, en català).

## Estructura d'arxius actual
```
rehabilitacions-ruizmarin/
├── admin/
│   ├── config.yml
│   └── index.html
├── imatges/              (imatges pujades pel CMS)
├── _treballs/            (fitxers .md dels treballs creats al CMS)
├── index.html           (web principal)
├── Logo azul.svg
└── CONTEXT_PROJECTE.md
```
