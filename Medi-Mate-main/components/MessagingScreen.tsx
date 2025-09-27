import React, { useState, useRef, useEffect } from 'react';
import { Message, TranslationSet, UserRole } from '../types';
import { CheckDoubleIcon } from './icons';

interface MessagingScreenProps {
    messages: Message[];
    addMessage: (text: string) => void;
    t: TranslationSet;
    userRole: UserRole;
    isOtherUserTyping: boolean;
}

const formatDateDivider = (date: Date, t: TranslationSet): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return t.chatToday;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return t.chatYesterday;
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const Avatar: React.FC<{ role: string }> = ({ role }) => (
    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-600 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 flex-shrink-0">
        {role.charAt(0).toUpperCase()}
    </div>
);

const MessagingScreen: React.FC<MessagingScreenProps> = ({ messages, addMessage, t, userRole, isOtherUserTyping }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            // Heuristic to check if user is scrolled near the bottom before auto-scrolling
            const isNearBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 150;
            if (isNearBottom) {
                scrollToBottom('smooth');
            }
        }
    }, [messages, isOtherUserTyping]);

    useEffect(() => {
        scrollToBottom('auto'); // Jump to bottom on initial load
    }, []);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            addMessage(newMessage.trim());
            setNewMessage('');
        }
    };
    
    const currentUserSender: 'caretaker' | 'family' = userRole;
    const otherUserRole = currentUserSender === 'caretaker' ? t.roleFamily : t.roleCaretaker;

    const renderMessages = () => {
        // Fix: Changed JSX.Element to React.ReactElement to resolve namespace error.
        const elements: React.ReactElement[] = [];
        let lastDate: string | null = null;

        messages.forEach((msg, index) => {
            const msgDate = new Date(msg.id).toDateString();
            if (msgDate !== lastDate) {
                elements.push(
                    <div key={`date-${msg.id}`} className="text-center my-4">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                            {formatDateDivider(new Date(msg.id), t)}
                        </span>
                    </div>
                );
                lastDate = msgDate;
            }

            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            const isCurrentUser = msg.sender === currentUserSender;
            
            const prevMsgDate = prevMsg ? new Date(prevMsg.id).toDateString() : null;
            const nextMsgDate = nextMsg ? new Date(nextMsg.id).toDateString() : null;

            const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender || prevMsgDate !== msgDate;
            const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || nextMsgDate !== msgDate;

            let bubbleClasses = 'max-w-xs md:max-w-md p-3 text-sm ';

            if (isCurrentUser) {
                bubbleClasses += 'bg-[#0C8346] text-white ';
                if (isFirstInGroup && isLastInGroup) bubbleClasses += 'rounded-2xl';
                else if (isFirstInGroup) bubbleClasses += 'rounded-t-2xl rounded-l-2xl';
                else if (isLastInGroup) bubbleClasses += 'rounded-b-2xl rounded-l-2xl';
                else bubbleClasses += 'rounded-l-2xl rounded-r-md'; 
            } else {
                bubbleClasses += 'bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-slate-100 ';
                if (isFirstInGroup && isLastInGroup) bubbleClasses += 'rounded-2xl';
                else if (isFirstInGroup) bubbleClasses += 'rounded-t-2xl rounded-r-2xl';
                else if (isLastInGroup) bubbleClasses += 'rounded-b-2xl rounded-r-2xl';
                else bubbleClasses += 'rounded-r-2xl rounded-l-md';
            }

            elements.push(
                <div key={msg.id} className={`flex items-end gap-2 animate-slide-in-up ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
                    {!isCurrentUser && isLastInGroup && <Avatar role={otherUserRole} />}
                    {!isCurrentUser && !isLastInGroup && <div className="w-8 flex-shrink-0" />}
                    
                    <div className={bubbleClasses}>
                        <p style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                        {isLastInGroup && (
                            <div className="text-xs opacity-70 mt-1 flex items-center gap-1" style={{ justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                <span>{msg.timestamp}</span>
                                {isCurrentUser && msg.read && <CheckDoubleIcon className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                </div>
            );
        });
        return elements;
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-slate-100">{t.messaging}</h2>
            <div ref={messagesContainerRef} className="flex-grow overflow-y-auto space-y-0 px-2 pb-16">
                {renderMessages()}
                {isOtherUserTyping && (
                    <div className="flex justify-start items-end gap-2 mt-4 animate-slide-in-up">
                        <Avatar role={otherUserRole} />
                        <div className="bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-slate-400 text-sm px-4 py-3 rounded-t-2xl rounded-r-2xl animate-pulse">
                            ...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center gap-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-gray-700 shadow-top">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.typeMessage}
                    className="flex-grow p-3 border border-slate-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-[#0C8346] bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100"
                />
                <button
                    type="submit"
                    className="w-12 h-12 flex-shrink-0 bg-[#0C8346] text-white rounded-full flex items-center justify-center hover:bg-green-800 transition shadow-sm disabled:bg-slate-300 dark:disabled:bg-gray-600"
                    disabled={!newMessage.trim()}
                    aria-label="Send Message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.53l4.949-1.414a.75.75 0 00-.53-.95L3.105 2.29zm-1.286.95a2.25 2.25 0 012.478-2.478l14.857 4.244a2.25 2.25 0 010 4.244L3.3 19.242a2.25 2.25 0 01-2.478-2.478l4.244-14.857z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default MessagingScreen;