"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AblyContextType {
  ably: any | null;
  channel: any | null;
  isConnected: boolean;
  subscribe: (eventName: string, callback: (message: any) => void) => () => void;
  unsubscribe: (eventName: string, callback: (message: any) => void) => void;
}

const AblyContext = createContext<AblyContextType | null>(null);

export const useAbly = () => {
  const context = useContext(AblyContext);
  if (!context) {
    throw new Error("useAbly must be used within AblyProvider");
  }
  return context;
};

interface AblyProviderProps {
  children: React.ReactNode;
}

export const AblyProvider = ({ children }: AblyProviderProps) => {
  const { user } = useAuth();
  const [ably, setAbly] = useState<any | null>(null);
  const [channel, setChannel] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscribersRef = useRef<Map<string, Set<(message: any) => void>>>(new Map());
  const ablyInstanceRef = useRef<any | null>(null);
  const channelInstanceRef = useRef<any | null>(null);
  const isInitializingRef = useRef(false);

  // Load Ably SDK from CDN
  const loadAblySDK = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof (window as any).Ably !== "undefined") {
        resolve((window as any).Ably);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="ably"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          if (typeof (window as any).Ably !== "undefined") {
            resolve((window as any).Ably);
          } else {
            reject(new Error("Ably SDK failed to load"));
          }
        });
        existingScript.addEventListener("error", reject);
        return;
      }

      // Load script
      const script = document.createElement("script");
      script.src = "https://cdn.ably.io/lib/ably.min-1.js";
      script.async = true;
      script.onload = () => {
        if (typeof (window as any).Ably !== "undefined") {
          resolve((window as any).Ably);
        } else {
          reject(new Error("Ably SDK failed to load"));
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  // Initialize Ably connection
  useEffect(() => {
    if (!user || typeof window === "undefined") {
      return;
    }

    // Prevent multiple initializations
    if (isInitializingRef.current || ablyInstanceRef.current) {
      return;
    }

    const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
    if (!ablyApiKey) {
      console.warn("Ably API key not configured. Real-time updates disabled.");
      return;
    }

    isInitializingRef.current = true;

    const initAbly = async () => {
      try {
        // Load Ably SDK
        const Ably = await loadAblySDK();
        if (!Ably) {
          console.warn("Ably not available. Real-time updates disabled.");
          isInitializingRef.current = false;
          return;
        }

        // Create Ably instance
        const ablyInstance = new Ably.Realtime({
          key: ablyApiKey,
          clientId: `admin-${user.id}`,
        });

        ablyInstanceRef.current = ablyInstance;

        // Get admin channel
        const channelInstance = ablyInstance.channels.get("admin");
        channelInstanceRef.current = channelInstance;

        // Handle connection state changes
        ablyInstance.connection.on("connected", () => {
          console.log("✅ Ably connected");
          setIsConnected(true);
        });

        ablyInstance.connection.on("disconnected", () => {
          console.warn("⚠ Ably disconnected");
          setIsConnected(false);
        });

        ablyInstance.connection.on("suspended", () => {
          console.warn("⚠ Ably suspended - attempting to reconnect...");
          setIsConnected(false);
        });

        channelInstance.on("attached", () => {
          console.log("✅ Ably admin channel attached");
          // Test subscription to verify connection
          channelInstance.subscribe("test", (message: any) => {
            console.log("🧪 [ABLY TEST] Test message received:", message);
          });
        });
        
        // Also listen for messages on the channel to verify connection
        channelInstance.on("message", (message: any) => {
          console.log("📨 [ABLY] Raw message received on admin channel:", {
            name: message.name,
            data: message.data,
            timestamp: message.timestamp,
          });
        });

        channelInstance.on("detached", () => {
          console.warn("⚠ Ably admin channel detached - attempting to reattach...");
          channelInstance.attach();
        });

        channelInstance.on("suspended", () => {
          console.warn("⚠ Ably admin channel suspended - attempting to reattach...");
          channelInstance.attach();
        });

        // Attach to channel
        channelInstance.attach((err: any) => {
          if (err) {
            console.error("❌ Error attaching to Ably admin channel:", err);
            isInitializingRef.current = false;
          } else {
            console.log("✅ Successfully attached to Ably admin channel");
            setAbly(ablyInstance);
            setChannel(channelInstance);
            setIsConnected(true);
            isInitializingRef.current = false;
          }
        });
      } catch (error) {
        console.error("Error initializing Ably:", error);
        isInitializingRef.current = false;
      }
    };

    initAbly();

    // Cleanup function
    return () => {
      if (channelInstanceRef.current) {
        // Unsubscribe all listeners
        subscribersRef.current.forEach((callbacks, eventName) => {
          callbacks.forEach((callback) => {
            channelInstanceRef.current.unsubscribe(eventName, callback);
          });
        });
        subscribersRef.current.clear();
        channelInstanceRef.current.unsubscribe();
      }
      if (ablyInstanceRef.current) {
        ablyInstanceRef.current.close();
        ablyInstanceRef.current = null;
      }
      setAbly(null);
      setChannel(null);
      setIsConnected(false);
      isInitializingRef.current = false;
    };
  }, [user, loadAblySDK]);

  // Subscribe to an event
  const subscribe = useCallback(
    (eventName: string, callback: (message: any) => void) => {
      if (!channelInstanceRef.current) {
        console.warn(`⚠️ [ABLY] Cannot subscribe to ${eventName}: channel not initialized`);
        return () => {}; // Return no-op unsubscribe function
      }

      // Wrapper callback that logs and forwards to the original callback
      const wrappedCallback = (message: any) => {
        console.log(`🔔 [ABLY] Received message on ${eventName}:`, {
          name: message.name,
          data: message.data,
          timestamp: message.timestamp,
          clientId: message.clientId,
        });
        callback(message);
      };

      // Add callback to subscribers map
      if (!subscribersRef.current.has(eventName)) {
        subscribersRef.current.set(eventName, new Set());
      }
      subscribersRef.current.get(eventName)!.add(callback);

      // Check if channel is attached
      const channelState = channelInstanceRef.current.state;
      console.log(`📡 [ABLY] Subscribing to event: ${eventName} on channel: admin (state: ${channelState})`);

      if (channelState === "attached") {
        // Channel is attached, subscribe immediately
        channelInstanceRef.current.subscribe(eventName, wrappedCallback);
        console.log(`✅ [ABLY] Successfully subscribed to ${eventName} (channel attached)`);
      } else if (channelState === "attaching") {
        // Channel is attaching, wait for it
        console.log(`⏳ [ABLY] Channel is attaching, waiting before subscribing to ${eventName}...`);
        const attachHandler = () => {
          channelInstanceRef.current?.subscribe(eventName, wrappedCallback);
          console.log(`✅ [ABLY] Successfully subscribed to ${eventName} (after attach)`);
          channelInstanceRef.current?.off("attached", attachHandler);
        };
        channelInstanceRef.current.on("attached", attachHandler);
      } else {
        // Channel not attached, attach first then subscribe
        console.warn(`⚠️ [ABLY] Channel not attached (state: ${channelState}), attempting to attach...`);
        channelInstanceRef.current.attach((err: any) => {
          if (err) {
            console.error(`❌ [ABLY] Failed to attach channel:`, err);
          } else {
            console.log(`✅ [ABLY] Channel attached, subscribing to ${eventName}...`);
            channelInstanceRef.current?.subscribe(eventName, wrappedCallback);
            console.log(`✅ [ABLY] Successfully subscribed to ${eventName} (after attach)`);
          }
        });
      }

      // Return unsubscribe function
      return () => {
        const callbacks = subscribersRef.current.get(eventName);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            subscribersRef.current.delete(eventName);
          }
        }
        if (channelInstanceRef.current) {
          console.log(`🔌 [ABLY] Unsubscribing from ${eventName}`);
          channelInstanceRef.current.unsubscribe(eventName, wrappedCallback);
        }
      };
    },
    []
  );

  // Unsubscribe from an event
  const unsubscribe = useCallback(
    (eventName: string, callback: (message: any) => void) => {
      const callbacks = subscribersRef.current.get(eventName);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscribersRef.current.delete(eventName);
        }
      }
      if (channelInstanceRef.current) {
        channelInstanceRef.current.unsubscribe(eventName, callback);
      }
    },
    []
  );

  return (
    <AblyContext.Provider
      value={{
        ably,
        channel,
        isConnected,
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </AblyContext.Provider>
  );
};

