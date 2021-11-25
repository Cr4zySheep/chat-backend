export interface User {
  id: number;
  fullName: string;
  picture?: string;
}

export interface Forum {
  id: number;
  members: number[];
}

export interface Message {
  id: number;
  text: string;
  authorId: number;
  forumId: number;
  createdAt: Date;
}

export interface Context {
  user: User;
}
