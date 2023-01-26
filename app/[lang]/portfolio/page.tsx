import Portfolio from "@/components/portfolio";
import { getDictionary } from "@/get-dictionary";
import { i18n, Locale } from "@/i18n-config";
import Image from "next/image";

export async function generateStaticParams() {
	return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function PortfolioPage({
	params: { lang },
}: {
	params: { lang: Locale };
}) {
	const dictionary = await getDictionary(lang);

	return (
		<>
			<Portfolio />
			<p className="text-center text-xl mb-10">
				{dictionary["portfolio"].tecnologies}
			</p>
			<div className="flex justify-evenly mb-20">
				<div className="relative h-8 w-9 md:h-14 md:w-16">
					<Image
						fill
						src="/react.png"
						alt={"ReactJS Logo"}
						className="object-cover"
					/>
				</div>
				<div className="relative h-8 w-14 md:h-14 md:w-28">
					<Image
						fill
						src="/nextjs.png"
						alt={"NextJS Logo"}
						className="object-cover"
					/>
				</div>
				<div className="relative h-8 w-12 md:h-14 md:w-24">
					<Image
						fill
						src="/aws.png"
						alt={"AWS Logo"}
						className="object-cover"
					/>
				</div>
				<div className="relative h-8 w-7 md:h-14 md:w-12">
					<Image
						fill
						src="/prisma.png"
						alt={"PrismaJS Logo"}
						className="object-cover"
					/>
				</div>
				<div className="relative h-8 w-12 md:h-14 md:w-[90px]">
					<Image
						fill
						src="/tailwind.svg"
						alt={"Tailwind Logo"}
						className="object-cover"
					/>
				</div>
			</div>
		</>
	);
}
