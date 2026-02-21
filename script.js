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
        // Handle initial URL hash (e.g. direct link or page refresh on a project)
        this.handleHashChange();
    }

    async loadProjects() {
        try {
            console.log('Attempting to load projects.json from:', 'projects/projects.json');
            
            const response = await fetch('projects/projects.json');
            console.log('projects.json response status:', response.status);
            
            if (!response.ok) {
                console.error('Failed to load projects.json:', response.status, response.statusText);
                throw new Error(`Failed to load projects list: ${response.status} ${response.statusText}`);
            }
            
            const projectList = await response.json();
            console.log('Loaded project list:', projectList);
            this.projects = [];

            for (const project of projectList) {
                try {
                    const projectPath = project.folder ? 
                        `projects/${project.folder}/${project.file}` : 
                        `projects/${project.file}`;
                    
                    console.log('Attempting to load project from:', projectPath);
                    
                    const markdownResponse = await fetch(projectPath);
                    console.log(`${projectPath} response status:`, markdownResponse.status);
                    
                    if (markdownResponse.ok) {
                        const markdownContent = await markdownResponse.text();
                        console.log(`Loaded ${projectPath}, content length:`, markdownContent.length);
                        
                        const { frontMatter, content } = this.parseFrontMatter(markdownContent);
                        const processedContent = this.updateImagePaths(content, project.folder);
                        
                        this.projects.push({
                            id: project.id,
                            folder: project.folder,
                            title: frontMatter.title || project.title || 'Untitled Project',
                            icon: frontMatter.icon || project.icon || '📄',
                            image: frontMatter.image ? this.getProjectImagePath(frontMatter.image, project.folder) : project.image,
                            description: frontMatter.description || project.description || '',
                            progress: frontMatter.progress || 'Completed',
                            date: frontMatter.date || 'Recent',
                            skills: frontMatter.skills || 'Web Development',
                            content: processedContent
                        });
                    } else {
                        console.error(`Failed to load ${projectPath}:`, markdownResponse.status, markdownResponse.statusText);
                    }
                } catch (error) {
                    console.error(`Error loading project ${project.file}:`, error);
                }
            }

            console.log('Final projects loaded:', this.projects.length);

            if (this.projects.length === 0) {
                this.showError('No projects found. Check the console for loading errors.');
                return;
            }

            this.renderProjects();

        } catch (error) {
            console.error('Error in loadProjects:', error);
            this.showFallbackProjects();
        }
    }

    // Convert a project title/id to a URL-friendly slug
    slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // Get the slug for a project (prefer explicit id, fall back to slugified title)
    getProjectSlug(project) {
        return this.slugify(project.id || project.title);
    }

    parseFrontMatter(markdown) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontMatterRegex);
        
        if (match) {
            const frontMatterText = match[1];
            const content = match[2];
            const frontMatter = {};
            
            frontMatterText.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();
                    value = value.replace(/^["']|["']$/g, '');
                    frontMatter[key] = value;
                }
            });
            
            return { frontMatter, content };
        } else {
            return { frontMatter: {}, content: markdown };
        }
    }

    updateImagePaths(content, projectFolder) {
        if (!projectFolder) return content;
        
        let updatedContent = content.replace(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g, (match, alt, src) => {
            if (src.startsWith('/') || src.startsWith('projects/')) {
                return match;
            }
            return `![${alt}](projects/${projectFolder}/${src})`;
        });

        updatedContent = updatedContent.replace(/<source\s+src="(?!https?:\/\/)([^"]+)"/g, (match, src) => {
            if (src.startsWith('/') || src.startsWith('projects/')) {
                return match;
            }
            return `<source src="projects/${projectFolder}/${src}"`;
        });

        updatedContent = updatedContent.replace(/<video([^>]*)\s+src="(?!https?:\/\/)([^"]+)"/g, (match, attrs, src) => {
            if (src.startsWith('/') || src.startsWith('projects/')) {
                return match;
            }
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
        const demoProjects = [
            {
                id: 'web-application',
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
                id: 'setup-instructions',
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
            const slug = this.getProjectSlug(project);
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.dataset.projectId = project.id;
            
            let iconElement;
            if (project.image) {
                iconElement = `<div class="project-icon image-icon" style="background-image: url('${project.image}'); background-color: #f0f0f0;"></div>`;
            } else {
                iconElement = `<div class="project-icon">${project.icon}</div>`;
            }
            
            projectCard.innerHTML = `
                <a class="project-card-link" href="#${slug}" aria-label="View ${project.title}">
                    <div class="project-title-top">${project.title}</div>
                    ${iconElement}
                    ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
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
                    </div>
                </a>
            `;
            
            // Clicking the card updates the hash, which triggers handleHashChange
            projectCard.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = slug;
            });

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

        // Update page title so the browser tab & history entry shows the project name
        document.title = `${project.title} — Owen Dustin`;
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.title = 'Owen Dustin - Portfolio';

        // Remove the hash without adding a new history entry
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    // Called whenever the URL hash changes (including on page load)
    handleHashChange() {
        const hash = window.location.hash.slice(1); // strip leading '#'

        if (!hash) {
            // No hash → close any open modal
            if (this.modal.style.display === 'block') {
                this.modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.title = 'Owen Dustin - Portfolio';
            }
            return;
        }

        // Wait until projects are loaded before trying to match
        const project = this.projects.find(p => this.getProjectSlug(p) === hash);
        if (project) {
            this.openProject(project);
        }
    }

    setupEventListeners() {
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

        // React to browser back/forward navigation
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
    }

    markdownToHtml(markdown) {
        marked.setOptions({
            breaks: true,
            gfm: true,
            tables: true,
            sanitize: false,
            smartLists: true,
            smartypants: true
        });

        return marked.parse(markdown);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});