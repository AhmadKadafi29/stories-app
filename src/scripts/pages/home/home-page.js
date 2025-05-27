import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import Map from '../../utils/map';
import * as StoryAPI from '../../data/api';
import { StoryDatabase } from '../../utils/database';

export default class HomePage {
  #presenter = null;
  #map = null;
  #db = null; // Add database instance

  constructor() {
    this.#db = new StoryDatabase(); // Initialize database
  }

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>

        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.initialGalleryAndMap();
    this.#setupSaveButtons();
  }

  async populateReportsList(message, reports) {
    if (!Array.isArray(reports)) {
      console.error('Reports is not an array:', reports);
      this.populateReportsListError('Format data tidak valid');
      return;
    }

    if (reports.length <= 0) {
      this.populateReportsListEmpty();
      return;
    }

    try {
      // Create HTML for all reports
      let html = '';
      for (const report of reports) {
        const isSaved = await this.#db.isStorySaved(report.id);
        
        // Add marker to map if coordinates exist
        if (this.#map && report.lat && report.lon) {
          const coordinate = [report.lat, report.lon];
          const markerOptions = { alt: report.description || 'Laporan' };
          const popupOptions = { content: report.description || 'Laporan tanpa deskripsi' };
          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        }

        html += generateReportItemTemplate({
          id: report.id || 'unknown',
          description: report.description || 'Tidak ada deskripsi',
          photo: report.photoUrl || report.photo || '',
          name: report.name || 'Anonim',
          createdAt: report.createdAt || new Date().toISOString(),
          lat: report.lat,
          lon: report.lon,
          isSaved
        });
      }

        document.getElementById('reports-list').innerHTML = `
        <div class="reports-list">${html}</div>
      `;
    } catch (error) {
      console.error('Error processing reports:', error);
      this.populateReportsListError('Gagal memproses data laporan');
    }
  }

  #setupSaveButtons() {
    document.getElementById('reports-list').addEventListener('click', async (event) => {
      if (event.target.closest('.save-button')) {
        const button = event.target.closest('.save-button');
        const storyId = button.dataset.id;
        
        try {
          if (button.classList.contains('saved')) {
            await this.#presenter.removeSavedStory(storyId);
            button.classList.remove('saved');
            button.innerHTML = '<i class="fas fa-bookmark-o"></i> Simpan';
          } else {
            await this.#presenter.saveStoryToSaved(storyId);
            button.classList.add('saved');
            button.innerHTML = '<i class="fas fa-bookmark"></i> Tersimpan';
          }
        } catch (error) {
          console.error('Error toggling save:', error);
          alert('Gagal menyimpan cerita: ' + error.message);
        }
      }
    });
  }

  

  populateReportsListEmpty() {
    document.getElementById('reports-list').innerHTML = generateReportsListEmptyTemplate();
  }

  populateReportsListError(message) {
    document.getElementById('reports-list').innerHTML = generateReportsListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }

  
}
