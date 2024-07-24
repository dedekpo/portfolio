import "./globals.css";

import { i18n, Locale } from "../../i18n-config";

import { Inter as FontSans } from "@next/font/google";
import Script from "next/script";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={lang}>
      <head />
      <Script id="tag-manager">
        {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','GTM-5V5P5D8');
                `}
      </Script>
      <body className={`${fontSans.className}`}>
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
