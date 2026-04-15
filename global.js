// console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }


// // let navLinks = $$("nav a");

// // let currentLink = navLinks.find(
// //   (a) => a.host === location.host && a.pathname === location.pathname
// // );

// // currentLink?.classList.add("current");

// let pages = [
//   { url: "", title: "Home" },
//   { url: "projects/", title: "Projects" },
//   { url: "contact/", title: "Contact" },
//   { url: "resume/", title: "Resume" },
//   { url: "https://github.com/hz0410", title: "Profile" }
// ];

// /* -------------------------
//    Create nav element
// ------------------------- */
// let nav = document.createElement("nav");
// document.body.prepend(nav);

// /* -------------------------
//    Fix path (important)
// ------------------------- */
// const BASE_PATH =
//   location.hostname === "localhost" || location.hostname === "127.0.0.1"
//     ? "/"
//     : "/portfolio/"; // change to "/your-repo-name/" if using GitHub Pages

// /* -------------------------
//    Create links
// ------------------------- */
// for (let p of pages) {
//   let url = p.url;
//   let title = p.title;



//   // handle relative URLs
//   if (!url.startsWith("http")) {
//     url = BASE_PATH + url;
//   }

//   let a = document.createElement("a");
//   a.href = url;
//   a.textContent = title;

//   // highlight current page
//   if (a.host === location.host && a.pathname === location.pathname) {
//     a.classList.add("current");
//   }

//   nav.appendChild(a);
// }

console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

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