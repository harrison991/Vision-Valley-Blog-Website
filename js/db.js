// Vision Valley Blog - Local Database Module
// This module handles data storage and retrieval using localStorage

const DB = {
    // Storage keys
    KEYS: {
        POSTS: 'visionValley_posts',
        PAGES: 'visionValley_pages',
        MEDIA: 'visionValley_media',
        DRIVE_EMBEDS: 'visionValley_driveEmbeds',
        SETTINGS: 'visionValley_settings',
        STATS: 'visionValley_stats'
    },

    // Initialize the database with default data if empty
    init: function() {
        // Initialize posts if not exist
        if (!this.getPosts()) {
            const defaultPosts = [
                {
                    id: 1,
                    title: 'Our Journey Through the Wilderness',
                    content: `<p>Students from Pymble Ladies College recently embarked on a transformative wilderness journey as part of the Vision Valley Residential Program. The expedition was designed to challenge the students both physically and mentally, while fostering a deep connection with nature.</p>
                    <p>Over the course of five days, participants hiked through rugged terrain, set up camp under the stars, and engaged in team-building activities. The experience encouraged self-reflection and personal growth while developing crucial skills like resilience, teamwork, and leadership.</p>
                    <p>"This journey pushed me outside my comfort zone in ways I never expected," shared one Year 10 student. "I discovered strengths I didn't know I had and formed incredible bonds with my classmates."</p>
                    <h3>Key Learning Outcomes</h3>
                    <ul>
                        <li>Enhanced problem-solving skills through navigation challenges</li>
                        <li>Developed greater resilience and perseverance</li>
                        <li>Strengthened community bonds through shared challenges</li>
                        <li>Gained appreciation for environmental conservation</li>
                    </ul>
                    <p>The wilderness journey is just one component of the Vision Valley Residential Program, which aims to provide students with experiences that complement their academic studies and prepare them for life beyond school.</p>`,
                    excerpt: 'Students reflect on their transformative experience during our week-long wilderness expedition.',
                    date: 'June 10, 2025',
                    author: 'Sarah Johnson',
                    image: 'images/blog/post-1.jpg',
                    slug: 'wilderness-journey',
                    category: 'student-life',
                    status: 'published'
                },
                {
                    id: 2,
                    title: 'Leadership Skills Developed at Vision Valley',
                    content: `<p>The Vision Valley Residential Program at Pymble Ladies College continues to excel in developing crucial leadership skills among students. Through carefully designed activities and mentorship opportunities, participants gain practical experience in leadership that will serve them well beyond their school years.</p>
                    <p>The program incorporates various leadership models and provides students with opportunities to lead in different contexts. From organizing community service initiatives to managing team projects, participants are constantly challenged to step into leadership roles.</p>
                    <h3>Leadership Development Framework</h3>
                    <p>Our approach focuses on five key areas:</p>
                    <ol>
                        <li><strong>Self-awareness:</strong> Understanding personal strengths and areas for growth</li>
                        <li><strong>Communication:</strong> Developing clear and effective communication skills</li>
                        <li><strong>Decision-making:</strong> Learning to make informed and ethical decisions</li>
                        <li><strong>Collaboration:</strong> Working effectively with diverse teams</li>
                        <li><strong>Initiative:</strong> Taking action to address challenges and opportunities</li>
                    </ol>
                    <p>Through reflection sessions and feedback from peers and mentors, students develop a deeper understanding of their leadership style and how to adapt it to different situations.</p>
                    <p>"The leadership skills I've developed at Vision Valley have already helped me in so many ways," said Emily, a Year 11 student. "I'm more confident in speaking up and taking initiative, both at school and in my community commitments."</p>`,
                    excerpt: 'How our residential program helps students develop essential leadership qualities.',
                    date: 'May 28, 2025',
                    author: 'Emily Parker',
                    image: 'images/blog/post-2.jpg',
                    slug: 'leadership-skills',
                    category: 'leadership',
                    status: 'published'
                },
                {
                    id: 3,
                    title: 'Connecting with Nature: Environmental Projects',
                    content: `<p>Environmental stewardship is a core value at Vision Valley, and students in our residential program have been actively engaged in various conservation projects throughout the year. These hands-on experiences provide valuable insights into sustainability while fostering a deep connection with the natural world.</p>
                    <p>Recent projects have included water quality monitoring in local creeks, native plant restoration, and wildlife habitat creation. Through these initiatives, students gain practical skills in environmental science while making a tangible difference in their local ecosystem.</p>
                    <h3>Current Environmental Initiatives</h3>
                    <ul>
                        <li>Creek Restoration Project: Removing invasive species and planting native vegetation</li>
                        <li>Bird Habitat Creation: Building and monitoring nesting boxes</li>
                        <li>Waste Reduction Campaign: Implementing composting and recycling systems</li>
                        <li>Water Conservation: Installing rainwater collection systems</li>
                    </ul>
                    <p>These projects align with the curriculum across multiple subject areas, including biology, geography, and sustainability studies.</p>
                    <p>"What I love about these environmental projects is that we can see the impact of our work," shared Sophie, a Year 9 participant. "When we return to areas we've previously restored, it's amazing to see how much has changed and grown."</p>
                    <p>The knowledge and passion for environmental conservation that students develop through these experiences often extend beyond their time at Vision Valley, inspiring ongoing commitment to sustainability in their personal lives and future careers.</p>`,
                    excerpt: 'Students engage in environmental conservation projects as part of their learning journey.',
                    date: 'May 15, 2025',
                    author: 'Michael Thompson',
                    image: 'images/blog/post-3.jpg',
                    slug: 'environmental-projects',
                    category: 'nature',
                    status: 'published'
                },
                {
                    id: 4,
                    title: 'Upcoming Events for Vision Valley Program',
                    content: `<p>The Vision Valley Residential Program has an exciting calendar of events planned for the upcoming term. These events offer diverse opportunities for learning, leadership development, and community engagement.</p>
                    <h3>Featured Upcoming Events</h3>
                    <h4>Community Service Day - July 15, 2025</h4>
                    <p>Students will partner with local organizations to complete service projects addressing community needs. Activities will include environmental cleanup, work with senior citizens, and support for local food banks.</p>
                    <h4>Leadership Summit - July 28-29, 2025</h4>
                    <p>A two-day intensive workshop featuring guest speakers from various industries who will share their leadership journeys and insights. Students will participate in practical exercises designed to enhance their leadership capabilities.</p>
                    <h4>Cultural Exchange Weekend - August 12-13, 2025</h4>
                    <p>An immersive experience focusing on cultural diversity and global citizenship. Students will engage with representatives from different cultural backgrounds, participate in traditional arts and crafts, and explore diverse cuisines.</p>
                    <h4>Environmental Symposium - August 25, 2025</h4>
                    <p>A day dedicated to environmental education and action. Activities will include workshops on sustainability, presentations from environmental experts, and the launch of new conservation initiatives.</p>
                    <p>Registration for these events is now open to all Vision Valley program participants. For more information or to register, please contact the program office.</p>`,
                    excerpt: 'Mark your calendars for these exciting upcoming events at the Vision Valley Residential Program.',
                    date: 'May 5, 2025',
                    author: 'Jessica Brown',
                    image: 'images/blog/post-4.jpg',
                    slug: 'upcoming-events',
                    category: 'events',
                    status: 'draft'
                }
            ];
            this.savePosts(defaultPosts);
        }

        // Initialize pages if not exist
        if (!this.getPages()) {
            const defaultPages = [
                {
                    id: 1,
                    title: 'About',
                    content: '<p>About the Vision Valley Residential Program</p>',
                    slug: 'about',
                    status: 'published'
                },
                {
                    id: 2,
                    title: 'Contact',
                    content: '<p>Contact information for the Vision Valley Residential Program</p>',
                    slug: 'contact',
                    status: 'published'
                },
                {
                    id: 3,
                    title: 'Gallery',
                    content: '<p>Photo gallery of Vision Valley activities</p>',
                    slug: 'gallery',
                    status: 'published'
                }
            ];
            this.savePages(defaultPages);
        }

        // Initialize media if not exist
        if (!this.getMedia()) {
            const defaultMedia = [
                {
                    id: 1,
                    name: 'post-1.jpg',
                    path: 'images/blog/post-1.jpg',
                    type: 'image',
                    dateUploaded: '2025-06-01'
                },
                {
                    id: 2,
                    name: 'post-2.jpg',
                    path: 'images/blog/post-2.jpg',
                    type: 'image',
                    dateUploaded: '2025-05-20'
                },
                {
                    id: 3,
                    name: 'post-3.jpg',
                    path: 'images/blog/post-3.jpg',
                    type: 'image',
                    dateUploaded: '2025-05-10'
                },
                {
                    id: 4,
                    name: 'post-4.jpg',
                    path: 'images/blog/post-4.jpg',
                    type: 'image',
                    dateUploaded: '2025-05-01'
                }
            ];
            this.saveMedia(defaultMedia);
        }

        // Initialize drive embeds if not exist
        if (!this.getDriveEmbeds()) {
            const defaultDriveEmbeds = [
                {
                    id: 1,
                    name: 'Vision Valley Photos',
                    driveId: '1xYz_ABC123_sample',
                    dateAdded: '2025-06-05'
                },
                {
                    id: 2,
                    name: 'Student Resources',
                    driveId: '2aBc_XYZ456_sample',
                    dateAdded: '2025-05-28'
                }
            ];
            this.saveDriveEmbeds(defaultDriveEmbeds);
        }

        // Initialize statistics
        this.updateStats();
    },

    // Post-related methods
    getPosts: function() {
        try {
            const posts = localStorage.getItem(this.KEYS.POSTS);
            return posts ? JSON.parse(posts) : null;
        } catch (error) {
            console.error('Error getting posts:', error);
            return null;
        }
    },

    getPostBySlug: function(slug) {
        const posts = this.getPosts();
        if (!posts) return null;
        return posts.find(post => post.slug === slug);
    },

    getPostById: function(id) {
        id = parseInt(id);
        const posts = this.getPosts();
        if (!posts) return null;
        return posts.find(post => post.id === id);
    },

    getPublishedPosts: function() {
        const posts = this.getPosts();
        if (!posts) return [];
        return posts.filter(post => post.status === 'published');
    },

    savePosts: function(posts) {
        try {
            localStorage.setItem(this.KEYS.POSTS, JSON.stringify(posts));
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error saving posts:', error);
            return false;
        }
    },

    createPost: function(postData) {
        const posts = this.getPosts() || [];
        
        // Generate ID
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        
        // Create slug if not provided
        if (!postData.slug) {
            postData.slug = this.generateSlug(postData.title);
        }
        
        // Set current date if not provided
        if (!postData.date) {
            postData.date = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        const newPost = {
            id: newId,
            ...postData
        };
        
        posts.push(newPost);
        this.savePosts(posts);
        return newPost;
    },

    updatePost: function(id, postData) {
        id = parseInt(id);
        const posts = this.getPosts() || [];
        const index = posts.findIndex(post => post.id === id);
        
        if (index === -1) return false;
        
        // Update the post
        posts[index] = {
            ...posts[index],
            ...postData,
            id: id // Ensure ID doesn't change
        };
        
        this.savePosts(posts);
        return posts[index];
    },

    deletePost: function(id) {
        id = parseInt(id);
        const posts = this.getPosts() || [];
        const newPosts = posts.filter(post => post.id !== id);
        
        if (newPosts.length === posts.length) return false;
        
        this.savePosts(newPosts);
        return true;
    },

    // Page-related methods
    getPages: function() {
        try {
            const pages = localStorage.getItem(this.KEYS.PAGES);
            return pages ? JSON.parse(pages) : null;
        } catch (error) {
            console.error('Error getting pages:', error);
            return null;
        }
    },

    getPageBySlug: function(slug) {
        const pages = this.getPages();
        if (!pages) return null;
        return pages.find(page => page.slug === slug);
    },

    getPageById: function(id) {
        id = parseInt(id);
        const pages = this.getPages();
        if (!pages) return null;
        return pages.find(page => page.id === id);
    },

    getPublishedPages: function() {
        const pages = this.getPages();
        if (!pages) return [];
        return pages.filter(page => page.status === 'published');
    },

    savePages: function(pages) {
        try {
            localStorage.setItem(this.KEYS.PAGES, JSON.stringify(pages));
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error saving pages:', error);
            return false;
        }
    },

    createPage: function(pageData) {
        const pages = this.getPages() || [];
        
        // Generate ID
        const newId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;
        
        // Create slug if not provided
        if (!pageData.slug) {
            pageData.slug = this.generateSlug(pageData.title);
        }
        
        const newPage = {
            id: newId,
            ...pageData
        };
        
        pages.push(newPage);
        this.savePages(pages);
        return newPage;
    },

    updatePage: function(id, pageData) {
        id = parseInt(id);
        const pages = this.getPages() || [];
        const index = pages.findIndex(page => page.id === id);
        
        if (index === -1) return false;
        
        // Update the page
        pages[index] = {
            ...pages[index],
            ...pageData,
            id: id // Ensure ID doesn't change
        };
        
        this.savePages(pages);
        return pages[index];
    },

    deletePage: function(id) {
        id = parseInt(id);
        const pages = this.getPages() || [];
        const newPages = pages.filter(page => page.id !== id);
        
        if (newPages.length === pages.length) return false;
        
        this.savePages(newPages);
        return true;
    },

    // Media-related methods
    getMedia: function() {
        try {
            const media = localStorage.getItem(this.KEYS.MEDIA);
            return media ? JSON.parse(media) : null;
        } catch (error) {
            console.error('Error getting media:', error);
            return null;
        }
    },

    saveMedia: function(media) {
        try {
            localStorage.setItem(this.KEYS.MEDIA, JSON.stringify(media));
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error saving media:', error);
            return false;
        }
    },

    addMedia: function(mediaData) {
        const media = this.getMedia() || [];
        
        // Generate ID
        const newId = media.length > 0 ? Math.max(...media.map(m => m.id)) + 1 : 1;
        
        // Set current date if not provided
        if (!mediaData.dateUploaded) {
            mediaData.dateUploaded = new Date().toISOString().split('T')[0];
        }
        
        const newMedia = {
            id: newId,
            ...mediaData
        };
        
        media.push(newMedia);
        this.saveMedia(media);
        return newMedia;
    },

    deleteMedia: function(id) {
        id = parseInt(id);
        const media = this.getMedia() || [];
        const newMedia = media.filter(item => item.id !== id);
        
        if (newMedia.length === media.length) return false;
        
        this.saveMedia(newMedia);
        return true;
    },

    // Drive embed methods
    getDriveEmbeds: function() {
        try {
            const embeds = localStorage.getItem(this.KEYS.DRIVE_EMBEDS);
            return embeds ? JSON.parse(embeds) : null;
        } catch (error) {
            console.error('Error getting drive embeds:', error);
            return null;
        }
    },

    saveDriveEmbeds: function(embeds) {
        try {
            localStorage.setItem(this.KEYS.DRIVE_EMBEDS, JSON.stringify(embeds));
            return true;
        } catch (error) {
            console.error('Error saving drive embeds:', error);
            return false;
        }
    },

    addDriveEmbed: function(embedData) {
        const embeds = this.getDriveEmbeds() || [];
        
        // Generate ID
        const newId = embeds.length > 0 ? Math.max(...embeds.map(e => e.id)) + 1 : 1;
        
        // Set current date if not provided
        if (!embedData.dateAdded) {
            embedData.dateAdded = new Date().toISOString().split('T')[0];
        }
        
        const newEmbed = {
            id: newId,
            ...embedData
        };
        
        embeds.push(newEmbed);
        this.saveDriveEmbeds(embeds);
        return newEmbed;
    },

    deleteDriveEmbed: function(id) {
        id = parseInt(id);
        const embeds = this.getDriveEmbeds() || [];
        const newEmbeds = embeds.filter(embed => embed.id !== id);
        
        if (newEmbeds.length === embeds.length) return false;
        
        this.saveDriveEmbeds(newEmbeds);
        return true;
    },

    // Stats methods
    getStats: function() {
        try {
            const stats = localStorage.getItem(this.KEYS.STATS);
            return stats ? JSON.parse(stats) : null;
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    },

    updateStats: function() {
        const posts = this.getPosts() || [];
        const pages = this.getPages() || [];
        const media = this.getMedia() || [];
        
        const stats = {
            totalPosts: posts.length,
            publishedPosts: posts.filter(post => post.status === 'published').length,
            draftPosts: posts.filter(post => post.status === 'draft').length,
            totalPages: pages.length,
            mediaCount: media.length,
            categories: this.getCategoryStats(posts),
            recentActivity: this.getRecentActivity(),
            lastUpdated: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
            return stats;
        } catch (error) {
            console.error('Error updating stats:', error);
            return null;
        }
    },

    getCategoryStats: function(posts) {
        const categories = {};
        
        posts.forEach(post => {
            if (post.category) {
                if (!categories[post.category]) {
                    categories[post.category] = 0;
                }
                categories[post.category]++;
            }
        });
        
        return categories;
    },

    getRecentActivity: function() {
        // This would track changes to the site
        // For now, return a simple placeholder
        return [
            {
                type: 'post',
                action: 'create',
                date: new Date().toISOString(),
                description: 'New post created'
            }
        ];
    },

    // Utility methods
    generateSlug: function(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')     // Replace spaces with hyphens
            .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
            .trim();                  // Trim whitespace
    },

    getParameterByName: function(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
};

// Initialize the database when the script is loaded
document.addEventListener('DOMContentLoaded', function() {
    DB.init();
});
