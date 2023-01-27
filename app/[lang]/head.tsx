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
			<title>{dictionary["head"].home}</title>
			<meta
				content="width=device-width, initial-scale=1"
				name="viewport"
			/>
			<meta name="description" content="Hi! I'm a Front-end Engineer" />
			<link rel="icon" href="/logo.png" />
		</>
	);
}
