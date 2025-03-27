/**
 * Enhanced Form Handler for Pratham.se
 * Provides proper AJAX form submission to Netlify
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAjaxForms();
});

/**
 * Initializes all Netlify forms for AJAX submission
 */
function initializeAjaxForms() {
    // Find all Netlify forms
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    
    forms.forEach(form => {
        // Add our custom AJAX submission handler
        form.addEventListener('submit', handleNetlifyFormSubmit);
        
        // Mark this form as enhanced
        form.classList.add('netlify-ajax-form');
        
        console.log(`Enhanced form: ${form.getAttribute('name')} for AJAX submission`);
    });
    
    console.log(`Enhanced ${forms.length} forms with AJAX submission`);
}

/**
 * Handles Netlify form submission via AJAX
 * @param {Event} event - The form submission event
 */
function handleNetlifyFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formName = form.getAttribute('name');
    const formAction = form.getAttribute('action');
    
    // Show loading state
    const loadingOverlay = form.querySelector('.form-loading');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Update ARIA live region if available
    const liveRegion = form.querySelector('[aria-live="polite"]');
    if (liveRegion) {
        liveRegion.textContent = 'Submitting form, please wait...';
    }
    
    // Create form data and ensure the form-name is included
    const formData = new FormData(form);
    if (!formData.has('form-name')) {
        formData.append('form-name', formName);
    }
    
    // Submit the form via fetch API
    fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Form submission failed: ${response.status}`);
        }
        return response;
    })
    .then(() => {
        console.log(`Form "${formName}" submitted successfully`);
        
        // Hide loading state
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // Handle success differently based on the form
        if (formName === 'newsletter') {
            handleNewsletterSuccess(form);
        } else if (formName === 'contact') {
            handleContactSuccess(form, formAction);
        } else {
            // Generic success handling
            alert('Thank you for your submission!');
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        
        // Hide loading state
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // Update ARIA live region with error
        if (liveRegion) {
            liveRegion.textContent = `Form submission failed: ${error.message}. Please try again.`;
        }
        
        // Show error message to user
        alert(`Sorry, there was a problem submitting your form. ${error.message}`);
    });
}

/**
 * Handle newsletter form success
 * @param {HTMLFormElement} form - The newsletter form
 */
function handleNewsletterSuccess(form) {
    // Show the success message
    const successElement = document.getElementById('newsletter-success');
    if (successElement) {
        form.style.display = 'none';
        successElement.style.display = 'flex';
        
        // Announce success for screen readers
        const liveRegion = document.querySelector('[aria-live="polite"]');
        if (liveRegion) {
            liveRegion.textContent = 'Thank you for subscribing to our newsletter!';
        }
    } else {
        alert('Thank you for subscribing to our newsletter!');
    }
    
    // Reset the form (helpful if we show it again later)
    form.reset();
}

/**
 * Handle contact form success
 * @param {HTMLFormElement} form - The contact form
 * @param {string|null} formAction - The form action attribute (redirect URL)
 */
function handleContactSuccess(form, formAction) {
    // Reset the form
    form.reset();
    
    // If there's a specific action/redirect, use it
    if (formAction) {
        window.location.href = formAction;
    } else {
        // Otherwise, show a success message in place
        const formContainer = form.closest('.contact-form');
        if (formContainer) {
            // Create success message
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success-message';
            successMessage.innerHTML = `
                <div style="text-align: center; padding: 2rem 1rem;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <h3>Message Sent!</h3>
                    <p>Thank you for reaching out. We'll get back to you shortly.</p>
                    <button class="button" id="reset-form" style="margin-top: 1rem;">Send Another Message</button>
                </div>
            `;
            
            // Hide the form and show success message
            form.style.display = 'none';
            formContainer.appendChild(successMessage);
            
            // Add listener to reset button
            const resetButton = document.getElementById('reset-form');
            if (resetButton) {
                resetButton.addEventListener('click', function() {
                    // Remove success message and show form again
                    successMessage.remove();
                    form.style.display = 'block';
                });
            }
            
            // Announce success for screen readers
            const liveRegion = document.querySelector('[aria-live="polite"]');
            if (liveRegion) {
                liveRegion.textContent = 'Your message has been sent successfully. We will get back to you shortly.';
            }
        } else {
            alert('Thank you for your message! We will get back to you shortly.');
        }
    }
}

/**
 * Stores form submission for offline use
 * Works with the Service Worker to submit when back online
 * @param {HTMLFormElement} form - The form to store
 */
function storeFormForOfflineSubmission(form) {
    // Only proceed if IndexedDB is available
    if (!('indexedDB' in window)) return;
    
    const formData = new FormData(form);
    const formDataObj = {};
    
    // Convert FormData to a simple object
    formData.forEach((value, key) => {
        formDataObj[key] = value;
    });
    
    // Store in IndexedDB for the Service Worker to submit later
    openFormDB().then(db => {
        const transaction = db.transaction(['forms'], 'readwrite');
        const store = transaction.objectStore('forms');
        
        store.add({
            url: '/',
            formData: new URLSearchParams(formData).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timestamp: Date.now()
        });
        
        transaction.oncomplete = () => {
            console.log('Form stored for offline submission');
            
            // Notify the user
            alert('You appear to be offline. Your form will be submitted automatically when you regain connection.');
            
            // Try to trigger a sync if service worker is available
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register('form-submission');
                });
            }
        };
    }).catch(error => {
        console.error('Failed to store form:', error);
    });
}

/**
 * Helper function to open the IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
function openFormDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PrathamForms', 1);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('forms')) {
                db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}
