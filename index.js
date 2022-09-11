// import url from 'url';
import axios from 'axios';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import * as dbHandler from './dbHandler.js';
import { extractPastes } from './parser.js';
import HttpProxyAgent from 'http-proxy-agent';
let latestDatePaste = 0;

import jsdom from "jsdom";
const { JSDOM } = jsdom;

let localPastes = 0;

// HTTP/HTTPS proxy to connect to
let proxy = 'http://localhost:8118';

// HTTP endpoint for the proxy to connect to
let endpoint = process.argv[2] || 'http://strongerw2ise74v3duebgsvug4mehyhlpa7f6kfwnas7zofs3kov7yd.onion/all';

// Configuring axios with a proxy agent and the endpoint.
let agent = new HttpProxyAgent(proxy);
const axiosProxy = axios.create({
    url: endpoint,
    httpAgent: agent
});

async function fetchPageData() {

}

async function fetchPage(pageNumber) {
    let res = '', domHtml = null;
    try {
        res = await (await axiosProxy.get(process.env.PASTES_SITE + '?page=' + pageNumber)).data;
    } catch (errors) {
        console.log(errors);
        return;
    }
    res = readFileSync('./test.html').toString();
    return new JSDOM(res).window.document;
}


async function fetchFirstPage() {
    return (await fetchPage(1));
}

async function getFirstTimePastes() {
    // First time analyze.
    const pastesData = [];
    const firstPastes = extractPastes(await fetchFirstPage());
    pastesData.push(firstPastes);
    for (let i = 2; i < limit; i++) {
        const page = await fetchPage(i);
        pastesData.push(extractPastes(page));
    }
    return pastesData;
}

async function main() {
    await dbHandler.connectDB();
    console.log('Starting.');

    if ((await dbHandler.isDBEmpty()) === true) {
        console.log('No pastes were found fetching the all the pages.');
        const firstPastes = await getFirstTimePastes(firstPageDocument);
        await dbHandler.insertManyPastes(firstPastes);
        console.log('Done');
    }
    console.log('Making first page read every 2 minutes');

    setInterval(() => {

    }, 20000);
}
main();
