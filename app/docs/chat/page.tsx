import { ChatPane } from "@/components/docs/ChatPane";

export default function ChatPage() {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
            <ChatPane />
        </div>
    );
}
