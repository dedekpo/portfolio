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
			<title>{dictionary["head"].portfolio}</title>
			<meta
				content="width=device-width, initial-scale=1"
				name="viewport"
			/>
			<meta name="description" content="Take a look at my portfolio" />
			<link rel="icon" href="/logo.png" />
		</>
	);
}
