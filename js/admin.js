// Admin Authentication and Dashboard Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initializeLogin();
    }
    
    // Check if on admin dashboard
    if (document.querySelector('.admin-page')) {
        initializeAdminDashboard();
    }
    
    // Check for logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Test API connection button
    const testApiBtn = document.getElementById('testApiBtn');
    if (testApiBtn) {
        testApiBtn.addEventListener('click', function() {
            api.testConnection();
        });
    }
});

// Login functionality
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    // Setup Firebase Auth state change listener
    if (typeof firebase !== 'undefined' && firebase.auth) {
        console.log('Setting up Firebase auth state listener');
        
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in with Firebase
                console.log('Firebase auth state changed - user signed in:', user.email);
                
                // Save the Firebase user session
                API.auth.saveFirebaseSession(user);
                
                // Update login status display if present
                const authStatus = document.getElementById('authStatus');
                if (authStatus) {
                    authStatus.innerHTML = `
Firebase authentication successful!
User: ${user.displayName || user.email}
Email: ${user.email}
UID: ${user.uid}
Provider: ${user.providerData[0]?.providerId || 'Unknown'}

Redirecting to admin dashboard...`;
                    authStatus.style.color = '#2e7d32';
                }
                
                // If on the login page, redirect to admin dashboard after a short delay
                // to allow the user to see the success message
                if (window.location.pathname.includes('login.html')) {
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            } else {
                console.log('Firebase auth state changed - no user signed in');
                
                // Update login status display if present
                const authStatus = document.getElementById('authStatus');
                if (authStatus) {
                    authStatus.textContent = 'No user is currently signed in with Firebase';
                    authStatus.style.color = '#666';
                }
            }
        });
    } else {
        console.warn('Firebase Auth not available for auth state listener');
    }
      // Traditional login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Show loading indication
        loginError.textContent = 'Authenticating...';
        loginError.style.display = 'block';
        loginError.style.color = '#666';
        
        // Check if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth) {                try {
                    console.log('Attempting Firebase login with:', email);
                    
                    // Show detailed error messages for common problems
                    if (!email.includes('@')) {
                        throw new Error('Please enter a valid email address');
                    }
                    
                    if (password.length < 6) {
                        throw new Error('Password should be at least 6 characters long');
                    }
                    
                    // Always try Firebase email/password sign in first
                    // This requires users to be created in Firebase Authentication console
                    await firebase.auth().signInWithEmailAndPassword(email, password);
                    
                    // Auth state listener will handle the session and redirect
                    console.log('Firebase authentication successful');
                    
                    // No need to manually redirect as the onAuthStateChanged listener will handle it
                } catch (firebaseError) {
                    console.error('Firebase auth failed:', firebaseError.message);
                    
                    // Map Firebase error codes to user-friendly messages
                    let errorMessage = firebaseError.message;
                    if (firebaseError.code === 'auth/user-not-found') {
                        errorMessage = 'No account found with this email address. Please check your email or create an account.';
                    } else if (firebaseError.code === 'auth/wrong-password') {
                        errorMessage = 'Incorrect password. Please try again.';
                    } else if (firebaseError.code === 'auth/invalid-email') {
                        errorMessage = 'Please enter a valid email address.';
                    }                    // First try with traditional login (for admin account)
                    if (email === 'admin@visionvalley.com' || email === 'admin') {
                        // Fall back to traditional login for the admin account
                        console.log('Trying traditional login for admin account');
                        const result = await API.auth.login(email, password);
                        
                        if (result.success) {
                            // Save the session data
                            API.auth.saveSession(result.user);
                            console.log('Traditional login successful');
                            
                            // Update debug display if available
                            const authStatus = document.getElementById('authStatus');
                            if (authStatus) {
                                authStatus.innerHTML = `Traditional login successful:
Username: ${result.user.username}
Login time: ${result.user.loginTime}`;
                            }
                            
                            // Redirect to admin dashboard
                            window.location.href = 'index.html';
                            return; // Exit function after successful login
                        } 
                        
                        // If traditional login failed, show a specific message
                        console.log('Traditional login failed, showing error');
                        loginError.textContent = result.error || 'Invalid email or password. If you\'re trying to use Firebase authentication, please ensure your account is set up in Firebase.';
                    } else {
                        // For non-admin accounts, show Firebase error
                        loginError.textContent = errorMessage || 'Login failed. Please check your email and password.';
                    }
                    
                    // Show error message
                    loginError.style.display = 'block';
                    loginError.style.color = '#d32f2f';
                    
                    // Clear password field for security
                    document.getElementById('password').value = '';
            }
        } else {
            // Firebase not available, use traditional login
            const result = await API.auth.login(email, password);
            
            if (result.success) {
                // Save the session data
                API.auth.saveSession(result.user);
                
                // Redirect to admin dashboard
                window.location.href = 'index.html';
            } else {
                // Show error message
                loginError.textContent = result.error || 'Invalid email or password.';
                loginError.style.display = 'block';
                loginError.style.color = '#d32f2f';
                
                // Clear form fields
                document.getElementById('password').value = '';
            }
        }
    });
}

// Admin Dashboard functionality
function initializeAdminDashboard() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Redirect to login page
        window.location.href = '../admin/login.html';
        return;
    }
    
    // Update UI with user info
    const session = API.auth.getSession();
    updateUserInterface(session);
    
    // Load admin content based on the current page
    const currentPage = getCurrentAdminPage();
    loadAdminContent(currentPage);
    
    // Initialize sidebar navigation
    initAdminNavigation();
    
    // Initialize specific page functionality
    if (currentPage === 'media') {
        initMediaPage();
    }
}

// Function to check if user is logged in
function isLoggedIn() {
    try {
        const loggedIn = API.auth.isLoggedIn();
        console.log('isLoggedIn check:', loggedIn);
        return loggedIn;
    } catch (e) {
        console.error('Error checking login status:', e);
        return false;
    }
}

// Function to log out
function logout() {
    console.log('Logging out user...');
    API.auth.clearSession();
    window.location.href = '../admin/login.html';
}

// Function to update UI with user information
function updateUserInterface(session) {
    if (!session) return;
    
    // Update username in header
    const userNameElement = document.querySelector('.admin-header-subtitle');
    if (userNameElement) {
        userNameElement.textContent = `Welcome back, ${session.username}`;
    }
    
    // If we have Firebase auth info, update profile display
    if (session.authMethod === 'firebase') {
        // Add user profile image if available
        const headerInfo = document.querySelector('.admin-header-info');
        if (headerInfo && session.photoURL) {
            const profileContainer = document.createElement('div');
            profileContainer.className = 'user-profile';
            
            const profileImg = document.createElement('img');
            profileImg.src = session.photoURL;
            profileImg.alt = 'User Profile';
            
            profileContainer.appendChild(profileImg);
            
            // Add it as the first child of headerInfo
            if (headerInfo.firstChild) {
                headerInfo.insertBefore(profileContainer, headerInfo.firstChild);
            } else {
                headerInfo.appendChild(profileContainer);
            }
        }
        
        // Add auth info to sidebar
        const sidebarHeader = document.querySelector('.admin-sidebar-header');
        if (sidebarHeader) {
            const authInfo = document.createElement('div');
            authInfo.className = 'auth-info';
            authInfo.innerHTML = `<span>Logged in with Firebase</span>`;
            sidebarHeader.appendChild(authInfo);
        }
    }
}

// Function to get current admin page
function getCurrentAdminPage() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '');
    
    switch (pageName) {
        case 'posts':
            return 'posts';
        case 'pages':
            return 'pages';
        case 'media':
            return 'media';
        case 'settings':
            return 'settings';
        case 'new-post':
        case 'edit-post':
            return 'post-editor';
        case 'new-page':
        case 'edit-page':
            return 'page-editor';
        default:
            return 'dashboard';
    }
}

// Function to load admin content based on the page
function loadAdminContent(page) {
    switch (page) {
        case 'posts':
            loadPosts();
            break;
        case 'pages':
            loadPages();
            break;
        case 'media':
            loadMedia();
            break;
        case 'post-editor':
            initPostEditor();
            break;
        case 'page-editor':
            initPageEditor();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            loadDashboardStats();
            break;
    }
}

// Initialize admin navigation
function initAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const currentPage = getCurrentAdminPage();
    
    // Update user profile in sidebar if it exists
    updateUserProfileUI();
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
        
        link.addEventListener('click', function(e) {
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                loadAdminContent(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Update user profile UI
function updateUserProfileUI() {
    const userNameEl = document.querySelector('.user-profile .user-name');
    const userEmailEl = document.querySelector('.user-profile .user-email');
    const userAvatarEl = document.querySelector('.user-profile .user-avatar');
    
    if (!userNameEl || !userEmailEl || !userAvatarEl) return;
    
    const session = API.auth.getSession();
    
    if (session) {
        userNameEl.textContent = session.username || 'Admin';
        
        if (session.authMethod === 'firebase' && session.email) {
            userEmailEl.textContent = session.email;
            
            // Update avatar if we have a photo URL
            if (session.photoURL) {
                userAvatarEl.innerHTML = `<img src="${session.photoURL}" alt="${session.username}">`;
            } else {
                // Create an avatar with the first letter of the name
                const initial = (session.username || 'A').charAt(0).toUpperCase();
                userAvatarEl.innerHTML = `<div style="width: 100%; height: 100%; background-color: #4285F4; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${initial}</div>`;
            }
        }
    }
}

// Load posts in admin
async function loadPosts() {
    const contentArea = document.querySelector('.admin-content');
    if (!contentArea) return;
    
    // Show loading state
    contentArea.innerHTML = '<div class="loading">Loading posts...</div>';
    
    try {
        // Fetch posts from API
        const posts = await API.posts.getAll();
        
        // Create admin tools section
        let html = `
            <div class="admin-tools">
                <button id="regenerateHtmlBtn" class="admin-btn"><i class="fas fa-sync"></i> Regenerate Post HTML Files</button>
                <p class="tool-description">Click to regenerate HTML files for all posts. Use this if any blog post links aren't working.</p>
            </div>
        `;
        
        // Create table
        html += `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Author</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (posts.length === 0) {
            html += `<tr><td colspan="5" class="no-data">No posts found</td></tr>`;
        } else {
            posts.forEach(post => {
                const status = post.status || 'draft';
                html += `
                    <tr>
                        <td>${post.title}</td>
                        <td>${post.date || 'No date'}</td>
                        <td><span class="status ${status.toLowerCase()}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                        <td>${post.author || 'Unknown'}</td>
                        <td class="table-actions">
                            <button class="table-action-btn view" title="View Post"><i class="fas fa-eye"></i></button>
                            <button class="table-action-btn edit" title="Edit Post" data-id="${post.id}"><i class="fas fa-edit"></i></button>
                            <button class="table-action-btn delete" title="Delete Post" data-id="${post.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        contentArea.innerHTML = html;
        
        // Add event listener for regenerate HTML button
        const regenerateBtn = document.getElementById('regenerateHtmlBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', async function() {
                try {
                    // Disable button and show loading state
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
                    
                    // Call API to regenerate HTML files
                    const result = await API.posts.regenerateHtml();
                    
                    if (result.success) {
                        alert(`HTML files regenerated successfully!\n\nSuccessfully generated: ${result.regenerated}\nFailed: ${result.failed}`);
                    } else {
                        alert(`Failed to regenerate HTML files: ${result.error || 'Unknown error'}`);
                    }
                } catch (error) {
                    console.error('Error regenerating HTML:', error);
                    alert('An error occurred while regenerating HTML files.');
                } finally {
                    // Reset button state
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-sync"></i> Regenerate Post HTML Files';
                }
            });
        }
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                window.location.href = `edit-post.html?id=${postId}`;
            });
        });
        
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this post?')) {
                    // Delete post via API
                    const result = await API.posts.delete(postId);
                    
                    if (result.success) {
                        // Remove the row from the table
                        this.closest('tr').remove();
                    } else {
                        alert('Failed to delete post: ' + (result.error || 'Unknown error'));
                    }
                }
            });
        });
        
        document.querySelectorAll('.view').forEach(btn => {
            btn.addEventListener('click', function() {
                const postRow = this.closest('tr');
                const postId = postRow.querySelector('.edit').getAttribute('data-id');
                const postTitle = postRow.cells[0].textContent;
                
                alert(`In a full implementation, this would open ${postTitle} in a preview window.`);
            });
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        contentArea.innerHTML = '<div class="error-message">Failed to load posts. Please try refreshing the page.</div>';
    }
}

// Load pages in admin
async function loadPages() {
    const contentArea = document.querySelector('.admin-content');
    if (!contentArea) return;
    
    // Show loading state
    contentArea.innerHTML = '<div class="loading">Loading pages...</div>';
    
    try {
        // Fetch pages from API
        const pages = await API.pages.getAll();
        
        // Create table
        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (pages.length === 0) {
            html += `<tr><td colspan="4" class="no-data">No pages found</td></tr>`;
        } else {
            pages.forEach(page => {
                const status = page.status || 'draft';
                html += `
                    <tr>
                        <td>${page.title}</td>
                        <td>${page.date || 'No date'}</td>
                        <td><span class="status ${status.toLowerCase()}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                        <td class="table-actions">
                            <button class="table-action-btn view" title="View Page"><i class="fas fa-eye"></i></button>
                            <button class="table-action-btn edit" title="Edit Page" data-id="${page.id}"><i class="fas fa-edit"></i></button>
                            <button class="table-action-btn delete" title="Delete Page" data-id="${page.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                </tbody>
            </table>
        `;
        
        contentArea.innerHTML = html;
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const pageId = this.getAttribute('data-id');
                window.location.href = `edit-page.html?id=${pageId}`;
            });
        });
        
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', async function() {
                const pageId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this page?')) {
                    // Delete page via API
                    const result = await API.pages.delete(pageId);
                    
                    if (result.success) {
                        // Remove the row from the table
                        this.closest('tr').remove();
                    } else {
                        alert('Failed to delete page: ' + (result.error || 'Unknown error'));
                    }
                }
            });
        });
        
        document.querySelectorAll('.view').forEach(btn => {
            btn.addEventListener('click', function() {
                const pageRow = this.closest('tr');
                const pageId = pageRow.querySelector('.edit').getAttribute('data-id');
                const pageTitle = pageRow.cells[0].textContent;
                
                alert(`In a full implementation, this would open ${pageTitle} in a preview window.`);
            });
        });
    } catch (error) {
        console.error('Error loading pages:', error);
        contentArea.innerHTML = '<div class="error-message">Failed to load pages. Please try refreshing the page.</div>';
    }
}

// Function to show the upload form
function showUploadForm() {
    document.getElementById('mediaUploadContainer').style.display = 'block';
    document.getElementById('mediaGallery').style.display = 'none';
}

// Function to hide the upload form
function cancelUpload() {
    document.getElementById('mediaUploadContainer').style.display = 'none';
    document.getElementById('mediaGallery').style.display = 'block';
    
    // Reset the form
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadProgressContainer').style.display = 'none';
}

// Function to upload media
function uploadMedia() {
    const fileInput = document.getElementById('mediaUpload');
    const titleInput = document.getElementById('mediaTitle');
    const descriptionInput = document.getElementById('mediaDescription');
    const progressBar = document.getElementById('uploadProgress');
    const progressBarContainer = document.getElementById('uploadProgressContainer');
    const progressPercent = document.getElementById('progressPercent');

    if (!fileInput.files.length) {
        alert('Please select a file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', titleInput.value || file.name);
    formData.append('description', descriptionInput.value || '');

    progressBarContainer.style.display = 'block';
    progressBar.value = 0;
    progressPercent.textContent = '0%';

    API.uploadMedia(formData, (progress) => {
        progressBar.value = progress;
        progressPercent.textContent = progress + '%';
        console.log('Upload progress:', progress);
    })
    .then(response => {
        console.log('Upload response:', response);
        if (response.success) {
            alert('Media uploaded successfully!');
            cancelUpload(); // Hide the form
            loadMedia(); // Refresh the media gallery
        } else {
            alert('Error uploading file: ' + (response.message || 'Unknown error'));
        }
        progressBarContainer.style.display = 'none';
    })
    .catch(error => {
        console.error('Upload Error:', error);
        alert('Error uploading file. Check console for details.');
        progressBarContainer.style.display = 'none';
    });
}

// Load media in admin
async function loadMedia() {
    const mediaGallery = document.getElementById('mediaGallery');
    if (!mediaGallery) return;
    
    // Show loading
    mediaGallery.innerHTML = '<div class="loading">Loading media...</div>';
    
    try {
        // Fetch media from API
        const mediaItems = await API.media.getAll();
        console.log('Media items loaded:', mediaItems);
        
        if (!mediaItems || mediaItems.length === 0) {
            mediaGallery.innerHTML = '<p>No media items found. Upload some images to get started.</p>';
            return;
        }
        
        // Create media grid
        let html = '<div class="media-grid">';
        
        mediaItems.forEach(item => {
            const imageUrl = item.path || '';
            const title = item.name || 'Unnamed';
            const id = item.id || '';
            
            html += `
                <div class="media-item" data-id="${id}">
                    <div class="media-preview" style="background-image: url('${imageUrl.startsWith('http') ? imageUrl : '..' + imageUrl}')"></div>
                    <div class="media-info">
                        <span>${title}</span>
                        <div class="media-actions">
                            <button title="View" onclick="viewMedia('${id}')"><i class="fas fa-eye"></i></button>
                            <button title="Delete" onclick="deleteMedia('${id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        mediaGallery.innerHTML = html;
    } catch (error) {
        console.error('Error loading media:', error);
        mediaGallery.innerHTML = '<div class="error-message">Failed to load media. Please try refreshing the page.</div>';
    }
}

// View media in modal/lightbox
function viewMedia(id) {
    API.media.get(id)
        .then(media => {
            if (!media) {
                alert('Media not found');
                return;
            }
            
            // Create a modal to display the image
            const modal = document.createElement('div');
            modal.className = 'admin-modal';
            
            const imageUrl = media.path.startsWith('http') ? media.path : '..' + media.path;
            
            modal.innerHTML = `
                <div class="admin-modal-content">
                    <span class="admin-modal-close">&times;</span>
                    <img src="${imageUrl}" alt="${media.name || 'Image preview'}">
                    <div class="admin-modal-info">
                        <h3>${media.name || 'Unnamed'}</h3>
                        <p>${media.description || 'No description'}</p>
                        <p class="admin-modal-path">Path: ${media.path}</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add close functionality
            const closeBtn = modal.querySelector('.admin-modal-close');
            closeBtn.onclick = function() {
                document.body.removeChild(modal);
            };
            
            // Also close when clicking outside the modal content
            modal.onclick = function(event) {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                }
            };
        })
        .catch(error => {
            console.error('Error viewing media:', error);
            alert('Error loading media details');
        });
}

// Delete media item
function deleteMedia(id) {
    if (!confirm('Are you sure you want to delete this media item? This cannot be undone.')) {
        return;
    }
    
    API.media.delete(id)
        .then(response => {
            if (response.success) {
                alert('Media deleted successfully');
                loadMedia(); // Refresh the list
            } else {
                alert('Failed to delete media: ' + (response.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error deleting media:', error);
            alert('Error deleting media. Check console for details.');
        });
}

// Initialize post/page editor
async function initPostEditor() {
    const editor = document.getElementById('contentEditor');
    if (!editor) return;
    
    // In a real app, we would initialize a rich text editor here
    // For this demo, we'll just simulate one with basic functionality
    
    const postId = getParameterByName('id');
    let currentPost = null;
    
    // Show loading state for existing posts
    if (postId) {
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'loading-overlay';
        loadingMsg.innerHTML = '<div class="loading">Loading post data...</div>';
        document.querySelector('.admin-main').appendChild(loadingMsg);
        
        try {
            // Load existing post data from API
            currentPost = await API.posts.getById(parseInt(postId));
            
            if (currentPost && !currentPost.error) {
                document.getElementById('postTitle').value = currentPost.title || '';
                editor.value = currentPost.content || '';
                document.getElementById('postExcerpt').value = currentPost.excerpt || '';
                
                // Set category if exists
                const categorySelect = document.getElementById('postCategory');
                if (categorySelect && currentPost.category) {
                    // Find and select the option
                    const options = categorySelect.options;
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value === currentPost.category) {
                            categorySelect.selectedIndex = i;
                            break;
                        }
                    }
                }
                
                // Set featured image preview if exists
                if (currentPost.image) {
                    const imagePreview = document.querySelector('.featured-image-preview');
                    if (imagePreview) {
                        imagePreview.style.backgroundImage = `url("../${currentPost.image}")`;
                        imagePreview.classList.add('has-image');
                    }
                }
                
                // Set status if exists
                const statusSelect = document.getElementById('postStatus');
                if (statusSelect && currentPost.status) {
                    // Find and select the option
                    const options = statusSelect.options;
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value === currentPost.status) {
                            statusSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            } else {
                alert('Failed to load post data: ' + (currentPost?.error || 'Post not found'));
                // Redirect back to posts page if post not found
                window.location.href = 'posts.html';
                return;
            }
        } catch (error) {
            console.error('Error loading post:', error);
            alert('Failed to load post data. Please try again.');
        } finally {
            // Remove loading overlay
            document.querySelector('.loading-overlay')?.remove();
        }
    }
    
    // Add event listeners for the save button
    const saveButton = document.getElementById('savePost');
    if (saveButton) {
        saveButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('postTitle').value;
            const content = editor.value;
            const excerpt = document.getElementById('postExcerpt').value;
            let category = 'uncategorized';
            let status = 'draft';
            
            const categorySelect = document.getElementById('postCategory');
            if (categorySelect) {
                category = categorySelect.value;
            }
            
            const statusSelect = document.getElementById('postStatus');
            if (statusSelect) {
                status = statusSelect.value;
            }
            
            if (!title || !content) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Disable save button and show loading state
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
            
            try {
                // Prepare post data
                const postData = {
                    title,
                    content,
                    excerpt,
                    category,
                    status,
                    // Keep existing image if updating
                    image: currentPost?.image || ''
                };
                
                let result;
                if (postId) {
                    // Update existing post
                    result = await API.posts.update(parseInt(postId), postData);
                } else {
                    // Create new post
                    result = await API.posts.create(postData);
                }
                
                if (result && !result.error) {
                    alert('Post saved successfully!');
                    window.location.href = 'posts.html';
                } else {
                    alert('Failed to save post: ' + (result?.error || 'Unknown error'));
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save';
                }
            } catch (error) {
                console.error('Error saving post:', error);
                alert('An error occurred while saving the post. Please try again.');
                saveButton.disabled = false;
                saveButton.textContent = 'Save';
            }
        });
    }
    
    // Add Google Drive embed functionality
    const addDriveEmbedBtn = document.getElementById('addDriveEmbed');
    if (addDriveEmbedBtn) {
        addDriveEmbedBtn.addEventListener('click', function() {
            const driveId = prompt('Enter the Google Drive ID to embed:');
            if (driveId) {
                // In a real app, this would insert the embed code into the editor
                const embedCode = `<div class="google-drive-embed" data-drive-id="${driveId}"></div>`;
                alert(`In a real rich text editor, this embed code would be inserted:\n\n${embedCode}`);
                
                editor.value += `\n\n[Google Drive Embed: ${driveId}]\n\n`;
            }
        });
    }
}

// Initialize page editor (similar to post editor)
function initPageEditor() {
    initPostEditor(); // For this demo, we'll reuse the same functionality
}

// Load dashboard statistics
async function loadDashboardStats() {
    const contentArea = document.querySelector('.admin-content');
    if (!contentArea) return;
    
    // Show loading state
    contentArea.innerHTML = '<div class="loading">Loading dashboard data...</div>';
    
    try {
        // Get stats from API
        const stats = await API.stats.get(true);
        
        // Get current date for greeting
        const today = new Date();
        const currentHour = today.getHours();
        const formattedDate = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let greeting;
        if (currentHour < 12) {
            greeting = "Good Morning";
        } else if (currentHour < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }
          // Get admin username and profile info from session
        const session = API.auth.getSession();
        const username = session?.username || 'Admin';
        const userPhoto = session?.photoURL;
        const authMethod = session?.authMethod;
          // Create dashboard overview with greeting
        let dashboardHTML = `
            <div class="dashboard-welcome">
                <h2>${greeting}, ${username}!</h2>
                <p>Today is ${formattedDate}. Here's an overview of your website.</p>
                ${authMethod === 'firebase' ? `<p class="auth-info"><i class="fab fa-google"></i> You are signed in with Firebase Authentication</p>` : ''}
            </div>
            
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalPosts || 0}</h3>
                        <p>Blog Posts</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalPages || 0}</h3>
                        <p>Pages</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-image"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalMedia || 0}</h3>
                        <p>Media Files</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fab fa-google-drive"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalDriveEmbeds || 0}</h3>
                        <p>Drive Embeds</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add recent activity section if available
        if (stats.recentActivity && stats.recentActivity.length > 0) {
            dashboardHTML += `
                <div class="recent-activity">
                    <h3>Recent Activity</h3>
                    <ul class="activity-list">
            `;
            
            stats.recentActivity.forEach(activity => {
                let icon = 'fas fa-clock';
                
                // Set appropriate icon based on activity type
                if (activity.type === 'post' && activity.action === 'create') {
                    icon = 'fas fa-plus';
                } else if (activity.type === 'page' && activity.action === 'update') {
                    icon = 'fas fa-edit';
                } else if (activity.type === 'drive') {
                    icon = 'fas fa-folder-plus';
                }
                
                dashboardHTML += `
                    <li>
                        <div class="activity-icon"><i class="${icon}"></i></div>
                        <div class="activity-details">
                            <span class="activity-description">${activity.title || 'Activity'}</span>
                            <span class="activity-time">${activity.date || 'Recent'}</span>
                        </div>
                    </li>
                `;
            });
            
            dashboardHTML += `
                    </ul>
                </div>
            `;
        }
        
        // Add quick actions section
        dashboardHTML += `
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="actions-grid">
                    <a href="new-post.html" class="action-card">
                        <i class="fas fa-file-alt"></i>
                        <span>New Post</span>
                    </a>
                    <a href="new-page.html" class="action-card">
                        <i class="fas fa-file"></i>
                        <span>New Page</span>
                    </a>
                    <a href="media.html" class="action-card">
                        <i class="fas fa-image"></i>
                        <span>Upload Media</span>
                    </a>
                    <a href="media.html#drive" class="action-card">
                        <i class="fab fa-google-drive"></i>
                        <span>Embed Drive</span>
                    </a>
                </div>
            </div>
        `;
        
        contentArea.innerHTML = dashboardHTML;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        contentArea.innerHTML = '<div class="error-message">Failed to load dashboard statistics. Please try refreshing the page.</div>';
    }
}

// Load settings
function loadSettings() {
    const contentArea = document.querySelector('.admin-content');
    if (!contentArea) return;
    
    contentArea.innerHTML = '<div class="loading">Loading settings...</div>';
    
    // Fetch settings from the API
    api.settings.get()
        .then(settings => {
            // Create settings form with current values
            contentArea.innerHTML = `
                <form class="admin-form settings-form">
                    <div class="form-section">
                        <h3>General Settings</h3>
                        <div class="form-group">
                            <label for="siteName">Site Name</label>
                            <input type="text" id="siteName" value="${settings.siteName || ''}">
                        </div>
                        <div class="form-group">
                            <label for="siteTagline">Tagline</label>
                            <input type="text" id="siteTagline" value="${settings.siteTagline || ''}">
                        </div>
                        <div class="form-group">
                            <label for="siteDescription">Site Description</label>
                            <textarea id="siteDescription">${settings.siteDescription || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Admin Credentials</h3>
                        <div class="form-group">
                            <label for="adminUsername">Admin Email</label>
                            <input type="text" id="adminEmail" value="${settings.adminEmail || ''}">
                        </div>
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" placeholder="Enter current password to change">
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" placeholder="Enter new password">
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm New Password</label>
                            <input type="password" id="confirmPassword" placeholder="Confirm new password">
                        </div>
                        <p class="form-helper-text">Leave password fields empty if you don't want to change the password.</p>
                    </div>
                    
                    <div class="form-section">
                        <h3>Display Settings</h3>
                        <div class="form-group">
                            <label for="postsPerPage">Posts Per Page</label>
                            <input type="number" id="postsPerPage" value="${settings.postsPerPage || 6}">
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="showAuthor" ${settings.showAuthor ? 'checked' : ''}>
                            <label for="showAuthor">Show Author Name</label>
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="showDate" ${settings.showDate ? 'checked' : ''}>
                            <label for="showDate">Show Post Date</label>
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="allowComments" ${settings.allowComments ? 'checked' : ''}>
                            <label for="allowComments">Allow Comments</label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="admin-btn" id="saveSettings">Save Settings</button>
                    </div>
                </form>
            `;
            
            // Add event listener for form submission
            const form = document.querySelector('.settings-form');
            const saveButton = document.getElementById('saveSettings');
            
            if (form && saveButton) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    saveSettingsChanges();
                });
                
                // Also connect the button in the header if it exists
                const headerSaveButton = document.getElementById('saveSettingsBtn');
                if (headerSaveButton) {
                    headerSaveButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        saveSettingsChanges();
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error loading settings:', error);
            contentArea.innerHTML = `
                <div class="admin-message error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load settings. Please try again later.</p>
                    <button class="admin-btn" onclick="loadSettings()">Retry</button>
                </div>
            `;
        });
}

// Save settings changes
function saveSettingsChanges() {
    // Show loading spinner
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.innerHTML += '<div class="loading-inline">Saving...</div>';
    }
    
    // Collect form data
    const settingsData = {
        siteName: document.getElementById('siteName').value,
        siteTagline: document.getElementById('siteTagline').value,
        siteDescription: document.getElementById('siteDescription').value,
        adminEmail: document.getElementById('adminEmail').value,
        postsPerPage: parseInt(document.getElementById('postsPerPage').value) || 6,
        showAuthor: document.getElementById('showAuthor').checked,
        showDate: document.getElementById('showDate').checked,
        allowComments: document.getElementById('allowComments').checked
    };
    
    // Handle password change if new password is provided
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password fields if attempting to change password
    if (newPassword || confirmPassword) {
        if (!currentPassword) {
            showSettingsMessage('error', 'Current password is required to change password.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showSettingsMessage('error', 'New passwords do not match.');
            return;
        }
        
        if (newPassword.length < 4) {
            showSettingsMessage('error', 'New password must be at least 4 characters long.');
            return;
        }
        
        // Include password change in settings update
        settingsData.currentPassword = currentPassword;
        settingsData.adminPassword = newPassword;
    }
    
    // Send update to the API
    api.settings.update(settingsData)
        .then(response => {
            if (response.error) {
                showSettingsMessage('error', response.error);
            } else {
                showSettingsMessage('success', 'Settings saved successfully!');
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            }
        })
        .catch(error => {
            showSettingsMessage('error', 'Failed to save settings. Please try again.');
            console.error('Error saving settings:', error);
        });
}

// Show settings status message
function showSettingsMessage(type, message) {
    // Remove any existing messages and loading indicators
    const existingMessages = document.querySelectorAll('.settings-message, .loading-inline');
    existingMessages.forEach(el => el.remove());
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `settings-message ${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <p>${message}</p>
    `;
    
    // Insert message before form actions
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.insertAdjacentElement('beforebegin', messageEl);
    }
    
    // Auto-remove success message after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Initialize media page if on media.html
function initMediaPage() {
    const uploadMediaBtn = document.getElementById('uploadMedia');
    if (uploadMediaBtn) {
        uploadMediaBtn.addEventListener('click', showUploadForm);
    }
    
    // Load media list
    loadMedia();
}

// Utility function to get URL parameters
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
