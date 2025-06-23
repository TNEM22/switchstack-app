import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react';

import { useNetwork } from './NetworkContext';

import { useRooms } from '@/context/RoomContext';

import { toast } from '@/components/ui/sonner';

import { WS_URL } from '@/constants';

export interface WebSocketContextType {
  isWsConnected: boolean;
  connect: (calledBy: string, cb?: () => void) => void;
  disconnect: () => void;
  toggleSwitch: (roomId: string, switchId: string, espId: string) => void;
  // onMessage: (callback: (message: string) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const socket = useRef<WebSocket | null>(null);
  const hasEstablishedConnection = useRef<boolean>(false);
  const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const wasOffline = useRef<boolean>(false);

  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  const { isOnline } = useNetwork();
  const { rooms, setRooms } = useRooms();

  // First connection on mount
  useEffect(() => {
    if (rooms.length && !hasEstablishedConnection.current && !socket.current) {
      connect('initial connect', () =>
        toast.error('Server Disconnected', { duration: 7000 })
      );
    }
  }, [rooms]);

  // Retry reconnect on failed connection
  useEffect(() => {
    if (
      isOnline &&
      !isWsConnected &&
      socket.current &&
      hasEstablishedConnection.current &&
      reconnectAttempts < 5
    ) {
      toast.loading(
        `Reconnecting to server attempt: ${reconnectAttempts + 1}...`,
        {
          id: 'ws-reconnect-toast',
          duration: 0,
        }
      );
      const timeoutId = setTimeout(() => {
        connect(`reconnectAttempts: ${reconnectAttempts + 1}`, () =>
          setReconnectAttempts((prev) => prev + 1)
        );
      }, reconnectAttempts * 2000);
      reconnectTimeoutId.current = timeoutId;
    } else if (reconnectAttempts === 5) {
      connect(`reconnectAttempts: ${reconnectAttempts + 1}`, () => {
        toast.dismiss('ws-reconnect-toast');
        toast.error('Max reconnect attempts reached');
      });
      setReconnectAttempts(6);
    }

    if (!isOnline) {
      // console.log('Network is offline, not reconnecting');
      if (reconnectTimeoutId.current) clearTimeout(reconnectTimeoutId.current);
    }

    return () => {
      if (reconnectTimeoutId.current) clearTimeout(reconnectTimeoutId.current);
    };
  }, [isWsConnected, isOnline, reconnectAttempts]);

  // Reconnect on network change
  useEffect(() => {
    if (!isOnline && hasEstablishedConnection.current && !wasOffline.current) {
      wasOffline.current = true;
      disconnect();
    } else if (
      isOnline &&
      hasEstablishedConnection.current &&
      wasOffline.current
    ) {
      toast.loading('Reconnecting to server...', {
        id: 'ws-reconnect-toast',
        duration: 0,
      });
      wasOffline.current = false;
      connect('network reconnect', () =>
        toast.error('Server Disconnected', { duration: 7000 })
      );
    }
  }, [isOnline]);

  function connect(calledBy = 'any', cb?: () => void) {
    socket.current = new WebSocket(WS_URL);
    console.log('Websocket created!, calledBy:', calledBy);

    socket.current.onopen = () => {
      toast.dismiss('ws-reconnect-toast');
      // console.log('WebSocket connected');
      hasEstablishedConnection.current = true;
      setIsWsConnected(true);
      setReconnectAttempts(0);
      if (reconnectTimeoutId.current) clearTimeout(reconnectTimeoutId.current);
    };
    socket.current.onclose = () => {
      if (cb) cb();
      // console.log('WebSocket disconnected');
      setIsWsConnected(false);
    };
  }

  function disconnect() {
    if (socket.current) {
      console.log('WebSocket disconnected manually!');
      socket.current.close();
      setIsWsConnected(false);
      socket.current = null;
    }
  }

  function toggleSwitch(roomId: string, switchId: string, espId: string) {
    if (socket.current && isWsConnected) {
      // socket.current.send(message);
      const esp = rooms.find((room) => room.esp_id === roomId);
      const room_switch = esp?.switches.find((sw) => sw._id === switchId);

      const message = {
        espId,
        switchId,
        state: !room_switch?.state,
      };
      socket.current.send(JSON.stringify(message));

      setRooms(
        rooms.map((room) => {
          if (room.esp_id === roomId) {
            return {
              ...room,
              switches: room.switches.map((sw) => {
                if (sw._id === switchId) {
                  const newState = !sw.state;
                  return { ...sw, state: newState };
                }
                return sw;
              }),
            };
          }
          return room;
        })
      );
    } else {
      toast.error('WebSocket is not connected. Please try again later.', {
        duration: 5000,
      });
    }
  }

  // Function to confirm toggle switch state from WebSocket message
  useEffect(() => {
    if (socket.current) {
      socket.current.onmessage = (event) => {
        const message = event.data;
        const parsedMessage = JSON.parse(message);

        // console.log('WebSocket message received:', parsedMessage);
        const { status, espId, switchId, state } = parsedMessage;

        if (status === 'error') {
          const esp = rooms.find((room) => room.esp_id === espId);
          const room_switch = esp?.switches.find((sw) => sw._id === switchId);

          if (room_switch && room_switch.state !== state) {
            setRooms(
              rooms.map((room) => {
                if (room.esp_id === espId) {
                  return {
                    ...room,
                    switches: room.switches.map((sw) => {
                      if (sw._id === switchId) {
                        return { ...sw, state: state };
                      }
                      return sw;
                    }),
                  };
                }
                return room;
              })
            );
          }
        } else if (status === 'info') {
          // console.log('Server ws:', parsedMessage);
          const esp = rooms.find((room) => room._id === espId);
          if (esp) {
            setRooms(
              rooms.map((room) => {
                if (room._id === espId) {
                  return {
                    ...room,
                    isOnline: state === 'connected',
                  };
                }
                return room;
              })
            );
          }
        }
        // Show toast if toggle was failed
        if (status === 'error') {
          toast.error(`Error toggling switch: ${parsedMessage.message}`);
          return;
        }
      };
    }
  }, [rooms, setRooms]);

  return (
    <WebSocketContext.Provider
      value={{
        isWsConnected,
        connect,
        disconnect,
        toggleSwitch,
        // onMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
