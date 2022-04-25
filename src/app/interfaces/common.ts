export type HTTPStatus = 'UPLOADING' | 'COMPLETED' | 'ERROR'

export interface ChatNotification {
    chatId: number,
    senderId: number,
    senderName: string,
    recipientId: number
}

export interface Message {
    id?: number,
    senderId: number,
    recipientId: number,
    senderName: string,
    recipientName: string,
    text?: string,
    images?: string[],
    files?: string[],
    timestamp: Date,
    status?: 'loading' | 'error' | 'received' | 'delivered'
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