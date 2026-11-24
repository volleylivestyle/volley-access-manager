/* Volley Access Manager - Firebase compat SDK. Insert your Firebase web config below. */
const firebaseConfig = {
  apiKey: "AIzaSyBYdUcvnhBqfvEbR70PoGPTTrU7ndhUFyM",
  authDomain: "volley-access-manager.firebaseapp.com",
  projectId: "volley-access-manager",
  storageBucket: "volley-access-manager.firebasestorage.app",
  messagingSenderId: "357618735440",
  appId: "1:357618735440:web:a65ca5c35b70cb43917455"
};

const $ = (id) => document.getElementById(id);
// Unico account Google autorizzato a utilizzare l'app e leggere la rubrica.
const OWNER_UID = "PdyLtLtceZeNJyFGCIdq657UYVD2";
const state = { user: null, db: null, contacts: [], unsubscribe: null, toastTimer: null };
const MAX_CONTACTS = 20;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isConfigured(){ return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("INSERISCI") && firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("INSERISCI"); }
function toast(message){ const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(state.toastTimer); state.toastTimer=setTimeout(()=>el.classList.remove("show"),2600); }
function setMessage(message, good=false){ const el=$("formMessage"); el.textContent=message; el.style.color=good?"var(--green)":"var(--red)"; }
function initials(contact){ const s=(contact.name||contact.email||"?").trim().split(/[\s@._-]+/).filter(Boolean); return (s[0]?.[0]||"").toUpperCase()+(s[1]?.[0]||"").toUpperCase(); }
function showLogin(){ $("loginPanel").classList.remove("hidden"); $("appPanel").classList.add("hidden"); $("userBadge").classList.add("hidden"); }
function showApp(user){ $("loginPanel").classList.add("hidden"); $("appPanel").classList.remove("hidden"); $("userBadge").classList.remove("hidden"); $("userName").textContent=user.displayName||user.email||"Account Google"; }
function viewerCollection(){ return state.db.collection("users").doc(state.user.uid).collection("authorizedViewers"); }
async function copyText(text, success){ try{ await navigator.clipboard.writeText(text); toast(success); }catch(e){ const area=document.createElement("textarea"); area.value=text; document.body.appendChild(area); area.select(); const ok=document.execCommand("copy"); area.remove(); toast(ok?success:"Copia non riuscita: seleziona e copia manualmente."); } }
function filteredContacts(){ const q=$("searchInput").value.trim().toLowerCase(), filter=$("filterSelect").value; return state.contacts.filter(c=>{const matches=!q||(c.name||"").toLowerCase().includes(q)||c.email.toLowerCase().includes(q); const status=filter==="all"||(filter==="active"&&c.active)||(filter==="inactive"&&!c.active); return matches&&status;}).sort((a,b)=>(a.name||a.email).localeCompare(b.name||b.email,"it")); }
function render(){ const active=state.contacts.filter(c=>c.active), inactive=state.contacts.length-active.length; $("countTotal").textContent=`${state.contacts.length}/${MAX_CONTACTS}`; $("countActive").textContent=active.length; $("countInactive").textContent=inactive; $("countFree").textContent=MAX_CONTACTS-state.contacts.length; $("addBtn").disabled=state.contacts.length>=MAX_CONTACTS;
 const list=$("contactList"); list.innerHTML=""; const contacts=filteredContacts();
 if(!contacts.length){ const empty=document.createElement("div"); empty.className="empty-state"; empty.textContent=state.contacts.length?"Nessun contatto corrisponde alla ricerca.":"La rubrica è vuota. Aggiungi il primo atleta qui sopra."; list.appendChild(empty); return; }
 contacts.forEach(c=>{ const row=document.createElement("div"); row.className="contact-row";
 const avatar=document.createElement("div"); avatar.className="avatar"; avatar.textContent=initials(c);
 const main=document.createElement("div"); main.className="contact-main";
 const name=document.createElement("div"); name.className="contact-name"; name.textContent=c.name||"Atleta";
 const pill=document.createElement("span"); pill.className="status-pill"+(c.active?"":" off"); pill.textContent=c.active?"ATTIVO":"NON ATTIVO"; name.appendChild(pill);
 const email=document.createElement("div"); email.className="contact-email"; email.textContent=c.email; main.append(name,email);
 const actions=document.createElement("div"); actions.className="row-actions";
 const copy=document.createElement("button"); copy.className="copy-one"; copy.type="button"; copy.title="Copia email"; copy.textContent="Copia"; copy.addEventListener("click",()=>copyText(c.email,"Indirizzo copiato."));
 const toggleLabel=document.createElement("label"); toggleLabel.className="toggle"; toggleLabel.title=c.active?"Disattiva contatto":"Attiva contatto";
 const toggle=document.createElement("input"); toggle.type="checkbox"; toggle.checked=!!c.active; toggle.setAttribute("aria-label",c.active?"Disattiva":"Attiva"); toggle.addEventListener("change",()=>updateContact(c.id,{active:toggle.checked}));
 const slider=document.createElement("span"); toggleLabel.append(toggle,slider);
 const del=document.createElement("button"); del.className="delete-one"; del.type="button"; del.title="Elimina contatto"; del.textContent="Elimina"; del.addEventListener("click",()=>deleteContact(c));
 actions.append(copy,toggleLabel,del); row.append(avatar,main,actions); list.appendChild(row);
 });
}
function subscribeContacts(){ if(state.unsubscribe)state.unsubscribe(); state.unsubscribe=viewerCollection().orderBy("createdAt","asc").onSnapshot(snapshot=>{state.contacts=snapshot.docs.map(d=>({id:d.id,...d.data()}));render();},err=>{console.error("Errore Firestore:",err.code||err.message);toast("Errore nel caricamento della rubrica. Verifica le regole Firestore.");}); }
async function addContact(event){ event.preventDefault(); const name=$("athleteName").value.trim(), email=$("athleteEmail").value.trim().toLowerCase();
 if(!emailPattern.test(email)){setMessage("Inserisci un indirizzo email valido.");return;}
 if(state.contacts.length>=MAX_CONTACTS){setMessage("Hai raggiunto il limite di 20 contatti.");return;}
 if(state.contacts.some(c=>c.email.toLowerCase()===email)){setMessage("Questo indirizzo è già presente.");return;}
 const btn=$("addBtn"); btn.disabled=true; setMessage("Salvataggio…",true);
 try{await viewerCollection().add({name,email,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()}); $("addForm").reset();setMessage("Contatto aggiunto.",true);toast("Atleta aggiunto alla rubrica.");}
 catch(e){console.error(e);setMessage("Salvataggio non riuscito. Controlla la connessione e le regole Firestore.");}
 finally{btn.disabled=state.contacts.length>=MAX_CONTACTS;}
}
async function updateContact(id,changes){ try{await viewerCollection().doc(id).update(changes);toast(changes.active?"Contatto attivato.":"Contatto disattivato.");}catch(e){console.error(e);toast("Non è stato possibile aggiornare il contatto.");render();} }
async function deleteContact(contact){ if(!confirm(`Eliminare ${contact.name||contact.email} dalla rubrica?`))return; try{await viewerCollection().doc(contact.id).delete();toast("Contatto eliminato.");}catch(e){console.error(e);toast("Eliminazione non riuscita.");} }
function exportCsv(){ const rows=[["Nome","Email","Stato"],...state.contacts.map(c=>[c.name||"",c.email,c.active?"Attivo":"Non attivo"])]; const csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n"); const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;a.download="volley-access-manager.csv";a.click();URL.revokeObjectURL(url);toast("Esportazione CSV pronta."); }
function initFirebase(){ if(!isConfigured()){ $("setupNotice").classList.remove("hidden"); $("googleLogin").disabled=true; $("googleLogin").textContent="Configura Firebase per iniziare"; return; }
 try{
   firebase.initializeApp(firebaseConfig);
   state.db=firebase.firestore();
   const auth=firebase.auth();
   auth.onAuthStateChanged(async user=>{
     if(user && user.uid !== OWNER_UID){
       // Nessun contenuto viene mostrato o caricato per un account diverso dal proprietario.
       if(state.unsubscribe){state.unsubscribe();state.unsubscribe=null;}
       state.user=null;state.contacts=[];showLogin();
       try{await auth.signOut();}catch(e){console.error("Uscita account non autorizzato non riuscita:",e.code||e.message);}
       toast("Account non autorizzato. L'accesso è riservato all'account proprietario.");
       return;
     }
     state.user=user;
     if(user){showApp(user);subscribeContacts();}
     else{
       if(state.unsubscribe){state.unsubscribe();state.unsubscribe=null;}
       state.contacts=[];showLogin();
     }
   });
   $("googleLogin").addEventListener("click",async()=>{
     try{
       const provider=new firebase.auth.GoogleAuthProvider();
       const result=await auth.signInWithPopup(provider);
       if(!result.user || result.user.uid !== OWNER_UID){
         await auth.signOut();
         toast("Account non autorizzato. Usa l'account Google proprietario.");
       }
     }catch(e){
       console.error("Accesso Google non riuscito:",e.code||e.message);
       toast(e.code==="auth/popup-blocked"?"Popup bloccato: consenti i popup per questo sito.":"Accesso Google non riuscito.");
     }
   });
   $("logoutBtn").addEventListener("click",()=>auth.signOut());
 }catch(e){console.error("Inizializzazione Firebase non riuscita:",e.code||e.message);$("setupNotice").classList.remove("hidden");}
}
$("addForm").addEventListener("submit",addContact); $("searchInput").addEventListener("input",render); $("filterSelect").addEventListener("change",render);
$("copyActiveBtn").addEventListener("click",()=>{const emails=state.contacts.filter(c=>c.active).map(c=>c.email);if(!emails.length){toast("Non ci sono email attive da copiare.");return;}copyText(emails.join(", "),`${emails.length} email attive copiate, separate da virgola.`);});
$("copyAllBtn").addEventListener("click",()=>{if(!state.contacts.length){toast("La rubrica è vuota.");return;}copyText(state.contacts.map(c=>c.email).join(", "),"Tutti gli indirizzi copiati, separati da virgola.");});
$("exportBtn").addEventListener("click",exportCsv);
initFirebase();
