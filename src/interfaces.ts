import { Reaction } from './models/enums.js';

export interface ActivityRequest {
  content: string,
  restreamId?: string,
  replyTo?: string
};

export interface ActivityResponse {
  id: string; // guid
  content: string;
  created: string;
  authorId: string;
  reactions: [];
  restreamId: string;
  replyIds: string[];
  parentId: string;
}

export interface EntityResponse {
  id: string;
  displayName: string;
  email: string;
  alias: string;
}

export interface ReactionResponse {
  type: Reaction;
  count: number;
}

export interface ActivitiesResponse {
  activities: ActivityResponse[];
  entities: EntityResponse[];
}