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
    firebase.auth().signInWithEmailAndPassword(nomeUtente + '@formulapro.local', password)
      .catch(function () {
        mostraErrore('Nome utente o password non corretti.');
      })
      .finally(function () {
        if (bottone) bottone.disabled = false;
      });
  }

  function eseguiLogout() {
    if (!confirm('Sicuro di voler uscire?')) return;
    firebase.analytics().logEvent('logout');
    firebase.auth().signOut();
  }

  firebase.auth().onAuthStateChanged(function (utente) {
    const ov = overlay();
    const loading = document.getElementById('loginLoading');
    const box = document.getElementById('loginBox');
    if (!ov) return;
    if (utente) {
      ov.classList.remove('on');
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.scrollTo(0, 0);
      firebase.analytics().logEvent('login', { method: 'email' });
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
