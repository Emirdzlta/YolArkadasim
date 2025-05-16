//dom sayfa tamamen yüklendiğinded çalışır bu yüzden
// dom elementlerine güvenle erişilir
document.addEventListener('DOMContentLoaded', () => {
  // kayıt olmadıysa logine gönder
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) return window.location.href = 'login.html';

  // kullanıcıya özel trips anahtarı
  const tripsKey = `trips_${user.email}`;
  let trips = JSON.parse(localStorage.getItem(tripsKey) || '[]');

  // dark mode
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme  = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', () => {
    // body'ye dark-mode sınıfını ekle/kaldır ve temayı kaydet
    const t = document.body.classList.toggle('dark-mode') ? 'dark' : 'light';
    applyTheme(t);
    localStorage.setItem('theme', t);
  });
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.textContent = '🌞';  // simge değişimi
    } else {
      document.body.classList.remove('dark-mode');
      themeToggle.textContent = '🌙';
    }
  }

  // nav bar çıkış linki
  const navLinks = document.querySelector('.nav-links');
  const logoutLi = document.createElement('li');
  logoutLi.innerHTML = `<a href="#" id="logout-link">Çıkış Yap (${user.email})</a>`;
  // son <li> yerine çıkış linkini yerleştir
  navLinks.replaceChild(logoutLi, navLinks.querySelector('li:last-child'));
  document.getElementById('logout-link').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });

  // form ve liste elemanları
  const form         = document.getElementById('destinationForm');
  const destInput    = form.querySelector('#destination');
  const dateInput    = form.querySelector('#date');
  const noteInput    = form.querySelector('#note');
  const plannedSec   = document.querySelector('.planned');
  const completedSec = document.querySelector('.completed');
  const plannedCont  = document.getElementById('planned-trips');
  const completedCont= document.getElementById('completed-trips');
  const statsTotal   = document.getElementById('total-destinations');
  const statsVisited = document.getElementById('visited-destinations');
  const planBtn      = document.getElementById('planBtn');
  const completedBtn = document.getElementById('completedBtn');

  // inline hata kutusu
  let errorBox = form.querySelector('.error-box');
  if (!errorBox) {
    //yoksa oluştur forma ekle
    errorBox = document.createElement('div');
    errorBox.className = 'error-box';
    form.insertBefore(errorBox, form.firstElementChild);
  }
  function showErrors(errs) { errorBox.innerHTML = errs.map(e=>`<p class="error">${e}</p>`).join(''); }
  function clearErrors()     { errorBox.innerHTML = ''; }

  // tripsi kaydet
  function saveTrips() {
    localStorage.setItem(tripsKey, JSON.stringify(trips));
  }

  // dinamik listeyi render et
  function render() {
    plannedCont.innerHTML   = '';
    completedCont.innerHTML = '';
    trips.forEach(trip => {
      const card = document.createElement('div');
      card.className = 'trip-card';
      card.innerHTML = `
        <h3>${trip.destination}</h3>
        <p><strong>Tarih:</strong> ${trip.date}</p>
        <p><strong>Not:</strong> ${trip.note}</p>`;
      if (!trip.isCompleted) {
         // planlanan için tamamlandı butonu
        const doneBtn = document.createElement('button');
        doneBtn.textContent = 'Tamamlandı olarak işaretle';
        doneBtn.addEventListener('click', () => {
          trip.isCompleted = true;
          saveTrips();
          render();
        });
        card.appendChild(doneBtn);
        plannedCont.appendChild(card);
      } else {
        // tamamlanmış için sil butonu
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Sil';
        delBtn.addEventListener('click', () => {
          trips = trips.filter(t => t.id !== trip.id);
          saveTrips();
          render();
        });
        card.appendChild(delBtn);
        completedCont.appendChild(card);
      }
    });

    // istatistikleri güncelle
    statsTotal.textContent   = trips.length;
    statsVisited.textContent = trips.filter(t => t.isCompleted).length;

    // boş liste mesajları
    if (!plannedCont.children.length)   plannedCont.innerHTML   = '<p class="empty-msg">Planlanan seyahat yok.</p>';
    if (!completedCont.children.length) completedCont.innerHTML = '<p class="empty-msg">Tamamlanmış seyahat yok.</p>';
  }

  // formdaki plan ekle ve tamamlanmış plan butonlarına 
  // vurgu eklemek için fonksiyon
  function updateTabHighlight(isPlan) {
    if (isPlan) {
      planBtn.classList.add('active');          // plan Ekle butonuna vurgu
      completedBtn.classList.remove('active');  // tamamlanmış butonunun vurgu sınıfını kaldır
    } else {
      planBtn.classList.remove('active');
      completedBtn.classList.add('active');
    }
  }

  // form gönderme
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    const errs = [];
    if (!destInput.value.trim()) errs.push('Konum boş olamaz.');
    if (!dateInput.value)        errs.push('Tarih seçiniz.');
    if (!noteInput.value.trim()) errs.push('Not giriniz.');
    if (errs.length) { showErrors(errs); return; }

    trips.push({
      id:           Date.now(),
      destination:  destInput.value.trim(),
      date:         dateInput.value,
      note:         noteInput.value.trim(),
      isCompleted:  false
    });
    saveTrips();
    form.reset();
    render();
  });

  // section toggle ve vurgu 
  planBtn.addEventListener('click', () => {
    plannedSec.style.display   = 'block';
    completedSec.style.display = 'none';
    updateTabHighlight(true);    // plan Ekle aktif olsun
  });
  completedBtn.addEventListener('click', () => {
    plannedSec.style.display   = 'none';
    completedSec.style.display = 'block';
    updateTabHighlight(false);   // tamamlanmış aktif olsun
  });

  // ilk yüklemede plan ekle seçili olsun — 
  render();
  planBtn.click();               // görünümü ayarla
  updateTabHighlight(true);      // vurgu ekle
});
