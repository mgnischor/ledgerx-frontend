/** The domain event a notification was generated from. */
export type NotificationType = "USER_REGISTERED" | "TRANSACTION_RECORDED" | "INVOICE_PAID";

/** An in-app notification populated from a domain event published over RabbitMQ. */
export interface NotificationDto {
    id: string;
    type: NotificationType;
    /** Id of the aggregate the notification refers to (a user, transaction, or invoice id). */
    referenceId: string;
    message: string;
    /** ISO instant the notification was created. */
    createdAt: string;
    read: boolean;
}
