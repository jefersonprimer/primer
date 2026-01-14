import { query } from "@/lib/database";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SharedChatView from "./SharedChatView";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface SharedMessage {
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

interface SharedChat {
    id: string;
    title: string;
    messages: SharedMessage[];
    created_at: string;
}

async function getSharedChat(id: string): Promise<SharedChat | null> {
    try {
        const result = await query(
            `SELECT id, title, messages, created_at
       FROM shared_chats
       WHERE id = $1
         AND (expires_at IS NULL OR expires_at > NOW())`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    } catch (error) {
        console.error("Failed to fetch shared chat:", error);
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const chat = await getSharedChat(id);

    if (!chat) {
        return {
            title: "Chat Not Found - Primer AI",
        };
    }

    const firstMessage = chat.messages[0]?.content?.slice(0, 150) || "";

    return {
        title: `${chat.title || "Shared Chat"} - Primer AI`,
        description: firstMessage + (firstMessage.length >= 150 ? "..." : ""),
        openGraph: {
            title: chat.title || "Shared Chat",
            description: firstMessage,
            type: "article",
        },
    };
}

export default async function SharedChatPage({ params }: PageProps) {
    const { id } = await params;
    const chat = await getSharedChat(id);

    if (!chat) {
        notFound();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://primerai.vercel.app"}/c/${id}`;

    return <SharedChatView chat={chat} shareUrl={shareUrl} />;
}
