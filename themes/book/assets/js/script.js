// Get header which contains the hamburger menus
const header = document.querySelector("header");

// Get the entire left menu
const left_sidebar = document.querySelector(".book-menu");

// Get the hamburger menu for mobile screens
const hamburger_menu = header.getElementsByTagName("label");

// Helper function to inject query parameter in internal URLs.
// Behavior is differnt for URLs with fragment identifer.
const insertBeforeLastOccurance = (strToSearchIn, strToFind, strtoInsert) => {
  var location = strToSearchIn.lastIndexOf(strToFind);
  // If fragment identifier doesn't exist
  if (location != -1) {
    return strToSearchIn.substring(0, location) + strtoInsert + strToSearchIn.substring(location);    
  }
  return strToSearchIn + strtoInsert;
}

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
  // We want this query parameter to persist and if they do, apply the logic below.
  // Do not add if it's external link so get the current URL hostname.
  const current_url = new URL(document.location);
  const current_hostname = current_url.hostname;
  const all_anchors = document.getElementsByTagName("a");
  for (var anchor of all_anchors) {
    if (anchor.hostname === current_hostname) {
      const current_page = current_url.protocol + "//" + current_url.host + current_url.pathname;
      const current_anchor = anchor.protocol + "//" + anchor.host + anchor.pathname;
      if (current_page === current_anchor) {
        continue;
      } else {
        // We want to inject the query parameter just before the pound sign (fragmant identifier)
        anchor.href = insertBeforeLastOccurance(anchor.href, "#", "?iframe=true"); 
      }
    }
  }
  waitForHubSpot("#hubspot-messages-iframe-container").then(
    (hubspot_widget) => {
      hubspot_widget.remove();
    }
  );
  left_sidebar.remove();
  hamburger_menu[0].remove();
}

