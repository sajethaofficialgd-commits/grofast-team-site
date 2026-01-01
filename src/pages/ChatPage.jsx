import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
    MessageCircle,
    Send,
    Search,
    ArrowLeft,
    Users,
    User,
    Check,
    CheckCheck,
    Paperclip,
    Image,
    Smile,
    MoreVertical
} from 'lucide-react';

export default function ChatPage() {
    const { user } = useAuth();
    const { chats, messages, sendMessage } = useData();

    const [selectedChat, setSelectedChat] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedChat]);

    const getOtherParticipant = (chat) => {
        if (chat.type === 'group') {
            return { name: chat.name, isGroup: true };
        }
        // For direct chats, return the other participant
        return { name: 'Team Member', isGroup: false };
    };

    const getChatMessages = (chatId) => {
        return messages.filter(m => m.chatId === chatId);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedChat) return;

        await sendMessage(selectedChat.id, messageText.trim());
        setMessageText('');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredChats = chats.filter(chat => {
        const participant = getOtherParticipant(chat);
        return participant.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Chat List View
    if (!selectedChat) {
        return (
            <div className="animate-fade-in">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Messages</h1>
                    <p className="page-subtitle">Stay connected with your team</p>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 'var(--space-5)' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: 'var(--space-4)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: 'calc(var(--space-4) + 28px)' }}
                    />
                </div>

                {/* Chat List */}
                {filteredChats.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {filteredChats.map(chat => {
                            const participant = getOtherParticipant(chat);

                            return (
                                <div
                                    key={chat.id}
                                    className="list-item"
                                    onClick={() => setSelectedChat(chat)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="avatar" style={{
                                        background: participant.isGroup ? 'var(--info-bg)' : 'var(--primary-gradient)'
                                    }}>
                                        {participant.isGroup ? (
                                            <Users size={20} color="var(--info)" />
                                        ) : (
                                            participant.name.charAt(0)
                                        )}
                                    </div>

                                    <div className="list-item-content">
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 'var(--space-1)'
                                        }}>
                                            <span style={{ fontWeight: 600 }}>{participant.name}</span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                {formatTime(chat.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <p style={{
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--text-secondary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '200px'
                                            }}>
                                                {chat.lastMessage}
                                            </p>
                                            {chat.unreadCount > 0 && (
                                                <span style={{
                                                    minWidth: 20,
                                                    height: 20,
                                                    borderRadius: 'var(--radius-full)',
                                                    background: 'var(--primary)',
                                                    color: 'white',
                                                    fontSize: 'var(--text-xs)',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0 6px'
                                                }}>
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <MessageCircle size={48} className="empty-state-icon" />
                        <h3 className="empty-state-title">No Conversations</h3>
                        <p className="empty-state-description">
                            Start chatting with your team members
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // Chat View
    const chatMessages = getChatMessages(selectedChat.id);
    const participant = getOtherParticipant(selectedChat);

    return (
        <div className="chat-container animate-fade-in" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            background: 'var(--bg-primary)'
        }}>
            {/* Chat Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-4)',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setSelectedChat(null)}
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="avatar" style={{
                    background: participant.isGroup ? 'var(--info-bg)' : 'var(--primary-gradient)'
                }}>
                    {participant.isGroup ? (
                        <Users size={20} color="var(--info)" />
                    ) : (
                        participant.name.charAt(0)
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{participant.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {participant.isGroup ? `${selectedChat.participants?.length || 0} members` : 'Online'}
                    </div>
                </div>

                <button className="btn btn-ghost btn-icon">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="chat-messages" style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-4)'
            }}>
                {chatMessages.length > 0 ? (
                    <>
                        {chatMessages.map((msg, index) => {
                            const isSent = msg.senderId === user?.id;
                            const showDate = index === 0 ||
                                formatDate(msg.timestamp) !== formatDate(chatMessages[index - 1].timestamp);

                            return (
                                <div key={msg.id}>
                                    {showDate && (
                                        <div style={{
                                            textAlign: 'center',
                                            marginBottom: 'var(--space-4)'
                                        }}>
                                            <span style={{
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--text-muted)',
                                                background: 'var(--bg-card)',
                                                padding: 'var(--space-1) var(--space-3)',
                                                borderRadius: 'var(--radius-full)'
                                            }}>
                                                {formatDate(msg.timestamp)}
                                            </span>
                                        </div>
                                    )}

                                    <div
                                        className={`chat-message ${isSent ? 'sent' : ''}`}
                                        style={{ marginBottom: 'var(--space-3)' }}
                                    >
                                        {!isSent && !participant.isGroup && (
                                            <div className="avatar avatar-sm">
                                                {msg.senderName?.charAt(0)}
                                            </div>
                                        )}

                                        <div>
                                            {!isSent && participant.isGroup && (
                                                <div style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--primary)',
                                                    marginBottom: 'var(--space-1)'
                                                }}>
                                                    {msg.senderName}
                                                </div>
                                            )}
                                            <div className="chat-bubble">
                                                {msg.content}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-1)',
                                                marginTop: 'var(--space-1)',
                                                justifyContent: isSent ? 'flex-end' : 'flex-start'
                                            }}>
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                                {isSent && (
                                                    msg.read ? (
                                                        <CheckCheck size={14} color="var(--info)" />
                                                    ) : (
                                                        <Check size={14} color="var(--text-muted)" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'var(--text-muted)'
                    }}>
                        <MessageCircle size={48} style={{ marginBottom: 'var(--space-3)' }} />
                        <p>No messages yet</p>
                        <p style={{ fontSize: 'var(--text-sm)' }}>Start the conversation!</p>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="chat-input-container">
                <button type="button" className="btn btn-ghost btn-icon">
                    <Paperclip size={20} />
                </button>

                <input
                    type="text"
                    className="form-input chat-input"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    style={{ margin: 0 }}
                />

                <button
                    type="submit"
                    className="btn btn-primary btn-icon"
                    disabled={!messageText.trim()}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}
