# Vision Valley Residential Program Blog Website

This is a complete website solution for the Vision Valley Residential Program by Pymble Ladies College. It features a modern responsive design with a dynamic blog system, Google Drive integration for resource sharing, and a comprehensive admin panel for content management.

## Features

- **Responsive Modern Design**: Mobile-first approach with elegant typography and smooth animations
- **Dynamic Blog System**: Create, edit, and manage blog posts with categories and tags
- **Google Drive Integration**: Seamlessly embed Google Drive content and resources
- **Admin Panel**: Full-featured content management system with authentication
- **API-Driven Architecture**: Flask-based REST API for dynamic content management
- **Media Management**: Upload and organize images and files
- **SEO-Friendly**: Clean URLs and proper meta tags for search engine optimization

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask with RESTful API
- **Database**: JSON-based file storage
- **Dependencies**: Flask, Flask-CORS

## Directory Structure

```
├── /                    # Root directory - main website pages
│   ├── index.html       # Homepage
│   ├── about.html       # About page
│   ├── blog.html        # Blog listing page
│   ├── gallery.html     # Photo gallery
│   └── contact.html     # Contact information
├── /css/                # Stylesheets
│   ├── style.css        # Main website styles
│   ├── blog.css         # Blog-specific styles
│   └── admin-dashboard.css # Admin panel styles
├── /js/                 # JavaScript files
│   ├── main.js          # Main website functionality
│   ├── api.js           # API communication
│   ├── admin.js         # Admin panel functionality
│   └── firebase-config.js # Firebase configuration
├── /images/             # Static images and media
├── /blog/               # Individual blog post pages
├── /admin/              # Admin panel interface
├── /server_data/        # Server data storage
│   ├── posts.json       # Blog posts data
│   ├── pages.json       # Static pages data
│   ├── media.json       # Media library data
│   └── uploads/         # Uploaded files
├── server.py            # Main Flask application
├── run.py               # Server startup script
└── requirements.txt     # Python dependencies
```

## Installation & Setup

### Prerequisites

Before starting, ensure you have the following installed on your system:

- **Python 3.7 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** (Python package manager) - Usually comes with Python
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Step 1: Install Dependencies

1. Open a terminal/command prompt
2. Navigate to the project directory:
   ```bash
   cd /path/to/Vision-Valley-Blog-Website
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### Step 2: Start the Server

There are two ways to start the server:

**Option A: Using the run script (Recommended)**
```bash
python run.py
```

**Option B: Direct server execution**
```bash
python server.py
```

You should see output similar to:
```
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[your-ip]:5000
```

### Step 3: Access the Website

1. **Main Website**: Open your web browser and navigate to:
   - `http://localhost:5000` (if using the server)
   - Or simply open `index.html` directly in your browser for static viewing

2. **Admin Panel**: Access the admin interface at:
   - `http://localhost:5000/admin/login.html`
   - Or click the "Admin" button in the website header

3. **Default Admin Credentials**:
   - Username: `admin`
   - Password: `admin`

## Server Information

### Server Configuration

- **Host**: `0.0.0.0` (accessible from any network interface)
- **Port**: `5000`
- **Debug Mode**: Enabled (automatically reloads on code changes)
- **CORS**: Enabled for cross-origin requests

### API Endpoints

The server provides a REST API for content management:

- **Authentication**: `POST /api/auth/login`
- **Posts**: `GET/POST/PUT/DELETE /api/posts`
- **Pages**: `GET/POST/PUT/DELETE /api/pages`
- **Media**: `GET/POST/DELETE /api/media`
- **Settings**: `GET/POST /api/settings`

### Data Storage

All data is stored in JSON files within the `server_data/` directory:
- Blog posts and pages are stored as JSON objects
- Media files are uploaded to `server_data/uploads/`
- No database installation required

## Admin Panel Features

The admin panel provides comprehensive content management capabilities:

### Dashboard
- **Site Statistics**: View total posts, pages, and media files
- **Recent Activity**: Track latest content updates
- **Quick Actions**: Fast access to common tasks

### Blog Management
- **Create Posts**: Rich text editor with formatting options
- **Edit/Delete Posts**: Full CRUD operations
- **Categories & Tags**: Organize content with flexible taxonomy
- **Draft System**: Save work in progress
- **Publishing Controls**: Schedule posts and manage visibility

### Page Management
- **Static Pages**: Create and manage non-blog content
- **Custom Templates**: Flexible page layouts
- **Navigation Control**: Manage site menu structure

### Media Library
- **File Upload**: Support for images and documents
- **Organization**: Folder-based file management
- **Google Drive Integration**: Embed external content
- **Bulk Operations**: Manage multiple files at once

### Settings
- **Site Configuration**: Global website settings
- **User Management**: Admin account controls
- **SEO Settings**: Meta tags and search optimization

## Google Drive Integration

The website includes powerful Google Drive integration for sharing educational resources:

### How to Embed Google Drive Content

1. **Access Admin Panel**:
   - Navigate to `http://localhost:5000/admin/login.html`
   - Login with admin credentials

2. **Go to Media Section**:
   - Click "Media" in the admin navigation
   - Select "Google Drive" tab

3. **Add Drive Content**:
   - Enter your Google Drive URL or folder ID
   - Configure display options (grid, list, preview)
   - Set permissions and access levels

4. **Generate Embed Code**:
   - Click "Generate Embed"
   - Copy the provided HTML code
   - Paste into your blog post or page content

5. **Supported Content Types**:
   - Documents (PDF, Word, PowerPoint)
   - Images and photo galleries
   - Video files
   - Shared folders
   - Forms and spreadsheets

### Google Drive URL Formats

The system accepts various Google Drive URL formats:
- Full sharing URLs: `https://drive.google.com/drive/folders/[FOLDER_ID]`
- File URLs: `https://drive.google.com/file/d/[FILE_ID]/view`
- Direct folder IDs: `[FOLDER_ID]`

## Troubleshooting

### Common Issues

**Server Won't Start**
- Ensure Python 3.7+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5000 is available: `lsof -i :5000`

**Cannot Access Admin Panel**
- Verify server is running on `http://localhost:5000`
- Clear browser cache and cookies
- Try accessing directly: `http://localhost:5000/admin/login.html`

**API Errors**
- Check server console for error messages
- Ensure CORS is enabled for your domain
- Verify JSON data files in `server_data/` directory

**File Upload Issues**
- Check write permissions on `server_data/uploads/` directory
- Verify file size limits (default: 16MB)
- Ensure supported file types

### Development Mode

For development and testing:

1. **Enable Debug Mode**: Server runs with debug=True by default
2. **Auto-Reload**: Server automatically restarts on code changes
3. **Error Reporting**: Detailed error messages in browser
4. **API Testing**: Use tools like Postman or curl for API testing

### Production Deployment

For production use:

1. **Disable Debug Mode**: Set `debug=False` in `server.py`
2. **Use Production Server**: Consider using Gunicorn or uWSGI
3. **Configure HTTPS**: Set up SSL certificates
4. **Database Migration**: Consider moving to PostgreSQL or MySQL
5. **Backup Strategy**: Regular backups of `server_data/` directory

## Browser Compatibility

The website is tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- **Default Credentials**: Change the default admin password in production
- **File Uploads**: Validate file types and scan for malware
- **CORS Configuration**: Restrict origins in production environment
- **Data Backup**: Regularly backup the `server_data/` directory

## Performance Optimization

- **Image Optimization**: Compress images before upload
- **Caching**: Browser caching enabled for static assets
- **Minification**: Consider minifying CSS and JavaScript for production
- **CDN**: Use content delivery network for better global performance

## Contact & Support

For any questions, issues, or feature requests:
- Check the existing documentation in `SERVER_GUIDE.md`
- Review error logs in the server console
- Contact the website administrator
- Submit issues to the project repository

---

© 2025 Harrison Fluck and Associates. All rights reserved.
