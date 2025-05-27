## Scripts

- `npm run build`: Membuat build production menggunakan Webpack.
- `npm run start-dev`: Menjalankan server development menggunakan Webpack Dev Server.
- `npm run serve`: Menjalankan server HTTP untuk build yang sudah dibuat.
- `npm run prettier`: Memeriksa format kode menggunakan Prettier.
- `npm run prettier:write`: Memformat ulang kode menggunakan Prettier.

## Struktur Proyek

```plaintext
project-stories-app-akhir
├── package.json            # Informasi dependensi proyek
├── package-lock.json       # File lock untuk dependensi
├── README.md               # Dokumentasi proyek
├── webpack.common.js       # Konfigurasi Webpack (umum)
├── webpack.dev.js          # Konfigurasi Webpack (development)
├── webpack.prod.js         # Konfigurasi Webpack (production)
└── src                     # Direktori utama untuk kode sumber
    ├── index.html          # Berkas HTML utama
    ├── public              # Direktori aset publik
    │   ├── favicon.png     # Ikon situs
    │   └── images          # Gambar yang digunakan dalam proyek
    ├── scripts             # Direktori untuk kode JavaScript
    │   ├── data            # Folder untuk API atau sumber data
    │   ├── pages           # Halaman-halaman utama
    │   ├── routes          # Pengaturan routing
    │   ├── utils           # Helper dan utilitas
    │   ├── templates.js    # Template HTML dinamis
    │   ├── config.js       # Konfigurasi proyek
    │   └── index.js        # Entry point aplikasi
    └── styles              # File CSS
        ├── responsives.css # Gaya untuk responsivitas
        └── styles.css      # Gaya umum
Tambahan
file database.js dan notification.js di dalam utils
file sw.js dan manifest.json di direktori public

tambahan di data/api.js untuk post data untuk notifikasi ke api
export async function subscribePushNotification(subscription) {
  const accessToken = getAccessToken();
  const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    })
  });
  return response.json();
}

export async function unsubscribePushNotification(endpoint) {
  const accessToken = getAccessToken();
  const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ endpoint })
  });
  return response.json();
}


Tambahan di app.js untuk registrasi service worker dari sw.js
async #registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');

      // Subscribe to push notifications after registration
      if ('PushManager' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const subscription = await PushNotification.subscribeUser();
          if (subscription) {
            await subscribePushNotification(subscription);
          }
        }
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}


Ubah kode di home-presenter.js
async initialGalleryAndMap() {
  this.#view.showLoading();
  try {
    await this.showReportsListMap();

    // Coba ambil data dari API
    const response = await this.#model.getAllReports();

    if (response.ok) {
      this.#view.populateReportsList(response.message, response.data);

      // Simpan ke IndexedDB
      const db = new StoryDatabase();
      await db.openDB();
      for (const story of response.data) {
        await db.saveStory(story);
      }
    } else {
      // Fallback ke data dari IndexedDB
      const db = new StoryDatabase();
      const stories = await db.getStories();
      if (stories.length > 0) {
        this.#view.populateReportsList('Data offline', stories);
      } else {
        this.#view.populateReportsListError(response.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    // Coba tampilkan data dari IndexedDB
    try {
      const db = new StoryDatabase();
      const stories = await db.getStories();
      if (stories.length > 0) {
        this.#view.populateReportsList('Data offline', stories);
      } else {
        this.#view.populateReportsListError(error.message);
      }
    } catch (dbError) {
      this.#view.populateReportsListError(error.message);
    }
  } finally {
    this.#view.hideLoading();
  }
}


Tambahkan di style.css
.notification {
  position: fixed;
  bottom: 20px;
  right: -100%;
  max-width: 350px;
  padding: 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: right 0.3s ease-in-out;
  background-color: #4CAF50;
  color: white;
}

.notification.show {
  right: 20px;
}

.notification-error {
  background-color: #f44336;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: 15px;
  font-size: 16px;
}
```

direktori docs rename dari direktori dist
dist akan muncul saat menjalankan npm run build
