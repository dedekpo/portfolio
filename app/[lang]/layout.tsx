import './globals.css';
import './meadow.css';

import { i18n, Locale } from '../../i18n-config';

import { BootScript } from '@/components/portfolio/boot';
import Script from 'next/script';
import PlausibleProvider from 'next-plausible';

export const generateStaticParams = () =>
  i18n.locales.map((locale) => ({ lang: locale }));

// Only the languages above exist: anything else under /[lang] is a 404, not a server error.
export const dynamicParams = false;

type RootLayoutProps = {
  children: React.ReactNode;
  params: { lang: Locale };
};

export default async function RootLayout({
  children,
  params: { lang },
}: RootLayoutProps) {
  return (
    // BootScript adds a `js` class here before the first paint
    <html lang={lang} suppressHydrationWarning>
      <head>
        <PlausibleProvider
          selfHosted
          domain="andreelias.dev"
          customDomain={process.env.PLAUSIBLE_URL}
        />
      </head>
      <Script id="tag-manager">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5V5P5D8');`}
      </Script>
      <body>
        <BootScript />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5V5P5D8"
            height="0"
            width="0"
            className="hidden invisible"
          ></iframe>
        </noscript>
        {children}
      </body>
    </html>
  );
}
