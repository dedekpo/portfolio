import Scene3D from "@/components/3d-scene";
import { InstagramIcon, LinkedinIcon, TwitterIcon } from "@/components/icons";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import Link from "next/link";

export default async function HomePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <main>
        <div className="overflow-auto md:overflow-hidden h-screen bg-white bg-opacity-50">
          <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 pt-[100px]">
              <div className="flex flex-col items-center gap-2">
                <img src="/me-face-only.webp" alt="Me" className="w-[50%]" />
                <h1 className="text-3xl font-bold">André Dev</h1>
                <span>{dictionary["tagline"]}</span>
                <div className="flex items-center gap-4">
                  <Link href="https://x.com/andre_elias98" target="_blank">
                    <TwitterIcon />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/andré-elias/"
                    target="_blank"
                  >
                    <LinkedinIcon />
                  </Link>
                  <Link
                    href="https://www.instagram.com/andreeliasdev"
                    target="_blank"
                  >
                    <InstagramIcon />
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col items-center pt-[100px]">
              <div className="flex flex-col gap-2 w-[90%] mx-auto md:w-full mb-[100px] md:mb-0">
                <div className="flex flex-col md:flex-row w-full gap-2">
                  <ProjectCard
                    name="Loveyuu"
                    description={dictionary["loveyuu"].description}
                    image="/loveyuu.webp"
                  />
                  <ProjectCard
                    name="MyVendas"
                    description={dictionary["myvendas"].description}
                    image="/my-vendas.webp"
                  />
                </div>
                <div className="flex flex-col md:flex-row w-full gap-2">
                  <ProjectCard
                    name="Court Kings"
                    description={dictionary["courtkings"].description}
                    image="/court-kings.webp"
                  />
                  <ProjectCard
                    name="Pong Jam"
                    description={dictionary["pongjam"].description}
                    image="/pong-jam-2.webp"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Scene3D />
      </main>
      <footer>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 text-xs text-gray-700 text-center w-full">
          <span>Todos os direitos reservados © {new Date().getFullYear()}</span>
          <span className="hidden md:block">•</span>
          <span>CNPJ: 52.236.286/0001-02</span>
        </div>
      </footer>
    </>
  );
}

function ProjectCard({
  name,
  description,
  image,
}: {
  name: string;
  description: string;
  image: string;
}) {
  return (
    <Link href="/" className="w-full h-[150px]">
      <div className="w-full h-full rounded-lg shadow-lg flex items-center p-3 gap-2 md:p-10 bg-white border hover:border-black">
        <div className="w-1/3">
          <div className="w-[75px] h-[75px] rounded-full overflow-hidden">
            <img src={image} alt={name} />
          </div>
        </div>
        <div className="w-full flex flex-col">
          <h3 className="font-bold text-xl">{name}</h3>
          <span className="text-xs text-gray-700">{description}</span>
        </div>
      </div>
    </Link>
  );
}
