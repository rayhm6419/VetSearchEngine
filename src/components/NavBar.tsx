"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/components/navLinks";

interface NavBarProps {
	className?: string;
}

export default function NavBar({ className }: NavBarProps) {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const firstFocusableRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
	const lastFocusableRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);

	const isActive = (href: string) => {
		return pathname === href;
	};

	// Close on route change
	useEffect(() => {
		setOpen(false);
	}, [pathname]);

	// Handle Esc and focus trap when open
	useEffect(() => {
		if (!open) return;

		const panel = panelRef.current;
		if (!panel) return;

		const focusableSelectors = [
			"a[href]",
			"button:not([disabled])",
			"[tabindex]:not([tabindex='-1'])",
			"input:not([disabled])",
			"select:not([disabled])",
			"textarea:not([disabled])",
		];
		const focusable = Array.from(
			panel.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
		);
		if (focusable.length > 0) {
			firstFocusableRef.current = focusable[0] as HTMLAnchorElement;
			lastFocusableRef.current = focusable[focusable.length - 1] as HTMLAnchorElement;
			// Move focus to first focusable when opening
			focusable[0].focus();
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
			if (e.key === "Tab" && focusable.length > 0) {
				// Focus trap
				if (e.shiftKey && document.activeElement === focusable[0]) {
					e.preventDefault();
					(focusable[focusable.length - 1] as HTMLElement).focus();
				} else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
					e.preventDefault();
					(focusable[0] as HTMLElement).focus();
				}
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open]);

	const containerClasses = useMemo(
		() =>
			`sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 ${
				className || ""
			}`,
		[className]
	);

	return (
		<nav className={containerClasses} role="navigation" aria-label="Main">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="flex h-14 items-center justify-between">
					{/* Left: Logo */}
					<Link href="/" className="text-base font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
						<span aria-hidden>🐾</span>
						<span>PetCare</span>
					</Link>

					{/* Desktop Links */}
					<div className="hidden sm:flex items-center gap-4">
						{NAV_LINKS.map((l) => {
							const active = isActive(l.href);
							const base = "px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";
							const activeCls = active ? "font-semibold underline underline-offset-4" : "hover:underline underline-offset-4";
							const ctaCls = l.cta ? "ml-2 inline-block rounded-lg bg-black text-white px-3 py-1 text-sm hover:bg-gray-800" : "";
							return (
								<Link
									key={l.href}
									href={l.href}
									className={`${base} ${activeCls} ${ctaCls}`}
									aria-current={active ? "page" : undefined}
								>
									{l.label}
								</Link>
							);
						})}
					</div>

					{/* Mobile hamburger */}
					<div className="sm:hidden">
						<button
							aria-label="Open menu"
							aria-controls="mobile-menu"
							aria-expanded={open}
							onClick={() => setOpen((v) => !v)}
							className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
						>
							<span className="block w-5 h-[2px] bg-gray-800 mb-1" />
							<span className="block w-5 h-[2px] bg-gray-800 mb-1" />
							<span className="block w-5 h-[2px] bg-gray-800" />
						</button>
					</div>
				</div>
			</div>

			{/* Mobile panel */}
			<div
				id="mobile-menu"
				ref={panelRef}
				className={`sm:hidden overflow-hidden transition-[max-height] duration-200 ease-out border-b border-gray-200 ${
					open ? "max-h-96" : "max-h-0"
				}`}
			>
				<div className="px-4 pb-4 pt-2 bg-white shadow-sm">
					<div className="flex flex-col gap-2">
						{NAV_LINKS.map((l) => {
							const active = isActive(l.href);
							return (
								<Link
									key={l.href}
									href={l.href}
									className={`px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
										active ? "font-semibold underline" : "hover:underline"
									} ${l.cta ? "rounded-lg bg-black text-white px-3 py-2 hover:bg-gray-800" : ""}`}
									aria-current={active ? "page" : undefined}
								>
									{l.label}
								</Link>
							);
						})}
					</div>
				</div>
			</div>
		</nav>
	);
}
