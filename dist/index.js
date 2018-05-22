"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const options_1 = __importDefault(require("./options"));
const eacs_socket_1 = require("eacs-socket");
const fs_1 = require("fs");
const modular_json_rpc_1 = require("modular-json-rpc");
const Log_1 = require("./Log");
const TagAuth_1 = require("./TagAuth");
const KeyProvider_1 = require("./KeyProvider");
const https = __importStar(require("https"));
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
const jwtPublicKey = fs_1.readFileSync(options.jwtPublicKey, "utf8");
// Setup EACSSocket (websockets with JWT auth)
if (options.tls_cert.length) {
    // With TLS
    var server = https.createServer({
        cert: fs_1.readFileSync(options.tls_cert),
        key: fs_1.readFileSync(options.tls_key)
    }).listen(options.port, options.host);
    var socket = new eacs_socket_1.EACSSocket({
        jwtPubKey: jwtPublicKey,
        server
    });
}
else {
    // Without TLS
    var socket = new eacs_socket_1.EACSSocket({
        host: options.host,
        port: options.port,
        jwtPubKey: jwtPublicKey
    });
}
socket.on('connection', (ws, req) => {
    let token = req.token;
    Log_1.Log.info(`index: New connection from ${req.connection.remoteAddress}. Identifier: ${token.identifier}`);
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
        token
    });
});
process.on('unhandledRejection', (reason, p) => {
    Log_1.Log.error("Unhandled promise rejection");
    console.log(reason);
    console.log(p);
});
