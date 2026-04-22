import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');





const projects = await fetchJSON('../lib/projects.json');

// Select title element
const titleElement = document.querySelector('.projects-title');

// Update text with project count
titleElement.textContent = `Projects (${projects.length})`;