export interface Message {
    id?: number,
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
    online: boolean,
    newMessages?: number,
    lastMessage?: Message,
}

export interface ImagePreview {
    id: number,
    url: string,
}