export type NotificationType = "USER_REGISTERED" | "TRANSACTION_RECORDED" | "INVOICE_PAID";

export interface NotificationDto {
    id: string;
    type: NotificationType;
    referenceId: string;
    message: string;
    createdAt: string;
    read: boolean;
}
