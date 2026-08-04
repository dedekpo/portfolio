/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
	async redirects() {
		return [
			{
				source: "/discord",
				destination: "https://discord.gg/hnwxN6E6b8",
				permanent: false,
			},
		];
	},
};

module.exports = nextConfig;
