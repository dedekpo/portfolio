import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

type Params = {
  params: { lang: Locale };
};

export default async function Head({ params: { lang } }: Params) {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <title>André Dev</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="description" content={dictionary['tagline']} />
      <link rel="icon" href="/me-face-only.webp" />
    </>
  );
}
