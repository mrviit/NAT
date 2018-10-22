import { MyServices } from "../services/MyServices"

function polling() {
  console.log('devtools');
  setTimeout(polling, 1000 * 30);
  MyServices.sayHello("Hello from devtools");
}

polling();

chrome.devtools.panels.elements.createSidebarPane("MyDevTool", function (e) {
  e.setPage("../panel/panel.html")
});

