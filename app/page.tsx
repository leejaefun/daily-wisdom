"use client";

import { useState, useEffect } from "react";
import { getDailyQuote, Quote } from "@/lib/quotes";
import QuoteDisplay from "./components/QuoteDisplay";
import { LocalNotifications } from "@capacitor/local-notifications";
import { APP_VERSION } from "./constants/version";

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(getDailyQuote());

    // One-time notification refresh on version update (0% overhead on normal launches)
    const refreshNotification = async () => {
      try {
        const LAST_REFRESHED_KEY = "notification_refreshed_version";
        const lastRefreshedVersion = localStorage.getItem(LAST_REFRESHED_KEY);
        const isNotificationEnabled = localStorage.getItem("notificationEnabled") === "true";

        if (isNotificationEnabled && lastRefreshedVersion !== APP_VERSION) {
          const { display } = await LocalNotifications.checkPermissions();
          if (display === "granted") {
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: "Daily Wisdom",
                  body: "아침 7시에 오늘의 명언을 알려드립니다.",
                  id: 1,
                  smallIcon: "ic_stat_icon",
                  iconColor: "#4A5568",
                  schedule: {
                    on: { hour: 7, minute: 0 },
                    repeats: true,
                    allowWhileIdle: true,
                  },
                },
              ],
            });
            localStorage.setItem(LAST_REFRESHED_KEY, APP_VERSION);
          }
        }
      } catch (e) {
        console.log("LocalNotifications auto-refresh skipped (web context or uninstalled)");
      }
    };
    refreshNotification();
  }, []);

  // Prevent hydration mismatch by rendering nothing or a placeholder initially
  if (!quote) return <div className="min-h-screen bg-[#fdfbf7]" />;

  return <QuoteDisplay quote={quote} />;
}
