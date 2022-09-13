/**
 * Returns an object containing all the pastes information we need.
 * @param {Document} domSite The DOM page we are analyzing.
 */
export function extractPastes(domSite) {
    // Remember that the first index and the last index are not relevant.
    const pastes = domSite.querySelector('#list').children;
    const allPastes = [];
    for (let i = 1; i < pastes.length - 1; i++) {
        const paste = pastes[i];
        const title = paste.querySelector('.col-sm-5').textContent.trim();
        const author = paste.querySelector('.col-sm-6').textContent.split(' ')[2].trim();
        const date = new Date(paste.querySelector('.col-sm-6').textContent.split(' ').splice(4).join(' ').trim()).toISOString();
        const content = paste.querySelectorAll('.well li');
        const contentArr = [];
        for (const contentLine of content) {
            contentArr.push(contentLine.textContent.trim());
        }
        allPastes.push({ author: author, paste: {title: title, date: date, content: contentArr} });
    }
    return allPastes;
}

export function extractPasteId(pageDOM) {
    return pageDOM.querySelectorAll('.first a') === null ? null : Array.from(pageDOM.querySelectorAll('.first a'))
    .map((idElement) => idElement.href.split('/')[idElement.href.split('/').length - 1]);
}