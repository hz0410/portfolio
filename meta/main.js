import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

// let data = await loadData();

// console.log(data); // you can remove later
function processCommits(data) {
  return d3
    .groups(data, d => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];

      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/YOUR_USERNAME/YOUR_REPO/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length
      };

      // 🔴 THIS PART IS IMPORTANT (hidden property)
      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false   // 👈 THIS is the key fix
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats')
    .append('dl')
    .attr('class', 'stats');

  const fileCount = d3.group(data, d => d.file).size;
  const maxDepth = d3.max(data, d => d.depth);
  const longestLine = d3.max(data, d => d.length);

  const fileLengths = d3.rollups(
    data,
    v => d3.max(v, d => d.line),
    d => d.file
  );
  const maxLines = d3.max(fileLengths, d => d[1]);

  const addStat = (label, value) => {
    dl.append('dt').text(label);
    dl.append('dd').text(value);
  };

  addStat('Commits', commits.length);
  addStat('Files', fileCount);
  addStat('Total LOC', data.length);
  addStat('Max Depth', maxDepth);
  addStat('Longest Line', longestLine);
  addStat('Max Lines', maxLines);
}


// function renderScatterPlot(data, commits) {
//   const width = 1000;
//   const height = 600;

//   const svg = d3.select('#chart')
//     .append('svg')
//     .attr('viewBox', `0 0 ${width} ${height}`)
//     .style('overflow', 'visible');

//   const xScale = d3.scaleTime()
//     .domain(d3.extent(commits, d => d.datetime))
//     .range([0, width])
//     .nice();

//   const yScale = d3.scaleLinear()
//     .domain([0, 24])
//     .range([height, 0]);


//     const margin = { top: 10, right: 10, bottom: 30, left: 40 };

//     const usableArea = {
//     top: margin.top,
//     right: width - margin.right,
//     bottom: height - margin.bottom,
//     left: margin.left,
//     width: width - margin.left - margin.right,
//     height: height - margin.top - margin.bottom,
//     };

//     xScale.range([usableArea.left, usableArea.right]);
//     yScale.range([usableArea.bottom, usableArea.top]);

//     const xAxis = d3.axisBottom(xScale);

//     const yAxis = d3
//     .axisLeft(yScale)
//     .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

//     svg
//     .append('g')
//     .attr('transform', `translate(0, ${usableArea.bottom})`)
//     .call(xAxis);

//     svg
//     .append('g')
//     .attr('transform', `translate(${usableArea.left}, 0)`)
//     .call(yAxis);

//   const dots = svg.append('g').attr('class', 'dots');

//   dots.selectAll('circle')
//     .data(commits)
//     .join('circle')
//     .attr('cx', d => xScale(d.datetime))
//     .attr('cy', d => yScale(d.hourFrac))
//     .attr('r', 5)
//     .attr('fill', 'steelblue');
// }

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  const margin = { top: 10, right: 10, bottom: 30, left: 40 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  gridlines.call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  );

  const xAxis = d3.axisBottom(xScale);

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const dots = svg.append('g').attr('class', 'dots');

//   dots.selectAll('circle')
//     .data(commits)
//     .join('circle')
//     .attr('cx', d => xScale(d.datetime))
//     .attr('cy', d => yScale(d.hourFrac))
//     .attr('r', 5)
//     .attr('fill', 'steelblue');

    const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);

    const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]); // you can tweak this

    dots.selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))   // ✅ NEW
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)             // ✅ NEW

    .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget)
        .style('fill-opacity', 1);          // ✅ NEW

        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })

    .on('mouseleave', (event) => {
        d3.select(event.currentTarget)
        .style('fill-opacity', 0.7);        // ✅ NEW

        updateTooltipVisibility(false);
    });
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit) return;

  link.href = commit.url;
  link.textContent = commit.id;

  date.textContent = commit.datetime.toLocaleString('en', {
    dateStyle: 'full',
  });

  time.textContent = commit.datetime.toLocaleString('en', {
    timeStyle: 'short',
  });

  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}


let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

console.log(commits);