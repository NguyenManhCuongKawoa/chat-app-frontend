export interface Message {
    senderId: number,
    recipientId: number,
    senderName: string,
    recipientName: string,
    content: string,
    timestamp: Date,
    status?: string
}
  
export interface User {
    id: number,
    username: string,
    imageUrl: string,
    newMessages?: number,
    lastMessage?: Message
}