class PortfolioApp {
    constructor() {
        this.projects = [];
        this.modal = document.getElementById('projectModal');
        this.modalBody = document.getElementById('modalBody');
        this.projectsGrid = document.getElementById('projectsGrid');
        
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.setupEventListeners();
    }

    async loadProjects() {
        try {
            // Load the project list from projects.json
            const response = await fetch('projects/projects.json');
            if (!response.ok) {
                throw new Error('Failed to load projects list');
            }
            
            const projectList = await response.json();
            this.projects = [];

            // Load each project's markdown content
            for (const project of projectList) {
                try {
                    // Updated path structure: projects/folder-name/file.md
                    const projectPath = project.folder ? 
                        `projects/${project.folder}/${project.file}` : 
                        `projects/${project.file}`;
                    
                    const markdownResponse = await fetch(projectPath);
                    if (markdownResponse.ok) {
                        const markdownContent = await markdownResponse.text();
                        console.log('Raw markdown content:', markdownContent.substring(0, 200) + '...');
                        
                        const { frontMatter, content } = this.parseFrontMatter(markdownContent);
                        console.log('Parsed front matter:', frontMatter);
                        console.log('Parsed content:', content.substring(0, 100) + '...');
                        
                        // Update image paths to be relative to project folder
                        const processedContent = this.updateImagePaths(content, project.folder);
                        
                        this.projects.push({
                            id: project.id,
                            folder: project.folder,
                            title: frontMatter.title || project.title || 'Untitled Project',
                            icon: frontMatter.icon || project.icon || '📄',
                            image: frontMatter.image ? this.getProjectImagePath(frontMatter.image, project.folder) : project.image,
                            progress: frontMatter.progress || '',
                            date: frontMatter.date || '',
                            skills: frontMatter.skills || '',
                            difficulty: frontMatter.difficulty || '',
                            content: processedContent
                        });
                        
                        // Debug: Log the final project data
                        const lastProject = this.projects[this.projects.length - 1];
                        console.log('Final project data:', {
                            title: lastProject.title,
                            image: lastProject.image,
                            icon: lastProject.icon
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to load project ${project.file}:`, error);
                }
            }

            if (this.projects.length === 0) {
                this.showError('No projects found. Add some .md files to the projects folder!');
                return;
            }

            this.renderProjects();

        } catch (error) {
            console.error('Error loading projects:', error);
            this.showFallbackProjects();
        }
    }

    parseFrontMatter(markdown) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontMatterRegex);
        
        if (match) {
            const frontMatterText = match[1];
            const content = match[2];
            const frontMatter = {};
            
            // Parse YAML-like front matter
            frontMatterText.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();
                    // Remove quotes if they exist
                    value = value.replace(/^["']|["']$/g, '');
                    frontMatter[key] = value;
                }
            });
            
            return { frontMatter, content };
        } else {
            // If no front matter found, return empty front matter and full content
            return { frontMatter: {}, content: markdown };
        }
    }

    updateImagePaths(content, projectFolder) {
        if (!projectFolder) return content;
        
        // Update relative image paths to include project folder
        let updatedContent = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (match, alt, src) => {
            // Skip if it's already an absolute path or starts with projects/
            if (src.startsWith('/') || src.startsWith('projects/')) {
                return match;
            }
            // Convert relative paths to include project folder
            return `![${alt}](projects/${projectFolder}/${src})`;
        });

        // Update video src attributes to include project folder
        updatedContent = updatedContent.replace(/<source\s+src="(?!https?:\/\/)([^"]+)"/g, (match, src) => {
            // Skip if it's already an absolute path or starts with projects/
            if (src.startsWith('/') || src.startsWith('projects/')) {
                return match;
            }
            // Convert relative paths to include project folder
            return `<source src="projects/${projectFolder}/${src}"`;
        });

        // Also handle video tag src attributes
        updatedContent = updatedContent.replace(/<video([^>]*)\s+src="(?!https?:\/\/)([^"]+)"/g, (match, attrs, src) => {
            // Skip if it's already an absolute path or starts with projects/
            if (src.startsWith('/') || src.startsWith('projects/')) {
                return match;
            }
            // Convert relative paths to include project folder
            return `<video${attrs} src="projects/${projectFolder}/${src}"`;
        });

        return updatedContent;
    }

    getProjectImagePath(imagePath, projectFolder) {
        if (!projectFolder || imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        return `projects/${projectFolder}/${imagePath}`;
    }

    showFallbackProjects() {
        // Fallback demo projects if projects.json doesn't exist
        const demoProjects = [
            {
                id: 'project1',
                title: 'Web Application',
                icon: '🌐',
                content: `# Web Application

A modern web application built with React and Node.js.

## Features

- Responsive design
- Real-time updates
- User authentication
- Data visualization

## Technologies Used

- React.js
- Node.js
- MongoDB
- Express.js

This project demonstrates modern web development practices with a focus on user experience and performance.

*To add your own projects, create markdown files in the projects folder and update projects.json*`
            },
            {
                id: 'demo-setup',
                title: 'Setup Instructions',
                icon: '📝',
                content: `# Portfolio Setup

Welcome to your portfolio! Here's how to add your own projects:

## Quick Start

1. Create \`.md\` files in the \`projects\` folder
2. Update \`projects/projects.json\` with your project list
3. Use front matter in your markdown files

## Example Project File

Create \`projects/my-project.md\`:

\`\`\`markdown
---
title: "My Amazing Project"
icon: "🚀"
image: "images/my-project-thumb.png"
---

# My Amazing Project

Your project description goes here...

## Features

- Feature 1
- Feature 2

![Screenshot](images/screenshot.png)
\`\`\`

## Update projects.json

Add your project to \`projects/projects.json\`:

\`\`\`json
[
    {
        "id": "my-project",
        "file": "my-project.md"
    }
]
\`\`\`

That's it! Your project will appear automatically.`
            }
        ];

        this.projects = demoProjects;
        this.renderProjects();
    }

    renderProjects() {
        this.projectsGrid.innerHTML = '';
        
        this.projects.forEach(project => {
            console.log('Rendering project:', project.title, 'Image:', project.image);
            
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.dataset.projectId = project.id;
            
            let iconElement;
            if (project.image) {
                console.log('Creating image icon with URL:', project.image);
                iconElement = `<div class="project-icon image-icon" style="background-image: url('${project.image}'); background-color: #f0f0f0;"></div>`;
            } else {
                console.log('Using emoji icon:', project.icon);
                iconElement = `<div class="project-icon">${project.icon}</div>`;
            }
            
            projectCard.innerHTML = `
                <div class="project-title-top">${project.title}</div>
                ${iconElement}
                <div class="project-meta">
                    <div class="project-meta-item">
                        <span class="meta-label">Progress:</span>
                        <span class="meta-value">${project.progress}</span>
                    </div>
                    <div class="project-meta-item">
                        <span class="meta-label">Date:</span>
                        <span class="meta-value">${project.date}</span>
                    </div>
                    <div class="project-meta-item">
                        <span class="meta-label">Skills:</span>
                        <span class="meta-value">${project.skills}</span>
                    </div>
                    <div class="project-meta-item">
                        <span class="meta-label">Technical Difficulty:</span>
                        <span class="meta-value">${project.difficulty}</span>
                    </div>
                </div>
            `;
            
            projectCard.addEventListener('click', () => this.openProject(project));
            this.projectsGrid.appendChild(projectCard);
        });
    }

    showError(message = 'Unable to load projects. Please try again later.') {
        this.projectsGrid.innerHTML = `<div class="error">${message}</div>`;
    }

    openProject(project) {
        this.modalBody.innerHTML = this.markdownToHtml(project.content);
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    setupEventListeners() {
        // Close modal events
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    markdownToHtml(markdown) {
        // Configure marked.js options for better parsing
        marked.setOptions({
            breaks: true,        // Convert line breaks to <br>
            gfm: true,          // Enable GitHub Flavored Markdown
            tables: true,       // Enable tables
            sanitize: false,    // Allow HTML (be careful with user content)
            smartLists: true,   // Better list handling
            smartypants: true   // Smart quotes and dashes
        });

        // Use marked.js to convert markdown to HTML
        return marked.parse(markdown);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});