import commandLineArgs = require('command-line-args');
import commandLineUsage = require('command-line-usage');
import * as WebSocket from 'ws';
import { readFileSync } from 'fs';
import { IncomingMessage } from 'http';
import { WSTransport, RPCNode } from 'modular-json-rpc';
import { Log } from './Log';
import { TagAuth } from './TagAuth';
import { HKDF } from './KeyProvider';
import optionDefinitions from './options';
import * as jwt from 'jsonwebtoken';

// Options
const options = commandLineArgs(optionDefinitions);

// Print usage
if (options.help)
{
    const sections = [
        {
            header: 'eacs-tag-auth',
            content: 'Extensible Access Control System. RFID Tag Authentication Module.'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ];

    console.log(commandLineUsage(sections));
    process.exit();
}

// Initial keying material used to derive keys
const IKM = Buffer.from(options.hkdf_ikm, 'hex');

// HKDF key provider
const keyProvider = new HKDF(IKM, 'sha256', Buffer.from(options.hkdf_salt));

// Load JWT public key
const jwtPublicKey = readFileSync(options.jwtPublicKey);

// Setup websocket server
const wss = new WebSocket.Server({
    host: options.host,
    port: options.port,
    // Authorises client using JWT
    verifyClient: (info, cb) => {
        let token = info.req.headers.token;
        if (token) {
            jwt.verify(<string>token, jwtPublicKey, (err, decoded) => {
                if (err) {
                    Log.error(`JWT verification failed for ${info.req.connection.remoteAddress}`);
                    cb(false, 401, 'Unauthorized');
                } else {
                    // Hack typescript to insert additional data
                    (<any>info.req).token = decoded;
                    cb(true);
                }
            });
        } else {
            Log.error(`Token not found for ${info.req.connection.remoteAddress}`);
            cb(false, 401, 'Unauthorized');
        }
    }
});

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    Log.info(`index: New websocket connection from ${req.connection.remoteAddress}`);

    // Create RPC transport over websocket
    let transport = new WSTransport(ws);

    // Create bidirectional RPC connection
    let node = new RPCNode(transport);

    // Handle error
    node.on('error', (e) => {
        Log.error("Internal JSONRPC Error", e);
    });
    ws.on('error', (e) => {
        Log.error("WebSocket Error", e);
    });

    // Initialise tag authentication
    let tagAuth = new TagAuth({
        keyProvider,
        rpc: node,
        token: (<any>req).token
    });
});

process.on('unhandledRejection', (reason, p) => {
    Log.error("Unhandled promise rejection");
    console.log(reason);
    console.log(p);
});
