import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Pie chart
const svg = d3.select('#projects-pie-plot');

let data = [1, 2];
let colors = ['gold', 'purple'];

let arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);

svg.selectAll('path')
  .data(arcData)
  .join('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors[i]);

