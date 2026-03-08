import React, { useRef, useEffect, useState } from "react";
import { Send, BarChart3, Smile } from "lucide-react";
import ReactMarkdown from "react-markdown";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  time: string;
}

interface ChatPageProps {
  active: string;
  setCurrentPage: (page: string) => void;
  chatMessages: Message[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  isTyping?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Quick-access emoji list shown in the emoji picker
const EMOJIS = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "🥰",
  "🤔",
  "🙌",
  "👍",
  "🔥",
  "🎉",
  "💡",
  "💰",
  "📈",
  "🧠",
  "✅",
  "❗",
  "❓",
  "📝",
];

// Textarea auto-resize limits
const LINE_HEIGHT_PX = 24; // Approximate line height in pixels
const MAX_ROWS = 6; // Maximum rows before textarea stops growing
const MAX_HEIGHT_PX = LINE_HEIGHT_PX * MAX_ROWS;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Chat page — full-screen AI financial assistant chat interface.
 * Features auto-scrolling, auto-resizing textarea, emoji picker,
 * typing indicator, and a live ghost preview of the current message.
 * AI messages are rendered as markdown for proper formatting.
 */
const ChatPage: React.FC<ChatPageProps> = ({
  active,
  setCurrentPage,
  chatMessages,
  newMessage,
  setNewMessage,
  sendMessage,
  isTyping = false,
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // Auto-scroll to the latest message whenever messages, typing state, or input changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping, newMessage]);

  // Auto-resize textarea height based on content, up to MAX_HEIGHT_PX
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // Reset first so scrollHeight recalculates correctly
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT_PX) + "px";
  }, [newMessage]);

  // Submit form on Enter key (Shift+Enter inserts a newline instead)
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (
        e.currentTarget.closest("form") as HTMLFormElement | null
      )?.requestSubmit();
    }
  };

  // Insert selected emoji at the current cursor position in the textarea
  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setNewMessage(newMessage + emoji);
      return;
    }

    const start = el.selectionStart ?? newMessage.length;
    const end = el.selectionEnd ?? newMessage.length;

    // Splice emoji into message at cursor position
    const updated = newMessage.slice(0, start) + emoji + newMessage.slice(end);
    setNewMessage(updated);

    // Restore focus and move caret to just after the inserted emoji
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + emoji.length;
      el.setSelectionRange(caret, caret);
    });

    setShowEmoji(false);
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <StatusBar />

      {/* Chat header — AI assistant identity */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="font-semibold">AI Financial Mentor</h2>
            <p className="text-green-400 text-sm">● Online</p>
          </div>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-60">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              {message.sender === "ai" ? (
                // AI messages — render markdown for bold, lists, headings etc.
                <div
                  className="text-sm prose prose-invert prose-sm max-w-none
                  prose-p:my-1
                  prose-ul:my-1 prose-ul:pl-4
                  prose-ol:my-1 prose-ol:pl-4
                  prose-li:my-0.5
                  prose-strong:text-white
                  prose-headings:text-white prose-headings:font-semibold"
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                // User messages — plain text, preserve line breaks
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              )}

              {/* Timestamp */}
              <p
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-blue-100" : "text-zinc-400"
                }`}
              >
                {message.time}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator — three bouncing dots shown while AI is responding */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white/10">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:.1s]" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:.2s]" />
              </div>
            </div>
          </div>
        )}

        {/* Ghost preview — shows the message being typed before it's sent */}
        {newMessage && (
          <div className="flex justify-end">
            <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-blue-500/40 text-white">
              <p className="text-sm whitespace-pre-wrap break-words">
                {newMessage}
              </p>
            </div>
          </div>
        )}

        {/* Scroll anchor — always kept at the bottom of the message list */}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar — fixed above the navbar */}
      <div
        className="fixed left-0 right-0 bottom-20 z-20 px-4"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom))" }}
      >
        <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl bg-white/5 backdrop-blur border border-white/10 px-2 py-2 shadow-lg">
            {/* Emoji picker toggle button */}
            <button
              type="button"
              aria-label="Open emoji picker"
              onClick={() => setShowEmoji((s) => !s)}
              className="p-2 rounded-xl hover:bg-white/10 text-zinc-300 transition-colors"
            >
              <Smile size={20} />
            </button>

            {/* Auto-resizing message textarea */}
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message…"
              className="flex-1 px-3 py-2 bg-transparent border-0 outline-none text-white placeholder-zinc-500 resize-none leading-6"
              rows={1}
            />

            {/* Send button */}
            <button
              type="submit"
              aria-label="Send message"
              className="px-3 py-2 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

        {/* Emoji picker panel */}
        {showEmoji && (
          <div className="mx-auto max-w-3xl">
            <div className="mt-2 rounded-2xl border border-white/10 bg-[#0A0F1E] p-2 shadow-xl">
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Insert ${emoji}`}
                    className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/10 transition-colors"
                    onClick={() => insertEmoji(emoji)}
                  >
                    <span className="text-lg">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <NavBar active={active} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default ChatPage;
