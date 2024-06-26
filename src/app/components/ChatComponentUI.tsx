'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CoreMessage } from "ai";
import { useState } from 'react';
import { continueConversation } from '../actions';
import { readStreamableValue } from 'ai/rsc';
import { BotIcon, MenuIcon, SendIcon } from "@/svgs/svgs";

export default function ChatComponentUI() {
    const [messages, setMessages] = useState<CoreMessage[]>([]);
    const [input, setInput] = useState('');
    const [data, setData] = useState<any>();
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <BotIcon className="w-6 h-6" />
          <h1 className="text-lg font-medium">Chatbot</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-white">
          <MenuIcon className="w-5 h-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </header>

      <form
        action={async () => {
          const newMessages: CoreMessage[] = [
            ...messages,
            { content: input, role: 'user' },
          ];

          setMessages(newMessages);
          setInput('');

          const result = await continueConversation(newMessages);
          setData(result.data);

          for await (const content of readStreamableValue(result.message)) {
            setMessages([
              ...newMessages,
              {
                role: 'assistant',
                content: content as string,
              },
            ]);
          }
        }}
      >

      <div className="flex-1 bg-[#F3F4F6] px-6 py-8 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex-1">
            <div className="text-white">
            {messages.map((m, i) => (
              <div key={i} className={`rounded-lg px-4 py-3 shadow-md 
                whitespace-pre-wrap mb-4
                ${m.role === 'user' ? 'bg-[#6366F1] justify-items-end' : 'bg-black justify-items-start'}`
              }>
                {m.role === 'user' ? 'User: ' : 'AI: '}
                {m.content as string}
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white px-6 py-4 flex items-center gap-2 shadow-md">
        <Input
          type="text"
          value={input}
          placeholder="Type your message..."
          className="flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
          onChange={e => setInput(e.target.value)}
        />
        <Button className="rounded-full px-4 py-2 bg-[#6366F1] text-white hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50">
          <SendIcon className="w-5 h-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      </form>
    </div>
  )
};
