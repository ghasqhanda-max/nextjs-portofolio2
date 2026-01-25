import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'] & {
  is_read?: boolean; // For backward compatibility
  read?: boolean;    // For backward compatibility
};

class NotificationService {
  private static instance: NotificationService;
  private supabase: SupabaseClient;
  private subscription: any = null;
  private callbacks: Map<string, (data: any) => void> = new Map();

  private constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async connect(userId: string) {
    // Subscribe to realtime changes
    this.subscription = this.supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          this.handleNotification(payload.new as Notification);
        }
      )
      .subscribe();
  }

  public disconnect() {
    if (this.subscription) {
      this.supabase.removeChannel(this.subscription);
      this.subscription = null;
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    this.callbacks.set(event, callback);
  }

  public unsubscribe(event: string) {
    this.callbacks.delete(event);
  }

  private handleNotification(notification: Notification) {
    // For backward compatibility with existing code
    const formattedNotification = {
      ...notification,
      read: notification.is_read,
      is_read: notification.is_read,
      message: notification.description || ''
    };
    
    // Trigger all callbacks with the new notification
    this.callbacks.forEach(callback => {
      callback(formattedNotification);
    });
  }

  public async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  public async markAsRead(notificationId: string, userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  public async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  }
}

export default NotificationService.getInstance();
