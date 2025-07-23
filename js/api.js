// API Client for Vision Valley Blog Website

const api = {
    baseUrl: 'http://192.168.0.50:5000', // Update this if your server is on a different port
    
    // Test API connectivity
    testConnection: function() {
        console.log('Testing API connection to:', this.baseUrl);
        
        // Create a small notification div
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 15px';
        notification.style.backgroundColor = '#f8f9fa';
        notification.style.border = '1px solid #ddd';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        notification.style.zIndex = '9999';
        notification.textContent = 'Testing API connection...';
        
        document.body.appendChild(notification);
        
        // Simple HEAD request to the server root
        fetch(this.baseUrl + '/api/stats', { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        .then(response => {
            if (response.ok) {
                notification.textContent = 'API connection successful!';
                notification.style.backgroundColor = '#d4edda';
                notification.style.borderColor = '#c3e6cb';
                console.log('API connection successful');
            } else {
                notification.textContent = `API error: ${response.status} ${response.statusText}`;
                notification.style.backgroundColor = '#f8d7da';
                notification.style.borderColor = '#f5c6cb';
                console.error('API response not OK:', response.status, response.statusText);
            }
        })
        .catch(error => {
            notification.textContent = `API connection failed: ${error.message}`;
            notification.style.backgroundColor = '#f8d7da';
            notification.style.borderColor = '#f5c6cb';
            console.error('API connection failed:', error);
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                notification.textContent += ' - Check if server is running and accessible';
                console.error('Network error - server might be unreachable');
            } else if (error.name === 'AbortError') {
                notification.textContent += ' - Connection timed out';
                console.error('Request timeout');
            }
        })
        .finally(() => {
            // Remove notification after 8 seconds
            setTimeout(() => {
                notification.remove();
            }, 8000);
        });
    },
    
    // Authentication methods
    auth: {
        login: function(username, password) {
            return api.makeRequest('POST', '/api/auth/login', { username, password });
        },
        
        // For Firebase authentication
        loginWithToken: function(token) {
            return api.makeRequest('POST', '/api/auth/token', { token });
        },
        
        logout: function() {
            localStorage.removeItem('auth_token');
            return Promise.resolve({ success: true });
        },
        
        saveSession: function(userData) {
            localStorage.setItem('auth_token', btoa(userData.username + ':admin'));
            localStorage.setItem('user_data', JSON.stringify(userData));
        },
        
        saveFirebaseSession: function(user) {
            localStorage.setItem('auth_token', 'Firebase:' + user.uid);
            localStorage.setItem('user_data', JSON.stringify({
                username: user.displayName || user.email,
                email: user.email,
                uid: user.uid,
                provider: user.providerData[0]?.providerId || 'Unknown'
            }));
        },
        
        getSession: function() {
            const userData = localStorage.getItem('user_data');
            if (userData) {
                try {
                    return JSON.parse(userData);
                } catch (e) {
                    return null;
                }
            }
            return null;
        },
        
        clearSession: function() {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        },
        
        isLoggedIn: function() {
            return localStorage.getItem('auth_token') !== null;
        }
    },
    
    // Stats endpoints
    stats: {
        get: function(detailed = false) {
            let url = '/api/stats';
            if (detailed) {
                url += '?detailed=true';
            }
            return api.makeRequest('GET', url);
        }
    },
    
    // Posts API endpoints
    posts: {
        getAll: function(publishedOnly = false) {
            let url = '/api/posts';
            if (publishedOnly) {
                url += '?published=true';
            }
            return api.makeRequest('GET', url);
        },
        
        getById: function(id) {
            return api.makeRequest('GET', `/api/posts/${id}`);
        },
        
        get: function(id) {
            return this.getById(id);
        },
        
        getBySlug: function(slug) {
            return api.makeRequest('GET', `/api/posts/slug/${slug}`);
        },
          // Method to get blog HTML content directly from the server
        getBlogContent: async function(slug) {
            try {
                const response = await fetch(`${api.baseUrl}/blog/${slug}.html`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch blog content: ${response.status} ${response.statusText}`);
                }
                return await response.text();
            } catch (error) {
                console.error('Error fetching blog content:', error);
                throw error;
            }
        },
        
        // Get the URL for a blog post
        getBlogUrl: function(slug) {
            return `${api.baseUrl}/blog/${slug}.html`;
        },
        
        create: function(postData) {
            return api.makeRequest('POST', '/api/posts', postData);
        },
        
        update: function(id, postData) {
            return api.makeRequest('PUT', `/api/posts/${id}`, postData);
        },
        
        delete: function(id) {
            return api.makeRequest('DELETE', `/api/posts/${id}`);
        },
        
        regenerateHtml: function() {
            return api.makeRequest('POST', '/api/regenerate-html');
        }
    },
    
    // Get authentication headers
    getAuthHeaders: function() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            if (token.startsWith('Firebase:')) {
                // Firebase token
                return 'Firebase ' + token.substring(9);
            } else {
                // Basic auth
                return 'Basic ' + token;
            }
        }
        return null;
    },
    
    // Pages API endpoints
    pages: {
        getAll: function(publishedOnly = false) {
            let url = '/api/pages';
            if (publishedOnly) {
                url += '?published=true';
            }
            return api.makeRequest('GET', url);
        },
        
        get: function(id) {
            return api.makeRequest('GET', `/api/pages/${id}`);
        },
        
        getBySlug: function(slug) {
            return api.makeRequest('GET', `/api/pages/slug/${slug}`);
        },
        
        create: function(pageData) {
            return api.makeRequest('POST', '/api/pages', pageData);
        },
        
        update: function(id, pageData) {
            return api.makeRequest('PUT', `/api/pages/${id}`, pageData);
        },
        
        delete: function(id) {
            return api.makeRequest('DELETE', `/api/pages/${id}`);
        }
    },
    
    // Media API endpoints
    media: {
        getAll: function() {
            return api.makeRequest('GET', '/api/media');
        },
        
        get: function(id) {
            return api.makeRequest('GET', `/api/media/${id}`);
        },
        
        delete: function(id) {
            return api.makeRequest('DELETE', `/api/media/${id}`);        }
    },
    
    uploadMedia: function(formData, progressCallback) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.open('POST', this.baseUrl + '/api/media', true);
            
            // Add authentication header
            const authHeader = this.getAuthHeaders();
            if (authHeader) {
                xhr.setRequestHeader('Authorization', authHeader);
            }
            
            // Track upload progress
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && progressCallback) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    progressCallback(progress);
                }
            });
              // Handle response
            xhr.onload = function() {
                if (xhr.status === 200 || xhr.status === 201) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject('Invalid JSON response');
                    }
                } else {
                    reject(xhr.statusText);
                }
            };
            
            xhr.onerror = function() {
                reject('Network error occurred');
            };
            
            // Send the form data
            xhr.send(formData);
        });
    },
      // Generic request method
    makeRequest: function(method, endpoint, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            // Add timeout to avoid hanging requests
            signal: AbortSignal.timeout(10000) // 10 second timeout
        };
        
        // Add auth header if available
        const authHeader = this.getAuthHeaders();
        if (authHeader) {
            options.headers['Authorization'] = authHeader;
        }
        
        // Add body for POST/PUT requests
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        console.log(`Making API request to: ${this.baseUrl}${endpoint}`);
        
        return fetch(this.baseUrl + endpoint, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`API response received for ${endpoint}:`, data);
                return data;
            })
            .catch(error => {
                console.error(`API Error for ${endpoint}:`, error);
                return { success: false, message: error.message || 'Network error' };
            });
    },
    
    // Settings API endpoints
    settings: {
        get: function() {
            return api.makeRequest('GET', '/api/settings');
        },
        
        update: function(settingsData) {
            return api.makeRequest('PUT', '/api/settings', settingsData);
        }
    }
};

// Export the API object (making it available as both lowercase and uppercase for compatibility)
window.API = api;
window.api = api;
