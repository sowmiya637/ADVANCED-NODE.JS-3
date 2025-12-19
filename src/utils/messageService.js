import redisClient from "../services/redisClient.js";

export const saveMessage = async (message, room = "global") => {
  const key = `chat_${room}`;
  await redisClient.rPush(key, JSON.stringify(message));
  await redisClient.lTrim(key, -100, -1);
};

export const getAllMessages = async (room = "global") => {
  const key = `chat_${room}`;
  const messages = await redisClient.lRange(key, 0, -1);
  return messages.map(msg => JSON.parse(msg));
};
