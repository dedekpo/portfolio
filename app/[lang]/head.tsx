import { PERSON, SITE_URL } from '@/components/portfolio/content';
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

type Params = {
  params: { lang: Locale };
};

// Only <title>, <meta> and plain <link>s here: in this Next.js version anything else in head.tsx
// (stylesheets, <style>, preconnects, scripts) fails to hydrate and blanks the page. The font
// stylesheets, the `js` class and the structured data are set up in boot.tsx instead.

export default async function Head({ params: { lang } }: Params) {
  const dictionary = await getDictionary(lang);
  const url = `${SITE_URL}/${lang}`;
  const image = `${SITE_URL}/og.jpg`;
  const role = `${dictionary.role.first} & ${dictionary.role.second}`;

  return (
    <>
      <title>{dictionary.meta.title}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta name="description" content={dictionary.meta.description} />
      <link rel="canonical" href={url} />
      <meta name="theme-color" content="#10201b" />
      <link rel="icon" href="/me-face-only.webp" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={PERSON.alternateName} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={dictionary.meta.title} />
      <meta property="og:description" content={dictionary.meta.description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${PERSON.name}, ${role}`} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@andreeliasdev" />
      <meta name="twitter:title" content={dictionary.meta.title} />
      <meta name="twitter:description" content={dictionary.meta.description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
