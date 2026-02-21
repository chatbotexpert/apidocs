import { ChatPane } from "@/components/docs/ChatPane";

export default function ChatPage() {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ChatPane />
        </div>
    );
}
