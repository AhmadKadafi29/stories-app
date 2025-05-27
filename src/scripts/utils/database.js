export class StoryDatabase {
  constructor() {
    this.dbName = 'StoryAppDB';
    this.dbVersion = 4; // Increment version
    this.storeName = 'stories';
    this.savedStoreName = 'savedStories';
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.savedStoreName)) {
          db.createObjectStore(this.savedStoreName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async saveStory(story) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put(story);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getStories() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async deleteStory(id) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async saveStoryToSaved(story) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.savedStoreName, 'readwrite');
      const store = transaction.objectStore(this.savedStoreName);
      const request = store.put(story);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getSavedStories() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.savedStoreName, 'readonly');
      const store = transaction.objectStore(this.savedStoreName);
      
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async removeSavedStory(id) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.savedStoreName, 'readwrite');
      const store = transaction.objectStore(this.savedStoreName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async isStorySaved(id) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.savedStoreName, 'readonly');
      const store = transaction.objectStore(this.savedStoreName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
}