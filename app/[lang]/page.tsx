import { Scene3D } from '@/components/3d-scene';
import { Footer } from '@/components/footer';
import { ProfileSection } from '@/components/profile-section';
import { ProjectsGrid } from '@/components/projects-grid';
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

type Params = {
  params: { lang: Locale };
};

export default async function HomePage({ params: { lang } }: Params) {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <main>
        <div className="overflow-auto md:overflow-hidden h-screen bg-white bg-opacity-50">
          <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row">
            <ProfileSection dictionary={dictionary} />
            <ProjectsGrid dictionary={dictionary} />
          </div>
        </div>

        <Scene3D />
      </main>

      <Footer dictionary={dictionary} />
    </>
  );
}
