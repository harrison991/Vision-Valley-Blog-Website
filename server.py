from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Data storage paths
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server_data')
POSTS_FILE = os.path.join(DATA_DIR, 'posts.json')
PAGES_FILE = os.path.join(DATA_DIR, 'pages.json')
MEDIA_FILE = os.path.join(DATA_DIR, 'media.json')
DRIVE_EMBEDS_FILE = os.path.join(DATA_DIR, 'drive_embeds.json')
SETTINGS_FILE = os.path.join(DATA_DIR, 'settings.json')
UPLOADS_DIR = os.path.join(DATA_DIR, 'uploads')

# Create data directories if they don't exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Helper functions
def load_data(file_path, default=None):
    if default is None:
        default = []
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                return json.load(f)
        else:
            return default
    except Exception as e:
        print(f"Error loading data from {file_path}: {e}")
        return default

def save_data(file_path, data):
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving data to {file_path}: {e}")
        return False

def generate_slug(title):
    """Generate a URL-friendly slug from a title"""
    import re
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove special characters
    slug = re.sub(r'\s+', '-', slug)      # Replace spaces with hyphens
    slug = re.sub(r'-+', '-', slug)       # Replace multiple hyphens with single hyphen
    return slug.strip()

def format_date(date_obj=None):
    """Format a date in 'Month Day, Year' format"""
    if date_obj is None:
        date_obj = datetime.datetime.now()
    return date_obj.strftime('%B %d, %Y')

def generate_post_html(post):
    """Generate an HTML file for a blog post"""
    try:
        # Define paths
        blog_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog')
        template_path = os.path.join(blog_dir, 'template.html')
        output_path = os.path.join(blog_dir, f"{post['slug']}.html")
        
        # Create blog directory if it doesn't exist
        os.makedirs(blog_dir, exist_ok=True)
        
        # Check if template exists, otherwise use a basic template
        if os.path.exists(template_path):
            with open(template_path, 'r') as file:
                template = file.read()
        else:
            # Basic template if no template file exists
            template = '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{title}}</h1><div>{{content}}</div></body></html>'
        
        # Replace template variables
        html = template
        html = html.replace('{{title}}', post.get('title', ''))
        html = html.replace('{{date}}', post.get('date', ''))
        html = html.replace('{{author}}', post.get('author', 'Unknown'))
        html = html.replace('{{content}}', post.get('content', ''))
        html = html.replace('{{image}}', post.get('image', 'images/blog/default.jpg'))
        html = html.replace('{{category}}', post.get('category', 'Uncategorized').title())
        
        # Write the file
        with open(output_path, 'w') as file:
            file.write(html)
        
        print(f"Generated HTML file for post: {post['slug']}")
        return True
    except Exception as e:
        print(f"Error generating HTML file for post: {e}")
        return False

def init_data():
    """Initialize data files with default data if they don't exist"""
    # Initialize posts
    if not os.path.exists(POSTS_FILE):
        default_posts = [
            {
                "id": 1,
                "title": "Our Journey Through the Wilderness",
                "content": "<p>Students from Pymble Ladies College recently embarked on a transformative wilderness journey as part of the Vision Valley Residential Program. The expedition was designed to challenge the students both physically and mentally, while fostering a deep connection with nature.</p>",
                "excerpt": "Students reflect on their transformative experience during our week-long wilderness expedition.",
                "date": "June 10, 2025",
                "author": "Sarah Johnson",
                "image": "images/blog/post-1.jpg",
                "slug": "wilderness-journey",
                "category": "student-life",
                "status": "published"
            },
            {
                "id": 2,
                "title": "Leadership Skills Developed at Vision Valley",
                "content": "<p>The Vision Valley Residential Program at Pymble Ladies College continues to excel in developing crucial leadership skills among students.</p>",
                "excerpt": "How our residential program helps students develop essential leadership qualities.",
                "date": "May 28, 2025",
                "author": "Emily Parker",
                "image": "images/blog/post-2.jpg",
                "slug": "leadership-skills",
                "category": "leadership",
                "status": "published"
            }
        ]
        save_data(POSTS_FILE, default_posts)
    
    # Initialize pages
    if not os.path.exists(PAGES_FILE):
        default_pages = [
            {
                "id": 1,
                "title": "About",
                "content": "<p>About the Vision Valley Residential Program</p>",
                "slug": "about",
                "status": "published"
            },
            {
                "id": 2,
                "title": "Contact",
                "content": "<p>Contact information for the Vision Valley Residential Program</p>",
                "slug": "contact",
                "status": "published"
            }
        ]
        save_data(PAGES_FILE, default_pages)
    
    # Initialize media
    if not os.path.exists(MEDIA_FILE):
        default_media = [
            {
                "id": 1,
                "name": "post-1.jpg",
                "path": "images/blog/post-1.jpg",
                "type": "image",
                "dateUploaded": "2025-06-01"
            },
            {
                "id": 2,
                "name": "post-2.jpg",
                "path": "images/blog/post-2.jpg",
                "type": "image",
                "dateUploaded": "2025-05-20"
            }
        ]
        save_data(MEDIA_FILE, default_media)
    
    # Initialize drive embeds
    if not os.path.exists(DRIVE_EMBEDS_FILE):
        default_drive_embeds = [
            {
                "id": 1,
                "name": "Vision Valley Photos",
                "driveId": "1xYz_ABC123_sample",
                "dateAdded": "2025-06-05"
            }
        ]
        save_data(DRIVE_EMBEDS_FILE, default_drive_embeds)
      # Initialize settings
    if not os.path.exists(SETTINGS_FILE):
        default_settings = {
            "siteName": "Vision Valley Residential Program",
            "siteTagline": "Pymble Ladies College",
            "siteDescription": "The Vision Valley Residential Program at Pymble Ladies College offers students a unique opportunity to learn, grow, and connect with nature while developing leadership skills and resilience.",
            "adminUsername": "admin",
            "adminEmail": "admin@visionvalley.com",
            "adminPassword": "admin",  # In production, store hashed passwords!
            "postsPerPage": 6,
            "showAuthor": True,
            "showDate": True,
            "allowComments": True
        }
        save_data(SETTINGS_FILE, default_settings)

# Authentication and security
def authenticate(username_or_email, password):
    """Simple authentication function that supports both username and email"""
    settings = load_data(SETTINGS_FILE, {})
    admin_username = settings.get("adminUsername")
    admin_email = settings.get("adminEmail", "admin@visionvalley.com")  # Default admin email
    
    # Check if input matches either username or email
    username_matches = username_or_email == admin_username
    email_matches = username_or_email == admin_email
    
    return ((username_matches or email_matches) and 
            password == settings.get("adminPassword"))

def check_firebase_auth():
    """Check if Firebase authentication header is present and valid"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Firebase '):
        # Extract the Firebase UID
        firebase_uid = auth_header.split(' ')[1]
        # In a real scenario, you would verify this token with Firebase
        # For now, we'll accept any Firebase token as valid
        return True
    return False

def is_authenticated():
    """Check if the request is authenticated using either method"""
    # Check traditional auth
    auth = request.authorization
    if auth and authenticate(auth.username, auth.password):
        return True
    
    # Check Firebase auth
    if check_firebase_auth():
        return True
    
    return False

# Initialize data on startup
init_data()

# Generate HTML files for existing posts
def generate_all_post_html_files():
    """Generate HTML files for all existing posts"""
    try:
        posts = load_data(POSTS_FILE, [])
        count = 0
        for post in posts:
            if post.get('slug') and post.get('status') == 'published':
                if generate_post_html(post):
                    count += 1
        print(f"Generated {count} HTML files for existing posts")
    except Exception as e:
        print(f"Error generating HTML files for existing posts: {e}")

# Generate HTML files on server startup
generate_all_post_html_files()

# API Routes
@app.route('/')
def home():
    return "Vision Valley Blog API Server is running!"

@app.route('/api/regenerate-html', methods=['POST'])
def regenerate_html():
    """Regenerate HTML files for all posts"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        posts = load_data(POSTS_FILE, [])
        regenerated = 0
        failed = 0
        
        for post in posts:
            if post.get('slug'):
                if generate_post_html(post):
                    regenerated += 1
                else:
                    failed += 1
        
        return jsonify({
            "success": True,
            "message": f"Regenerated {regenerated} HTML files. {failed} failed.",
            "regenerated": regenerated,
            "failed": failed
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Posts API endpoints
@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get all posts or published posts only"""
    posts = load_data(POSTS_FILE, [])
    published_only = request.args.get('published', 'false').lower() == 'true'
    
    if published_only:
        posts = [post for post in posts if post.get('status') == 'published']
    
    # Optional filtering by category
    category = request.args.get('category')
    if category:
        posts = [post for post in posts if post.get('category') == category]
    
    return jsonify(posts)

@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post by ID"""
    posts = load_data(POSTS_FILE, [])
    post = next((p for p in posts if p.get('id') == post_id), None)
    
    if post:
        return jsonify(post)
    else:
        return jsonify({"error": "Post not found"}), 404

@app.route('/api/posts/slug/<slug>', methods=['GET'])
def get_post_by_slug(slug):
    """Get a specific post by slug"""
    posts = load_data(POSTS_FILE, [])
    post = next((p for p in posts if p.get('slug') == slug), None)
    
    if post:
        return jsonify(post)
    else:
        return jsonify({"error": "Post not found"}), 404

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Create a new post"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    posts = load_data(POSTS_FILE, [])
    
    # Generate ID
    new_id = 1
    if posts:
        new_id = max(p.get('id', 0) for p in posts) + 1
    
    # Generate slug if not provided
    if 'slug' not in data or not data['slug']:
        data['slug'] = generate_slug(data['title'])
    
    # Set date if not provided
    if 'date' not in data or not data['date']:
        data['date'] = format_date()
    
    new_post = {
        'id': new_id,
        **data
    }
    
    posts.append(new_post)
    success = save_data(POSTS_FILE, posts)
    
    # Generate HTML file for the post
    if success:
        generate_post_html(new_post)
        return jsonify(new_post), 201
    else:
        return jsonify({"error": "Failed to save post"}), 500

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """Update an existing post"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    posts = load_data(POSTS_FILE, [])
    
    # Find the post
    post_index = next((i for i, p in enumerate(posts) if p.get('id') == post_id), None)
    if post_index is None:
        return jsonify({"error": "Post not found"}), 404
    
    # Get old slug for checking if it changed
    old_slug = posts[post_index].get('slug')
    
    # Update the post
    updated_post = {
        **posts[post_index],
        **data,
        'id': post_id  # Ensure ID doesn't change
    }
    
    # Generate slug if not provided or if title changed and slug is the same as before
    if ('slug' not in data or not data['slug']) and 'title' in data:
        updated_post['slug'] = generate_slug(data['title'])
    
    posts[post_index] = updated_post
    success = save_data(POSTS_FILE, posts)
    
    if success:
        # Generate HTML file for the updated post
        generate_post_html(updated_post)
        
        # Delete old HTML file if slug changed
        if old_slug and old_slug != updated_post.get('slug'):
            try:
                old_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog', f"{old_slug}.html")
                if os.path.exists(old_file_path):
                    os.remove(old_file_path)
                    print(f"Deleted old HTML file: {old_slug}.html")
            except Exception as e:
                print(f"Error deleting old HTML file: {e}")
        
        return jsonify(updated_post)
    else:
        return jsonify({"error": "Failed to update post"}), 500

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a post"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    posts = load_data(POSTS_FILE, [])
    
    # Find the post to get its slug before deletion
    post_to_delete = next((p for p in posts if p.get('id') == post_id), None)
    
    # Filter out the post to delete
    filtered_posts = [p for p in posts if p.get('id') != post_id]
    
    if len(filtered_posts) == len(posts):
        return jsonify({"error": "Post not found"}), 404
    
    success = save_data(POSTS_FILE, filtered_posts)
    
    if success:
        # Delete the post's HTML file if it exists
        if post_to_delete and post_to_delete.get('slug'):
            try:
                post_html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog', f"{post_to_delete['slug']}.html")
                if os.path.exists(post_html_path):
                    os.remove(post_html_path)
                    print(f"Deleted HTML file for post: {post_to_delete['slug']}")
            except Exception as e:
                print(f"Error deleting HTML file: {e}")
                
        # Continue with the original response
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to delete post"}), 500

# Pages API endpoints - similar structure to posts
@app.route('/api/pages', methods=['GET'])
def get_pages():
    pages = load_data(PAGES_FILE, [])
    published_only = request.args.get('published', 'false').lower() == 'true'
    
    if published_only:
        pages = [page for page in pages if page.get('status') == 'published']
    
    return jsonify(pages)

@app.route('/api/pages/<int:page_id>', methods=['GET'])
def get_page(page_id):
    pages = load_data(PAGES_FILE, [])
    page = next((p for p in pages if p.get('id') == page_id), None)
    
    if page:
        return jsonify(page)
    else:
        return jsonify({"error": "Page not found"}), 404

@app.route('/api/pages/slug/<slug>', methods=['GET'])
def get_page_by_slug(slug):
    pages = load_data(PAGES_FILE, [])
    page = next((p for p in pages if p.get('slug') == slug), None)
    
    if page:
        return jsonify(page)
    else:
        return jsonify({"error": "Page not found"}), 404

# Removed duplicate route - now all handled in the main '/api/media' POST endpoint

@app.route('/api/pages', methods=['POST'])
def create_page():
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    pages = load_data(PAGES_FILE, [])
    
    # Generate ID
    new_id = 1
    if pages:
        new_id = max(p.get('id', 0) for p in pages) + 1
    
    # Generate slug if not provided
    if 'slug' not in data or not data['slug']:
        data['slug'] = generate_slug(data['title'])
    
    new_page = {
        'id': new_id,
        **data
    }
    
    pages.append(new_page)
    success = save_data(PAGES_FILE, pages)
    
    if success:
        return jsonify(new_page), 201
    else:
        return jsonify({"error": "Failed to save page"}), 500

@app.route('/api/pages/<int:page_id>', methods=['PUT'])
def update_page(page_id):
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    pages = load_data(PAGES_FILE, [])
    
    # Find the page
    page_index = next((i for i, p in enumerate(pages) if p.get('id') == page_id), None)
    if page_index is None:
        return jsonify({"error": "Page not found"}), 404
    
    # Update the page
    updated_page = {
        **pages[page_index],
        **data,
        'id': page_id  # Ensure ID doesn't change
    }
    
    pages[page_index] = updated_page
    success = save_data(PAGES_FILE, pages)
    
    if success:
        return jsonify(updated_page)
    else:
        return jsonify({"error": "Failed to update page"}), 500

@app.route('/api/pages/<int:page_id>', methods=['DELETE'])
def delete_page(page_id):
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    pages = load_data(PAGES_FILE, [])
    
    # Filter out the page to delete
    filtered_pages = [p for p in pages if p.get('id') != page_id]
    
    if len(filtered_pages) == len(pages):
        return jsonify({"error": "Page not found"}), 404
    
    success = save_data(PAGES_FILE, filtered_pages)
    
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to delete page"}), 500

# Media API endpoints
@app.route('/api/media', methods=['GET'])
def get_media():
    media = load_data(MEDIA_FILE, [])
    return jsonify(media)

@app.route('/api/media/<int:media_id>', methods=['GET'])
def get_media_item(media_id):
    media = load_data(MEDIA_FILE, [])
    media_item = next((m for m in media if m.get('id') == media_id), None)
    
    if media_item:
        return jsonify(media_item)
    else:
        return jsonify({"error": "Media item not found"}), 404

@app.route('/api/media', methods=['POST'])
def create_media():
    """Create a new media entry"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    # Handle file upload
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Make sure it is an allowed file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webp'}
    if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "File type not allowed"}), 400
    
    # Generate unique filename
    filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
    file_path = os.path.join(UPLOADS_DIR, filename)
    
    try:
        # Save the file
        file.save(file_path)
        
        # Create media entry
        media = load_data(MEDIA_FILE, [])
        new_id = 1
        if media:
            new_id = max(m.get('id', 0) for m in media) + 1
        
        new_media = {
            'id': new_id,
            'name': file.filename,
            'path': f"/uploads/{filename}",  # Path accessible via the API
            'type': file.content_type.split('/')[0] if hasattr(file, 'content_type') else 'image',
            'title': request.form.get('title', file.filename),
            'description': request.form.get('description', ''),
            'dateUploaded': datetime.datetime.now().strftime('%Y-%m-%d')
        }
        
        media.append(new_media)
        success = save_data(MEDIA_FILE, media)
        
        if success:
            return jsonify({
                "success": True,
                "message": "File uploaded successfully",
                "media": new_media
            }), 201
        else:
            return jsonify({"error": "Failed to save media entry"}), 500
    except Exception as e:
        print(f"Error uploading file: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/media/<int:media_id>', methods=['DELETE'])
def delete_media(media_id):
    """Delete a media entry and its file"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    media = load_data(MEDIA_FILE, [])
    
    # Find the media entry
    media_item = next((m for m in media if m.get('id') == media_id), None)
    if not media_item:
        return jsonify({"error": "Media item not found"}), 404
    
    # Delete the actual file if it's in our uploads directory
    if media_item.get('path', '').startswith('/uploads/'):
        try:
            file_path = os.path.join(DATA_DIR, media_item['path'].lstrip('/'))
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    # Filter out the media entry
    filtered_media = [m for m in media if m.get('id') != media_id]
    success = save_data(MEDIA_FILE, filtered_media)
    
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to delete media entry"}), 500

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOADS_DIR, filename)

# Route to serve static files
@app.route('/<path:path>')
def send_static_file(path):
    """Serve static files from the root directory"""
    # Check if the path is a directory to prevent directory listing
    if os.path.isdir(os.path.join('.', path)):
        return "403 Forbidden", 403
        
    return send_from_directory('.', path)

# Specific route for blog HTML files
@app.route('/blog/<path:filename>')
def serve_blog_html(filename):
    """Serve blog HTML files"""
    return send_from_directory('blog', filename)

# Routes for serving CSS and JS files with proper content types
@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files with proper content type"""
    return send_from_directory('css', filename, mimetype='text/css')

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files with proper content type"""
    return send_from_directory('js', filename, mimetype='application/javascript')

# Drive embeds API endpoints
@app.route('/api/drive-embeds', methods=['GET'])
def get_drive_embeds():
    drive_embeds = load_data(DRIVE_EMBEDS_FILE, [])
    return jsonify(drive_embeds)

@app.route('/api/drive-embeds/<int:embed_id>', methods=['GET'])
def get_drive_embed(embed_id):
    drive_embeds = load_data(DRIVE_EMBEDS_FILE, [])
    embed = next((e for e in drive_embeds if e.get('id') == embed_id), None)
    
    if embed:
        return jsonify(embed)
    else:
        return jsonify({"error": "Drive embed not found"}), 404

@app.route('/api/drive-embeds', methods=['POST'])
def create_drive_embed():
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    drive_embeds = load_data(DRIVE_EMBEDS_FILE, [])
    
    # Generate ID
    new_id = 1
    if drive_embeds:
        new_id = max(e.get('id', 0) for e in drive_embeds) + 1
    
    new_embed = {
        'id': new_id,
        'dateAdded': datetime.datetime.now().strftime('%Y-%m-%d'),
        **data
    }
    
    drive_embeds.append(new_embed)
    success = save_data(DRIVE_EMBEDS_FILE, drive_embeds)
    
    if success:
        return jsonify(new_embed), 201
    else:
        return jsonify({"error": "Failed to save drive embed"}), 500

@app.route('/api/drive-embeds/<int:embed_id>', methods=['DELETE'])
def delete_drive_embed(embed_id):
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    drive_embeds = load_data(DRIVE_EMBEDS_FILE, [])
    
    # Filter out the embed to delete
    filtered_embeds = [e for e in drive_embeds if e.get('id') != embed_id]
    
    if len(filtered_embeds) == len(drive_embeds):
        return jsonify({"error": "Drive embed not found"}), 404
    
    success = save_data(DRIVE_EMBEDS_FILE, filtered_embeds)
    
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to delete drive embed"}), 500

# Settings API endpoints
@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get public settings (excluding admin credentials)"""
    settings = load_data(SETTINGS_FILE, {})
    
    # Remove sensitive information
    public_settings = {k: v for k, v in settings.items() if k not in ['adminUsername', 'adminPassword']}
    return jsonify(public_settings)

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update settings"""
    # Check authentication using either method
    if not is_authenticated():
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    settings = load_data(SETTINGS_FILE, {})
    
    # Handle password change if included
    if 'adminPassword' in data and data.get('currentPassword'):
        current_password = data.get('currentPassword')
        
        # Verify current password
        if current_password != settings.get('adminPassword'):
            return jsonify({"error": "Current password is incorrect"}), 400
        
        # Password verified, continue with update
    
    # Update only provided fields (excluding currentPassword)
    for key, value in data.items():
        if key != 'currentPassword':  # Skip the currentPassword field
            settings[key] = value
    
    success = save_data(SETTINGS_FILE, settings)
    
    if success:
        # Return public settings (excluding admin credentials)
        public_settings = {k: v for k, v in settings.items() if k not in ['adminUsername', 'adminPassword']}
        return jsonify(public_settings)
    else:
        return jsonify({"error": "Failed to update settings"}), 500

# Stats API endpoint
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get blog statistics"""    # Authentication check for detailed stats
    detailed = request.args.get('detailed', 'false').lower() == 'true'
    if detailed:
        if not is_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
    
    posts = load_data(POSTS_FILE, [])
    pages = load_data(PAGES_FILE, [])
    media = load_data(MEDIA_FILE, [])
    drive_embeds = load_data(DRIVE_EMBEDS_FILE, [])
    
    # Calculate basic stats
    stats = {
        "totalPosts": len(posts),
        "publishedPosts": len([p for p in posts if p.get('status') == 'published']),
        "totalPages": len(pages),
        "totalMedia": len(media),
        "totalDriveEmbeds": len(drive_embeds)
    }
    
    # Add more detailed stats if requested
    if detailed:
        # Calculate category stats
        categories = {}
        for post in posts:
            category = post.get('category')
            if category:
                categories[category] = categories.get(category, 0) + 1
        
        # Recent activity (would be more sophisticated in a real app)
        recent_activity = []
        
        # Add sorted posts by date (most recent first)
        sorted_posts = sorted(posts, key=lambda p: p.get('date', ''), reverse=True)
        recent_posts = sorted_posts[:5] if len(sorted_posts) > 5 else sorted_posts
        
        for post in recent_posts:
            recent_activity.append({
                "type": "post",
                "action": "create",
                "title": post.get('title', 'Untitled'),
                "date": post.get('date', 'Unknown date')
            })
        
        stats["categories"] = categories
        stats["recentActivity"] = recent_activity
    
    return jsonify(stats)

# Authentication endpoint
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate a user"""
    data = request.json
    username_or_email = data.get('username')  # This could be either username or email
    password = data.get('password')
    
    if authenticate(username_or_email, password):
        return jsonify({
            "success": True,
            "user": {
                "username": username_or_email,
                "loginTime": datetime.datetime.now().isoformat()
            }
        })
    else:
        return jsonify({
            "success": False,
            "error": "Invalid email or password"
        }), 401

# Main entry point
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
