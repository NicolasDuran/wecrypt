// -----------------------------
// Utilities (safe base64url)
// -----------------------------

export function b64u(buf: ArrayBuffer | Uint8Array) {
	const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
	let binary = "";
	const CHUNK = 0x2000; // avoid argument limits
	for (let i = 0; i < u8.length; i += CHUNK) {
		const end = Math.min(i + CHUNK, u8.length);
		for (let j = i; j < end; j++) binary += String.fromCharCode(u8[j]);
	}
	const b64 = btoa(binary);
	return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
export function ub64u(s: string) {
	const b64 =
		s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
	const bin = atob(b64);
	const u8 = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
	return u8;
}

export function formatBytes(n: number) {
	if (!Number.isFinite(n)) return "";
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;
	while (n >= 1024 && i < units.length - 1) {
		n /= 1024;
		i++;
	}
	return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
