"use client"

import { useState } from "react"
import { Copy, Globe, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export interface Collaborator {
    email: string;
    role: "viewer" | "editor" | "owner";
}

export interface ShareSettings {
    access: "restricted" | "public";
    collaborators: Collaborator[];
}

interface ShareDialogProps {
    initialSettings?: ShareSettings;
    onSave: (settings: ShareSettings) => void;
}

export function ShareDialog({ initialSettings, onSave }: ShareDialogProps) {
    const [settings, setSettings] = useState<ShareSettings>(initialSettings || {
        access: "restricted",
        collaborators: [
            { email: "you@example.com", role: "owner" }
        ]
    });
    const [newEmail, setNewEmail] = useState("");
    const [open, setOpen] = useState(false);

    const handleInvite = () => {
        if (!newEmail) return;
        setSettings(prev => ({
            ...prev,
            collaborators: [...prev.collaborators, { email: newEmail, role: "editor" }]
        }));
        setNewEmail("");
    };

    const handleRoleChange = (email: string, newRole: Collaborator["role"]) => {
        setSettings(prev => ({
            ...prev,
            collaborators: prev.collaborators.map(c =>
                c.email === email ? { ...c, role: newRole } : c
            )
        }));
    };

    const handleAccessChange = (val: "restricted" | "public") => {
        setSettings(prev => ({ ...prev, access: val }));
    };

    const handleSave = () => {
        onSave(settings);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-0">
                    <Users className="h-4 w-4" /> Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share spreadsheet</DialogTitle>
                    <DialogDescription>
                        Invite people to this spreadsheet or change general access.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2">
                    <Input
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Add people and groups"
                        className="flex-1"
                    />
                    <Select defaultValue="editor">
                        <SelectTrigger className="w-[110px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleInvite} disabled={!newEmail}>Invite</Button>
                </div>

                <div className="py-4">
                    <h4 className="mb-4 text-sm font-medium text-muted-foreground">People with access</h4>
                    <div className="space-y-4">
                        {settings.collaborators.map((c) => (
                            <div key={c.email} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-xs font-medium">{c.email.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{c.email} {c.role === 'owner' && '(you)'}</span>
                                        <span className="text-xs text-muted-foreground">{c.role}</span>
                                    </div>
                                </div>
                                {c.role !== 'owner' ? (
                                    <Select
                                        value={c.role}
                                        onValueChange={(val: Collaborator['role']) => handleRoleChange(c.email, val)}
                                    >
                                        <SelectTrigger className="h-8 w-[100px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="remove">Remove</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Owner</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                <div className="py-4 space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">General access</h4>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                {settings.access === 'public' ? <Globe className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className="flex flex-col">
                                <Select
                                    value={settings.access}
                                    onValueChange={(val: "restricted" | "public") => handleAccessChange(val)}
                                >
                                    <SelectTrigger className="h-8 border-none shadow-none p-0 font-medium hover:bg-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="restricted">Restricted</SelectItem>
                                        <SelectItem value="public">Anyone with the link</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-xs text-muted-foreground">
                                    {settings.access === 'public' ? 'Anyone on the internet with the link can view' : 'Only people with access can open with the link'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                    }}>
                        <Copy className="h-4 w-4" />
                        Copy link
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
