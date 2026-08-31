/**
 * Storage engine for Document Vault using IndexedDB for high storage capacity
 * (Supports PDFs, Word docs, Images, TXT, etc., with unlimited local storage capacity)
 */

const DB_NAME = 'MoosplannerVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'vault_documents';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Fallback localStorage key
const LOCAL_STORAGE_KEY = 'moosplanner_vault_docs';

const getLocalStorageDocs = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const setLocalStorageDocs = (docs) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.warn('LocalStorage full, IndexedDB primary storage used:', e);
  }
};

export const vaultStorage = {
  async getAll(userId = 'guest') {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback to localStorage
      const all = getLocalStorageDocs();
      return all.filter(d => !d.userId || d.userId === userId);
    }
  },

  async save(doc) {
    const documentItem = {
      id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: doc.name || 'Untitled Document',
      size: doc.size || 0,
      type: doc.type || 'application/octet-stream',
      fileType: doc.fileType || 'other', // 'pdf', 'image', 'word', 'text', 'other'
      category: doc.category || 'General',
      data: doc.data, // Data URL base64 or blob
      textContent: doc.textContent || '', // Extracted text if text/doc
      tags: doc.tags || [],
      starred: Boolean(doc.starred),
      description: doc.description || '',
      userId: doc.userId || 'guest',
      uploadedAt: doc.uploadedAt || new Date().toISOString()
    };

    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(documentItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback to localStorage
      const all = getLocalStorageDocs();
      const idx = all.findIndex(d => d.id === documentItem.id);
      if (idx >= 0) all[idx] = documentItem;
      else all.unshift(documentItem);
      setLocalStorageDocs(all);
    }

    return documentItem;
  },

  async delete(id) {
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const all = getLocalStorageDocs();
      const filtered = all.filter(d => d.id !== id);
      setLocalStorageDocs(filtered);
    }
  },

  async toggleStar(id) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      return new Promise((resolve, reject) => {
        getReq.onsuccess = () => {
          const doc = getReq.result;
          if (doc) {
            doc.starred = !doc.starred;
            const putReq = store.put(doc);
            putReq.onsuccess = () => resolve(doc);
            putReq.onerror = () => reject(putReq.error);
          } else {
            resolve(null);
          }
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch {
      const all = getLocalStorageDocs();
      const doc = all.find(d => d.id === id);
      if (doc) {
        doc.starred = !doc.starred;
        setLocalStorageDocs(all);
      }
      return doc;
    }
  }
};
