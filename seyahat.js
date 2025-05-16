document.addEventListener('DOMContentLoaded', () => {
  // girişli kullanıcıyı al yoksa kayıt yoksa logine gönder
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    return window.location.href = 'login.html';
  }
 
  // Kullanıcıya özel trips anahtarı ve tamamlanmış seyahatleri filtrele
  const tripsKey = `trips_${user.email}`;
  const allTrips = JSON.parse(localStorage.getItem(tripsKey) || '[]');
  const completed = allTrips.filter(t => t.isCompleted);

  // dark mode
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme  = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);  // kaydedilen temayı uygula
  themeToggle.addEventListener('click', () => {
    const t = document.body.classList.toggle('dark-mode') ? 'dark' : 'light';
    applyTheme(t);
    localStorage.setItem('theme', t); //yeni temayı kaydet
  });
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.textContent = '🌞';
    } else {
      document.body.classList.remove('dark-mode');
      themeToggle.textContent = '🌙';
    }
  }

  // seyahatlerim listesini doldur
  const visitedContainer = document.querySelector('.visited-container');
  visitedContainer.innerHTML = '';
  if (!completed.length) {
    // tamamlanmış seyahat yoksa uyarı mesajı göster
    visitedContainer.innerHTML = '<p class="empty-msg">Bu dosya boştur.</p>';
  } else {
     // her bir tamamlanmış seyahat için kart oluştur
    completed.forEach(trip => {
      const item = document.createElement('div');
      item.className = 'visited-item';
      item.dataset.country = trip.destination;
      const imgSrc = `image/${trip.destination.toLowerCase()}.jpg`;
      item.innerHTML = `
        <img src="${imgSrc}" alt="${trip.destination}">
        <div>${trip.destination}</div>`;
      visitedContainer.appendChild(item);
    });
  }

  // popup gösterme 
  const popup = document.getElementById('infoPopup');
  visitedContainer.addEventListener('click', e => {
    // tıklanan seyahatin .visited-item olup olmadığını kontrol
    const item = e.target.closest('.visited-item');
    if (!item) return;
    const country = item.dataset.country;
    const trip = completed.find(t => t.destination === country); //ilgili seyahati bul

    // Not kısmını kırpma için
    const maxLen = 100;
    const rawNote = trip?.note || '';
    const shortNote = rawNote.length > maxLen
      ? rawNote.slice(0, maxLen) + '...'
      : rawNote;
    const isTruncated = rawNote.length > maxLen;

    const content = popup.querySelector('.popup-page-content');

    if (!trip) {
      //seyahat bulunamazsa boş mesajı
      content.innerHTML = `
        <p>Bu dosya boştur.</p>
        <button onclick="closePopup()">Kapat</button>`;
    } else {
      //popup içeriği dinamik
      content.innerHTML = `
        <span class="close-btn" onclick="closePopup()">X</span>
        <img src="image/${country.toLowerCase()}.jpg" alt="${country}" class="popup-image">
        <h3 id="popupTitle">${country.toUpperCase()}</h3>
        <p id="popupYear"><strong>Tarih:</strong> ${trip.date}</p>
        <p id="popupComment">${shortNote}
          ${isTruncated
            ? `<span class="read-more" onclick="expandNote(this, '${rawNote.replace(/'/g, "\\'")}')"> Devamını Oku</span>`
            : ''
          }
        </p>
        <div class="stars" id="popupStars">${'⭐'.repeat(trip.stars || 5)}</div>
        <button onclick="openInMaps()">🗺️</button>`;
    }
    popup.style.display = 'flex'; //popup görünür
  });
  // popup kapatma
  window.closePopup = () => popup.style.display = 'none';
  //haritalarda açma
  window.openInMaps = () => {
    const c = document.getElementById('popupTitle').innerText;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c)}`, '_blank');
  };
});

// Devamını Oku için fonksiyon tam  notu gösterir
window.expandNote = (el, fullText) => {
  el.parentElement.textContent = fullText;
};
