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

  function overlay() { return document.getElementById('loginOverlay'); }
  function inputUser() { return document.getElementById('loginUser'); }
  function inputPass() { return document.getElementById('loginPass'); }
  function erroreEl() { return document.getElementById('loginError'); }
  function bottoneEl() { return document.getElementById('loginBtn'); }

  function mostraErrore(testo) {
    const el = erroreEl();
    if (el) el.textContent = testo;
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
    
    // Controlla se esiste una sessione attiva per questo utente
    db.collection('sessions').doc(nomeUtente).get().then(function(doc) {
      if (doc.exists) {
        mostraErrore('Questo account è già in uso su un altro dispositivo.');
        if (bottone) bottone.disabled = false;
        return;
      }
      
      // Nessuna sessione attiva, procedi con il login
      firebase.auth().signInWithEmailAndPassword(nomeUtente + '@formulapro.local', password)
        .catch(function () {
          mostraErrore('Nome utente o password non corretti.');
        })
        .finally(function () {
          if (bottone) bottone.disabled = false;
        });
    }).catch(function(error) {
      mostraErrore('Errore nel controllo della sessione.');
      if (bottone) bottone.disabled = false;
    });
  }

  function eseguiLogout() {
    if (!confirm('Sicuro di voler uscire?')) return;
    
    const utente = firebase.auth().currentUser;
    if (utente) {
      // Estrai il nome utente dalla email
      const nomeUtente = utente.email.split('@')[0];
      // Cancella la sessione da Firestore
      db.collection('sessions').doc(nomeUtente).delete().then(function() {
        firebase.analytics().logEvent('logout');
        firebase.auth().signOut();
      }).catch(function(error) {
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
      // Estrai il nome utente dalla email
      const nomeUtente = utente.email.split('@')[0];
      // Crea la sessione in Firestore
      db.collection('sessions').doc(nomeUtente).set({
        email: utente.email,
        loginTime: new Date(),
        deviceId: 'device-' + Math.random().toString(36).substr(2, 9)
      }).then(function() {
        ov.classList.remove('on');
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        window.scrollTo(0, 0);
        firebase.analytics().logEvent('login', { method: 'email' });
      }).catch(function(error) {
        console.error('Errore nella creazione della sessione:', error);
        ov.classList.remove('on');
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        window.scrollTo(0, 0);
      });
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
