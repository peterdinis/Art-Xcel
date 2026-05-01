"use client";

import dynamic from "next/dynamic";
import { EditorSkeleton } from "./components/EditorSkeleton";

const EditorContent = dynamic(() => import("./EditorContent"), {
	ssr: false,
	loading: () => <EditorSkeleton />,
});

export default function EditorPage() {
	return <EditorContent />;
}
