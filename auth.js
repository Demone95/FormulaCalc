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
  const db = firebase.firestore();
  firebase.analytics();

  let loginManuale = false;

  function overlay() { return document.getElementById('loginOverlay'); }
  function inputUser() { return document.getElementById('loginUser'); }
  function inputPass() { return document.getElementById('loginPass'); }
  function erroreEl() { return document.getElementById('loginError'); }
  function bottoneEl() { return document.getElementById('loginBtn'); }

  function mostraErrore(testo) {
    const el = erroreEl();
    if (el) el.textContent = testo;
  }

  function mostraApp() {
    const ov = overlay();
    if (ov) ov.classList.remove('on');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.scrollTo(0, 0);
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

    firebase.auth().signInWithEmailAndPassword(nomeUtente + '@formulapro.local', password)
      .then(function (credenziali) {
        const utente = credenziali.user;
        const docRef = db.collection('sessions').doc(nomeUtente);
        return docRef.get().then(function (doc) {
          if (doc.exists) {
            return firebase.auth().signOut().then(function () {
              const errore = new Error('sessione già attiva');
              errore.codiceCustom = 'session-in-use';
              throw errore;
            });
          }
          return docRef.set({ email: utente.email, loginTime: new Date() });
        });
      })
      .then(function () {
        mostraApp();
        firebase.analytics().logEvent('login', { method: 'email' });
      })
      .catch(function (err) {
        if (err && err.codiceCustom === 'session-in-use') {
          mostraErrore('Questo account è già in uso su un altro dispositivo.');
        } else if (err && err.code && err.code.indexOf('auth/') === 0) {
          mostraErrore('Nome utente o password non corretti.');
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

  firebase.auth().onAuthStateChanged(function (utente) {
    const ov = overlay();
    const loading = document.getElementById('loginLoading');
    const box = document.getElementById('loginBox');
    if (!ov) return;
    if (utente) {
      // Se il login è in corso (gestito manualmente), l'aggiornamento della UI
      // avviene solo dopo aver verificato/creato la sessione in eseguiLogin.
      if (!loginManuale) {
        mostraApp();
      }
    } else {
      if (loading) loading.style.display = 'none';
      if (box) box.style.display = 'block';
      ov.classList.add('on');
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
      eseguiLogin();
    }
  });

  window.eseguiLogin = eseguiLogin;
  window.eseguiLogout = eseguiLogout;
})();
