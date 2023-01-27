import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function Head({
	params: { lang },
}: {
	params: { lang: Locale };
}) {
	const dictionary = await getDictionary(lang);

	return (
		<>
			<title>{dictionary["head"].about}</title>
			<meta
				content="width=device-width, initial-scale=1"
				name="viewport"
			/>
			<meta name="description" content="Know a little more about me" />
			<link rel="icon" href="/logo.png" />
		</>
	);
}
