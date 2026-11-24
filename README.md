# Volley Access Manager

Prima versione web responsive per organizzare fino a 20 indirizzi Google autorizzati a vedere registrazioni private YouTube.

## Funzioni
- Login Google con Firebase Authentication.
- Rubrica privata per account Google (Firestore).
- Aggiunta, eliminazione e attivazione/disattivazione contatti.
- Ricerca e filtri.
- Copia email attive, tutte le email, copia singola.
- Esportazione CSV.
- Limite massimo 20 contatti.

**Limite YouTube:** l'app non modifica direttamente la condivisione dei video. Copia gli indirizzi da incollare in YouTube Studio → Contenuti → Live → video → Visibilità → Condividi in privato.

## Configurazione Firebase
1. In Firebase Console crea un progetto dedicato (oppure usa un progetto già predisposto per questa app).
2. Aggiungi una Web App e copia la configurazione Firebase.
3. Apri `app.js` e sostituisci i valori segnaposto in `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, `appId`).
4. In **Authentication → Sign-in method** abilita Google.
5. In **Authentication → Settings → Authorized domains** aggiungi il dominio di pubblicazione, ad esempio `tuonome.github.io` (e `localhost` per prove locali, se necessario).
6. In **Firestore Database** crea il database.
7. Apri la scheda **Rules**, incolla il contenuto di `firestore.rules` e pubblica le regole.
8. Pubblica i file `index.html`, `styles.css` e `app.js` su GitHub Pages. Mantieni `firestore.rules` nel repository per riferimento; le regole vanno pubblicate nella console Firebase.

## Sicurezza
Le regole Firestore limitano la lettura e la scrittura al solo utente autenticato proprietario del percorso `users/{uid}`. Non rendere pubblica la raccolta degli indirizzi.

## Pubblicazione GitHub Pages
Carica i file del progetto nella root di un repository GitHub, vai in **Settings → Pages**, scegli il branch e la cartella `/root`, quindi salva. Se il sito viene pubblicato in una sottocartella del repository, funziona ugualmente perché i riferimenti a CSS e JS sono relativi.
