import React, { useRef, useEffect, useState } from "react";
import { Send, BarChart3, Smile } from "lucide-react";
import StatusBar from "../components/StatusBar";
import NavBar from "../components/NavBar";

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

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","🥰","🤔","🙌","👍","🔥","🎉","💡","💰","📈","🧠","✅","❗","❓","📝"
];

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, newMessage]);

  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = "auto";
    const max = 6 * 24; // ~24px line-height * 6 lines
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  }, [newMessage]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget.closest("form") as HTMLFormElement | null)?.requestSubmit();
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      setNewMessage(newMessage + emoji);
      return;
    }
    const start = el.selectionStart ?? newMessage.length;
    const end = el.selectionEnd ?? newMessage.length;
    const next = newMessage.slice(0, start) + emoji + newMessage.slice(end);
    setNewMessage(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + emoji.length;
      el.setSelectionRange(caret, caret);
    });
    setShowEmoji(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <StatusBar />
      <div className="px-6 py-4 border-b border-gray-800">
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
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-60">
        {chatMessages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-800 text-white"}`}>
              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>{message.time}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-800 text-white">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.1s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]"></span>
              </div>
            </div>
          </div>
        )}
        {newMessage && (
          <div className="flex justify-end">
            <div className="max-w-xs px-4 py-2 rounded-2xl bg-blue-500/60 text-white">
              <p className="text-sm whitespace-pre-wrap break-words">{newMessage}</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed left-0 right-0 bottom-20 z-20 px-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom))" }}>
        <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl bg-gray-850/80 backdrop-blur border border-gray-700 px-2 py-2 shadow-lg">
            <button type="button" aria-label="Emoji" onClick={() => setShowEmoji((s) => !s)} className="p-2 rounded-xl hover:bg-gray-800 text-gray-300">
              <Smile size={20} />
            </button>
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message…"
              className="flex-1 px-3 py-2 bg-transparent border-0 outline-none text-white placeholder-gray-400 resize-none leading-6"
              rows={1}
            />
            <button type="submit" className="px-3 py-2 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </form>

        {showEmoji && (
          <div className="mx-auto max-w-3xl">
            <div className="mt-2 w-full sm:w-auto inline-block rounded-2xl border border-gray-700 bg-gray-900 p-2 shadow-xl">
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" className="h-8 w-8 grid place-items-center rounded-md hover:bg-gray-800" onClick={() => insertEmoji(e)}>
                    <span className="text-lg">{e}</span>
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
