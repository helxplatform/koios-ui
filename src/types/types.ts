// types.ts
import { Conversation, Session } from 'reachat';

export interface ConversationExt extends Conversation {
  kg: KnowledgeGraphData | null;
}

export interface Session_ext extends Session {
  conversations: ConversationExt[];
}

export type KnowledgeGraphData = {
  links: Array<{ source: string; target: string }>;
  nodes: Array<{ id: string; name: string }>;
};