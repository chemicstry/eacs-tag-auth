import { RPCNode } from 'modular-json-rpc';
import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { Tag, TagInfo } from './Tag';
import { TagFactory } from './TagFactory';
import { KeyProvider } from './KeyProvider';
import { Log } from './Log';

enum RPCErrors
{
    UNSUPPORTED_TAG_TYPE                = 1,
    ERROR_AUTHENTICATING                = 2,
}

class TagAuth
{
    keyProvider: KeyProvider;
    rpc: RPCNode;

    constructor(keyProvider: KeyProvider, rpc: RPCNode)
    {
        this.keyProvider = keyProvider;
        this.rpc = rpc;

        this.rpc.bind("auth", this.Authenticate.bind(this));
    }

    // Exchanges data with remote tag
    async TagTransceive(buf: Buffer)
    {
        // Call remote transceive function
        var result = await this.rpc.call("transceive", buf.toString('hex'));

        // Convert result to buffer
        return Buffer.from(<string>result, 'hex');
    }

    async Authenticate(args: any)
    {
        Log.debug("TagAuth::Authenticate()", args);

        const taginfo: TagInfo = {
            ATQA: args.ATQA,
            SAK: args.SAK,
            UID: Buffer.from(args.UID, 'hex'),
            ATS: Buffer.from(args.ATS, 'hex')
        };

        var TagClass: typeof Tag;

        try {
            TagClass = TagFactory.Identify(taginfo);
        } catch (e) {
            Log.error("TagAuth::Authenticate(): Identify failed.");
            throw new RPCMethodError(RPCErrors.UNSUPPORTED_TAG_TYPE, "Unsupported tag type");
        }
        
        // Initialize tag
        var tag = new TagClass(taginfo, (buf: Buffer) => this.TagTransceive(buf));

        // Authenticate
        try {
            var res = await tag.Authenticate(this.keyProvider);
        } catch (e) {
            Log.error(`TagAuth::Authenticate(): Authentication error: ${e.message}`, e);
            throw new RPCMethodError(RPCErrors.ERROR_AUTHENTICATING, `Error authenticating: ${e.message}`);
        }

        return res;
    }
}

export {
    TagAuth
};
