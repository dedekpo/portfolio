import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { i18n } from "./i18n-config";

import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

function getLocale(request: NextRequest): string | undefined {
	// Negotiator expects plain object so we need to transform headers
	const negotiatorHeaders: Record<string, string> = {};
	request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

	// Use negotiator and intl-localematcher to get best locale
	let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
	// @ts-ignore locales are readonly
	const locales: string[] = i18n.locales;
	return matchLocale(languages, locales, i18n.defaultLocale);
}

const PUBLIC_FILE_PATTERN = /\.(.*)$/;

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	if (
		pathname.startsWith("/_next/image") || // exclude all image requests
		pathname.startsWith("/api") || //  exclude all API routes - Perhaps not wanted?
		pathname.startsWith("/static") || // exclude static files - Perhaps not wanted?
		PUBLIC_FILE_PATTERN.test(pathname) // exclude all files in the public folder
	)
		return NextResponse.next();

	// // Skip next internal requests
	// if (request.nextUrl.pathname.includes("_next")) return;

	// Check if there is any supported locale in the pathname
	const pathnameIsMissingLocale = i18n.locales.every(
		(locale) =>
			!pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
	);

	// Let's redirect if there is no locale
	if (pathnameIsMissingLocale) {
		const locale = getLocale(request);
		return NextResponse.redirect(
			new URL(`/${locale}/${pathname}`, request.url)
		);
	}
}

export const config = {
	// We can enable redirect just from root
	// matcher: ["/((?!_next).*)"],
};
