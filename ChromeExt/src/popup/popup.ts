var homePageBtn = <HTMLAnchorElement>document.getElementById("popup_homePageBtn")
if (homePageBtn) {
    homePageBtn.onclick = () => {
        chrome.tabs.create({ url: homePageBtn.href });
        return false;
    }
}