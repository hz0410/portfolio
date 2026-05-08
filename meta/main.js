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

  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
}

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

console.log(commits);