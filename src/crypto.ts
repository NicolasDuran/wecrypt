import { ub64u, b64u } from "./utils";
import { idbGet, idbSet } from "./storage";

export const te = new TextEncoder();

// -----------------------------
// X25519 + HKDF + AES-GCM helpers
// -----------------------------
export async function ensureKeypair(): Promise<{
	priv: CryptoKey;
	pubX: string;
}> {
	const saved = await idbGet<any>("x25519-keypair");
	if (saved?.priv && saved?.pubX) {
		return saved as { priv: CryptoKey; pubX: string };
	}
	const kp = (await crypto.subtle.generateKey({ name: "X25519" }, false, [
		"deriveBits",
		"deriveKey",
	])) as CryptoKeyPair;
	const pubJwk = (await crypto.subtle.exportKey("jwk", kp.publicKey)) as any;
	const pubX = pubJwk.x as string;
	const record = { priv: kp.privateKey, pubX };
	await idbSet("x25519-keypair", record);
	return record;
}

async function importX25519PublicFromX(x: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"jwk",
		{ kty: "OKP", crv: "X25519", x },
		{ name: "X25519" },
		true,
		[],
	);
}

export async function deriveAesKeyFromECDH(
	myPriv: CryptoKey,
	theirPub: CryptoKey,
	infoStr: string,
	salt?: Uint8Array,
): Promise<{ aesKey: CryptoKey; salt: Uint8Array }> {
	const shared = await crypto.subtle.deriveBits(
		{ name: "X25519", public: theirPub },
		myPriv,
		256,
	);

	const hkdfSalt = salt
		? new Uint8Array(salt)
		: crypto.getRandomValues(new Uint8Array(16));
	const saltBuffer =
		hkdfSalt.byteOffset === 0 &&
		hkdfSalt.byteLength === hkdfSalt.buffer.byteLength
			? hkdfSalt.buffer
			: hkdfSalt.buffer.slice(
					hkdfSalt.byteOffset,
					hkdfSalt.byteOffset + hkdfSalt.byteLength,
				);

	const info = te.encode(infoStr);
	const base = await crypto.subtle.importKey("raw", shared, "HKDF", false, [
		"deriveKey",
	]);
	const aesKey = await crypto.subtle.deriveKey(
		{ name: "HKDF", hash: "SHA-256", salt: saltBuffer, info },
		base,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
	return { aesKey, salt: hkdfSalt };
}

export async function encryptForPublicX(publicX: string, file: File) {
	const eph = (await crypto.subtle.generateKey({ name: "X25519" }, true, [
		"deriveBits",
		"deriveKey",
	])) as CryptoKeyPair;
	const ephJwk = (await crypto.subtle.exportKey("jwk", eph.publicKey)) as any;
	const ephX = ephJwk.x as string;

	const recvPub = await importX25519PublicFromX(publicX);
	const { aesKey, salt } = await deriveAesKeyFromECDH(
		eph.privateKey,
		recvPub,
		`X25519-HKDF-A256GCM|recv:${publicX}|eph:${ephX}`,
	);

	const arrayBuf = await file.arrayBuffer();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ct = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		aesKey,
		arrayBuf,
	);

	const envelope = {
		v: 1,
		alg: "X25519+HKDF(SHA-256)+AES-GCM-256",
		ephX,
		recvX: publicX,
		salt: b64u(salt),
		iv: b64u(iv),
		filename: file.name,
		mime: file.type || "application/octet-stream",
		ct: b64u(ct),
	};
	const blob = new Blob([JSON.stringify(envelope, null, 2)], {
		type: "application/json",
	});
	const dlName = file.name + ".wecrypt";
	return { blob, dlName };
}

export async function decryptWithMyPrivate(envelope: any, myPriv: CryptoKey) {
	const { ephX, recvX, salt, iv, ct, filename, mime } = envelope;
	const ephPub = await importX25519PublicFromX(ephX);
	const { aesKey } = await deriveAesKeyFromECDH(
		myPriv,
		ephPub,
		`X25519-HKDF-A256GCM|recv:${recvX}|eph:${ephX}`,
		ub64u(salt),
	);
	const pt = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: ub64u(iv) },
		aesKey,
		ub64u(ct),
	);
	const blob = new Blob([pt], { type: mime || "application/octet-stream" });
	return { blob, filename: filename || "file" };
}
