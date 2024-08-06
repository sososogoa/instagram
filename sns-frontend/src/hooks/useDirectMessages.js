import { useState, useEffect, useCallback } from 'react';
import {
    createConversation,
    getMessagesBetweenUsers,
    getConversationsByUserId,
    markNotificationAsRead
} from '../api';
import { useNotifications } from '../context/NotificationContext';

const useDirectMessages = (currentUser, userId) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [ws, setWs] = useState(null);
    const { notifications, fetchNotifications } = useNotifications();

    const fetchConversations = useCallback(async () => {
        if (!currentUser) return;
        try {
            const response = await getConversationsByUserId(currentUser._id);
            setConversations(response.data);

            if (userId) {
                const targetConversation = response.data.find(conv =>
                    conv.participants.some(participant => participant._id === userId)
                );
                if (targetConversation) {
                    setSelectedConversation(targetConversation);
                } else {
                    const newConvResponse = await createConversation([currentUser._id, userId]);
                    setSelectedConversation(newConvResponse.data);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, [currentUser, userId]);

    const fetchMessages = useCallback(async (page, initial = false) => {
        if (!selectedConversation) return;

        const otherUser = selectedConversation.participants.find(participant => participant._id !== currentUser._id);
        if (!otherUser) return;

        try {
            setIsLoading(true);
            const response = await getMessagesBetweenUsers(currentUser._id, otherUser._id, page, limit);

            if (response.data.length < limit) {
                setHasMore(false);
            }

            if (initial) {
                setMessages(response.data.reverse());
            } else {
                setMessages(prevMessages => {
                    const newMessages = response.data.reverse();
                    const allMessages = [...newMessages, ...prevMessages];
                    const uniqueMessages = Array.from(new Set(allMessages.map(msg => msg._id))).map(
                        id => allMessages.find(msg => msg._id === id)
                    );
                    return uniqueMessages;
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedConversation, currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        fetchConversations();
    }, [currentUser, fetchConversations]);

    useEffect(() => {
        if (!selectedConversation) return;

        const fetchInitialMessages = async () => {
            await fetchMessages(1, true);
        };

        fetchInitialMessages();
    }, [fetchMessages, selectedConversation]);

    useEffect(() => {
        if (!selectedConversation) return;
        const socket = new WebSocket('ws://localhost:5000');
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'SEND_MESSAGE' && data.conversationId === selectedConversation._id) {
                const completeMessage = {
                    ...data.message,
                    conversationId: data.conversationId,
                    createdAt: data.message.createdAt,
                    sender: data.message.sender,
                    text: data.message.text,
                    _id: data.message._id,
                };
                setMessages((prevMessages) => {
                    if (!prevMessages.some(msg => msg._id === completeMessage._id)) {
                        return [...prevMessages, completeMessage];
                    }
                    return prevMessages;
                });

                setConversations(prevConversations => {
                    return prevConversations.map(conv => {
                        if (conv._id === data.conversationId) {
                            return { ...conv, lastMessage: data.message.text };
                        }
                        return conv;
                    });
                });
                fetchNotifications();
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            socket.close();
        };
    }, [selectedConversation]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !ws || !selectedConversation) return;
        const receiver = selectedConversation.participants.find(participant => participant._id !== currentUser._id);
        const messageData = {
            type: 'NEW_MESSAGE',
            conversationId: selectedConversation._id,
            sender: {
                _id: currentUser._id,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture || '',
            },
            text: newMessage,
            receiver: {
                _id: receiver._id,
                username: receiver.username,
                profilePicture: receiver.profilePicture || '',
            },
            createdAt: new Date().toISOString(),
        };
        ws.send(JSON.stringify(messageData));

        const response = await getConversationsByUserId(currentUser._id);
        setConversations(response.data);


        // setConversations(prevConversations => {
        //     return prevConversations.map(conv => {
        //         if (conv._id === selectedConversation._id) {
        //             return { ...conv, lastMessage: newMessage };
        //         }
        //         return conv;
        //     });
        // });
        setNewMessage('');

        await markConversationNotificationsAsRead(selectedConversation);

        fetchNotifications();
    };

    const markConversationNotificationsAsRead = async (conversation) => {
        const otherUser = conversation.participants.find(participant => participant._id !== currentUser._id);
        if (!otherUser) return;
        const unreadNotifications = notifications.filter(
            notification =>
                !notification.isRead &&
                notification.type === 'message' &&
                notification.requester._id === otherUser._id
        );

        for (const notification of unreadNotifications) {
            await markNotificationAsRead(notification._id);
        }

        fetchNotifications();
    };

    return {
        conversations,
        selectedConversation,
        messages,
        newMessage,
        setNewMessage,
        fetchMessages,
        setSelectedConversation,
        sendMessage,
        hasMore,
        isLoading,
        setPage,
    };
};

export default useDirectMessages;
