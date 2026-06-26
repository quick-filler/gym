"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { useNotifications, type AdminNotificationItem } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<string, IconName> = {
  admin_booking: "calendar",
  booking_confirmed: "calendar",
  class_reminder: "clock",
  admin_payment: "money",
  payment_paid: "money",
  payment_due: "credit",
  workout_new: "heart-pulse",
};

function iconFor(kind: string): IconName {
  return KIND_ICON[kind] ?? "bell";
}

export function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function onItem(n: AdminNotificationItem) {
    if (!n.read) await markRead(n.id);
    setOpen(false);
    if (n.route) router.push(n.route);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full bg-paper-2 hover:bg-paper-3 text-ink-700 flex items-center justify-center transition-colors"
        aria-label={
          unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : "Notificações"
        }
      >
        <Icon name="bell" size="lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-flame text-white text-[0.6rem] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] z-50 rounded-2xl border border-line bg-white shadow-gym-2 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="font-display text-[0.95rem] font-semibold text-ink-900">
                Notificações
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="font-mono text-[0.68rem] uppercase tracking-[0.06em] font-semibold text-flame hover:text-flame-dark transition-colors"
                >
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-ink-400 text-[0.85rem]">
                  Nenhuma notificação.
                </div>
              ) : (
                items.slice(0, 12).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onItem(n)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 px-4 py-3 border-b border-line/60 hover:bg-paper-50 transition-colors",
                      !n.read && "bg-flame-50/40",
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-paper-2 text-flame flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name={iconFor(n.kind)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-[0.85rem] text-ink-900 truncate",
                            n.read ? "font-medium" : "font-bold",
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="text-[0.66rem] text-ink-400 shrink-0">
                          {n.timeLabel}
                        </span>
                      </div>
                      {n.body && (
                        <div className="text-[0.76rem] text-ink-500 mt-0.5 line-clamp-2">
                          {n.body}
                        </div>
                      )}
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-flame shrink-0 mt-1.5" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
