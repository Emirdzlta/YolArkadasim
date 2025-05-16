    // DomContentLoaded sayfanın html içeriği tamamen yüklendiğinde çalışır
    // scriptin tüm elemantlere erişebildiğinden emin oluruz
    document.addEventListener('DOMContentLoaded', () => {
    const tabs       = document.querySelectorAll('.tab-btn');               
    const formWrap   = document.getElementById('form-container');           
    let   currentTab = 'signin';                                           
  
    //hata kutusu
    let errorBox = document.createElement('div');
    errorBox.className = 'error-box';
    formWrap.parentNode.insertBefore(errorBox, formWrap);
      
    // hata kutusunu temizleyen yardımcı fonksiyon
    function clearErrors() { errorBox.innerHTML = ''; }
    // hata mesajını görüntüleyen yardımcı fonksiyon
    function showError(msg)  { errorBox.innerHTML = `<p class="error">${msg}</p>`; }
  
    // şifre görme göz fonksiyonu şekile ikona tıklayınca tetiklenir
    window.togglePassword = icon => {
      const inp = icon.previousElementSibling;
      if (inp.type === 'password') {
        inp.type = 'text';  // şifreyi düz metin yap
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        inp.type = 'password';    // tekrar gizle
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    };
  
    // sekmeler arası geçiş
    function switchTab(tab) {
      clearErrors();
      currentTab = tab;
      // buton vurgusu
      tabs.forEach(b => b.classList.remove('active'));
      document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  
      // form içeriğine dinamik olarak html ekle
      let html = `
        <input type="email" id="email" placeholder="Email" required>
        <div class="password-container">
          <input type="password" id="password" placeholder="Password" required>
          <i class="fa fa-eye"></i>
        </div>`;

        // kayıt sekmesindeysek onay şifre alanı ekle
      if (tab === 'signup') {
        html += `
          <div class="password-container">
            <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
            <i class="fa fa-eye"></i>
          </div>`;
      }
      // giriş veya Kayıt butonunu ekle
      html += `
        <button type="submit" class="sign-btn" id="actionButton">
          ${ tab === 'signin' ? 'Giriş Yap' : 'Kayıt Ol' }
        </button>
        <div class="forgot"><a href="#">Şifreni mi unuttun?</a></div>`;
      // formWrap içeriğini yukarıdaki html ile güncelle
      formWrap.innerHTML = html;
      // togglePassword ikonlarını yeniden bağla
      formWrap.querySelectorAll('.fa-eye')
        .forEach(ic => ic.addEventListener('click', () => togglePassword(ic)));
    }
    // sekme butonlarına tıklanınca switchTab çalışsın
    tabs.forEach(btn =>
      btn.addEventListener('click', () => switchTab(btn.dataset.tab))
    );
    // ilk açılışta Giriş Yap sekmesini göster
    switchTab('signin');  // varsayılan
  
    // form gönderilince gerçekleşecek olay
    formWrap.addEventListener('submit', e => {
      e.preventDefault();  // sayfa yenilenmesini engelle
      clearErrors();
  
      const email   = formWrap.querySelector('#email').value.trim();
      const pass    = formWrap.querySelector('#password').value;
      // basit e-posta format kontrolü için regex
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      // e-posta geçerli mi?
      if (!emailRe.test(email)) {
        showError('Geçerli bir e-posta girin.');
        return;
      }
      // şifre uzunluk kontrolü
      if (pass.length < 6) {
        showError('Şifre en az 6 karakter olmalı.');
        return;
      }
       // localStorage'dan kayıtlı kullanıcıları al
      let users = JSON.parse(localStorage.getItem('users') || '[]');
  
      if (currentTab === 'signin') {
        //  giriş yap işlemi
        const found = users.find(u => u.email === email && u.password === pass);
        if (!found) {
          showError('E-posta veya şifre hatalı.');
          return;
        }
        // başarılı girişte kullanıcı bilgisini sakla ve anasayfaya yönlendir
        localStorage.setItem('loggedInUser', JSON.stringify({ email }));
        window.location.href = 'index.html';
      } else {
        // kayıt ol işlemi
        const confirmPass = formWrap.querySelector('#confirmPassword').value;
        // şifreler eşleşiyor mu?
        if (pass !== confirmPass) {
          showError('Şifreler eşleşmiyor.');
          return;
        }
        // e-posta zaten kayıtlı mı?
        if (users.some(u => u.email === email)) {
          showError('Bu e-posta zaten kayıtlı.');
          return;
        }
        // yeni kullanıcıyı ekle ama direkt login yapma
        users.push({ email, password: pass });
        localStorage.setItem('users', JSON.stringify(users));
        // Başarı mesajı ve login sekmesine geçiş
        alert('Kayıt başarılı! Lütfen şimdi giriş yapın.');
        switchTab('signin');  // formu giriş yap sayfasına getir
      }
    });
  });
  