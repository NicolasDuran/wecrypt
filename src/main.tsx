import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
	BrowserRouter,
	Routes,
	Route,
	Link,
	useLocation,
	useParams,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
	ShieldCheck,
	KeyRound,
	Lock,
	UploadCloud,
	Download,
	Copy as CopyIcon,
	AlertTriangle,
	Github,
} from "lucide-react";
import {
	decryptWithMyPrivate,
	encryptForPublicX,
	ensureKeypair,
} from "./crypto";
import { formatBytes } from "./utils";
import "./index.css";

function BetaBanner() {
	return (
		<div className="w-full bg-orange-200/80 text-sm text-center flex items-center justify-center h-10">
			<p>This is a beta preview. Don’t trust it with sensitive data yet.</p>
		</div>
	);
}

function Navbar() {
	const location = useLocation();
	const isSharePage = location.pathname.startsWith("/share");

	return (
		<nav className="border-b border-slate-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
				<div className="flex items-center gap-2">
					<span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 font-semibold text-white shadow-sm">
						W
					</span>
					<div>
						<Link to="/" className="text-base font-semibold text-slate-900">
							WeCrypt
							<span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
								v0.0.1
							</span>
						</Link>
						<p className="flex items-center gap-2 text-xs text-slate-500">
							Local end-to-end encryption
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4 text-sm">
					<Link
						to="/"
						className={`transition hover:text-slate-900 ${!isSharePage ? "text-slate-900 font-medium" : "text-slate-500"}`}
					>
						Home
					</Link>
					<a
						href="https://github.com/NicolasDuran/wecrypt"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
					>
						<Github className="h-4 w-4" />
						GitHub
					</a>
				</div>
			</div>
		</nav>
	);
}

function Hero() {
	return (
		<section className="mx-auto max-w-5xl px-4 pt-12 pb-10 text-center">
			<motion.h1
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="text-4xl font-semibold text-slate-900 sm:text-5xl"
			>
				WeCrypt
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, delay: 0.05 }}
				className="mt-3 text-lg text-slate-600"
			>
				Local end-to-end file encryption &amp; decryption in your browser.
			</motion.p>
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, delay: 0.1 }}
				className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600"
			>
				<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
					<ShieldCheck className="h-4 w-4 text-slate-500" />
					X25519 • HKDF • AES-GCM
				</span>
				<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
					<Github className="h-4 w-4 text-slate-500" />
					Open source (MIT)
				</span>
				<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
					<Lock className="h-4 w-4 text-slate-500" />
					100% local processing
				</span>
			</motion.div>
		</section>
	);
}

function StepsGuide() {
	const steps = [
		{
			title: "Share your personal link",
			body: "Send it to anyone who needs to deliver encrypted files to you.",
		},
		{
			title: "They encrypt in their browser",
			body: "Only their device and yours see the file.",
		},
		{
			title: "They send you the .wecrypt file",
			body: "Email, chat, drive upload, any existing channel works.",
		},
		{
			title: "You decrypt here",
			body: "Drop the received file back into WeCrypt to recover the original.",
		},
	];

	return (
		<section className="mx-auto max-w-4xl px-4">
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-900">How it works</h2>
				<ol className="mt-4 space-y-3 text-sm text-slate-600">
					{steps.map((step, idx) => (
						<li key={idx} className="flex gap-3">
							<span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
								{idx + 1}
							</span>
							<div>
								<p className="font-medium text-slate-900">{step.title}</p>
								<p>{step.body}</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

function CopyField({
	label,
	value,
	helper,
}: {
	label: string;
	value: string;
	helper?: string;
}) {
	const [copied, setCopied] = useState(false);
	const canCopy = value && value.length > 0;

	const onCopy = async () => {
		if (!canCopy) return;
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1200);
	};

	return (
		<div className="space-y-2">
			<label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</label>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex-1 overflow-hidden rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
					{canCopy ? value : "Generating your secure link…"}
				</div>
				<button
					onClick={onCopy}
					disabled={!canCopy}
					className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<CopyIcon className="h-4 w-4" />
					{copied ? "Copied" : "Copy link"}
				</button>
			</div>
			{helper && <p className="text-xs text-slate-500">{helper}</p>}
		</div>
	);
}

function FileChip({ file }: { file: File }) {
	return (
		<div className="inline-flex max-w-full items-center gap-2 truncate rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600">
			<span className="truncate" title={file.name}>
				{file.name}
			</span>
			<span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px]">
				{file.type || "binary"}
			</span>
			<span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px]">
				{formatBytes(file.size)}
			</span>
		</div>
	);
}

function ProgressBar({ percent }: { percent: number }) {
	const safe = Math.max(0, Math.min(100, percent));
	return (
		<div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
			<div
				className="h-full rounded-full bg-slate-700 transition-all"
				style={{ width: `${safe}%` }}
			/>
		</div>
	);
}

function FileDrop({
	onFile,
	accept,
	hint,
}: {
	onFile: (f: File) => void;
	accept?: string;
	hint?: string;
}) {
	const [active, setActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				setActive(true);
			}}
			onDragLeave={() => setActive(false)}
			onDrop={(e) => {
				e.preventDefault();
				setActive(false);
				const f = e.dataTransfer.files?.[0];
				if (f) onFile(f);
			}}
			className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
				active ? "border-slate-600 bg-slate-100" : "border-slate-300 bg-white"
			}`}
		>
			<div className="flex flex-col items-center gap-3 text-sm text-slate-600">
				<UploadCloud className="h-6 w-6 text-slate-500" />
				<p className="text-base font-semibold text-slate-900">
					Drop a file here
				</p>
				{hint && <p className="max-w-xs text-xs text-slate-500">{hint}</p>}
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					onChange={(e) => {
						const f = e.target.files?.[0];
						if (f) onFile(f);
					}}
					className="hidden"
				/>
				<button
					onClick={() => inputRef.current?.click()}
					className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
				>
					Browse files
				</button>
			</div>
		</div>
	);
}

function MainPage() {
	const [loading, setLoading] = useState(true);
	const [pubX, setPubX] = useState<string | null>(null);
	const [priv, setPriv] = useState<CryptoKey | null>(null);
	const [decStatus, setDecStatus] = useState<string>("");
	const [decProgress, setDecProgress] = useState<number>(0);

	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const shareUrl = pubX ? `${origin}/share/${pubX}` : "";

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const { priv, pubX } = await ensureKeypair();
				if (!mounted) return;
				setPriv(priv);
				setPubX(pubX);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const onDecrypt = async (file?: File | null) => {
		if (!file || !priv) return;
		setDecStatus("Decrypting…");
		setDecProgress(8);
		const timer = setInterval(
			() => setDecProgress((p) => Math.min(92, p + 6)),
			120,
		);
		try {
			const text = await file.text();
			const envelope = JSON.parse(text);
			if (!envelope?.ephX || !envelope?.ct)
				throw new Error("Not a .wecrypt file");
			const { blob, filename } = await decryptWithMyPrivate(envelope, priv);
			clearInterval(timer);
			setDecProgress(100);
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
			setDecStatus("Decrypted successfully.");
			setTimeout(() => setDecProgress(0), 600);
		} catch (e: any) {
			clearInterval(timer);
			console.error(e);
			setDecStatus("Failed to decrypt: " + (e?.message || e));
			setDecProgress(0);
		}
	};

	return (
		<div className="space-y-6 pb-16">
			<Hero />
			<StepsGuide />
			<section className="mx-auto flex max-w-4xl flex-col gap-6 px-4">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-2 text-sm font-medium text-slate-900">
						<KeyRound className="h-5 w-5 text-slate-600" />
						Your link to share
					</div>
					<div className="mt-4">
						{loading ? (
							<p className="text-sm text-slate-600">Generating your keypair…</p>
						) : (
							<CopyField
								label="Share this URL"
								value={shareUrl}
								helper="Send it by email, chat, or any other channel you trust. We never store files."
							/>
						)}
					</div>
					<div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						<AlertTriangle className="mt-0.5 h-4 w-4" />
						<p>
							If you clear your browser data, you won't be able to decrypt
							previously encrypted files.
						</p>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-2 text-sm font-medium text-slate-900">
						<Lock className="h-5 w-5 text-slate-600" />
						Decrypt a .wecrypt file
					</div>
					<div className="mt-4">
						<FileDrop
							onFile={(f) => onDecrypt(f)}
							accept="application/json,.wecrypt"
							hint="Drop the encrypted file you received. Decryption stays entirely on this device."
						/>
					</div>
					{decProgress > 0 && (
						<div className="mt-4">
							<ProgressBar percent={decProgress} />
						</div>
					)}
					{decStatus && (
						<p className="mt-2 text-sm text-slate-600">{decStatus}</p>
					)}
				</div>
			</section>
		</div>
	);
}

function SharePage() {
	const { publickey } = useParams();
	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<string>("");
	const [encProgress, setEncProgress] = useState<number>(0);

	const onEncrypt = async () => {
		if (!publickey) {
			setStatus("Missing public key in URL.");
			return;
		}
		if (!file) {
			setStatus("Choose a file first.");
			return;
		}
		setStatus("Encrypting locally…");
		setEncProgress(8);
		const timer = setInterval(
			() => setEncProgress((p) => Math.min(92, p + 6)),
			120,
		);
		try {
			const { blob, dlName } = await encryptForPublicX(publickey, file);
			clearInterval(timer);
			setEncProgress(100);
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = dlName;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
			setStatus("Done! We downloaded the encrypted file to your computer.");
			setTimeout(() => setEncProgress(0), 600);
		} catch (e: any) {
			clearInterval(timer);
			console.error(e);
			setStatus("Failed to encrypt: " + (e?.message || e));
			setEncProgress(0);
		}
	};

	return (
		<div className="space-y-8 pb-16">
			<section className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center">
				<h1 className="text-3xl font-semibold text-slate-900">
					Encrypt a file
				</h1>
				<p className="mt-3 text-base text-slate-600">
					Drop your file below and WeCrypt will hand you a{" "}
					<code className="rounded bg-slate-100 px-1.5 py-0.5">.wecrypt</code>{" "}
					file.
					<br /> Send it to the person who shared this link, only they can
					decrypt it.
				</p>
			</section>

			<section className="mx-auto flex max-w-4xl flex-col gap-6 px-4">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-2 text-sm font-medium text-slate-900">
						<UploadCloud className="h-5 w-5 text-slate-600" />
						Encrypt &amp; download
					</div>
					<div className="mt-4">
						<FileDrop
							onFile={(f) => setFile(f)}
							hint="We wrap your file using their public key. Only they can decrypt the .wecrypt package."
						/>
					</div>
					{file && (
						<div className="mt-3">
							<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Selected file
							</span>
							<div className="mt-2">
								<FileChip file={file} />
							</div>
						</div>
					)}
					<button
						onClick={onEncrypt}
						disabled={!file}
						className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200"
					>
						<Download className="h-4 w-4" />
						Encrypt &amp; download .wecrypt
					</button>
					{encProgress > 0 && (
						<div className="mt-4">
							<ProgressBar percent={encProgress} />
						</div>
					)}
					{status && <p className="mt-2 text-sm text-slate-600">{status}</p>}
					<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
						Send the `.wecrypt` file using any channel. The file is encrypted,
						only the person who sent you this link can decrypt it.
					</div>
				</div>
			</section>
		</div>
	);
}

function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
			<BetaBanner />
			<Navbar />
			<main className="flex-1">{children}</main>
			<footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">
				Built with love by Nicolas DURAN
			</footer>
		</div>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<MainPage />} />
					<Route path="/share/:publickey" element={<SharePage />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
