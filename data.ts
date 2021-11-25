import { readFileSync } from 'fs';
import { User, Forum, Message } from './types';

export default function loadFixtures(): {
  users: User[];
  forums: Forum[];
  messages: Message[];
} {
  const rawdata = readFileSync('./fixtures.json');
  const data = JSON.parse(rawdata.toString());

  return {
    ...data,
    messages: data.rawMessages.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    })),
  };
}
