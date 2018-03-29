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
    RPCErrors[RPCErrors["ERROR_AUTHENTICATING"] = 2] = "ERROR_AUTHENTICATING";
})(RPCErrors || (RPCErrors = {}));
class TagAuth {
    constructor(keyProvider, rpc) {
        this.keyProvider = keyProvider;
        this.rpc = rpc;
        this.rpc.bind("auth", this.Authenticate.bind(this));
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
    Authenticate(args) {
        return __awaiter(this, void 0, void 0, function* () {
            Log_1.Log.debug("TagAuth::Authenticate()", args);
            const taginfo = {
                ATQA: args.ATQA,
                SAK: args.SAK,
                UID: Buffer.from(args.UID, 'hex'),
                ATS: Buffer.from(args.ATS, 'hex')
            };
            var TagClass;
            try {
                TagClass = TagFactory_1.TagFactory.Identify(taginfo);
            }
            catch (e) {
                Log_1.Log.error("TagAuth::Authenticate(): Identify failed.");
                throw new Defines_1.RPCMethodError(RPCErrors.UNSUPPORTED_TAG_TYPE, "Unsupported tag type");
            }
            // Initialize tag
            var tag = new TagClass(taginfo, (buf) => this.TagTransceive(buf));
            // Authenticate
            try {
                var res = yield tag.Authenticate(this.keyProvider);
            }
            catch (e) {
                Log_1.Log.error(`TagAuth::Authenticate(): Authentication error: ${e.message}`, e);
                throw new Defines_1.RPCMethodError(RPCErrors.ERROR_AUTHENTICATING, `Error authenticating: ${e.message}`);
            }
            return res;
        });
    }
}
exports.TagAuth = TagAuth;
