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
