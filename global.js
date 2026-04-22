
console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-select">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

// const colorSchemeSelect = document.querySelector("#theme-select");

// colorSchemeSelect.addEventListener("input", function (event) {
//     console.log("color scheme changed to", event.target.value);

//   document.documentElement.style.setProperty(
//     "color-scheme",
//     event.target.value
//   );
// });

const select = document.querySelector(".color-scheme select");

if ("colorScheme" in localStorage) {
  document.documentElement.style.setProperty(
    "color-scheme",
    localStorage.colorScheme
  );
  select.value = localStorage.colorScheme;
}

select.addEventListener("input", function (event) {
  const value = event.target.value;
  document.documentElement.style.setProperty("color-scheme", value);
  localStorage.colorScheme = value;
});

let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "https://github.com/hz0410", title: "Profile" }
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/portfolio/";

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  let a = document.createElement("a");
  a.href = url;
  a.textContent = p.title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current");
  }

  if (a.host !== location.host) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  nav.append(a);
}

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file
    const response = await fetch(url);

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    // Parse JSON
    const data = await response.json();

    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  // Validate inputs
  if (!Array.isArray(projects)) {
    console.error('Projects data is not an array');
    return;
  }

  if (!containerElement) {
    console.error('Container element not found');
    return;
  }

  // ✅ Validate heading level
  const validHeadings = ['h1','h2','h3','h4','h5','h6'];
  if (!validHeadings.includes(headingLevel)) {
    console.warn(`Invalid heading level "${headingLevel}", defaulting to h2`);
    headingLevel = 'h2';
  }

  // Clear container
  containerElement.innerHTML = '';

  // Render each project
  projects.forEach((project) => {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
    `;

    containerElement.appendChild(article);
  });
}