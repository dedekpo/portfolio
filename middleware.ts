import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { i18n } from './i18n-config';

// The site is English only. Its address stays /en, the one search engines have indexed, and
// everything else is sent there:
//   /            -> /en   (temporary, as before, so the root can still become the address later)
//   /pt, /pt/... -> /en   (permanent: the Portuguese pages are gone for good)
//   /anything    -> /en/anything (which is a 404 unless it exists)
//
// The previous version picked the language from the Accept-Language header and crashed with a
// 500 when there was none, which is what crawlers and link previews send. No header is read now.

const PUBLIC_FILE_PATTERN = /\.(.*)$/;
const RETIRED_LOCALES = ['pt'];

const hasLocale = (pathname: string, locale: string) =>
  pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE_PATTERN.test(pathname) // files in the public folder
  )
    return NextResponse.next();

  if (i18n.locales.some((locale) => hasLocale(pathname, locale))) return;

  const target = (rest: string) =>
    new URL(
      `/${i18n.defaultLocale}${rest === '/' ? '' : rest}${search}`,
      request.url,
    );

  const retired = RETIRED_LOCALES.find((locale) => hasLocale(pathname, locale));
  if (retired)
    return NextResponse.redirect(
      target(pathname.slice(retired.length + 1) || '/'),
      308,
    );

  return NextResponse.redirect(target(pathname), 307);
}
