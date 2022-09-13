import axios from 'axios';
import * as dbHandler from './dbHandler.js';
import { extractPasteId } from './parser.js';
import HttpProxyAgent from 'http-proxy-agent';
import * as dotenv from 'dotenv';
import jsdom from "jsdom";

dotenv.config();
const { JSDOM } = jsdom;

// HTTP/HTTPS proxy to connect to
let proxy = 'http://localhost:8118';

// HTTP endpoint for the proxy to connect to
let endpoint = process.argv[2] || process.env.PASTES_SITE;

// Configuring axios with a proxy agent and the endpoint.
let agent = new HttpProxyAgent(proxy);
const axiosProxy = axios.create({
    url: endpoint,
    httpAgent: agent
});

async function firstTimeFetch() {
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

async function fetchPage(pageNumber) {
    let res = '';
    try {
        res = await (await axiosProxy.get(endpoint + '/lists/' + pageNumber)).data;
    } catch (errors) {
        console.log(errors);
        return;
    }
    return new JSDOM(res).window.document;
}

async function getRecentPastes() {
    return await (await axiosProxy.get(endpoint + '/api/recent')).data;
}

async function main() {
    console.log('Starting.');
    try {
        await dbHandler.connectDB();
    } catch (error) {
        console.log('Failed to connect to database: ' + error);
    }

    if ((await dbHandler.isDBEmpty()) === true) {
        console.log('Database is empty. Pulling all pastes from sites');
        await firstTimeFetch();
    }
    console.log('Reading recent pastes api');
    setInterval(async () => {
        const recentPastes = await getRecentPastes();
        for (const paste of recentPastes) {
            if (await dbHandler.isPasteIdExists(paste.pid) === false) {
                console.log('Found new paste. Adding to the database');
                const pasteInfo = await (await axiosProxy.get(endpoint + '/api/paste/' + paste.pid)).data;
                await dbHandler.insertPaste(pasteInfo.name, { title: pasteInfo.title, id: paste.pid, content: pasteInfo.paste });
            }
        }
    }, 200000);
}
main();
