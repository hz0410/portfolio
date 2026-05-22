import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';

let data;
let commits;
let filteredData;
let filteredCommits;
let timeScale;
let commitMaxTime;
let xScale;
let yScale;

const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 45 };

const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};

const colors = d3.scaleOrdinal(d3.schemeTableau10);

async function loadData() {
  return await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;

      const ret = {
        id: commit,
        url: `https://github.com/hz0410/portfolio/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
      });

      return ret;
    })
    .sort((a, b) => d3.ascending(a.datetime, b.datetime));
}

function updateFilteredData() {
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  const filteredCommitIds = new Set(filteredCommits.map((d) => d.id));
  filteredData = data.filter((d) => filteredCommitIds.has(d.commit));
}

function updateTimeDisplay() {
  const timeElement = document.querySelector('#commit-time');
  timeElement.textContent = commitMaxTime.toLocaleString('en', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function renderCommitInfo(dataToShow, commitsToShow) {
  const container = d3.select('#stats');

  const fileCount = d3.group(dataToShow, (d) => d.file).size;
  const maxDepth = d3.max(dataToShow, (d) => d.depth) ?? 0;
  const longestLine = d3.max(dataToShow, (d) => d.length) ?? 0;

  const fileLengths = d3.rollups(
    dataToShow,
    (v) => d3.max(v, (d) => d.line),
    (d) => d.file,
  );
  const maxLines = d3.max(fileLengths, (d) => d[1]) ?? 0;

  const stats = [
    { label: 'Commits', value: commitsToShow.length },
    { label: 'Files', value: fileCount },
    { label: 'Total LOC', value: dataToShow.length },
    { label: 'Max Depth', value: maxDepth },
    { label: 'Longest Line', value: longestLine },
    { label: 'Max Lines', value: maxLines },
  ];

  const dl = container.selectAll('dl.stats').data([stats]).join('dl').attr('class', 'stats');
  const stat = dl.selectAll('div').data((d) => d).join('div');

  stat.selectAll('dt').data((d) => [d]).join('dt').text((d) => d.label);
  stat.selectAll('dd').data((d) => [d]).join('dd').text((d) => d.value);
}

function renderScatterPlot() {
  const svg = d3
    .select('#chart')
    .selectAll('svg')
    .data([null])
    .join('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime().range([usableArea.left, usableArea.right]);
  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);

  svg
    .selectAll('g.gridlines')
    .data([null])
    .join('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  svg
    .selectAll('g.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`);

  svg
    .selectAll('g.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00'));

  svg.selectAll('g.dots').data([null]).join('g').attr('class', 'dots');

  createBrushSelector(svg);
  updateScatterPlot();
}

function updateScatterPlot() {
  const svg = d3.select('#chart').select('svg');
  if (svg.empty()) return;

  xScale.domain(d3.extent(commits, (d) => d.datetime)).nice();

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines ?? 0, maxLines ?? 1]).range([2, 30]);

  svg.select('g.x-axis').call(d3.axisBottom(xScale));

  const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);

  svg
    .select('g.dots')
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join(
      (enter) =>
        enter
          .append('circle')
          .attr('cx', (d) => xScale(d.datetime))
          .attr('cy', (d) => yScale(d.hourFrac))
          .attr('r', 0)
          .attr('fill', 'steelblue')
          .style('fill-opacity', 0.7)
          .style('--r', (d) => rScale(d.totalLines))
          .call((enter) => enter.transition().attr('r', (d) => rScale(d.totalLines))),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .attr('cx', (d) => xScale(d.datetime))
            .attr('cy', (d) => yScale(d.hourFrac))
            .attr('r', (d) => rScale(d.totalLines))
            .style('--r', (d) => rScale(d.totalLines)),
        ),
      (exit) => exit.call((exit) => exit.transition().attr('r', 0).remove()),
    )
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', updateTooltipPosition)
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}

function renderTooltipContent(commit) {
  if (!commit) return;

  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time-tooltip');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  link.href = commit.url;
  link.textContent = commit.id.slice(0, 7);

  date.textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime.toLocaleString('en', { timeStyle: 'short' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY + 12}px`;
}

function createBrushSelector(svg) {
  const brush = d3
    .brush()
    .extent([
      [usableArea.left, usableArea.top],
      [usableArea.right, usableArea.bottom],
    ])
    .on('start brush end', brushed);

  svg.selectAll('g.brush').data([null]).join('g').attr('class', 'brush').call(brush);
  svg.select('g.dots').raise();
}

function brushed(event) {
  const selection = event.selection;

  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(selection, d));
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;

  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];

  document.querySelector('#selection-count').textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];

  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function updateFileDisplay() {
  const files = d3
    .groups(filteredData, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => d3.descending(a.lines.length, b.lines.length));

  const filesContainer = d3
    .select('#files')
    .selectAll('div')
    .data(files, (d) => d.name)
    .join(
      (enter) =>
        enter.append('div').call((div) => {
          div.append('dt').append('code');
          div.append('dd');
        }),
    );

  filesContainer
    .select('dt')
    .html((d) => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);

  filesContainer
    .select('dd')
    .selectAll('div')
    .data((d) => d.lines)
    .join('div')
    .attr('class', 'loc')
    .attr('style', (d) => `--color: ${colors(d.type)}`);
}

function updateAllViews() {
  updateFilteredData();
  updateTimeDisplay();
  renderCommitInfo(filteredData, filteredCommits);
  updateScatterPlot();
  updateFileDisplay();
  renderSelectionCount(null);
  renderLanguageBreakdown(null);
}

function setupCommitSlider() {
  const slider = document.querySelector('#commit-progress');
  timeScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, 100]);

  commitMaxTime = timeScale.invert(Number(slider.value));

  slider.addEventListener('input', () => {
    commitMaxTime = timeScale.invert(Number(slider.value));
    updateAllViews();
  });
}

function renderCommitStory() {
  d3.select('#scatter-story')
    .selectAll('.step')
    .data(commits, (d) => d.id)
    .join('div')
    .attr('class', 'step')
    .html(
      (d, i) => `
        <p>
          On ${d.datetime.toLocaleString('en', {
            dateStyle: 'full',
            timeStyle: 'short',
          })},
          I made
          <a href="${d.url}" target="_blank">
            ${i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
          </a>.
          I edited <strong>${d.totalLines}</strong> lines across
          <strong>${
            d3.rollups(
              d.lines,
              (D) => D.length,
              (line) => line.file,
            ).length
          }</strong> files.
          Then I looked over all I had made, and I saw that it was very good.
        </p>
      `,
    );
}

function onStepEnter(response) {
  const commit = response.element.__data__;
  if (!commit) return;

  commitMaxTime = commit.datetime;

  const slider = document.querySelector('#commit-progress');
  slider.value = timeScale(commitMaxTime);

  d3.selectAll('.step').classed('is-active', false);
  d3.select(response.element).classed('is-active', true);

  updateAllViews();
}

function setupScrollytelling() {
  const scroller = scrollama();

  scroller
    .setup({
      container: '#scrolly-1',
      step: '#scrolly-1 .step',
      offset: 0.5,
    })
    .onStepEnter(onStepEnter);

  window.addEventListener('resize', () => scroller.resize());
}

data = await loadData();
commits = processCommits(data);

setupCommitSlider();
updateFilteredData();
renderCommitInfo(filteredData, filteredCommits);
renderScatterPlot();
updateFileDisplay();
renderCommitStory();
setupScrollytelling();
updateTimeDisplay();

console.log(commits);
