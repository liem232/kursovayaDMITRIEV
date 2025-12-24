export type ChatParticipantRole = 'guest' | 'user' | 'manager' | 'admin';

export interface Chat {
  id: string;
  guestId?: string;
  userId?: string;
  createdAt: string;
  lastMessageAt: string;
  status: 'open' | 'closed';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderRole: ChatParticipantRole;
  senderId?: string;
  text: string;
  createdAt: string;
}

const CHATS_KEY = 'progressgarant_chats';
const MESSAGES_KEY = 'progressgarant_messages';
const GUEST_ID_KEY = 'progressgarant_guest_id';

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getOrCreateGuestId = () => {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const guestId = `guest-${genId()}`;
  localStorage.setItem(GUEST_ID_KEY, guestId);
  return guestId;
};

export const listChats = (): Chat[] => {
  const chats = readJson<Chat[]>(CHATS_KEY, []);
  return chats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
};

export const getChatById = (chatId: string): Chat | undefined => {
  return readJson<Chat[]>(CHATS_KEY, []).find(c => c.id === chatId);
};

export const getOrCreateChatForActor = (actor: { role: 'guest'; guestId: string } | { role: 'user'; userId: string }): Chat => {
  const chats = readJson<Chat[]>(CHATS_KEY, []);

  const existing = chats
    .filter(c => c.status === 'open')
    .find(c => (actor.role === 'guest' ? c.guestId === actor.guestId : c.userId === actor.userId));

  if (existing) return existing;

  const chat: Chat = {
    id: genId(),
    guestId: actor.role === 'guest' ? actor.guestId : undefined,
    userId: actor.role === 'user' ? actor.userId : undefined,
    createdAt: nowIso(),
    lastMessageAt: nowIso(),
    status: 'open'
  };

  writeJson(CHATS_KEY, [chat, ...chats]);
  return chat;
};

export const listMessages = (chatId: string): ChatMessage[] => {
  const messages = readJson<ChatMessage[]>(MESSAGES_KEY, []);
  return messages
    .filter(m => m.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const sendMessage = (params: {
  chatId: string;
  senderRole: ChatParticipantRole;
  senderId?: string;
  text: string;
}): ChatMessage => {
  const chats = readJson<Chat[]>(CHATS_KEY, []);
  const messages = readJson<ChatMessage[]>(MESSAGES_KEY, []);

  const message: ChatMessage = {
    id: genId(),
    chatId: params.chatId,
    senderRole: params.senderRole,
    senderId: params.senderId,
    text: params.text.trim(),
    createdAt: nowIso()
  };

  const updatedChats = chats.map(c => (c.id === params.chatId ? { ...c, lastMessageAt: message.createdAt } : c));

  writeJson(MESSAGES_KEY, [...messages, message]);
  writeJson(CHATS_KEY, updatedChats);

  return message;
};
