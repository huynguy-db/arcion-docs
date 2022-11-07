// Get header which contains the hamburger menus
const header = document.querySelector("header");

// Get the entire left menu
const left_sidebar = document.querySelector(".book-menu");

// Get the hamburger menu for mobile screens
const hamburger_menu = header.getElementsByTagName("label");

// Grab the ZenID widget class from HubSpot

// Using the mutation API to inspect the DOM for changes,
// and in this case, for the HubSpot widget to load.
function waitForHubSpot(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Get the query parameters from URL
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

// Get the value of `iframe` query  parameter
const iframe_value = params.iframe;

// Remove the HubSpot widget and left menu.
// We only need to remove the left menu that shows our website TOC,
// but we'll keep the page TOC.
if (iframe_value) {
  waitForHubSpot("#hubspot-messages-iframe-container").then(
    (hubspot_widget) => {
      hubspot_widget.remove();
    }
  );
  left_sidebar.remove();
  hamburger_menu[0].remove();
}
