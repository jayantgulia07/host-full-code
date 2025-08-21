declare module "remoteApp/services" {
  // Message inside a chat
  export interface ChatMessage {
    sender: "user" | "bot";   // who sent the message
    message: string;          // chat text
  }

  // A chat session
  export interface ChatSession {
    id: string;               // unique chat id
    title: string;            // chat title
    messages: ChatMessage[];  // list of messages
  }

  // get all saved chats
  export function getAllChats(): ChatSession[];

  // load a single chat by id
  export function loadChat(id: string): ChatSession | null;

  // save messages to a chat session
  export function saveChat(
    sessionId: string,
    messages: ChatMessage[]
  ): void;

  // call the API to get a new response
  export function askQuestionAPI(
    input: string,
    history: ChatMessage[],
    sessionId: string
  ): Promise<ChatMessage[]>;
}
