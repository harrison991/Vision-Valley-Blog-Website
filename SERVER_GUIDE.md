# Vision Valley Blog - Server Setup Guide

This document explains how to set up and run the Python server that connects the main website to the admin panel for content management.

## Prerequisites

Before starting, make sure you have the following installed:
- Python 3.7 or higher
- pip (Python package manager)

## Installation

1. **Install Required Dependencies**

   Open a terminal/command prompt in the project directory and run:

   ```
   pip install -r requirements.txt
   ```

   This will install Flask and Flask-CORS, which are needed for the API server.

2. **Initialize the Server**

   Run the server using:

   ```
   python run.py
   ``` 

   This will start the API server on http://localhost:5000.

3. **Access Your Website**

   Open your website in your web browser as usual. The main site and admin panel will now communicate with the API server.

## API Structure

### Authentication

- **Login**: `POST /api/auth/login`
  - Default credentials: admin/admin

### Content Management

- **Posts**:
  - Get all posts: `GET /api/posts`
  - Get published posts: `GET /api/posts?published=true`
  - Get post by ID: `GET /api/posts/{id}`
  - Get post by slug: `GET /api/posts/slug/{slug}`
  - Create post: `POST /api/posts`
  - Update post: `PUT /api/posts/{id}`
  - Delete post: `DELETE /api/posts/{id}`

- **Pages**:
  - Similar to posts with `/api/pages` endpoints

- **Media**:
  - Get all media: `GET /api/media`
  - Get media by ID: `GET /api/media/{id}`
  - Upload media: `POST /api/media` (multipart/form-data)
  - Delete media: `DELETE /api/media/{id}`

- **Google Drive Embeds**:
  - Get all embeds: `GET /api/drive-embeds`
  - Get embed by ID: `GET /api/drive-embeds/{id}`
  - Create embed: `POST /api/drive-embeds`
  - Delete embed: `DELETE /api/drive-embeds/{id}`

- **Settings**:
  - Get settings: `GET /api/settings`
  - Update settings: `PUT /api/settings`

- **Stats**:
  - Get stats: `GET /api/stats`
  - Get detailed stats: `GET /api/stats?detailed=true`

## Data Storage

The server stores all data in JSON files located in the `server_data` directory:

- `posts.json`: Blog posts
- `pages.json`: Pages
- `media.json`: Media metadata
- `drive_embeds.json`: Google Drive embeds
- `settings.json`: Site settings

Uploaded files are stored in the `server_data/uploads` directory.

## Troubleshooting

- **Server won't start**: Make sure you've installed all dependencies with `pip install -r requirements.txt`
- **Connection errors**: Verify that the server is running and accessible at http://localhost:5000
- **API errors**: Check the terminal output for any Python errors

## Further Development

This API server is a simple implementation for local development. For production use, consider:

1. Adding proper user authentication with tokens/sessions
2. Using a database like SQLite, MySQL, or MongoDB
3. Implementing proper error handling and validation
4. Adding file upload size limits and type validation
5. Setting up HTTPS for secure connections

## Blog Post Styling

The blog posts are generated from the `server_data/posts.json` file and converted to HTML files in the `blog` directory using the template in `blog/template.html`. 

### Regenerating Blog Posts

If blog posts appear without styling when accessed directly from the server, you may need to regenerate them with the correct template. To do this, run:

```
python regenerate_blogs.py
```

This script will rebuild all blog HTML files using the current template, ensuring they have the proper styling, navigation, and dynamic content.

### Common Blog Issues

If you encounter issues with blog posts:

1. **Plain text posts**: Run `regenerate_blogs.py` to rebuild all blog HTML files
2. **Missing CSS styles**: Ensure server routes for `/css/` files are working correctly
3. **Broken links**: Check that paths in the blog template use absolute paths (starting with `/`)
4. **Missing images**: Make sure image URLs are correct and the server can access them

For testing, you can access the API test page at `http://[YOUR_PI_IP]:5000/api_blog_test.html` which provides tools to diagnose blog content issues.
