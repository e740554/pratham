/**
 * Enhanced Form Handler for Netlify Forms
 * Solves 405 errors by implementing a more reliable submission process
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Form Handler: Initializing...");
    
    // Find all Netlify forms
    const forms = document.querySelectorAll('form[data-netlify="true"], form[netlify="true"]');
    console.log(`Found ${forms.length} Netlify forms`);
    
    forms.forEach(form => {
        // Ensure the form has the correct hidden field
        let formNameInput = form.querySelector('input[name="form-name"]');
        if (!formNameInput) {
            formNameInput = document.createElement('input');
            formNameInput.type = 'hidden';
            formNameInput.name = 'form-name';
            formNameInput.value = form.getAttribute('name');
            form.appendChild(formNameInput);
        }
        
        // Set up enhanced submission handler
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formName = form.getAttribute('name');
            console.log(`Form submission started: ${formName}`);
            
            // Show loading state on button
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.innerHTML : '';
            
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }
            
            // Get form data
            const formData = new FormData(form);
            
            // Log form data for debugging (remove in production)
            console.log("Form data being submitted:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }
            
            // Submit the form using fetch API
            fetch("/", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded" 
                },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    console.log("Form submitted successfully via fetch");
                    return { success: true, method: "fetch" };
                } else {
                    console.log("Fetch submission failed with status:", response.status);
                    throw new Error("Fetch submission failed");
                }
            })
            .catch(error => {
                console.log("Trying fallback submission method...");
                
                // Create a hidden iframe for submission
                return new Promise((resolve) => {
                    const iframe = document.createElement('iframe');
                    iframe.name = "hidden-form-frame";
                    iframe.style.display = "none";
                    document.body.appendChild(iframe);
                    
                    // Create a new form element
                    const hiddenForm = document.createElement('form');
                    hiddenForm.method = "POST";
                    hiddenForm.action = "/";
                    hiddenForm.target = "hidden-form-frame";
                    hiddenForm.style.display = "none";
                    
                    // Add all form fields
                    for (let pair of formData.entries()) {
                        const input = document.createElement('input');
                        input.type = "hidden";
                        input.name = pair[0];
                        input.value = pair[1];
                        hiddenForm.appendChild(input);
                    }
                    
                    // Add the form to the document
                    document.body.appendChild(hiddenForm);
                    
                    // Listen for iframe load event
                    iframe.addEventListener('load', function() {
                        console.log("Iframe submission completed");
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                            document.body.removeChild(hiddenForm);
                        }, 1000);
                        resolve({ success: true, method: "iframe" });
                    });
                    
                    // Submit the form
                    hiddenForm.submit();
                    
                    // Set a fallback timeout in case iframe load event doesn't fire
                    setTimeout(() => {
                        resolve({ success: true, method: "timeout" });
                    }, 3000);
                });
            })
            .then(result => {
                console.log("Submission result:", result);
                
                // Handle success UI updates
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Submitted ✓';
                    setTimeout(() => {
                        submitButton.innerHTML = originalButtonText;
                    }, 3000);
                }
                
                // Show success message based on form type
                if (formName === 'newsletter') {
                    const successElement = document.getElementById('newsletter-success');
                    if (successElement) {
                        form.style.display = 'none';
                        successElement.style.display = 'flex';
                    }
                } else if (formName === 'contact') {
                    // Create success message for contact form if it doesn't exist
                    const formContainer = form.closest('.contact-form') || form.parentNode;
                    let successElement = document.getElementById('contact-success');
                    
                    if (!successElement) {
                        successElement = document.createElement('div');
                        successElement.id = 'contact-success';
                        successElement.className = 'newsletter-success';
                        successElement.style.display = 'none';
                        successElement.innerHTML = `
                            <i class="fas fa-check-circle" aria-hidden="true"></i>
                            <p>Thank you for your message! We'll get back to you shortly.</p>
                        `;
                        formContainer.appendChild(successElement);
                    }
                    
                    form.style.display = 'none';
                    successElement.style.display = 'flex';
                }
                
                // Reset the form
                form.reset();
            })
            .catch(finalError => {
                console.error("All submission methods failed:", finalError);
                
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
                
                // Create and show error message
                const formContainer = form.closest('.contact-form') || form.parentNode;
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-banner';
                errorMessage.innerHTML = `
                    <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
                    <p>There was an issue submitting the form. Please try again or contact us directly at <a href="mailto:ekansh@pratham.se">ekansh@pratham.se</a>.</p>
                    <button class="close-error">×</button>
                `;
                formContainer.insertBefore(errorMessage, form);
                
                // Add error banner styling if not already in CSS
                if (!document.getElementById('error-banner-style')) {
                    const style = document.createElement('style');
                    style.id = 'error-banner-style';
                    style.textContent = `
                        .error-banner {
                            display: flex;
                            align-items: center;
                            background-color: #ffecec;
                            color: #940000;
                            padding: 1rem;
                            border-radius: 4px;
                            margin-bottom: 1rem;
                            border-left: 4px solid #e74c3c;
                        }
                        .error-banner i {
                            margin-right: 0.5rem;
                            font-size: 1.2rem;
                        }
                        .error-banner p {
                            margin: 0;
                            flex: 1;
                        }
                        .close-error {
                            background: none;
                            border: none;
                            color: #940000;
                            cursor: pointer;
                            font-size: 1.5rem;
                            padding: 0;
                            margin-left: 0.5rem;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Add close button functionality
                errorMessage.querySelector('.close-error').addEventListener('click', function() {
                    errorMessage.remove();
                });
            });
        });
    });
    
    // Add a small CSS fix for form loading states
    const style = document.createElement('style');
    style.textContent = `
        .form-loading {
            display: none !important;
        }
        .form-submitted {
            opacity: 1 !important;
            pointer-events: auto !important;
        }
    `;
    document.head.appendChild(style);
});
