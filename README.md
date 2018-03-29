[![Build Status](https://travis-ci.org/chemicstry/eacs-tag-auth.svg?branch=master)](https://travis-ci.org/chemicstry/eacs-tag-auth)
[![Coverage Status](https://coveralls.io/repos/github/chemicstry/eacs-tag-auth/badge.svg?branch=master)](https://coveralls.io/github/chemicstry/eacs-tag-auth?branch=master)

# eacs-tag-auth
Extensible Access Control System. RFID Tag Authentication Module.

This module provides a RFID tag authentication service over JSON-RPC protocol via websocket.

## Supported tags

- Mifare Desfire EV1 (AES, 2K3DES, 3K3DES keys)

## API

### `auth(taginfo: object): boolean`

Performs RFID tag authentication and returns boolean wether authentication succeeded.

`taginfo` is an ISO14443A target info object. Example (Desfire EV1):
```json
{
    "ATQA": [3, 68],
    "SAK": 32,
    "ATS": "7577810280",
    "UID": "04522EAA4723809000"
}
```

Client must expose `transceive(data: string): string` method which is used to exchange data with the tag. Input and output data is hex encoded string.

#### Example authentication (as seen from the client)

```json
Sent:
{
    "jsonrpc":"2.0",
    "id":73,
    "method":"auth",
    "params": [
        {
            "ATQA":[3,68],
            "ATS":"7577810280",
            "SAK":32,
            "UID":"047681BA703A80"
        }
    ]
}

Received:
{
    "jsonrpc":"2.0",
    "id":221,
    "method":"transceive",
    "params":["00a4040007d276000085010000"]
}

Sent:
{
    "jsonrpc":"2.0",
    "id":221,
    "result":"9000"
}

Received:
{
    "jsonrpc":"2.0",
    "id":222,
    "method":"transceive",
    "params":["90aa0000010000"]
}

Sent:
{
    "jsonrpc":"2.0",
    "id":222,
    "result":"53233522C3A15A39E6EA1AF139EFD2D691AF"
}

Received:
{
    "jsonrpc":"2.0",
    "id":223,
    "method":"transceive",
    "params":["90af000020dc5b7b348325b8b7b4284c0f7c3a98ecb31da51e25c566e8539bf32a00f1e8a800"]
}

Sent:
{
    "jsonrpc":"2.0",
    "id":223,
    "result":"9DBD38660C49CC852EE4EF427C9886B399100"
}

Received:
{
    "jsonrpc":"2.0",
    "id":73,
    "result":true
}
```
