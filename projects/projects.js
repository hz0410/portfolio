import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Pie chart
const svg = d3.select('#projects-pie-plot');

let data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' }
];
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

data.forEach((d, idx) => {
  legend.append('li')
    .attr('style', `--color:${colors(idx)}`)
    .html(`
      <span class="swatch"></span>
      ${d.label} <em>(${d.value})</em>
    `);
});