import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');

let query = '';
let filteredProjects = projects;

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

let sliceGenerator = d3.pie()
  .value(d => d.value);

function renderPieChart(projectsToRender) {
  let rolledData = d3.rollups(
    projectsToRender,
    v => v.length,
    d => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcData = sliceGenerator(data);

  svg.selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i));

  legend.selectAll('li')
    .data(data)
    .join('li')
    .attr('style', (d, i) => `--color:${colors(i)}`)
    .html(d => `
      <span class="swatch"></span>
      ${d.label} <em>(${d.value})</em>
    `);
}

function updateDisplay() {
//   filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
  filteredProjects = projects.filter((project) => {
    return project.title.toLowerCase().includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
}

// Initial render
updateDisplay();

// Search interaction
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  updateDisplay();
});