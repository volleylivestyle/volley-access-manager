# Volley Access Manager – patch account proprietario unico

Questa patch limita l'app al solo account Google con UID configurato nei file.

## File da sostituire nel repository GitHub
- `app.js`
- `index.html`

## Regole Firestore da pubblicare
1. Apri Firebase Console → Firestore Database → Rules.
2. Sostituisci l'intero contenuto con il file `firestore.rules` incluso in questa patch.
3. Premi **Pubblica**.

## Pubblicazione sito
Carica `app.js` e `index.html` nel repository GitHub, sostituendo i file esistenti, quindi esegui Commit changes. GitHub Pages pubblicherà la nuova versione.

## Risultato di sicurezza
- Solo l'UID proprietario configurato può leggere, aggiungere, modificare o eliminare contatti in Firestore.
- Gli altri account Google vengono disconnessi dall'app e non vedono la rubrica.
- Le regole Firestore negano l'accesso agli altri UID anche se tentano di interrogare direttamente il database.
- La configurazione Firebase client-side e la presenza di un repository pubblico non rendono pubblici i dati: la protezione dei contatti è applicata dalle regole Firestore.

Non inserire indirizzi email degli atleti nel repository, nei file di configurazione o in screenshot pubblici.
