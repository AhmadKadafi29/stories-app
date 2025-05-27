import { generateReportsListEmptyTemplate, generateReportsListErrorTemplate } from '../../templates';
import { StoryDatabase } from '../../utils/database';

export default class SavedPage {
  async render() {
    return `
      <section class="container">
        <h1 class="section-title">Cerita Tersimpan</h1>
        <div class="reports-list__container">
          <div id="saved-reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.#loadSavedStories();
    this.#setupDeleteButtons();
  }

  async #loadSavedStories() {
    this.showLoading();
    try {
      const db = new StoryDatabase();
      const savedStories = await db.getSavedStories();
      
      if (savedStories.length > 0) {
        this.#populateSavedStories(savedStories);
      } else {
        document.getElementById('saved-reports-list').innerHTML = 
          generateReportsListEmptyTemplate('Tidak ada cerita yang tersimpan');
      }
    } catch (error) {
      console.error('Error loading saved stories:', error);
      document.getElementById('saved-reports-list').innerHTML = 
        generateReportsListErrorTemplate('Gagal memuat cerita tersimpan');
    } finally {
      this.hideLoading();
    }
  }

  #populateSavedStories(stories) {
    let html = '';
    stories.forEach(story => {
      html += `
        <div class="saved-story-item" data-id="${story.id}">
          <div class="story-content">
            <h3>${story.description || 'Tidak ada deskripsi'}</h3>
            <p>Oleh: ${story.name || 'Anonim'}</p>
            <button class="delete-saved-button" data-id="${story.id}">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
          ${story.photo ? `
            <img src="${story.photo}" alt="${story.description.substring(0, 50)}">
          ` : ''}
        </div>
      `;
    });
    
    document.getElementById('saved-reports-list').innerHTML = html;
  }

  #setupDeleteButtons() {
    document.getElementById('saved-reports-list').addEventListener('click', async (event) => {
      if (event.target.closest('.delete-saved-button')) {
        const button = event.target.closest('.delete-saved-button');
        const storyId = button.dataset.id;
        
        try {
          const db = new StoryDatabase();
          await db.removeSavedStory(storyId);
          
          // Remove the story item from UI
          const storyItem = button.closest('.saved-story-item');
          storyItem.remove();
          
          // Show message if no stories left
          if (document.querySelectorAll('.saved-story-item').length === 0) {
            document.getElementById('saved-reports-list').innerHTML = 
              generateReportsListEmptyTemplate('Tidak ada cerita yang tersimpan');
          }
        } catch (error) {
          console.error('Error deleting saved story:', error);
          alert('Gagal menghapus cerita tersimpan');
        }
      }
    });
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = 
      '<div class="loader"></div>';
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }
}