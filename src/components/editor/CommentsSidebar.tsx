"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentData } from "@/hooks/use-spreadsheet";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface CommentsSidebarProps {
	comments: CommentData[];
	onAddComment: (text: string) => void;
	onRemoveComment: (id: string) => void;
	onResolveComment: (id: string, resolved: boolean) => void;
	onClose: () => void;
	selectedCell: string | null;
}

export function CommentsSidebar({
	comments,
	onAddComment,
	onRemoveComment,
	onResolveComment,
	onClose,
	selectedCell,
}: CommentsSidebarProps) {
	const [newComment, setNewComment] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newComment.trim()) {
			onAddComment(newComment.trim());
			setNewComment("");
		}
	};

	const filteredComments = selectedCell
		? comments.filter((c) => c.cellId === selectedCell)
		: comments;

	return (
		<div className="w-80 border-l bg-card flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
			<div className="p-4 border-b flex items-center justify-between bg-muted/30">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-primary" />
					<h2 className="font-semibold text-sm">Comments</h2>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-4 space-y-6">
					{filteredComments.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground space-y-2">
							<MessageSquare className="h-8 w-8 mx-auto opacity-20" />
							<p className="text-xs">
								No comments found {selectedCell ? `for ${selectedCell}` : ""}
							</p>
						</div>
					) : (
						filteredComments.map((comment) => (
							<div
								key={comment.id}
								className={cn(
									"group space-y-2 p-3 rounded-lg border transition-all",
									comment.resolved
										? "bg-muted/50 border-transparent opacity-60"
										: "bg-background border-border hover:border-primary/30",
								)}
							>
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0">
										<p className="text-xs font-bold text-primary flex items-center gap-1">
											{comment.author}
											<span className="text-[10px] font-normal text-muted-foreground">
												• {comment.cellId}
											</span>
										</p>
										<p className="text-[10px] text-muted-foreground">
											{format(comment.timestamp, "MMM d, h:mm a")}
										</p>
									</div>
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-muted-foreground hover:text-primary"
											onClick={() =>
												onResolveComment(comment.id, !comment.resolved)
											}
											title={comment.resolved ? "Unresolve" : "Resolve"}
										>
											<CheckCircle2
												className={cn(
													"h-3 w-3",
													comment.resolved &&
														"text-green-500 fill-green-500/10",
												)}
											/>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-muted-foreground hover:text-destructive"
											onClick={() => onRemoveComment(comment.id)}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<p className="text-sm leading-relaxed">{comment.text}</p>
							</div>
						))
					)}
				</div>
			</ScrollArea>

			<div className="p-4 border-t bg-muted/10">
				<form onSubmit={handleSubmit} className="space-y-3">
					<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
						<span className="font-medium">New comment</span>
						{selectedCell && (
							<span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
								{selectedCell}
							</span>
						)}
					</div>
					<div className="relative">
						<Input
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder={
								selectedCell
									? `Comment on ${selectedCell}...`
									: "Select a cell to comment..."
							}
							className="pr-10 text-sm h-9"
							disabled={!selectedCell}
						/>
						<Button
							type="submit"
							size="icon"
							variant="ghost"
							className="absolute right-1 top-1 h-7 w-7 text-primary hover:text-primary hover:bg-primary/10 disabled:opacity-30"
							disabled={!newComment.trim() || !selectedCell}
						>
							<Send className="h-3 w-3" />
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
