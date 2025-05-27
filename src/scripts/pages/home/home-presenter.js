import { StoryDatabase } from '../../utils/database';

export default class HomePresenter {
  #view;
  #model;
  #db;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
    this.#db = new StoryDatabase();
  }

  async showReportsListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showReportsListMap: error:', error);
      throw error;
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showReportsListMap();
      
      let stories = [];
      
      try {
        // Try to get data from API first
        const response = await this.#model.getAllReports();
        
        if (response.ok) {
          stories = response.data;
          // Save to IndexedDB
          await Promise.all(stories.map(story => this.#db.saveStory(story)));
        } else {
          // Fallback to IndexedDB if API fails
          stories = await this.#db.getStories();
        }
      } catch (error) {
        console.error('API Error:', error);
        stories = await this.#db.getStories();
      }

      if (stories.length > 0) {
        this.#view.populateReportsList(stories.length ? 'Daftar Cerita' : 'Tidak ada cerita', stories);
      } else {
        this.#view.populateReportsListError('Gagal memuat data');
      }
    } catch (error) {
      console.error('Error:', error);
      this.#view.populateReportsListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }


  async postNewReport({ description, photo, lat, lon }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.storeNewReport({
        description,
        photo,
        lat,
        lon
      });
  
      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }
  
      // Send notification after success
      await this.#sendNotification(description);
      this.#view.storeSuccessfully(response.message);
      
      // Refresh the stories list
      await this.initialGalleryAndMap();
    } catch (error) {
      console.error('postNewReport: error:', error);
      this.#view.storeFailed(error.message || 'Gagal mengirim cerita');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async saveStory(reportId) {
    try {
      const stories = await this.#db.getStories();
      const storyToSave = stories.find(story => story.id === reportId);
      
      if (storyToSave) {
        await this.#db.saveStoryToSaved(storyToSave);
        await this.#sendNotification(
          `Cerita "${storyToSave.description.substring(0, 30)}..." telah disimpan`
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving story:', error);
      throw error;
    }
  }

  async removeSavedStory(reportId) {
    try {
      await this.#db.removeSavedStory(reportId);
      return true;
    } catch (error) {
      console.error('Error removing saved story:', error);
      throw error;
    }
  }

  async isStorySaved(reportId) {
    try {
      return await this.#db.isStorySaved(reportId);
    } catch (error) {
      console.error('Error checking saved story:', error);
      return false;
    }
  }

  async #sendNotification(description) {
    try {
      // Check service worker and notification permission
      if (!('serviceWorker' in navigator)) return;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Send notification
      registration.showNotification('Story berhasil dibuat', {
        body: `Anda telah membuat story baru: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
        icon: '/icons/icon-192x192.png',
        vibrate: [200, 100, 200],
        badge: '/icons/badge.png'
      });

    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
    }
  }

  // New method to handle story details
  async saveStoryToSaved(storyId) {
    try {
      const db = new StoryDatabase();
      
      // Coba dapatkan cerita dari database lokal terlebih dahulu
      const localStories = await db.getStories();
      const story = localStories.find(s => s.id === storyId);
      
      if (story) {
        await db.saveStoryToSaved(story);
        return;
      }
      
      // Jika tidak ada di lokal, coba dari API (jika ada method getReportById)
      if (this.#model.getReportById) {
        const response = await this.#model.getReportById(storyId);
        if (response.ok) {
          await db.saveStoryToSaved(response.data);
          return;
        }
      }
      
      throw new Error('Cerita tidak ditemukan');
    } catch (error) {
      console.error('Error saving story:', error);
      throw error;
    }
  }

  async removeSavedStory(storyId) {
    try {
      const db = new StoryDatabase();
      await db.removeSavedStory(storyId);
    } catch (error) {
      console.error('Error removing saved story:', error);
      throw error;
    }
  }
}