import { StructuredData } from '@/components/portfolio/boot';
import { MeadowStage } from '@/components/portfolio/meadow-stage';
import { PortfolioOverlay } from '@/components/portfolio/overlay';
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

type Params = {
  params: { lang: Locale };
};

export default async function HomePage({ params: { lang } }: Params) {
  const dictionary = await getDictionary(lang);

  return (
    <main>
      <MeadowStage loading={dictionary.loading} />
      <PortfolioOverlay dictionary={dictionary} />
      <StructuredData
        lang={lang}
        role={`${dictionary.role.first} & ${dictionary.role.second}`}
      />
    </main>
  );
}
