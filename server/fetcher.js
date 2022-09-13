import { extractPasteId } from './parser.js';
import { axiosProxy } from './index.js';
import jsdom from "jsdom";
const { JSDOM } = jsdom;

export async function firstTimeFetch() {
  let hasReachedToEnd = false, pageIndex = 0;
  // A function to makes each request with a delay.
  const delay = (delayInms) => {
      return new Promise(resolve => setTimeout(resolve, delayInms));
  }
  while (hasReachedToEnd === false) {
      const ids = extractPasteId(await fetchPage(pageIndex));
      if (ids.length === 0) {
          hasReachedToEnd = true;
      }
      for (const id of ids) {
          const pasteInfo = await (await axiosProxy.get(endpoint + '/api/paste/' + id)).data;
          await dbHandler.insertPaste(pasteInfo.name, { title: pasteInfo.title, id: id, content: pasteInfo.paste });
          await delay(100);
      }
      pageIndex += 50;
      await delay(500);
  }

}

export async function fetchPage(pageNumber) {
  let res = '';
  try {
      res = await (await axiosProxy.get(endpoint + '/lists/' + pageNumber)).data;
  } catch (errors) {
      console.log(errors);
      return;
  }
  return new JSDOM(res).window.document;
}

export async function getRecentPastes() {
  return await (await axiosProxy.get(endpoint + '/api/recent')).data;
}
