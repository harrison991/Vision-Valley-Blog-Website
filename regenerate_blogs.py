import json
import os

def load_data(file_path, default=None):
    """Load data from a JSON file"""
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

def generate_post_html(post, template):
    """Generate HTML for a blog post"""
    try:
        # Define paths
        blog_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog')
        output_path = os.path.join(blog_dir, f"{post['slug']}.html")
        
        # Create blog directory if it doesn't exist
        os.makedirs(blog_dir, exist_ok=True)
        
        # Replace template variables
        html = template
        html = html.replace('{{title}}', post.get('title', 'Untitled Post'))
        html = html.replace('{{date}}', post.get('date', ''))
        html = html.replace('{{author}}', post.get('author', 'Unknown'))
        html = html.replace('{{content}}', post.get('content', ''))
        html = html.replace('{{image}}', post.get('image', 'images/placeholder-image.jpg'))
        html = html.replace('{{category}}', post.get('category', 'Uncategorized').title())
        
        # Write the file
        with open(output_path, 'w') as file:
            file.write(html)
        
        print(f"Generated HTML file for post: {post['slug']}")
        return True
    except Exception as e:
        print(f"Error generating HTML file for post: {e}")
        return False

def regenerate_all_posts():
    """Regenerate HTML for all blog posts"""
    # Define paths
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server_data')
    posts_file = os.path.join(data_dir, 'posts.json')
    template_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blog', 'template.html')
    
    # Load posts and template
    posts = load_data(posts_file, [])
    
    try:
        with open(template_path, 'r') as file:
            template = file.read()
    except Exception as e:
        print(f"Error loading template: {e}")
        return False
    
    # Generate HTML for each post
    success_count = 0
    failure_count = 0
    
    for post in posts:
        if post.get('slug'):
            if generate_post_html(post, template):
                success_count += 1
            else:
                failure_count += 1
    
    print(f"Regenerated {success_count} HTML files. {failure_count} failed.")
    return True

if __name__ == "__main__":
    print("Regenerating all blog posts...")
    regenerate_all_posts()
    print("Done!")
