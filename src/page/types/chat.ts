// types/chat.ts
export interface Teacher {
  _id: string;
  id?: string;
  username: string;
  name: string;
  department: string;
}

export interface Reaction {
  reaction: string;
  userId: string;
}

export interface Message {
  _id: string;
  id?: string;
  chatId: string;
  sender: string | { _id: string };
  senderModel: 'Student' | 'Teacher';
  message?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  timestamp: string;
  replyTo?: Message;
  reactions?: Reaction[];
  isDeleted?: boolean;
}

export interface ChatItem {
  chatId: string;
  contact: Teacher;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface ChatListResponse {
  chats: ChatItem[];
}
