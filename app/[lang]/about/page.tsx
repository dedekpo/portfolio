import { getDictionary } from "@/get-dictionary";
import { i18n, Locale } from "@/i18n-config";
import Image from "next/image";

export async function generateStaticParams() {
	return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function AboutPage({
	params: { lang },
}: {
	params: { lang: Locale };
}) {
	const dictionary = await getDictionary(lang);

	return (
		<div className="relative">
			<div className="border-2 h-[2100px] w-1 mx-auto mt-5 relative -top-60" />
			<div className="absolute flex gap-10 justify-center items-center top-0 left-0 right-0 mx-auto">
				<div className="h-80 w-48 relative">
					<Image
						src="/young.jpg"
						alt={"Young André"}
						fill
						className="object-cover rounded-md border-2 shadow-md"
					/>
				</div>
				<div className="w-48">
					<p className="bg-white rounded-sm border-2 text-center font-black">
						1998
					</p>
				</div>
				<div className="w-48">
					<p className="font-black">
						{dictionary["about"][1998].title}
					</p>
					<p>{dictionary["about"][1998].content}</p>
				</div>
			</div>
			<div className="absolute flex gap-10 justify-center items-center top-[500px] left-0 right-0 mx-auto">
				<div className="w-48">
					<p className="font-black">
						{dictionary["about"][2017].title}
					</p>
					<p>{dictionary["about"][2017].content}</p>
				</div>
				<div className="w-48">
					<p className="bg-white rounded-sm border-2 text-center font-black">
						2017
					</p>
				</div>
				<div className="h-80 w-48 relative">
					<Image
						src="/college.jpg"
						alt={"Time to college"}
						fill
						className="object-cover rounded-md border-2 shadow-md"
					/>
				</div>
			</div>
			<div className="absolute flex gap-10 justify-center items-center top-[1000px] left-0 right-0 mx-auto">
				<div className="h-80 w-48 relative">
					<Image
						src="/hotmart.jpg"
						alt={"Hotmart frame"}
						fill
						className="object-cover rounded-md border-2 shadow-md"
					/>
				</div>
				<div className="w-48">
					<p className="bg-white rounded-sm border-2 text-center font-black">
						2021
					</p>
				</div>
				<div className="w-48">
					<p className="font-black">
						{dictionary["about"][2021].title}
					</p>
					<p>{dictionary["about"][2021].content}</p>
				</div>
			</div>
			<div className="absolute flex gap-10 justify-center items-center top-[1500px] left-0 right-0 mx-auto">
				<div className="w-48">
					<p className="font-black">
						{dictionary["about"][2022].title}
					</p>
					<p>{dictionary["about"][2022].content}</p>
				</div>
				<div className="w-48">
					<p className="bg-white rounded-sm border-2 text-center font-black">
						2022
					</p>
				</div>
				<div className="h-80 w-48 relative">
					<Image
						src="/ice.jpg"
						alt={"The app I build"}
						fill
						className="object-cover rounded-md border-2 shadow-md"
					/>
				</div>
			</div>
			<div className="absolute flex gap-10 justify-center items-center top-[1900px] left-0 right-0 mx-auto">
				<p className="font-black">{dictionary["about"].footer}</p>
			</div>
		</div>
	);
}
