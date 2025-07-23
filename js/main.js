// Main JavaScript for Vision Valley Blog Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('active');
            // Animate hamburger menu
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
    }
    
    // Check API connectivity first
    if (typeof api !== 'undefined') {
        // Add a subtle indicator to show server status
        const serverStatus = document.createElement('div');
        serverStatus.className = 'server-status';
        serverStatus.innerHTML = 'Connecting to server...';
        document.body.appendChild(serverStatus);
        
        // Test the API connection
        fetch(api.baseUrl + '/api/stats', { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        .then(response => {
            if (response.ok) {
                serverStatus.innerHTML = 'Server connected';
                serverStatus.classList.add('connected');
                setTimeout(() => {
                    serverStatus.style.opacity = '0';
                    setTimeout(() => serverStatus.remove(), 1000);
                }, 2000);
            } else {
                serverStatus.innerHTML = `Server error (${response.status})`;
                serverStatus.classList.add('error');
                console.error('API response not OK:', response.status, response.statusText);
            }
        })
        .catch(error => {
            serverStatus.innerHTML = 'Server connection failed';
            serverStatus.classList.add('error');
            console.error('API connection failed:', error);
        });
    }
    
    // Load Featured Posts on Homepage
    loadFeaturedPosts();
    
    // Load Gallery Highlights on Homepage
    loadGalleryHighlights();
    
    // Initialize any Google Drive Embeds
    initGoogleDriveEmbeds();
    
    // Initialize search functionality if on blog page
    if (document.querySelector('.blog-filters')) {
        initSearch();
    }
});

// Function to load featured posts on the homepage
async function loadFeaturedPosts() {
    const featuredPostsContainer = document.getElementById('featuredPosts');
    if (!featuredPostsContainer) return;
    
    try {
        // Show loading state
        featuredPostsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        
        // Fetch posts from API
        const posts = await getPosts(3);
        
        // Clear loading indicator
        featuredPostsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            featuredPostsContainer.innerHTML = '<p>No posts available.</p>';
            return;
        }
        
        posts.forEach(post => {
            const postElement = createPostCard(post);
            featuredPostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading featured posts:', error);
        featuredPostsContainer.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
    }
}

// Function to get posts from API
async function getPosts(count = 3, category = null) {
    try {
        // First check if API client exists
        if (typeof api !== 'undefined') {
            // Fetch published posts from the API
            let posts = await api.posts.getAll(true);
            
            // Filter by category if needed
            if (category && category !== 'all') {
                posts = posts.filter(post => post.category === category);
            }
              // Convert API posts to the format needed for display
            const formattedPosts = posts.map(post => {
                // Create the proper image URL by checking if it's relative or absolute
                let imageUrl = post.image || 'images/blog/default.jpg';
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                    imageUrl = api.baseUrl + '/' + imageUrl;
                }
                
                // Create the proper post URL using the API server
                const postUrl = `${api.baseUrl}/blog/${post.slug}.html`;
                
                return {
                    id: post.id,
                    title: post.title,
                    excerpt: post.excerpt || '',
                    date: post.date || '',
                    author: post.author || 'Unknown',
                    image: imageUrl,
                    slug: post.slug,
                    url: postUrl,
                    serverUrl: true // Flag to indicate this is a server URL
                };
            });
            
            // Return only the requested number of posts
            return formattedPosts.slice(0, count);
        } else {
            // Fall back to mock data if API is not available
            return getMockPosts(count);
        }
    } catch (error) {
        console.error('Error in getPosts:', error);
        return getMockPosts(count);
    }
}

// Mock function to get posts as fallback when API is unavailable
async function getMockPosts(count = 3) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockPosts = [
        {
            id: 1,
            title: 'Our Journey Through the Wilderness',
            excerpt: 'Students reflect on their transformative experience during our week-long wilderness expedition.',
            date: 'June 10, 2025',
            author: 'Sarah Johnson',
            image: 'images/blog/post-1.jpg',
            url: 'blog/wilderness-journey.html'
        },
        {
            id: 2,
            title: 'Leadership Skills Developed at Vision Valley',
            excerpt: 'How our residential program helps students develop essential leadership qualities.',
            date: 'May 28, 2025',
            author: 'Emily Parker',
            image: 'images/blog/post-2.jpg',
            url: 'blog/leadership-skills.html'
        },
        {
            id: 3,
            title: 'Connecting with Nature: Environmental Projects',
            excerpt: 'Students engage in environmental conservation projects as part of their learning journey.',
            date: 'May 15, 2025',
            author: 'Michael Thompson',
            image: 'images/blog/post-3.jpg',
            url: 'blog/environmental-projects.html'
        },
        {
            id: 4,
            title: 'Upcoming Events for Vision Valley Program',
            excerpt: 'Mark your calendars for these exciting upcoming events at the Vision Valley Residential Program.',
            date: 'May 5, 2025',
            author: 'Jessica Brown',
            image: 'images/blog/post-4.jpg',
            url: 'blog/upcoming-events.html'
        }
    ];
    
    return mockPosts.slice(0, count);
}

// Function to create a post card element
function createPostCard(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    
    // Fix image URL if it's relative
    let imageUrl = post.image;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        // If serverUrl flag is set and the API base URL is available, use it
        if (post.serverUrl && typeof api !== 'undefined') {
            imageUrl = `${api.baseUrl}/${imageUrl}`;
        }
    }
    
    // For server URLs, we need a special click handler to load the content from the server
    const isServerUrl = post.serverUrl === true;
    
    article.innerHTML = `
        <div class="post-image">
            <img src="${imageUrl}" alt="${post.title}" class="placeholder-image" onerror="this.src='images/placeholder-image.jpg'">
        </div>
        <div class="post-content">
            <span class="post-date">${post.date}</span>
            <h3 class="post-title">
                <a href="${post.url}" ${isServerUrl ? 'target="_blank"' : ''}>${post.title}</a>
            </h3>
            <p class="post-excerpt">${post.excerpt}</p>
            <a href="${post.url}" class="btn" ${isServerUrl ? 'target="_blank"' : ''}>Read More</a>
        </div>
    `;
    
    return article;
}

// Helper function to load blog content from the server
async function loadBlogContentFromServer(slug) {
    if (!slug) return null;
    
    try {
        // Show loading indicator
        const contentContainer = document.createElement('div');
        contentContainer.innerHTML = '<div class="loading">Loading blog content...</div>';
        document.body.appendChild(contentContainer);
        
        // Fetch the blog content
        const content = await api.posts.getBlogContent(slug);
        
        // Display the blog content in a modal or container
        const modal = document.createElement('div');
        modal.className = 'blog-modal';
        modal.innerHTML = `
            <div class="blog-modal-content">
                <span class="blog-modal-close">&times;</span>
                <div class="blog-modal-body">${content}</div>
            </div>
        `;
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeBtn = modal.querySelector('.blog-modal-close');
        closeBtn.addEventListener('click', function() {
            modal.remove();
        });
        
        // Remove the loading indicator
        contentContainer.remove();
        
        return true;
    } catch (error) {
        console.error('Error loading blog content:', error);
        alert('Failed to load blog content. Please try again later.');
        return false;
    }
}

// Function to initialize Google Drive Embeds
function initGoogleDriveEmbeds() {
    const driveEmbeds = document.querySelectorAll('.google-drive-embed');
    
    driveEmbeds.forEach(embed => {
        const driveId = embed.dataset.driveId;
        if (driveId) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://drive.google.com/embeddedfolderview?id=${driveId}`;
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;
            
            embed.appendChild(iframe);
        }
    });
}

// Function to initialize search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    const filterSelect = document.querySelector('.filter-dropdown select');
    const blogGrid = document.querySelector('.blog-grid');
    
    if (!searchInput || !blogGrid) return;
    
    // Load initial blog posts
    loadBlogPosts(filterSelect ? filterSelect.value : 'all');
    
    // Handle search input
    searchInput.addEventListener('input', debounce(function() {
        const query = this.value.toLowerCase();
        const filter = filterSelect ? filterSelect.value : 'all';
        
        loadBlogPosts(filter, query);
    }, 300));
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const query = searchInput.value.toLowerCase();
            const filter = this.value;
            
            loadBlogPosts(filter, query);
        });
    }
    
    // Function to load blog posts with filtering
    async function loadBlogPosts(category = 'all', searchQuery = '') {
        try {
            // Show loading state
            blogGrid.innerHTML = '<div class="loading">Loading posts...</div>';
            
            // Get all posts (we'll filter them client-side for now)
            // In a more advanced implementation, we would pass the filter to the API
            const posts = await getPosts(10); // Get up to 10 posts
            
            // Filter posts by category and search query
            const filteredPosts = posts.filter(post => {
                const matchesCategory = category === 'all' || post.category === category;
                const matchesQuery = !searchQuery || 
                    post.title.toLowerCase().includes(searchQuery) || 
                    post.excerpt.toLowerCase().includes(searchQuery);
                
                return matchesCategory && matchesQuery;
            });
            
            // Clear the grid
            blogGrid.innerHTML = '';
            
            if (filteredPosts.length === 0) {
                blogGrid.innerHTML = '<p class="no-results">No posts found matching your search.</p>';
                return;
            }
            
            // Display filtered posts
            filteredPosts.forEach(post => {
                const postElement = createPostCard(post);
                blogGrid.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading blog posts:', error);
            blogGrid.innerHTML = '<p class="error">Failed to load posts. Please try again later.</p>';
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Function to load gallery highlights on the homepage
async function loadGalleryHighlights() {
    const galleryGrid = document.querySelector('.gallery-preview .gallery-grid');
    if (!galleryGrid) return;
    
    try {
        // Show loading state with placeholder images by default
        // No need to change HTML since placeholder images are already there
        
        // Check if API is available
        if (typeof api === 'undefined') {
            console.warn('API not available for gallery highlights');
            return;
        }
        
        // Fetch media items from the API
        const mediaItems = await api.media.getAll();
        
        if (!mediaItems || mediaItems.length === 0) {
            console.log('No media items found for gallery highlights');
            return;
        }
        
        // Filter only image types
        const imageItems = mediaItems.filter(item => 
            item.type === 'image' || 
            item.path.toLowerCase().endsWith('.jpg') || 
            item.path.toLowerCase().endsWith('.jpeg') || 
            item.path.toLowerCase().endsWith('.png') || 
            item.path.toLowerCase().endsWith('.gif')
        );
        
        if (imageItems.length === 0) {
            console.log('No image items found for gallery highlights');
            return;
        }
        
        // Clear the gallery grid
        galleryGrid.innerHTML = '';
        
        // Get up to 4 random images for the highlights
        const highlightCount = Math.min(4, imageItems.length);
        const highlights = imageItems
            .sort(() => 0.5 - Math.random()) // Shuffle the array
            .slice(0, highlightCount);
            
        // Add each highlight to the grid
        highlights.forEach(item => {
            // Format the image URL correctly
            const imageUrl = item.path ? 
                (item.path.startsWith('/uploads') ? api.baseUrl + item.path : item.path) : '';
            const title = item.title || item.name || 'Vision Valley';
                
            // Create gallery item element
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            // Create an anchor for the lightbox effect
            const anchor = document.createElement('a');
            anchor.href = "gallery.html";
            anchor.style.display = 'block';
            anchor.style.height = '100%';
            
            // Set background image for the gallery item
            galleryItem.style.backgroundImage = `url('${imageUrl}')`;
            galleryItem.style.backgroundSize = 'cover';
            galleryItem.style.backgroundPosition = 'center';
            
            // Add error handling for images
            galleryItem.setAttribute('data-fallback', 'images/placeholder-image.jpg');
            
            // Handle image error
            galleryItem.addEventListener('error', function() {
                this.style.backgroundImage = `url('${this.getAttribute('data-fallback')}')`;
            });
            
            anchor.appendChild(document.createTextNode(''));
            galleryItem.appendChild(anchor);
            galleryGrid.appendChild(galleryItem);
        });
        
    } catch (error) {
        console.error('Error loading gallery highlights:', error);
    }
}

document.getElementById('uploadProgress').addEventListener('value-changed', function() {
    const precent = this.value + '%';
    document.getElementById('progressPercent').textContent = precent;
})