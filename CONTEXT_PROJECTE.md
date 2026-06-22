# Projecte: Web Rehabilitacions Ruíz Marín

## Resum
Web per a una empresa familiar de rehabilitació de façanes a Badalona (Catalunya). Projecte real per a un amic, que també servirà com a peça de portfolio.

## Client
- **Nom empresa:** Rehabilitacions Ruíz Marín
- **Serveis:** Rehabilitació de façanes, impermeabilitzacions, treballs en altura
- **Zona:** Badalona i província de Barcelona
- **Telèfon:** 689 24 29 68
- **Email:** rehabilitacionsruizmarin@gmail.com
- **Idioma de la web:** Català
- **Logo:** Logo_azul.png (fons transparent, color teal/turquesa #18B4CC)

## Estat actual
- `index.html` ja creat: HTML/CSS/JS pur (sense frameworks), disseny modern inspirat en l'estètica de "Visune" (fons fosc al hero, tipografia serif elegant Instrument Serif + Instrument Sans, targetes amb cantonades arrodonides, botons pill).
- Seccions ja fetes: Nav, Hero, Serveis (3 targetes), Treballs (bento grid amb placeholders esperant fotos reals), bloc CTA fosc "Tens un projecte? Parlem.", Nosaltres, Contacte (formulari + dades de contacte), Footer.
- **Falten fotos reals dels treballs** — de moment hi ha placeholders visuals.
- Decisió presa: **vanilla HTML/CSS/JS**, NO Angular (per simplicitat i compatibilitat amb Decap CMS).

## Stack decidit
- **Hosting:** Netlify (gratuït)
- **Repositori:** GitHub (l'usuari ja té compte)
- **CMS:** Decap CMS (abans Netlify CMS) — per permetre que el client (sense coneixements tècnics) pugui pujar fotos de treballs nous des d'un panell a `/admin`
- **Domini:** `.cat` triat (per identitat catalana + lleuger avantatge SEO local). Comprant-se a **SW Hosting** (millor preu trobat: alta 5,75€ / renovació 17,75€ — el més barat comparant amb DonDominio, cdmon, OVH, Nominalia, etc.)
- **Formulari de contacte:** pendent de decidir servei (Formspree o EmailJS recomanats, gratuïts per volum baix)

## Pròxims passos pendents
1. Crear estructura de carpetes local: `index.html` + `Logo_azul.png`
2. `git init` + pujar a un repositori nou a GitHub (`rehabilitacions-ruizmarin`)
3. Connectar repositori amb Netlify (Add new site → Import from Git, sense build command ni publish directory)
4. Un cop comprat el domini .cat a SW Hosting, connectar-lo a Netlify (Domain settings → Add custom domain + configurar DNS)
5. Implementar Decap CMS:
   - Activar Netlify Identity al projecte
   - Crear `/admin/index.html` i `/admin/config.yml`
   - Configurar la col·lecció "treballs" (títol, categoria, ubicació, foto, descripció)
   - Convidar el client com a usuari via Netlify Identity
   - Modificar `index.html` perquè la secció de Treballs carregui dinàmicament el contingut generat pel CMS (actualment són placeholders estàtics)
6. Configurar formulari de contacte amb Formspree o EmailJS
7. Pujar fotos reals dels treballs (pendents del client)
8. Proves finals i entrega al client

## Notes de pressupost (per referència de l'usuari)
- Temps estimat amb IA: 12-21h / sense IA: 40-70h
- Preu de mercat orientatiu: 600-2.000€ pel projecte; opció triada: cobrar simbòlic o ~600-800€ per ser primer portfolio real
- Costos reals del projecte: domini .cat (~5,75€ alta) + hosting Netlify gratuït = cost gairebé nul

## Preferències de l'usuari
- Aprenent frontend (Angular, JS/TS, SQL) — perfil en transició cap a Data Analyst/UX
- Prefereix explicacions pas a pas i entendre el "per què", no només copiar-enganxar
- Vol fer-ho amb vanilla JS per simplicitat amb el CMS, encara que estigui aprenent Angular
