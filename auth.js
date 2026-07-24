(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyAJhPA47DjtabIWjvisq7s3h8YHNeY0FYs",
    authDomain: "formulapro.firebaseapp.com",
    projectId: "formulapro",
    storageBucket: "formulapro.firebasestorage.app",
    messagingSenderId: "600889378191",
    appId: "1:600889378191:web:389b2bbe3cf93fb672f7fa",
    measurementId: "G-RKLX0MP8GB"
  };
  firebase.initializeApp(firebaseConfig);
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (err) {
    console.error('Errore impostazione persistenza', err);
  });
  const db = firebase.firestore();
  firebase.analytics();

  // ⚠️ Sostituisci con il TUO uid Firebase di questo progetto (Authentication → Users → "User UID").
  // Solo l'account con questo uid vede il pulsante "Richieste" e può approvare/rifiutare nuovi utenti.
  const ADMIN_UID = "oLSAwMUuGLQxf6VrxR6zpRpcxzz2";

  let loginManuale = false;
  let modalitaAuth = 'login'; // oppure 'register'

  function overlay() { return document.getElementById('loginOverlay'); }
  function loadingEl() { return document.getElementById('loginLoading'); }
  function loginBoxEl() { return document.getElementById('loginBox'); }
  function pendingBoxEl() { return document.getElementById('pendingBox'); }
  function rejectedBoxEl() { return document.getElementById('rejectedBox'); }
  function inputUser() { return document.getElementById('loginUser'); }
  function inputPass() { return document.getElementById('loginPass'); }
  function erroreEl() { return document.getElementById('loginError'); }
  function bottoneEl() { return document.getElementById('loginBtn'); }
  function authTitleEl() { return document.getElementById('authTitle'); }
  function authToggleEl() { return document.getElementById('authToggle'); }
  function adminBtnEl() { return document.getElementById('adminAction'); }

  function mostraErrore(testo) {
    const el = erroreEl();
    if (el) el.textContent = testo;
  }

  function nascondiTutteLeBox() {
    [loadingEl(), loginBoxEl(), pendingBoxEl(), rejectedBoxEl()].forEach(function (el) {
      if (el) el.style.display = 'none';
    });
  }

  function mostraApp() {
    const ov = overlay();
    if (ov) ov.classList.remove('on');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.scrollTo(0, 0);
  }

  function mostraSchermata(nome) {
    const ov = overlay();
    if (!ov) return;
    ov.classList.add('on');
    nascondiTutteLeBox();
    if (nome === 'login' && loginBoxEl()) loginBoxEl().style.display = 'block';
    if (nome === 'pending' && pendingBoxEl()) pendingBoxEl().style.display = 'block';
    if (nome === 'rejected' && rejectedBoxEl()) rejectedBoxEl().style.display = 'block';
  }

  function cambiaModalitaAuth() {
    modalitaAuth = modalitaAuth === 'login' ? 'register' : 'login';
    mostraErrore('');
    const titolo = authTitleEl(), bottone = bottoneEl(), toggle = authToggleEl(), pass = inputPass();
    if (modalitaAuth === 'register') {
      if (titolo) titolo.textContent = 'Crea account';
      if (bottone) bottone.textContent = 'Registrati';
      if (toggle) toggle.textContent = 'Hai già un account? Accedi';
      if (pass) pass.autocomplete = 'new-password';
    } else {
      if (titolo) titolo.textContent = 'Accedi';
      if (bottone) bottone.textContent = 'Accedi';
      if (toggle) toggle.textContent = 'Non hai un account? Registrati';
      if (pass) pass.autocomplete = 'current-password';
    }
  }

  function mostraNascondiPassword() {
    const campo = inputPass();
    const btn = document.getElementById('togglePass');
    if (!campo) return;
    const nascosta = campo.type === 'password';
    campo.type = nascosta ? 'text' : 'password';
    if (btn) btn.textContent = nascosta ? '🙈' : '👁️';
  }

  const ERRORI = {
    'auth/email-already-in-use': 'Questo nome utente è già in uso.',
    'auth/invalid-email': 'Nome utente non valido.',
    'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
    'auth/user-not-found': 'Nome utente o password non corretti.',
    'auth/wrong-password': 'Nome utente o password non corretti.',
    'auth/invalid-credential': 'Nome utente o password non corretti.',
    'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto.'
  };

  function eseguiAuth() {
    if (modalitaAuth === 'register') eseguiRegistrazione();
    else eseguiLogin();
  }

  function eseguiRegistrazione() {
    const nomeUtente = (inputUser().value || '').trim().toLowerCase();
    const password = inputPass().value || '';
    if (!nomeUtente || !password) {
      mostraErrore('Inserisci nome utente e password.');
      return;
    }
    mostraErrore('');
    const bottone = bottoneEl();
    if (bottone) bottone.disabled = true;
    loginManuale = true;

    firebase.auth().createUserWithEmailAndPassword(nomeUtente + '@formulapro.local', password)
      .then(function (credenziali) {
        return db.collection('users').doc(credenziali.user.uid).set({
          username: nomeUtente,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      })
      .then(function () {
        firebase.analytics().logEvent('sign_up', { method: 'email' });
      })
      .catch(function (err) {
        mostraErrore(ERRORI[err && err.code] || 'Errore tecnico. Riprova.');
      })
      .finally(function () {
        loginManuale = false;
        if (bottone) bottone.disabled = false;
      });
  }

  function eseguiLogin() {
    const nomeUtente = (inputUser().value || '').trim().toLowerCase();
    const password = inputPass().value || '';
    if (!nomeUtente || !password) {
      mostraErrore('Inserisci nome utente e password.');
      return;
    }
    mostraErrore('');
    const bottone = bottoneEl();
    if (bottone) bottone.disabled = true;
    loginManuale = true;

    let utenteLoggato = null;
    firebase.auth().signInWithEmailAndPassword(nomeUtente + '@formulapro.local', password)
      .then(function (credenziali) {
        utenteLoggato = credenziali.user;
        return db.collection('users').doc(utenteLoggato.uid).get();
      })
      .then(function (userDoc) {
        const status = userDoc.exists ? userDoc.data().status : 'pending';
        const isAdmin = utenteLoggato.uid === ADMIN_UID;
        if (!isAdmin && status !== 'approved') {
          const errore = new Error('non approvato');
          errore.codiceCustom = status === 'rejected' ? 'account-rejected' : 'account-pending';
          throw errore;
        }
        // Approvato (o admin): applica il blocco "un dispositivo alla volta".
        const docRef = db.collection('sessions').doc(nomeUtente);
        return docRef.get().then(function (doc) {
          if (doc.exists) {
            return firebase.auth().signOut().then(function () {
              const errore = new Error('sessione già attiva');
              errore.codiceCustom = 'session-in-use';
              throw errore;
            });
          }
          return docRef.set({ email: utenteLoggato.email, loginTime: new Date() });
        });
      })
      .then(function () {
        mostraApp();
        firebase.analytics().logEvent('login', { method: 'email' });
      })
      .catch(function (err) {
        if (err && err.codiceCustom === 'session-in-use') {
          mostraErrore('Questo account è già in uso su un altro dispositivo.');
        } else if (err && err.codiceCustom === 'account-pending') {
          mostraSchermata('pending');
        } else if (err && err.codiceCustom === 'account-rejected') {
          mostraSchermata('rejected');
        } else if (err && err.code && err.code.indexOf('auth/') === 0) {
          mostraErrore(ERRORI[err.code] || 'Nome utente o password non corretti.');
        } else {
          console.error('Errore login:', err);
          mostraErrore('Errore tecnico (' + (err && err.code ? err.code : 'sconosciuto') + '). Contatta l\'amministratore.');
        }
      })
      .finally(function () {
        loginManuale = false;
        if (bottone) bottone.disabled = false;
      });
  }

  function eseguiLogout() {
    if (!confirm('Sicuro di voler uscire?')) return;

    const utente = firebase.auth().currentUser;
    if (utente) {
      const nomeUtente = utente.email.split('@')[0];
      db.collection('sessions').doc(nomeUtente).delete().then(function () {
        firebase.analytics().logEvent('logout');
        firebase.auth().signOut();
      }).catch(function () {
        firebase.analytics().logEvent('logout');
        firebase.auth().signOut();
      });
    } else {
      firebase.auth().signOut();
    }
  }

  // --- Pannello admin: approvazione/rifiuto nuovi utenti ---

  function openAdmin() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.add('on');
    caricaListaStato('pending', 'pendingList', [
      { etichetta: '✅ Approva', classe: 'reuseBtn', nuovoStato: 'approved' },
      { etichetta: '❌ Rifiuta', classe: 'del', nuovoStato: 'rejected' }
    ]);
    caricaListaStato('rejected', 'rejectedList', [
      { etichetta: '✅ Approva', classe: 'reuseBtn', nuovoStato: 'approved' }
    ]);
  }

  function closeAdmin() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.remove('on');
  }

  function caricaListaStato(stato, containerId, azioni) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<p class="empty-pending">Caricamento…</p>';
    db.collection('users').where('status', '==', stato).get()
      .then(function (snapshot) {
        if (snapshot.empty) {
          container.innerHTML = '<p class="empty-pending">' + (stato === 'pending' ? 'Nessuna richiesta in sospeso.' : 'Nessun account rifiutato.') + '</p>';
          return;
        }
        container.innerHTML = '';
        snapshot.forEach(function (docSnap) {
          const dati = docSnap.data();
          const riga = document.createElement('div');
          riga.className = 'pending-row';
          const nome = document.createElement('span');
          nome.textContent = dati.username || docSnap.id;
          riga.appendChild(nome);
          azioni.forEach(function (azione) {
            const btn = document.createElement('button');
            btn.textContent = azione.etichetta;
            btn.className = azione.classe;
            btn.onclick = function () {
              db.collection('users').doc(docSnap.id).update({ status: azione.nuovoStato }).then(openAdmin);
            };
            riga.appendChild(btn);
          });
          container.appendChild(riga);
        });
      })
      .catch(function (err) {
        console.error('Errore caricamento utenti', err);
        container.innerHTML = '<p class="empty-pending">Errore nel caricamento.</p>';
      });
  }

  firebase.auth().onAuthStateChanged(function (utente) {
    const ov = overlay();
    if (!ov) return;
    if (utente) {
      const isAdmin = utente.uid === ADMIN_UID;
      if (adminBtnEl()) adminBtnEl().style.display = isAdmin ? '' : 'none';
      if (!loginManuale) {
        db.collection('users').doc(utente.uid).get().then(function (userDoc) {
          const status = userDoc.exists ? userDoc.data().status : 'pending';
          if (isAdmin || status === 'approved') mostraApp();
          else if (status === 'rejected') mostraSchermata('rejected');
          else mostraSchermata('pending');
        }).catch(function () {
          mostraSchermata('pending');
        });
      }
    } else {
      if (adminBtnEl()) adminBtnEl().style.display = 'none';
      mostraSchermata('login');
      if (inputPass()) inputPass().value = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'loginUser') {
      e.preventDefault();
      inputPass().focus();
    } else if (e.target.id === 'loginPass') {
      e.preventDefault();
      eseguiAuth();
    }
  });

  window.eseguiAuth = eseguiAuth;
  window.eseguiLogout = eseguiLogout;
  window.mostraNascondiPassword = mostraNascondiPassword;
  window.cambiaModalitaAuth = cambiaModalitaAuth;
  window.openAdmin = openAdmin;
  window.closeAdmin = closeAdmin;
})();
