"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const WebSocket = __importStar(require("ws"));
const fs_1 = require("fs");
const modular_json_rpc_1 = require("modular-json-rpc");
const Log_1 = require("./Log");
const TagAuth_1 = require("./TagAuth");
const KeyProvider_1 = require("./KeyProvider");
const options_1 = __importDefault(require("./options"));
const jwt = __importStar(require("jsonwebtoken"));
// Options
const options = commandLineArgs(options_1.default);
// Print usage
if (options.help) {
    const sections = [
        {
            header: 'eacs-tag-auth',
            content: 'Extensible Access Control System. RFID Tag Authentication Module.'
        },
        {
            header: 'Options',
            optionList: options_1.default
        }
    ];
    console.log(commandLineUsage(sections));
    process.exit();
}
// Initial keying material used to derive keys
const IKM = Buffer.from(options.hkdf_ikm, 'hex');
// HKDF key provider
const keyProvider = new KeyProvider_1.HKDF(IKM, 'sha256', Buffer.from(options.hkdf_salt));
// Load JWT public key
const jwtPublicKey = fs_1.readFileSync(options.jwtPublicKey);
// Setup websocket server
const wss = new WebSocket.Server({
    host: options.host,
    port: options.port,
    // Authorises client using JWT
    verifyClient: (info, cb) => {
        let token = info.req.headers.token;
        if (token) {
            jwt.verify(token, jwtPublicKey, (err, decoded) => {
                if (err) {
                    Log_1.Log.error(`JWT verification failed for ${info.req.connection.remoteAddress}`);
                    cb(false, 401, 'Unauthorized');
                }
                else {
                    // Hack typescript to insert additional data
                    info.req.token = decoded;
                    cb(true);
                }
            });
        }
        else {
            Log_1.Log.error(`Token not found for ${info.req.connection.remoteAddress}`);
            cb(false, 401, 'Unauthorized');
        }
    }
});
wss.on('connection', (ws, req) => {
    Log_1.Log.info(`index: New websocket connection from ${req.connection.remoteAddress}`);
    // Create RPC transport over websocket
    let transport = new modular_json_rpc_1.WSTransport(ws);
    // Create bidirectional RPC connection
    let node = new modular_json_rpc_1.RPCNode(transport);
    // Handle error
    node.on('error', (e) => {
        Log_1.Log.error("Internal JSONRPC Error", e);
    });
    ws.on('error', (e) => {
        Log_1.Log.error("WebSocket Error", e);
    });
    // Initialise tag authentication
    let tagAuth = new TagAuth_1.TagAuth({
        keyProvider,
        rpc: node,
        token: req.token
    });
});
process.on('unhandledRejection', (reason, p) => {
    Log_1.Log.error("Unhandled promise rejection");
    console.log(reason);
    console.log(p);
});
