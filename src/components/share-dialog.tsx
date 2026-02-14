"use client";

import { useState } from "react";
import {
	Copy,
	Globe,
	Lock,
	Mail,
	Trash2,
	User,
	Users,
	Check,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export type Permission = "view" | "edit" | "comment" | "owner";
export type AccessLevel = "private" | "anyone-with-link" | "public";

export interface Collaborator {
	id: string;
	email: string;
	name?: string;
	permission: Permission;
	status: "pending" | "active" | "declined";
	avatar?: string;
}

export interface ShareSettings {
	accessLevel: AccessLevel;
	collaborators: Collaborator[];
	linkPermission?: Permission; // Default permission for anyone-with-link
	expiryDate?: Date | null;
	password?: string | null;
}

interface ShareDialogProps {
	resourceName?: string;
	resourceType?: "spreadsheet" | "document" | "folder";
	initialSettings?: ShareSettings;
	currentUserEmail: string;
	currentUserId: string;
	onSave: (settings: ShareSettings) => Promise<void> | void;
	onInvite?: (emails: string[], permission: Permission) => Promise<void> | void;
	onRemoveCollaborator?: (collaboratorId: string) => Promise<void> | void;
	onCopyLink?: () => void;
	isLoading?: boolean;
}

export function ShareDialog({
	resourceName = "Untitled",
	resourceType = "spreadsheet",
	initialSettings,
	currentUserEmail,
	currentUserId,
	onSave,
	onInvite,
	onRemoveCollaborator,
	onCopyLink,
	isLoading = false,
}: ShareDialogProps) {
	const [settings, setSettings] = useState<ShareSettings>(() => {
		if (initialSettings) return initialSettings;

		// Default settings
		return {
			accessLevel: "private",
			linkPermission: "view",
			collaborators: [
				{
					id: currentUserId,
					email: currentUserEmail,
					permission: "owner",
					status: "active",
					name: "You",
				},
			],
			expiryDate: null,
			password: null,
		};
	});

	const [newEmails, setNewEmails] = useState<string[]>([]);
	const [emailInput, setEmailInput] = useState("");
	const [invitePermission, setInvitePermission] = useState<Permission>("edit");
	const [open, setOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [copied, setCopied] = useState(false);

	// Handle email input (supports multiple emails separated by comma or space)
	const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmailInput(value);

		// Parse multiple emails
		const emails = value
			.split(/[,\s]+/)
			.filter((email) => email.includes("@") && email.length > 0);
		setNewEmails(emails);
	};

	const handleInvite = async () => {
		if (newEmails.length === 0 || !onInvite) return;

		try {
			setIsSaving(true);
			await onInvite(newEmails, invitePermission);

			// Add new collaborators to local state
			const newCollaborators: Collaborator[] = newEmails.map((email) => ({
				id: `temp-${Date.now()}-${email}`,
				email,
				permission: invitePermission,
				status: "pending",
			}));

			setSettings((prev) => ({
				...prev,
				collaborators: [...prev.collaborators, ...newCollaborators],
			}));

			setEmailInput("");
			setNewEmails([]);

			toast.success(
				`Invited ${newEmails.length} user${newEmails.length > 1 ? "s" : ""}`,
				{
					description: "Invitations sent successfully",
				},
			);
		} catch (error) {
			toast.error("Failed to send invitations", {
				description:
					error instanceof Error ? error.message : "Please try again",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handlePermissionChange = async (
		collaboratorId: string,
		newPermission: Permission | "remove",
	) => {
		if (newPermission === "remove") {
			if (onRemoveCollaborator) {
				try {
					setIsSaving(true);
					await onRemoveCollaborator(collaboratorId);

					setSettings((prev) => ({
						...prev,
						collaborators: prev.collaborators.filter(
							(c) => c.id !== collaboratorId,
						),
					}));

					toast.success("Collaborator removed", {
						description: "User removed successfully",
					});
				} catch (error) {
					toast.error("Failed to remove collaborator", {
						description:
							error instanceof Error ? error.message : "Please try again",
					});
				} finally {
					setIsSaving(false);
				}
			}
		} else {
			setSettings((prev) => ({
				...prev,
				collaborators: prev.collaborators.map((c) =>
					c.id === collaboratorId ? { ...c, permission: newPermission } : c,
				),
			}));

			toast.info("Permission updated", {
				description: `User now has ${newPermission} access`,
			});
		}
	};

	const handleAccessLevelChange = (level: AccessLevel) => {
		setSettings((prev) => ({ ...prev, accessLevel: level }));

		// Show toast for public access warning
		if (level === "public") {
			toast.warning("Public access enabled", {
				description: "Anyone on the internet can now access this resource",
				duration: 5000,
			});
		} else if (level === "anyone-with-link") {
			toast.info("Link sharing enabled", {
				description: "Anyone with the link can access",
			});
		} else {
			toast.success("Private access", {
				description: "Only invited people can access",
			});
		}
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await onSave(settings);
			setOpen(false);
			toast.success("Share settings updated", {
				description: "Your changes have been saved",
			});
		} catch (error) {
			toast.error("Failed to save share settings", {
				description:
					error instanceof Error ? error.message : "Please try again",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleCopyLink = () => {
		if (onCopyLink) {
			onCopyLink();
		} else {
			navigator.clipboard.writeText(window.location.href);
		}

		setCopied(true);
		setTimeout(() => setCopied(false), 2000);

		toast.success("Link copied", {
			description: "Share link copied to clipboard",
			icon: <Copy className="h-4 w-4" />,
		});
	};

	const getPermissionIcon = (permission: Permission) => {
		switch (permission) {
			case "view":
				return <User className="h-3 w-3" />;
			case "comment":
				return <Mail className="h-3 w-3" />;
			case "edit":
				return <Users className="h-3 w-3" />;
			case "owner":
				return <Users className="h-3 w-3 text-yellow-500" />;
		}
	};

	const getPermissionLabel = (permission: Permission) => {
		switch (permission) {
			case "view":
				return "Viewer";
			case "comment":
				return "Commenter";
			case "edit":
				return "Editor";
			case "owner":
				return "Owner";
		}
	};

	const getAccessLevelIcon = () => {
		switch (settings.accessLevel) {
			case "private":
				return <Lock className="h-4 w-4" />;
			case "anyone-with-link":
				return <Link className="h-4 w-4" />;
			case "public":
				return <Globe className="h-4 w-4" />;
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<Share className="h-4 w-4" /> Share
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Share "{resourceName}"</DialogTitle>
					<DialogDescription>
						{resourceType === "spreadsheet"
							? "Spreadsheet"
							: resourceType === "document"
								? "Document"
								: "Folder"}
					</DialogDescription>
				</DialogHeader>

				{/* Invite section */}
				<div className="space-y-4">
					<div className="flex flex-col space-y-2">
						<Label htmlFor="emails">Invite people</Label>
						<div className="flex flex-col space-y-2">
							<div className="flex items-center space-x-2">
								<Input
									id="emails"
									value={emailInput}
									onChange={handleEmailInputChange}
									placeholder="Enter email addresses (separate by comma or space)"
									className="flex-1"
									disabled={isLoading || isSaving}
								/>
								<Select
									value={invitePermission}
									onValueChange={(val: Permission) => setInvitePermission(val)}
								>
									<SelectTrigger className="w-[110px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="view">Viewer</SelectItem>
										<SelectItem value="comment">Commenter</SelectItem>
										<SelectItem value="edit">Editor</SelectItem>
									</SelectContent>
								</Select>
								<Button
									onClick={handleInvite}
									disabled={
										newEmails.length === 0 || !onInvite || isLoading || isSaving
									}
								>
									Invite
								</Button>
							</div>

							{/* Email preview */}
							{newEmails.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2">
									{newEmails.map((email, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{email}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Collaborators list */}
					{settings.collaborators.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-sm font-medium text-muted-foreground">
								People with access ({settings.collaborators.length})
							</h4>
							<div className="space-y-3 max-h-60 overflow-y-auto pr-2">
								{settings.collaborators.map((collaborator) => (
									<div
										key={collaborator.id}
										className="flex items-center justify-between group"
									>
										<div className="flex items-center gap-3 min-w-0 flex-1">
											<Avatar className="h-8 w-8 flex-shrink-0">
												<AvatarFallback className="text-xs">
													{collaborator.name
														? collaborator.name.charAt(0).toUpperCase()
														: collaborator.email.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="text-sm font-medium truncate">
														{collaborator.name || collaborator.email}
													</span>
													{collaborator.id === currentUserId && (
														<Badge variant="outline" className="text-xs">
															You
														</Badge>
													)}
													{collaborator.status === "pending" && (
														<Badge variant="secondary" className="text-xs">
															Pending
														</Badge>
													)}
												</div>
												{collaborator.name &&
													collaborator.name !== collaborator.email && (
														<span className="text-xs text-muted-foreground truncate">
															{collaborator.email}
														</span>
													)}
											</div>
										</div>

										{collaborator.permission === "owner" ? (
											<span className="text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
												{getPermissionIcon("owner")}
												Owner
											</span>
										) : (
											<Select
												value={collaborator.permission}
												onValueChange={(val: Permission | "remove") =>
													handlePermissionChange(collaborator.id, val)
												}
												disabled={isLoading || isSaving}
											>
												<SelectTrigger className="h-8 w-[100px] text-xs border-none hover:bg-muted/50">
													<SelectValue>
														<div className="flex items-center gap-1">
															{getPermissionIcon(collaborator.permission)}
															{getPermissionLabel(collaborator.permission)}
														</div>
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="view">
														<div className="flex items-center gap-2">
															<User className="h-3 w-3" />
															Viewer
														</div>
													</SelectItem>
													<SelectItem value="comment">
														<div className="flex items-center gap-2">
															<Mail className="h-3 w-3" />
															Commenter
														</div>
													</SelectItem>
													<SelectItem value="edit">
														<div className="flex items-center gap-2">
															<Users className="h-3 w-3" />
															Editor
														</div>
													</SelectItem>
													<Separator className="my-1" />
													<SelectItem
														value="remove"
														className="text-red-600 focus:text-red-600"
													>
														<div className="flex items-center gap-2">
															<Trash2 className="h-3 w-3" />
															Remove
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					<Separator />

					{/* General access section */}
					<div className="space-y-4">
						<h4 className="text-sm font-medium text-muted-foreground">
							General access
						</h4>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
									{getAccessLevelIcon()}
								</div>
								<div className="flex flex-col">
									<Select
										value={settings.accessLevel}
										onValueChange={(val: AccessLevel) =>
											handleAccessLevelChange(val)
										}
										disabled={isLoading || isSaving}
									>
										<SelectTrigger className="h-8 border-none shadow-none p-0 font-medium hover:bg-transparent">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="private">
												<div className="flex items-center gap-2">
													<Lock className="h-4 w-4" />
													Private
												</div>
											</SelectItem>
											<SelectItem value="anyone-with-link">
												<div className="flex items-center gap-2">
													<Link className="h-4 w-4" />
													Anyone with the link
												</div>
											</SelectItem>
											<SelectItem value="public">
												<div className="flex items-center gap-2">
													<Globe className="h-4 w-4" />
													Public
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									<span className="text-xs text-muted-foreground">
										{settings.accessLevel === "private" &&
											"Only invited people can access"}
										{settings.accessLevel === "anyone-with-link" &&
											"Anyone with the link can access"}
										{settings.accessLevel === "public" &&
											"Anyone on the internet can access"}
									</span>
								</div>
							</div>

							{/* Link permission for anyone-with-link */}
							{settings.accessLevel === "anyone-with-link" && (
								<Select
									value={settings.linkPermission || "view"}
									onValueChange={(val: Permission) =>
										setSettings((prev) => ({ ...prev, linkPermission: val }))
									}
									disabled={isLoading || isSaving}
								>
									<SelectTrigger className="w-[100px] h-8">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="view">Can view</SelectItem>
										<SelectItem value="comment">Can comment</SelectItem>
										<SelectItem value="edit">Can edit</SelectItem>
									</SelectContent>
								</Select>
							)}
						</div>

						{/* Advanced settings toggle */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowAdvanced(!showAdvanced)}
							className="w-full justify-start"
						>
							{showAdvanced ? "Hide" : "Show"} advanced settings
						</Button>

						{/* Advanced settings */}
						{showAdvanced && (
							<div className="space-y-4 pt-2">
								{/* Expiry date */}
								<div className="flex items-center justify-between">
									<Label htmlFor="expiry" className="text-sm">
										Link expiry
									</Label>
									<Input
										id="expiry"
										type="date"
										className="w-auto"
										min={new Date().toISOString().split("T")[0]}
										onChange={(e) =>
											setSettings((prev) => ({
												...prev,
												expiryDate: e.target.value
													? new Date(e.target.value)
													: null,
											}))
										}
									/>
								</div>

								{/* Password protection */}
								<div className="flex items-center justify-between">
									<Label htmlFor="password" className="text-sm">
										Password protect
									</Label>
									<div className="flex items-center gap-2">
										<Switch
											id="password-toggle"
											checked={!!settings.password}
											onCheckedChange={(checked) =>
												setSettings((prev) => ({
													...prev,
													password: checked ? "temp" : null,
												}))
											}
										/>
										{settings.password && (
											<Input
												type="password"
												placeholder="Enter password"
												className="w-32"
												value={
													settings.password === "temp" ? "" : settings.password
												}
												onChange={(e) =>
													setSettings((prev) => ({
														...prev,
														password: e.target.value,
													}))
												}
											/>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				<DialogFooter className="sm:justify-between gap-2">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="gap-2"
									onClick={handleCopyLink}
									disabled={isLoading || isSaving}
								>
									{copied ? (
										<Check className="h-4 w-4" />
									) : (
										<Copy className="h-4 w-4" />
									)}
									{copied ? "Copied!" : "Copy link"}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Copy share link to clipboard</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSave}
							disabled={isSaving || isLoading}
						>
							{isSaving ? "Saving..." : "Done"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Helper component for Link icon (since it's not in lucide-react by default)
const Link = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		{...props}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	</svg>
);

// Helper component for Share icon
const Share = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		{...props}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
		<polyline points="16 6 12 2 8 6" />
		<line x1="12" x2="12" y1="2" y2="15" />
	</svg>
);
