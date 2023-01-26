/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
	i18n: {
		locales: ["pt-BR", "en-US"],
		defaultLocale: "en-US",
	},
};

module.exports = nextConfig;
