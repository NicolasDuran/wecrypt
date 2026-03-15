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
	Share2,
	Send,
	Unlock,
	ChevronRight,
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
		<div className="w-full bg-orange-100 text-xs text-center flex items-center justify-center h-8 text-orange-800 border-b border-orange-200">
			Beta preview. Do not use with sensitive data yet.
		</div>
	);
}

function Navbar() {
	const location = useLocation();
	const isSharePage = location.pathname.startsWith("/share");

	return (
		<nav className="border-b border-slate-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5">
				<div className="flex items-center gap-2">
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-bold text-white text-sm shadow-sm">
						W
					</span>
					<div>
						<Link to="/" className="text-sm font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
							WeCrypt
							<span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
								v0.0.2
							</span>
						</Link>
						<p className="text-[11px] text-slate-400 leading-tight">
							Local end-to-end encryption
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4 text-sm">
					<Link
						to="/"
						className={`transition hover:text-slate-900 text-sm ${!isSharePage ? "text-slate-900 font-medium" : "text-slate-500"}`}
					>
						Home
					</Link>
					<a
						href="https://github.com/NicolasDuran/wecrypt"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
					>
						<Github className="h-3.5 w-3.5" />
						GitHub
					</a>
				</div>
			</div>
		</nav>
	);
}

function Hero() {
	return (
		<section className="mx-auto max-w-5xl px-4 pt-6 pb-4 text-center">
			<motion.h1
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="text-5xl font-semibold text-slate-900"
			>
				WeCrypt
			</motion.h1>
			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.05 }}
				className="mt-2 text-lg text-slate-500"
			>
				Local end-to-end file encryption &amp; decryption in your browser.
			</motion.p>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				className="mt-3 flex flex-wrap items-center justify-center gap-2"
			>
				<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
					<ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
					X25519 · HKDF · AES-GCM
				</span>
				<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
					<Github className="h-3.5 w-3.5 text-slate-400" />
					Open source (MIT)
				</span>
				<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">
					<Lock className="h-3.5 w-3.5 text-slate-400" />
					100% local
				</span>
			</motion.div>
		</section>
	);
}

function StepsGuide() {
	const [open, setOpen] = useState(false);

	const steps = [
		{
			icon: Share2,
			label: "01",
			title: "Share your link",
			body: "Give your personal URL to whoever needs to send you a file.",
		},
		{
			icon: ShieldCheck,
			label: "02",
			title: "They encrypt locally",
			body: "Their browser encrypts the file using your public key. Everything happens locally, nothing is ever uploaded.",
		},
		{
			icon: Send,
			label: "03",
			title: "They send the file",
			body: "Email, chat, cloud storage — any channel works. The .wecrypt file is safe to share anywhere.",
		},
		{
			icon: Unlock,
			label: "04",
			title: "You decrypt",
			body: "Drop the .wecrypt file below. Your private key, stored in this browser, decrypts it instantly.",
		},
	];

	return (
		<section className="mx-auto max-w-4xl px-4">
			{/* Mobile toggle — hidden on sm+ */}
			<button
				onClick={() => setOpen((o) => !o)}
				className="sm:hidden w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm cursor-pointer transition hover:border-slate-300"
			>
				<span className="flex items-center gap-2 text-slate-600">
					<ChevronRight
						className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
					/>
					How it works
				</span>
				<span className="text-xs text-slate-400">4 steps</span>
			</button>

			{/* Steps grid */}
			<div className={`${open ? "mt-3" : "hidden"} sm:block`}>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					{steps.map((step, idx) => {
						const Icon = step.icon;
						const isLast = idx === steps.length - 1;
						return (
							<div key={idx} className="relative">
								{/* Arrow connector between cards on large screens */}
								{!isLast && (
									<div className="hidden lg:flex absolute -right-[1.125rem] top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm">
										<ChevronRight className="h-3.5 w-3.5 text-slate-400" />
									</div>
								)}
								<div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3 hover:border-slate-300 hover:shadow-md transition-all duration-200">
									{/* Icon + step number row */}
									<div className="flex items-center justify-between">
										<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 border border-orange-100">
											<Icon className="h-4.5 w-4.5 text-orange-500" style={{ width: "1.125rem", height: "1.125rem" }} />
										</div>
										<span className="text-lg font-black tabular-nums text-slate-300 tracking-tight select-none">
											{step.label}
										</span>
									</div>
									{/* Text */}
									<div>
										<p className="text-sm font-semibold text-slate-900 leading-snug">
											{step.title}
										</p>
										<p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
											{step.body}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
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
		<div className="space-y-1.5">
			<label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
				{label}
			</label>
			<div className="flex items-center gap-2">
				<div className="flex-1 min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 truncate">
					{canCopy ? value : "Generating your secure link…"}
				</div>
				<button
					onClick={onCopy}
					disabled={!canCopy}
					className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
				>
					<CopyIcon className="h-3.5 w-3.5" />
					{copied ? "Copied!" : "Copy"}
				</button>
			</div>
			{helper && <p className="text-[11px] text-slate-400">{helper}</p>}
		</div>
	);
}

function FileChip({ file }: { file: File }) {
	return (
		<div className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
			<span className="truncate" title={file.name}>
				{file.name}
			</span>
			<span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
				{file.type || "binary"}
			</span>
			<span className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
				{formatBytes(file.size)}
			</span>
		</div>
	);
}

function ProgressBar({ percent }: { percent: number }) {
	const safe = Math.max(0, Math.min(100, percent));
	return (
		<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
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
	compact,
}: {
	onFile: (f: File) => void;
	accept?: string;
	hint?: string;
	compact?: boolean;
}) {
	const [active, setActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => inputRef.current?.click();

	if (compact) {
		return (
			<div
				onDragOver={(e) => { e.preventDefault(); setActive(true); }}
				onDragLeave={() => setActive(false)}
				onDrop={(e) => {
					e.preventDefault();
					setActive(false);
					const f = e.dataTransfer.files?.[0];
					if (f) onFile(f);
				}}
				onClick={handleClick}
				className={`flex-1 cursor-pointer rounded-xl border-2 border-dashed px-5 py-6 transition flex flex-col items-center justify-center gap-3 text-center ${
					active ? "border-slate-500 bg-slate-100" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
				}`}
			>
				<UploadCloud className={`h-7 w-7 flex-shrink-0 ${active ? "text-slate-600" : "text-slate-400"}`} />
				<div className="min-w-0">
					<p className="text-sm font-medium text-slate-700">Drop your .wecrypt file</p>
					{hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
				</div>
				<button
					onClick={(e) => { e.stopPropagation(); handleClick(); }}
					className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 cursor-pointer"
				>
					Browse files
				</button>
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
			</div>
		);
	}

	return (
		<div
			onDragOver={(e) => { e.preventDefault(); setActive(true); }}
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
				<p className="text-base font-semibold text-slate-900">Drop a file here</p>
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
					className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 cursor-pointer"
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
	const [decFile, setDecFile] = useState<File | null>(null);

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
		return () => { mounted = false; };
	}, []);

	const onDecrypt = async (file?: File | null) => {
		if (!file || !priv) return;
		setDecFile(file);
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
		<div className="space-y-4 pb-8">
			<Hero />
			<StepsGuide />
			<section className="mx-auto max-w-4xl px-4">
				<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
						{/* Left: Share link */}
						<div className="p-5 flex flex-col gap-3">
							<div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
								<KeyRound className="h-4 w-4 text-orange-500" />
								Your share link
							</div>
							{loading ? (
								<p className="text-xs text-slate-400 py-2">Generating keypair…</p>
							) : (
								<CopyField
									label="Share this URL"
									value={shareUrl}
									helper="Send it by email, chat, or any channel you trust."
								/>
							)}
							<div className="mt-auto flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
								<AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
								<p>
									If you clear your browser data, you won't be able to decrypt
									previously encrypted files.
								</p>
							</div>
						</div>

						{/* Right: Decrypt */}
						<div className="p-5 flex flex-col gap-3 min-h-0">
							<div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
								<Lock className="h-4 w-4 text-slate-600" />
								Decrypt a .wecrypt file
							</div>
							<FileDrop
								onFile={(f) => onDecrypt(f)}
								accept="application/json,.wecrypt"
								hint="Decryption stays entirely on this device."
								compact
							/>
							{decFile && decProgress === 0 && !decStatus.includes("Failed") && (
								<FileChip file={decFile} />
							)}
							{decProgress > 0 && <ProgressBar percent={decProgress} />}
							{decStatus && (
								<p className={`text-xs ${decStatus.includes("Failed") ? "text-red-600" : "text-slate-500"}`}>
									{decStatus}
								</p>
							)}
						</div>
					</div>
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
			setStatus("Done! The encrypted file was downloaded to your computer.");
			setTimeout(() => setEncProgress(0), 600);
		} catch (e: any) {
			clearInterval(timer);
			console.error(e);
			setStatus("Failed to encrypt: " + (e?.message || e));
			setEncProgress(0);
		}
	};

	return (
		<div className="space-y-6 pb-10">
			<section className="mx-auto max-w-5xl px-4 pt-8 pb-4 text-center">
				<h1 className="text-2xl font-semibold text-slate-900">Encrypt a file</h1>
				<p className="mt-2 text-sm text-slate-500">
					Drop a file below. WeCrypt encrypts it locally in your browser and gives you a{" "}
					<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.wecrypt</code>{" "}
					file only the recipient can open.
				</p>
			</section>

			<section className="mx-auto flex max-w-xl flex-col gap-4 px-4">
				<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4">
						<UploadCloud className="h-4 w-4 text-slate-600" />
						Encrypt &amp; download
					</div>
					<FileDrop
						onFile={(f) => setFile(f)}
						hint="Encrypted locally in your browser. Nothing is uploaded."
					/>
					{file && (
						<div className="mt-3">
							<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
								Selected
							</span>
							<div className="mt-1.5">
								<FileChip file={file} />
							</div>
						</div>
					)}
					<button
						onClick={onEncrypt}
						disabled={!file}
						className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
					>
						<Download className="h-4 w-4" />
						Encrypt &amp; download .wecrypt
					</button>
					{encProgress > 0 && (
						<div className="mt-3">
							<ProgressBar percent={encProgress} />
						</div>
					)}
					{status && (
						<p className={`mt-2 text-xs ${status.includes("Failed") ? "text-red-600" : "text-slate-500"}`}>
							{status}
						</p>
					)}
					<div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
						Send the <code className="font-mono">.wecrypt</code> file over any
						channel. Only the link owner can decrypt it.
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
			<footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-400">
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
