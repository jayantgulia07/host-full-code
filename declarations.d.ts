declare module 'remoteApp/services' {
  export interface ChatMessage {
    role: 'user' | 'assistant'; // identifies who sent it
    message: string;            // actual chat text
  }

  export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
  }

  export function getAllChats(): ChatSession[];
  export function loadChat(id: string): ChatSession | null;
  export function saveChat(
    sessionId: string,
    messages: ChatMessage[]
  ): void;
  export function askQuestionAPI(
    input: string,
    history: ChatMessage[],
    sessionId: string
  ): Promise<ChatMessage[]>;
}
