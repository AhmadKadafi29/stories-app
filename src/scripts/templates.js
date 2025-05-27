import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Cerita</a></li>
    <li><a id="report-list-button" class="report-list-button" href="#/new">Buat Cerita<i class="fas fa-plus"></i></a></li>
    <li><a id="report-list-button" class="report-list-button" href="#/saved"><i class="fas fa-bookmark"></i> Tersimpan</a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateReportsListEmptyTemplate() {
  return `
    <div id="reports-list-empty" class="reports-list__empty">
      <h2>Tidak ada Cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang dapat ditampilkan.</p>
    </div>
  `;
}

export function generateReportsListErrorTemplate(message) {
  return `
    <div id="reports-list-error" class="reports-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${message ? message : 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateReportItemTemplate({
  id,
  description,
  photo,
  name,
  createdAt,
  lat,
  lon,
  isSaved = false
}) {
  // Format lokasi jika ada koordinat
  const locationText = (lat && lon) ? 
    `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 
    'Lokasi tidak tersedia';
  
  // Format nama reporter atau anonim jika tidak ada
  const reporterName = name || 'Anonim';
  
  return `
    <div tabindex="0" class="report-item" data-reportid="${id}">
      ${photo ? `
        <img class="report-item__image" src="${photo}" alt="${description.substring(0, 50)}">
      ` : `
        <div class="report-item__image-placeholder">
          <i class="fas fa-image"></i>
          <span>Tidak ada gambar</span>
        </div>
      `}
      <div class="report-item__body">
        
        <div class="report-item__actions">
          <button class="save-button ${isSaved ? 'saved' : ''}" data-id="${id}">
            <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
            ${isSaved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
        <div id="report-description" class="report-item__description">
          <h5>${description}</h5>
        </div>
        <div class="report-item__more-info">
          <div class="report-item__author">
            <i class="fas fa-user"></i> ${reporterName}
          </div>
        </div>
        <div class="report-item__main">
          <div class="report-item__more-info">
            <div class="report-item__createdat">
              <i class="fas fa-calendar-alt"></i>Upload at <strong>${showFormattedDate(createdAt, 'id-ID')}</strong> 
            </div>
            
          </div>
        </div>
      </div>
    </div>
  `;
}

// Tambahan untuk placeholder gambar jika tidak ada foto
export function generateImagePlaceholderTemplate() {
  return `
    <div class="report-item__image-placeholder">
      <i class="fas fa-image"></i>
      <span>Tidak ada gambar</span>
    </div>
  `;
}

// templates.js
export function generateNotificationTemplate(type, message) {
  return `
    <div class="notification notification-${type}">
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
}

export function generateSaveButtonTemplate(isSaved) {
  return `
    <button class="save-button ${isSaved ? 'saved' : ''}" aria-label="${isSaved ? 'Hapus dari tersimpan' : 'Simpan cerita'}">
      <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
    </button>
  `;
}

export function generateSavedReportItemTemplate({
  id,
  description,
  photo,
  name,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="report-item saved-report-item" data-reportid="${id}">
      ${photo ? `
        <img class="report-item__image" src="${photo}" alt="${description.substring(0, 50)}">
      ` : `
        <div class="report-item__image-placeholder">
          <i class="fas fa-image"></i>
          <span>Tidak ada gambar</span>
        </div>
      `}
      <div class="report-item__body">
        <div class="report-item__header">
          <button class="remove-saved-button" data-id="${id}" aria-label="Hapus dari tersimpan">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div id="report-description" class="report-item__description">
          <h5>${description}</h5>
        </div>
        <div class="report-item__more-info">
          <div class="report-item__author">
            <i class="fas fa-user"></i> ${name || 'Anonim'}
          </div>
        </div>
        <div class="report-item__main">
          <div class="report-item__more-info">
            <div class="report-item__createdat">
              <i class="fas fa-calendar-alt"></i> Upload at <strong>${showFormattedDate(createdAt, 'id-ID')}</strong> 
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}