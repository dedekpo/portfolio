import "./globals.css";
import { i18n, Locale } from "../../i18n-config";

import { Inter as FontSans } from "@next/font/google";
import Header from "@/components/header";
import { getDictionary } from "@/get-dictionary";
import Link from "next/link";

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
	const dictionary = await getDictionary(lang);

	return (
		<html lang={lang}>
			<head />
			<body className={`${fontSans.className}`}>
				<div className={"overflow-hidden"}>
					<div className="max-w-5xl min-h-screen mx-auto flex flex-col relative">
						<Header />
						<div className="m-auto flex flex-col gap-1">
							<h1 className="text-center text-gray-700 text-xl">
								{dictionary["hero"].myName}
							</h1>
							<h1 className="text-center text-5xl font-black">
								{dictionary["hero"].iDo}
							</h1>
							<div className="flex items-center justify-center gap-5 mt-4">
								<Link href={`${lang}/about`}>
									<button className="border-2 py-1 px-2 rounded-md shadow-md text-xl font-black border-gray-500 flex items-center gap-2 hover:bg-slate-100">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-6 h-6"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M12 6v12m6-6H6"
											/>
										</svg>
										{dictionary["hero"].knowMe}
									</button>
								</Link>
								<p className="text-gray-500">
									{dictionary["hero"].or}
								</p>
								<Link href={`${lang}/portfolio`}>
									<button className="border-2 py-1 px-2 rounded-md shadow-md text-xl font-black border-gray-500 flex items-center gap-2 hover:bg-slate-100">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-6 h-6"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
											/>
										</svg>
										{dictionary["hero"].portfolio}
									</button>
								</Link>
							</div>
						</div>
					</div>
				</div>
				{children}
			</body>
		</html>
	);
}
