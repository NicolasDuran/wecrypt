# WeCrypt

[WeCrypt.eu](https://wecrypt.eu) is a browser-first tool for exchanging encrypted files using end-to-end cryptography. It generates a personal X25519 key pair locally, lets you share the public key as a link, and keeps all encryption and decryption work on the client. No files or keys ever leave the browser.

> ⚠️ This is a beta preview. Do not entrust it with sensitive data yet.


## How it works

1. Visiting the home page generates (or reuses) a local X25519 key pair. The public key is embedded in a share link such as `/share/:publicKey`.
2. You send the link to a sender. When they open it, they can encrypt a file with your public key and it hands them back a `.wecrypt` blob.
3. The sender transmits the `.wecrypt` file via email, chat, drive, or any channel.
4. You drop the `.wecrypt` file back into WeCrypt. Your private key (stored locally) decrypts the payload and downloads the original file.

If you clear your browser storage, your private key is lost and previously received `.wecrypt` files cannot be recovered.


## Cryptography notes

- X25519 performs the Diffie-Hellman key exchange between the sender’s ephemeral key and the recipient’s persisted key.
- HKDF with SHA-256 derives an AES-256-GCM key scoped by the peer public keys and a random salt.
- The output bundle includes the sender’s ephemeral public key, the salt, IV, ciphertext, and the original metadata (filename, MIME type).
- Because private keys never leave the browser, losing local storage means losing access to past files. Inform users before they rely on the tool.

