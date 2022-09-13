import axios from 'axios';
import * as dbHandler from './db/dbHandler.js';
import * as fetcher from './fetcher.js';
import HttpProxyAgent from 'http-proxy-agent';
import * as dotenv from 'dotenv';
import express from 'express';
const app = express();
dotenv.config();

// HTTP/HTTPS proxy to connect to
const proxy = 'http://localhost:8118';

// HTTP endpoint for the proxy to connect to
const endpoint = process.argv[2] || process.env.PASTES_SITE;

// Configuring axios with a proxy agent and the endpoint.
const agent = new HttpProxyAgent(proxy);
export const axiosProxy = axios.create({
    url: endpoint,
    httpAgent: agent
});


async function main() {
    console.log('Starting.');
    try {
        await dbHandler.connectDB();
    } catch (error) {
        console.log('Failed to connect to database: ' + error);
    }

    if ((await dbHandler.isDBEmpty()) === true) {
        console.log('Database is empty. Pulling all pastes from sites');
        await fetcher.firstTimeFetch();
    }
    console.log('Reading recent pastes api');
    setInterval(async () => {
        const recentPastes = await fetcher.getRecentPastes();
        for (const paste of recentPastes) {
            if (await dbHandler.isPasteIdExists(paste.pid) === false) {
                console.log('Found new paste. Adding to the database');
                const pasteInfo = await (await axiosProxy.get(endpoint + '/api/paste/' + paste.pid)).data;
                await dbHandler.insertPaste(pasteInfo.name, { title: pasteInfo.title, id: paste.pid, content: pasteInfo.paste });
            }
        }
    }, 200000);
}

app.listen(4000, () => {
    main();
});
