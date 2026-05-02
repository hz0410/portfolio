import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON('../lib/projects.json');

let rolledData = d3.rollups(
  filteredProjects,
  v => v.length,
  d => d.year
);

let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

let query = '';
let filteredProjects = projects;

const projectsContainer = document.querySelector('.projects');
// renderProjects(projects, projectsContainer, 'h2');
renderProjects(filteredProjects, projectsContainer, 'h2');

// Pie chart
const svg = d3.select('#projects-pie-plot');


let colors = d3.scaleOrdinal(d3.schemeTableau10);

let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

// let sliceGenerator = d3.pie();
let sliceGenerator = d3.pie()
  .value(d => d.value);

let arcData = sliceGenerator(data);

svg.selectAll('path')
  .data(arcData)
  .join('path')
  .attr('d', arcGenerator)
//   .attr('fill', (d, i) => colors[i]);
  .attr('fill', (d, i) => colors(i));

let legend = d3.select('.legend');

const searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(query)
  );

  renderProjects(filteredProjects, projectsContainer, 'h2');
});

data.forEach((d, idx) => {
  legend.append('li')
    .attr('style', `--color:${colors(idx)}`)
    .html(`
      <span class="swatch"></span>
      ${d.label} <em>(${d.value})</em>
    `);
});

