import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import Loading from "./loading";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
	title: {
		default: "ArtXcel - Online Spreadsheet Application",
		template: "%s | ArtXcel",
	},
	description:
		"Free online spreadsheet editor with Excel compatibility. Create, edit, and share spreadsheets online with real-time collaboration and advanced formatting.",
	keywords: [
		"excel",
		"spreadsheet",
		"online editor",
		"excel online",
		"free spreadsheet",
		"collaboration",
		"data analysis",
		"excel alternative",
		"online excel",
		"spreadsheet editor",
	],
	authors: [
		{
			name: "Your Name",
			url: "https://yourwebsite.com",
		},
	],
	creator: "Your Name",
	publisher: "Your Company",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://excel-editor.com"), // Replace with your actual domain
	alternates: {
		canonical: "/",
		languages: {
			"en-US": "/en-US",
			"sk-SK": "/sk-SK",
		},
	},
	openGraph: {
		title: "ArtXcel - Online Spreadsheet Application",
		description:
			"Free online spreadsheet editor with Excel compatibility. Create, edit, and share spreadsheets online.",
		url: "https://excel-editor.com",
		siteName: "ArtXcel",
		images: [
			{
				url: "/og-image.png", // Make sure to add this image to your public folder
				width: 1200,
				height: 630,
				alt: "ArtXcel - Online Spreadsheet Application",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "ArtXcel - Online Spreadsheet Application",
		description:
			"Free online spreadsheet editor with Excel compatibility. Create, edit, and share spreadsheets online.",
		images: ["/twitter-image.png"], // Make sure to add this image to your public folder
		creator: "@yourtwitterhandle",
		site: "@yourtwitterhandle",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/icon.png", type: "image/png", sizes: "32x32" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
		other: [
			{
				rel: "mask-icon",
				url: "/safari-pinned-tab.svg",
			},
		],
	},
	category: "Productivity",
	classification: "Business Software",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Additional meta tags for Excel compatibility */}
				<meta name="application-name" content="ArtXcel" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="ArtXcel" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="msapplication-TileColor" content="#1D6F42" />
				<meta name="msapplication-tap-highlight" content="no" />
				<meta name="theme-color" content="#1D6F42" />

				{/* Excel-specific meta tags */}
				<meta name="excel-version" content="compatible" />
				<meta
					name="spreadsheet-capabilities"
					content="formulas,charts,pivot-tables"
				/>
			</head>
			<body className={`${inter.variable} antialiased font-sans`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Suspense fallback={<Loading />}>{children}
						<Toaster
							position="top-center"
							closeButton
						/></Suspense>
				</ThemeProvider>
			</body>
		</html>
	);
}
