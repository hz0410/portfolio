import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const svg = d3.select('#projects-pie-plot');
const legend = d3.select('.legend');

let query = '';
let selectedYear = null;

const colors = d3.scaleOrdinal(d3.schemeTableau10);

const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

const sliceGenerator = d3.pie()
  .value(d => d.value);

function getSearchFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function getVisibleProjects() {
  let searchFiltered = getSearchFilteredProjects();

  if (selectedYear) {
    return searchFiltered.filter(project => project.year == selectedYear);
  }

  return searchFiltered;
}

function renderPieChart(projectsGiven) {
  const rolledData = d3.rollups(
    projectsGiven,
    v => v.length,
    d => d.year
  );

  const data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  const arcData = sliceGenerator(data);

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  svg.selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', arcGenerator)
    .attr('fill', (d, i) => colors(i))
    .attr('class', d => d.data.label == selectedYear ? 'selected' : '')
    .on('click', (event, d) => {
      selectedYear = selectedYear == d.data.label ? null : d.data.label;
      updateDisplay();
    });

  legend.selectAll('li')
    .data(data)
    .join('li')
    .attr('style', (d, i) => `--color:${colors(i)}`)
    .attr('class', d => d.label == selectedYear ? 'selected' : '')
    .html(d => `
      <span class="swatch"></span>
      ${d.label} <em>(${d.value})</em>
    `)
    .on('click', (event, d) => {
      selectedYear = selectedYear == d.label ? null : d.label;
      updateDisplay();
    });
}

function updateDisplay() {
  const searchFilteredProjects = getSearchFilteredProjects();
  const visibleProjects = getVisibleProjects();

  // Project cards show selected year only
  renderProjects(visibleProjects, projectsContainer, 'h2');

  // Pie chart still shows all years from search results
  renderPieChart(searchFilteredProjects);
}

updateDisplay();

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  selectedYear = null;
  updateDisplay();
});