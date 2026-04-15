console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


let navLinks = $$("nav a");

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add("current");

// const navLinks = $$("nav a");

// navLinks.forEach(link => {
//   if (link.host !== location.host) return;

//   let linkPath = new URL(link.href).pathname;
//   let currentPath = location.pathname;

//   linkPath = linkPath.replace(/index\.html$/, "");
//   currentPath = currentPath.replace(/index\.html$/, "");

//   if (linkPath === currentPath) {
//     link.classList.add("current");
//   }
// });