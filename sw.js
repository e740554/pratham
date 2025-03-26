/**
 * Service Worker for Pratham & HyGOAT
 * Provides offline functionality
 */

const CACHE_NAME = 'pratham-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/our-story.css',
  '/js/main.js',
  '/images/ekansh-portrait.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();

        // Cache the response for future use
        caches.open(CACHE_NAME)
          .then(cache => {
            // Only cache GET requests
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(() => {
        // If network request fails, try to serve from cache
        return caches.match(event.request);
      })
  );
});

// Background sync for form submissions when offline
self.addEventListener('sync', event => {
  if (event.tag === 'form-submission') {
    event.waitUntil(submitOfflineForms());
  }
});

// Handle offline form submissions
async function submitOfflineForms() {
  try {
    // Get stored form submissions from IndexedDB
    const db = await openFormDB();
    const submissions = await getStoredSubmissions(db);
    
    // Process each stored submission
    for (const submission of submissions) {
      try {
        const response = await fetch(submission.url, {
          method: 'POST',
          body: submission.formData,
          headers: submission.headers
        });
        
        if (response.ok) {
          // If successful, remove from storage
          await removeSubmission(db, submission.id);
        }
      } catch (error) {
        console.error('Failed to submit form:', error);
        // Keep in storage to try again later
      }
    }
  } catch (error) {
    console.error('Error processing offline forms:', error);
  }
}

// Helper functions for IndexedDB management
function openFormDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PrathamForms', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
    };
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function getStoredSubmissions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['forms'], 'readonly');
    const store = transaction.objectStore('forms');
    const request = store.getAll();
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function removeSubmission(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['forms'], 'readwrite');
    const store = transaction.objectStore('forms');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = event => reject(event.target.error);
  });
}
