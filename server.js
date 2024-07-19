const http = require('http');
const config = require('./config.js');
const controller = require('./controller.js');

const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error('API_KEY environment variable is required');
    process.exit(1);
}

let receivedPushes = {};

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

async function switchController(switchId, state) {
    // Implement controller switch here.
}

async function processPush(push) {
    for (const cnf of config) {
        if (cnf.package === push.package && push.title.includes(cnf.inTitle) && push.text.includes(cnf.inText)) {
            console.info(`${push.title} ${push.text} -> ${cnf.switch} = ${cnf.state}`);
            // Switch the controller here
            switchController(cnf.switch, cnf.state).then(() => {
                console.info('Switched successfully');
            }).catch(e => {
                console.error('Switch error', e);
            })
        }
    }
}

async function processRequest(method, url, body) {
    if (method === 'POST' && url === '/push') {
        let data;
        try {
            data = JSON.parse(body);
        } catch (e) {
            throwError(400, 'Invalid JSON');
        }

        // Example: {"pushList":[{"package":"com.kyivdigital","text":"Невдовзі відновлять за адресою вул. Практична, 3.","time":1721390985936,"title":"⚡ Світло повертається"}]}
        if (!data.pushList || !Array.isArray(data.pushList)) {
            throwError(400, 'pushList is required');
        }

        for (const push of data.pushList) {
            if (!push.package || !push.text || !push.time || !push.title) {
                console.error('Invalid push object', push);
                continue;
            }

            const pushKey = `${push.package}:${push.title}:${push.text}`;
            if (receivedPushes[pushKey]) {
                console.info('Push already received', pushKey);
                continue;
            }

            await processPush(push);
            receivedPushes[pushKey] = true;
        }
    } else if (method === 'GET' && url === '/ping') {
        return; // Do nothing. Just ping message. Log for later health check.
    } else {
        throwError(404, 'Not Found');
    }
}

http.createServer((req, res) => {

    if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== apiKey) {
        res.writeHead(401, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({"error": "Invalid API key"}));
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        console.log(`${req.method} ${req.url}: ${body}`);

        try {
            await processRequest(req.method, req.url, body);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({"status": "ok"}));
        } catch (e) {
            console.error(e);

            const statusCode = e.statusCode || 500;
            const error = e.message || 'Internal Server Error';
            res.writeHead(statusCode, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error}));
        }
    });
}).listen(8080, () => console.info(`Push server listening at *:8080...`));
