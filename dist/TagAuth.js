"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Defines_1 = require("modular-json-rpc/dist/Defines");
const TagFactory_1 = require("./TagFactory");
const Log_1 = require("./Log");
var RPCErrors;
(function (RPCErrors) {
    RPCErrors[RPCErrors["UNSUPPORTED_TAG_TYPE"] = 1] = "UNSUPPORTED_TAG_TYPE";
    RPCErrors[RPCErrors["AUTHENTICATE_FAILED"] = 2] = "AUTHENTICATE_FAILED";
    RPCErrors[RPCErrors["INITIALIZE_KEY_FAILED"] = 3] = "INITIALIZE_KEY_FAILED";
    RPCErrors[RPCErrors["WRONG_PASSWORD"] = 4] = "WRONG_PASSWORD";
})(RPCErrors || (RPCErrors = {}));
class TagAuth {
    constructor(options) {
        this.options = options;
        this.keyProvider = options.keyProvider;
        this.rpc = options.rpc;
        this.rpc.bind("auth", this.Authenticate.bind(this));
        this.rpc.bind("init", this.InitializeKey.bind(this));
    }
    hasPermission(perm) {
        let token = this.options.token;
        if (!token)
            return false;
        if (!(token.permissions instanceof Array))
            return false;
        return token.permissions.includes(perm);
    }
    // Exchanges data with remote tag
    TagTransceive(buf) {
        return __awaiter(this, void 0, void 0, function* () {
            // Call remote transceive function
            var result = yield this.rpc.call("transceive", buf.toString('hex'));
            // Convert result to buffer
            return Buffer.from(result, 'hex');
        });
    }
    // Identifies tag based on taginfo and returns new tag object
    GetTag(tagInfoRPC) {
        // Parse arguments
        const taginfo = {
            ATQA: tagInfoRPC.ATQA,
            SAK: tagInfoRPC.SAK,
            UID: Buffer.from(tagInfoRPC.UID, 'hex'),
            ATS: Buffer.from(tagInfoRPC.ATS, 'hex')
        };
        var TagClass;
        try {
            TagClass = TagFactory_1.TagFactory.Identify(taginfo);
        }
        catch (e) {
            throw new Defines_1.RPCMethodError(RPCErrors.UNSUPPORTED_TAG_TYPE, "Unsupported tag type");
        }
        // Initialize tag
        return new TagClass(taginfo, (buf) => this.TagTransceive(buf));
    }
    Authenticate(tagInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            Log_1.Log.debug("TagAuth::Authenticate()", tagInfo);
            let tag = this.GetTag(tagInfo);
            // Authenticate
            try {
                var res = yield tag.Authenticate(this.keyProvider);
            }
            catch (e) {
                Log_1.Log.error(`TagAuth::Authenticate(): Authentication error: ${e.message}`, e);
                throw new Defines_1.RPCMethodError(RPCErrors.AUTHENTICATE_FAILED, `Error authenticating: ${e.message}`);
            }
            return res;
        });
    }
    InitializeKey(tagInfo, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check password for this method
            if (!this.hasPermission("eacs-tag-auth:initializekey"))
                throw new Defines_1.RPCMethodError(RPCErrors.WRONG_PASSWORD, 'Wrong initialization password');
            let tag = this.GetTag(tagInfo);
            // Initialize key
            try {
                var res = yield tag.InitializeKey(this.keyProvider);
            }
            catch (e) {
                Log_1.Log.error(`TagAuth::InitializeKey(): error: ${e.message}`, e);
                throw new Defines_1.RPCMethodError(RPCErrors.INITIALIZE_KEY_FAILED, e.message);
            }
            return res;
        });
    }
}
exports.TagAuth = TagAuth;
