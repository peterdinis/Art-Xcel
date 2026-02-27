import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
	transpilePackages: ["lucide-react", "framer-motion", "xlsx", "exceljs", "sonner"],
	experimental: {
		optimizePackageImports: [
			"lucide-react",
			"framer-motion",
			"@radix-ui/react-icons",
			"mathjs",
			"xlsx",
			"exceljs",
			"filepond",
			"react-filepond",
			"sonner",
		],
	},
	// @ts-ignore
	typescript: {
		ignoreBuildErrors: true,
	},
	// @ts-ignore
	eslint: {
		ignoreDuringBuilds: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
