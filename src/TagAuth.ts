import { RPCNode } from 'modular-json-rpc';
import { RPCMethodError } from 'modular-json-rpc/dist/Defines';
import { Tag, TagInfo, TagConstructor } from './Tag';
import { TagFactory } from './TagFactory';
import { KeyProvider } from './KeyProvider';
import { Log } from './Log';

enum RPCErrors
{
    UNSUPPORTED_TAG_TYPE                = 1,
    AUTHENTICATE_FAILED                 = 2,
    INITIALIZE_KEY_FAILED               = 3,
    WRONG_PASSWORD                      = 4,
}

interface TagAuthOptions
{
    // Used for diversifying tag keys
    keyProvider: KeyProvider;
    // Communications
    rpc: RPCNode;
    // Key initialization is unsafe (keys are exposed) and must be protected
    initilizationPass: string;
}

class TagAuth
{
    options: TagAuthOptions;
    keyProvider: KeyProvider;
    rpc: RPCNode;

    constructor(options: TagAuthOptions)
    {
        this.options = options;
        this.keyProvider = options.keyProvider;
        this.rpc = options.rpc;

        this.rpc.bind("auth", this.Authenticate.bind(this));
        this.rpc.bind("init", this.InitializeKey.bind(this));
    }

    // Exchanges data with remote tag
    async TagTransceive(buf: Buffer)
    {
        // Call remote transceive function
        var result = await this.rpc.call("transceive", buf.toString('hex'));

        // Convert result to buffer
        return Buffer.from(<string>result, 'hex');
    }

    // Identifies tag based on taginfo and returns new tag object
    GetTag(tagInfoRPC: any): Tag
    {
        // Parse arguments
        const taginfo: TagInfo = {
            ATQA: tagInfoRPC.ATQA,
            SAK: tagInfoRPC.SAK,
            UID: Buffer.from(tagInfoRPC.UID, 'hex'),
            ATS: Buffer.from(tagInfoRPC.ATS, 'hex')
        };

        var TagClass: TagConstructor;

        try {
            TagClass = TagFactory.Identify(taginfo);
        } catch (e) {
            throw new RPCMethodError(RPCErrors.UNSUPPORTED_TAG_TYPE, "Unsupported tag type");
        }

        // Initialize tag
        return new TagClass(taginfo, (buf: Buffer) => this.TagTransceive(buf));
    }

    async Authenticate(tagInfo: any): Promise<boolean>
    {
        Log.debug("TagAuth::Authenticate()", tagInfo);

        let tag = this.GetTag(tagInfo);

        // Authenticate
        try {
            var res = await tag.Authenticate(this.keyProvider);
        } catch (e) {
            Log.error(`TagAuth::Authenticate(): Authentication error: ${e.message}`, e);
            throw new RPCMethodError(RPCErrors.AUTHENTICATE_FAILED, `Error authenticating: ${e.message}`);
        }

        return res;
    }

    async InitializeKey(tagInfo: any, pass: string): Promise<boolean>
    {
        // Check password for this method
        if (pass !== this.options.initilizationPass)
            throw new RPCMethodError(RPCErrors.WRONG_PASSWORD, 'Wrong initialization password');

        let tag = this.GetTag(tagInfo);

        // Initialize key
        try {
            var res = await tag.InitializeKey(this.keyProvider);
        } catch (e) {
            Log.error(`TagAuth::InitializeKey(): error: ${e.message}`, e);
            throw new RPCMethodError(RPCErrors.INITIALIZE_KEY_FAILED, e.message);
        }

        return res;
    }
}

export {
    TagAuthOptions,
    TagAuth
};
