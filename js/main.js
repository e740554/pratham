/**
 * Pratham & HyGOAT Main JavaScript
 * Advanced interactive elements for Phase 2
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeNavigation();
    initializeParticles();
    initializeBlockchainDiagram();
    initializeTimeline();
    initializeDataStream();
    initializeFormValidation();
    initializeServiceWorker();
});

/**
 * Navigation functionality
 */
function initializeNavigation() {
    // Header scroll effect
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Add header background when scrolled
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Call on initial load
    
    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const closeMenu = document.getElementById('closeMenu');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && closeMenu && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.add('active');
            // Trap focus inside mobile menu when open
            setTimeout(() => {
                closeMenu.focus();
            }, 100);
        });
        
        closeMenu.addEventListener('click', function() {
            navMenu.classList.remove('active');
            menuBtn.focus(); // Return focus to menu button
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                e.target !== menuBtn) {
                navMenu.classList.remove('active');
            }
        });
        
        // Escape key closes menu
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuBtn.focus();
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
                
                // Calculate header height dynamically
                const headerHeight = header.offsetHeight;
                
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping (modern browsers)
                window.history.pushState(null, null, targetId);
                
                // Set focus to the target element or first focusable child
                setTimeout(() => {
                    const focusableElement = targetElement.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusableElement) {
                        focusableElement.focus();
                    } else {
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();
                        targetElement.removeAttribute('tabindex');
                    }
                }, 1000);
            }
        });
    });
    
    // Scroll down button
    const scrollDown = document.getElementById('scrollDown');
    if (scrollDown) {
        scrollDown.addEventListener('click', function() {
            const whatWeDo = document.getElementById('what-we-do');
            if (whatWeDo) {
                window.scrollTo({
                    top: whatWeDo.offsetTop - header.offsetHeight,
                    behavior: 'smooth'
                });
                
                // Focus first element in section
                setTimeout(() => {
                    const focusableElement = whatWeDo.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusableElement) {
                        focusableElement.focus();
                    }
                }, 1000);
            }
        });
    }
}

/**
 * Particle animations for hero section
 */
function initializeParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    // Performance optimization - reduce particles on mobile
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 10 : 20;
    
    // Clear any existing particles
    particlesContainer.innerHTML = '';
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random size between 5px and 20px
        const size = Math.random() * 15 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Random animation duration and delay
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    // Optimize performance by reducing animations when not in viewport
    const hero = document.querySelector('.hero');
    if (hero) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    particlesContainer.style.display = 'block';
                } else {
                    particlesContainer.style.display = 'none';
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(hero);
    }
}

/**
 * Interactive blockchain diagram
 */
function initializeBlockchainDiagram() {
    const blockchainDiagram = document.getElementById('blockchainDiagram');
    if (!blockchainDiagram) return;
    
    // Make nodes focusable for accessibility
    const nodes = document.querySelectorAll('.blockchain-node');
    nodes.forEach(node => {
        node.setAttribute('tabindex', '0');
        node.setAttribute('role', 'button');
        node.setAttribute('aria-label', `${node.textContent} node`);
        
        // Keyboard accessibility
        node.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                highlightConnections(this.id);
            }
        });
        
        // Mouse interaction
        node.addEventListener('mouseenter', function() {
            highlightConnections(this.id);
        });
        
        node.addEventListener('mouseleave', function() {
            resetConnections();
        });
        
        node.addEventListener('focus', function() {
            highlightConnections(this.id);
        });
        
        node.addEventListener('blur', function() {
            resetConnections();
        });
    });
    
    // Function to update connection lines
    function updateLinks() {
        function updateLink(linkId, sourceId, targetId) {
            const source = document.getElementById(sourceId);
            const target = document.getElementById(targetId);
            const link = document.getElementById(linkId);
            
            if (!source || !target || !link) return;
            
            const sourceRect = source.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const diagramRect = blockchainDiagram.getBoundingClientRect();
            
            // Calculate positions relative to the diagram
            // Use positions based on the edges of the boxes for smoother connections
            let sourceX, sourceY, targetX, targetY;
            
            // Horizontal connection (top row to top row, or bottom row to bottom row)
            if (Math.abs(sourceRect.top - targetRect.top) < 50) {
                // Determine which side of each box to connect from
                if (sourceRect.left < targetRect.left) {
                    // Source is to the left of target
                    sourceX = sourceRect.right - diagramRect.left;
                    targetX = targetRect.left - diagramRect.left;
                } else {
                    // Source is to the right of target
                    sourceX = sourceRect.left - diagramRect.left;
                    targetX = targetRect.right - diagramRect.left;
                }
                
                // Connect from the middle height of each box
                sourceY = sourceRect.top + sourceRect.height / 2 - diagramRect.top;
                targetY = targetRect.top + targetRect.height / 2 - diagramRect.top;
            }
            // Vertical connection (connecting boxes on different rows)
            else if (Math.abs(sourceRect.left - targetRect.left) < 50) {
                // Connect from the center of the bottom of the top box to the center of the top of the bottom box
                if (sourceRect.top < targetRect.top) {
                    // Source is above target
                    sourceX = sourceRect.left + sourceRect.width / 2 - diagramRect.left;
                    sourceY = sourceRect.bottom - diagramRect.top;
                    targetX = targetRect.left + targetRect.width / 2 - diagramRect.left;
                    targetY = targetRect.top - diagramRect.top;
                } else {
                    // Source is below target
                    sourceX = sourceRect.left + sourceRect.width / 2 - diagramRect.left;
                    sourceY = sourceRect.top - diagramRect.top;
                    targetX = targetRect.left + targetRect.width / 2 - diagramRect.left;
                    targetY = targetRect.bottom - diagramRect.top;
                }
            }
            // Diagonal connection
            else {
                // Start from the appropriate corner depending on relative positions
                if (sourceRect.top < targetRect.top) {
                    // Source is above target
                    sourceY = sourceRect.bottom - diagramRect.top;
                    targetY = targetRect.top - diagramRect.top;
                } else {
                    // Source is below target
                    sourceY = sourceRect.top - diagramRect.top;
                    targetY = targetRect.bottom - diagramRect.top;
                }
                
                if (sourceRect.left < targetRect.left) {
                    // Source is to the left of target
                    sourceX = sourceRect.right - diagramRect.left;
                    targetX = targetRect.left - diagramRect.left;
                } else {
                    // Source is to the right of target
                    sourceX = sourceRect.left - diagramRect.left;
                    targetX = targetRect.right - diagramRect.left;
                }
            }
            
            const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
            const length = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
            
            link.style.width = `${length}px`;
            link.style.left = `${sourceX}px`;
            link.style.top = `${sourceY}px`;
            link.style.transform = `rotate(${angle}rad)`;
            
            // Add data attributes for highlighting
            link.dataset.source = sourceId;
            link.dataset.target = targetId;
        }
        
        const connections = [
            { linkId: 'link1-2', sourceId: 'node1', targetId: 'node2' },
            { linkId: 'link2-3', sourceId: 'node2', targetId: 'node3' },
            { linkId: 'link1-4', sourceId: 'node1', targetId: 'node4' },
            { linkId: 'link2-5', sourceId: 'node2', targetId: 'node5' },
            { linkId: 'link3-6', sourceId: 'node3', targetId: 'node6' },
            { linkId: 'link4-5', sourceId: 'node4', targetId: 'node5' },
            { linkId: 'link5-6', sourceId: 'node5', targetId: 'node6' }
        ];
        
        connections.forEach(conn => {
            updateLink(conn.linkId, conn.sourceId, conn.targetId);
        });
    }
    
    // Function to highlight connections for a node
    function highlightConnections(nodeId) {
        // Reset all connections first
        resetConnections();
        
        // Highlight the selected node
        const selectedNode = document.getElementById(nodeId);
        if (selectedNode) {
            selectedNode.style.transform = 'scale(1.1)';
            selectedNode.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
            selectedNode.style.zIndex = '10';
            selectedNode.style.backgroundColor = '#f8f9fa';
        }
        
        // Highlight connected links and nodes
        const links = document.querySelectorAll('.blockchain-link');
        links.forEach(link => {
            if (link.dataset.source === nodeId || link.dataset.target === nodeId) {
                link.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                link.style.height = '3px';
                link.style.zIndex = '5';
                
                // Also highlight connected nodes
                const connectedNodeId = link.dataset.source === nodeId ? link.dataset.target : link.dataset.source;
                const connectedNode = document.getElementById(connectedNodeId);
                if (connectedNode) {
                    connectedNode.style.transform = 'scale(1.05)';
                    connectedNode.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                    connectedNode.style.backgroundColor = '#f0f0f0';
                }
            } else {
                link.style.opacity = '0.3';
            }
        });
        
        // Add a tooltip description for the selected node
        const tooltipContent = getNodeDescription(nodeId);
        if (tooltipContent) {
            const tooltip = document.createElement('div');
            tooltip.className = 'node-tooltip';
            tooltip.textContent = tooltipContent;
            tooltip.style.position = 'absolute';
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '0.5rem 1rem';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '0.9rem';
            tooltip.style.maxWidth = '200px';
            tooltip.style.zIndex = '20';
            tooltip.style.top = `${selectedNode.offsetTop + selectedNode.offsetHeight + 10}px`;
            tooltip.style.left = `${selectedNode.offsetLeft}px`;
            tooltip.style.animation = 'fadeIn 0.3s ease';
            
            // Check if tooltip exists already
            const existingTooltip = blockchainDiagram.querySelector('.node-tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
            
            blockchainDiagram.appendChild(tooltip);
        }
    }
    
    // Function to reset all connections
    function resetConnections() {
        const nodes = document.querySelectorAll('.blockchain-node');
        nodes.forEach(node => {
            node.style.transform = '';
            node.style.boxShadow = '';
            node.style.zIndex = '';
            node.style.backgroundColor = '';
        });
        
        const links = document.querySelectorAll('.blockchain-link');
        links.forEach(link => {
            link.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            link.style.height = '2px';
            link.style.zIndex = '1';
            link.style.opacity = '1';
        });
        
        // Remove any tooltips
        const tooltip = blockchainDiagram.querySelector('.node-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    // Node descriptions for tooltips
    function getNodeDescription(nodeId) {
        const descriptions = {
            'node1': 'Real-time sensor data collected from hydrogen production systems.',
            'node2': 'Secure IoT gateway that encrypts and authenticates production data.',
            'node3': 'Distributed ledger that stores immutable production records.',
            'node4': 'Automated verification against multiple hydrogen certification standards.',
            'node5': 'Self-executing contracts that validate compliance and manage transfers.',
            'node6': 'Tamper-proof digital certificates with verifiable provenance.'
        };
        
        return descriptions[nodeId] || '';
    }
    
    // Initial setup
    updateLinks();
    
    // Update on resize
    window.addEventListener('resize', updateLinks);
    
    // Add mutation observer to update links if DOM changes
    const observer = new MutationObserver(updateLinks);
    observer.observe(blockchainDiagram, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
}

/**
 * Interactive timeline functionality
 */
function initializeTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length === 0) return;
    
    // Add animation when timeline items come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('timeline-visible');
                // Add specific animation based on odd/even
                const isOdd = Array.from(timelineItems).indexOf(entry.target) % 2 === 0;
                entry.target.style.animation = `fadeIn${isOdd ? 'Right' : 'Left'} 0.8s forwards`;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    // Observe each timeline item
    timelineItems.forEach(item => {
        // Add CSS styles for animations
        if (!document.getElementById('timeline-animations')) {
            const style = document.createElement('style');
            style.id = 'timeline-animations';
            style.textContent = `
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                .timeline-item {
                    opacity: 0;
                }
                
                .timeline-visible {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        observer.observe(item);
        
        // Make timeline years interactive
        const year = item.querySelector('.timeline-year');
        if (year) {
            year.setAttribute('tabindex', '0');
            year.setAttribute('role', 'button');
            year.setAttribute('aria-label', `Show details for ${year.textContent}`);
            
            // Toggle expanded state on interaction
            const content = item.querySelector('.timeline-content');
            
            year.addEventListener('click', () => toggleTimelineDetail(content));
            year.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTimelineDetail(content);
                }
            });
        }
    });
    
    // Function to toggle detailed view for timeline items
    function toggleTimelineDetail(content) {
        if (!content) return;
        
        const isExpanded = content.classList.contains('expanded');
        
        // Reset all expanded items first
        document.querySelectorAll('.timeline-content.expanded').forEach(item => {
            if (item !== content) {
                item.classList.remove('expanded');
                item.style.backgroundColor = '';
                item.style.boxShadow = '';
            }
        });
        
        if (isExpanded) {
            content.classList.remove('expanded');
            content.style.backgroundColor = '';
            content.style.boxShadow = '';
        } else {
            content.classList.add('expanded');
            content.style.backgroundColor = '#f8f9fa';
            content.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            
            // Scroll to the expanded item if needed
            const rect = content.getBoundingClientRect();
            const isInView = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
            
            if (!isInView) {
                content.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

/**
 * Data stream simulation for sensor display
 */
function initializeDataStream() {
    const dataStream = document.querySelector('.data-stream');
    const dataStreamContainer = document.querySelector('.data-stream-container');
    
    if (!dataStream || !dataStreamContainer) return;
    
    // Auto-scroll to bottom initially
    dataStreamContainer.scrollTop = dataStreamContainer.scrollHeight;
    
    // Initialize messages to add dynamically
    const randomMessages = [
        "> Checking renewable energy source...",
        "> Solar input: 6.2 kWh",
        "> Wind input: 0.8 kWh",
        "> Grid stability: 99.3%",
        "> Recirculation pump: active",
        "> Membrane cycle: 42/100",
        "> Water treatment stage: 3",
        "> Waste heat recovery: 89.7%",
        "> CO₂ offset verified: +0.24 tonnes",
        "> New certification batch initiated",
        "> Connecting to verification node...",
        "> Blockchain hash calculated",
        "> Updating smart contract...",
        "> Water quality: 99.98% pure",
        "> System pressure: 2.6 MPa",
        "> O₂ production rate: 6.3 kg/h",
        "> Energy efficiency: 76.2%",
        "> Membrane integrity check: passed"
    ];
    
    // Animate initial messages
    document.querySelectorAll('.data-stream div').forEach((div, index) => {
        div.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add user interaction - pause on hover/focus
    let isPaused = false;
    let streamInterval;
    
    dataStreamContainer.addEventListener('mouseenter', () => {
        isPaused = true;
    });
    
    dataStreamContainer.addEventListener('mouseleave', () => {
        isPaused = false;
    });
    
    dataStreamContainer.addEventListener('focus', () => {
        isPaused = true;
    });
    
    dataStreamContainer.addEventListener('blur', () => {
        isPaused = false;
    });
    
    // Make container keyboard accessible
    dataStreamContainer.setAttribute('tabindex', '0');
    dataStreamContainer.setAttribute('role', 'log');
    dataStreamContainer.setAttribute('aria-label', 'Real-time sensor data stream');
    
    // Automated data stream
    streamInterval = setInterval(() => {
        if (isPaused) return;
        
        const newData = document.createElement('div');
        const messageIndex = Math.floor(Math.random() * randomMessages.length);
        newData.textContent = randomMessages[messageIndex];
        newData.style.opacity = '0';
        newData.style.animation = 'fadeIn 0.5s forwards';
        dataStream.appendChild(newData);
        
        // Auto-scroll if already at bottom
        if (dataStreamContainer.scrollTop + dataStreamContainer.clientHeight >= dataStreamContainer.scrollHeight - 50) {
            setTimeout(() => {
                dataStreamContainer.scrollTop = dataStreamContainer.scrollHeight;
            }, 100);
        }
        
        // Keep a reasonable number of messages
        if (dataStream.children.length > 100) {
            dataStream.removeChild(dataStream.firstChild);
        }
        
        // Announce new message for screen readers
        if (document.querySelector('[aria-live="polite"]')) {
            document.querySelector('[aria-live="polite"]').textContent = randomMessages[messageIndex];
        }
    }, 3000);
    
    // Cleanup function
    function cleanup() {
        clearInterval(streamInterval);
    }
    
    // Optimize performance by pausing when not in viewport
    const hygoatSection = document.querySelector('.hygoat-section');
    if (hygoatSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    clearInterval(streamInterval);
                    streamInterval = null;
                } else if (!streamInterval) {
                    streamInterval = setInterval(() => {
                        if (isPaused) return;
                        
                        const newData = document.createElement('div');
                        const messageIndex = Math.floor(Math.random() * randomMessages.length);
                        newData.textContent = randomMessages[messageIndex];
                        newData.style.opacity = '0';
                        newData.style.animation = 'fadeIn 0.5s forwards';
                        dataStream.appendChild(newData);
                        
                        // Auto-scroll if already at bottom
                        if (dataStreamContainer.scrollTop + dataStreamContainer.clientHeight >= dataStreamContainer.scrollHeight - 50) {
                            setTimeout(() => {
                                dataStreamContainer.scrollTop = dataStreamContainer.scrollHeight;
                            }, 100);
                        }
                        
                        // Keep a reasonable number of messages
                        if (dataStream.children.length > 100) {
                            dataStream.removeChild(dataStream.firstChild);
                        }
                    }, 3000);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(hygoatSection);
    }
    
    // Add this to window for cleanup if needed
    window.cleanupDataStream = cleanup;
}

/**
 * Form validation and enhanced form interactions
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Skip if already initialized
        if (form.classList.contains('enhanced')) return;
        form.classList.add('enhanced');
        
        // Add hidden ARIA live region for form feedback
        const liveRegion = document.createElement('div');
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        form.appendChild(liveRegion);
        
        // Add loading spinner container
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'form-loading';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loadingOverlay.appendChild(spinner);
        form.appendChild(loadingOverlay);
        
        // Enhanced input fields
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Skip submit buttons and checkboxes
            if (input.type === 'submit' || input.type === 'checkbox' || input.type === 'radio') return;
            
            // Create error message container
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            input.parentNode.appendChild(errorMessage);
            
            // Add visual feedback on input
            input.addEventListener('input', function() {
                validateInput(this);
            });
            
            input.addEventListener('blur', function() {
                validateInput(this, true);
            });
            
            // Helper function to validate a single input
            function validateInput(input, showError = false) {
                const formGroup = input.closest('.form-group');
                if (!formGroup) return;
                
                let isValid = input.validity.valid;
                errorMessage.textContent = '';
                
                // Reset classes
                formGroup.classList.remove('error', 'success');
                
                // Don't validate empty fields on input (only on blur or submit)
                if (!showError && input.value === '') return;
                
                // Custom email validation
                if (input.type === 'email' && input.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        errorMessage.textContent = 'Please enter a valid email address';
                    }
                }
                
                // Required fields
                if (input.required && input.value === '') {
                    isValid = false;
                    errorMessage.textContent = `${getInputLabel(input)} is required`;
                }
                
                // Update UI based on validation
                if (!isValid && (showError || input.value !== '')) {
                    formGroup.classList.add('error');
                } else if (input.value !== '') {
                    formGroup.classList.add('success');
                }
                
                return isValid;
            }
            
            // Helper to get input label
            function getInputLabel(input) {
                const formGroup = input.closest('.form-group');
                if (!formGroup) return 'This field';
                
                const label = formGroup.querySelector('label');
                return label ? label.textContent : 'This field';
            }
        });
        
        // Enhanced form submission
        form.addEventListener('submit', function(e) {
            // Only prevent default for client-side validation
            // Let the form submit normally to Netlify otherwise
            
            // Validate all fields
            let isValid = true;
            inputs.forEach(input => {
                if (input.type !== 'submit' && input.type !== 'checkbox' && input.type !== 'radio') {
                    const inputValid = validateInput(input, true);
                    isValid = isValid && inputValid;
                }
                
                // Also validate checkboxes that are required
                if ((input.type === 'checkbox' || input.type === 'radio') && input.required && !input.checked) {
                    isValid = false;
                    const formGroup = input.closest('.form-checkbox') || input.closest('.form-group');
                    if (formGroup) formGroup.classList.add('error');
                }
            });
            
            // If not valid, prevent form submission and show errors
            if (!isValid) {
                e.preventDefault();
                
                // Update live region with error message
                liveRegion.textContent = 'There are errors in the form. Please correct them and try again.';
                
                // Focus first invalid field
                const firstInvalid = form.querySelector('.form-group.error input, .form-group.error textarea, .form-group.error select, .form-checkbox.error input');
                if (firstInvalid) firstInvalid.focus();
            } else {
                // Form is valid, we'll show a brief loading overlay but not interrupt the normal form submission
                loadingOverlay.style.display = 'flex';
                
                // Update live region
                liveRegion.textContent = 'Submitting form, please wait...';
                
                // For the newsletter form, we'll handle the success message visibility separately
                if (form.id === 'newsletter-form') {
                    const successElement = document.getElementById('newsletter-success');
                    if (successElement) {
                        // We'll let Netlify handle the submission, but set up a way to show the success message
                        // This relies on the form actually submitting and redirecting back to the page
                        if (window.location.search.includes('success=true')) {
                            form.style.display = 'none';
                            successElement.style.display = 'flex';
                        }
                    }
                }
                
                // Let the form submit normally to Netlify
                // The page will refresh or redirect based on Netlify's form handling
            }
        });
        
        // Helper function to validate a single input with error display option
        function validateInput(input, showError = false) {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return true;
            
            const errorMessage = formGroup.querySelector('.error-message');
            if (!errorMessage) return true;
            
            let isValid = input.validity.valid;
            errorMessage.textContent = '';
            
            // Reset classes
            formGroup.classList.remove('error', 'success');
            
            // Don't validate empty fields on input (only on blur or submit)
            if (!showError && input.value === '') return true;
            
            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    errorMessage.textContent = 'Please enter a valid email address';
                }
            }
            
            // Required fields
            if (input.required && input.value === '') {
                isValid = false;
                const label = formGroup.querySelector('label');
                const fieldName = label ? label.textContent : 'This field';
                errorMessage.textContent = `${fieldName} is required`;
            }
            
            // Update UI based on validation
            if (!isValid && (showError || input.value !== '')) {
                formGroup.classList.add('error');
            } else if (input.value !== '') {
                formGroup.classList.add('success');
            }
            
            return isValid;
        }
    });
}

/**
 * Service Worker for offline capability
 */
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Register service worker
        navigator.serviceWorker.register('/sw.js').then(
            registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            },
            error => {
                console.log('ServiceWorker registration failed: ', error);
            }
        );
        
        // Show offline/online status to user
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        function updateOnlineStatus() {
            // Create or update status indicator
            let statusIndicator = document.getElementById('connection-status');
            
            if (!statusIndicator) {
                statusIndicator = document.createElement('div');
                statusIndicator.id = 'connection-status';
                statusIndicator.style.position = 'fixed';
                statusIndicator.style.bottom = '20px';
                statusIndicator.style.right = '20px';
                statusIndicator.style.padding = '8px 16px';
                statusIndicator.style.borderRadius = '4px';
                statusIndicator.style.fontSize = '0.9rem';
                statusIndicator.style.fontWeight = 'bold';
                statusIndicator.style.zIndex = '9999';
                statusIndicator.style.transition = 'all 0.3s ease';
                statusIndicator.style.opacity = '0';
                document.body.appendChild(statusIndicator);
            }
            
            if (navigator.onLine) {
                statusIndicator.textContent = '✓ Back Online';
                statusIndicator.style.backgroundColor = '#2ecc71';
                statusIndicator.style.color = 'white';
            } else {
                statusIndicator.textContent = '! Offline Mode';
                statusIndicator.style.backgroundColor = '#f39c12';
                statusIndicator.style.color = 'white';
            }
            
            // Show status
            statusIndicator.style.opacity = '1';
            
            // Hide after 3 seconds
            setTimeout(() => {
                statusIndicator.style.opacity = '0';
            }, 3000);
        }
    }
}
