import axios from 'axios';
import { toast } from '@/components/ui/sonner';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useNetwork } from './NetworkContext';

import { SERVER_URL, ROOMS_STORAGE_KEY } from '@/constants';

export interface Switch {
  _id: string;
  esp: string;
  name: string;
  state: boolean;
  icon: string;
  order?: number;
}

export interface Room {
  esp_id: string;
  name: string;
  icon: string;
  switches: Switch[];
  order: number;
  type?: 'demo'; // 'demo' for demo rooms, null for real rooms
}

interface RoomContextType {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  loading: boolean;
  addRoom: (
    name: string,
    device_id: string,
    icon: string,
    cb: () => void
  ) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string, resolve: () => void, reject: () => void) => void;
  // addSwitch: (roomId: string, name: string, icon: string) => void;
  updateSwitch: (
    roomId: string,
    switchId: string,
    updates: Partial<Switch>
  ) => void;
  // deleteSwitch: (roomId: string, switchId: string) => void;
  // toggleSwitch: (roomId: string, switchId: string, espId: string) => void;
  reorderRooms: (startIndex: number, endIndex: number) => void;
  reorderSwitches: (
    roomId: string,
    startIndex: number,
    endIndex: number
  ) => void;
}

// Create context with a more descriptive undefined check
const RoomContext = createContext<RoomContextType | undefined>(undefined);

// const STORAGE_KEY = 'switchstack-rooms';

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { isOnline } = useNetwork();

  // Function to confirm toggle switch state from WebSocket message
  /*const confirmToggleSwitch = (message: string) => {
    const parsedMessage = JSON.parse(message);

    const { espId, switchId, state } = parsedMessage;
    const esp = rooms.find((room) => room.esp_id === espId);
    const room_switch = esp?.switches.find((sw) => sw._id === switchId);
    // console.log(
    //   `Changing state of switch ${switchId} in room ${espId} to ${state}`
    // );
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

    // Show toast if toggle was failed
    if (parsedMessage.status === 'error') {
      toast.error(`Error toggling switch: ${parsedMessage.message}`);
      return;
    }
  };*/

  /*const initializeDemoRooms = () => {
      // Initialize with demo data if no saved rooms
      const demoRooms: Room[] = [
        //   {
        //     id: 'room-1',
        //     name: 'Living Room',
        //     icon: 'house',
        //     order: 0,
        //     switches: [
        //       {
        //         id: 'switch-1',
        //         name: 'Main Light',
        //         isOn: false,
        //         icon: 'lightbulb',
        //       },
        //       { id: 'switch-2', name: 'TV', isOn: true, icon: 'monitor' },
        //     ],
        //   },
        //   {
        //     id: 'room-2',
        //     name: 'Bedroom',
        //     icon: 'bell',
        //     order: 1,
        //     switches: [
        //       {
        //         id: 'switch-3',
        //         name: 'Ceiling Light',
        //         isOn: false,
        //         icon: 'lightbulb',
        //       },
        //       { id: 'switch-4', name: 'Desk Lamp', isOn: false, icon: 'lamp' },
        //     ],
        //   },
      ];
      setRooms(demoRooms);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRooms));
    };*/

  // Initialize Rooms from localStorage and update from API
  useEffect(() => {
    if (!isAuthenticated) return; // Check if user is logged in

    // Initially Load rooms from localStorage
    const savedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
    const parsedRooms = JSON.parse(savedRooms) ?? []; // Default to empty array if null
    setRooms(parsedRooms);

    if (isOnline) {
      // Set loading state to true at the beginning
      setLoading(true);
      // Show loading toast that will stay until dismissed
      const loadingToastId = toast.loading('Loading your rooms...');
      axios
        .get(`${SERVER_URL}/api/v1/esps`, { withCredentials: true })
        .then((response) => {
          const data = response.data.data.esps;

          // Compare with localStorage
          if (!data || data.length === 0) {
            setRooms([]);
          } else {
            // If rooms are not found in localstorage set the rooms
            if (parsedRooms.length === 0) {
              setRooms(data);
            } else {
              // Filter, Update and Add rooms
              // Step 1: Filter out rooms that are already in localStorage
              const existingRooms = parsedRooms.filter((room: Room) =>
                data.find((r: Room) => r.esp_id === room.esp_id)
              );

              // Step 2: Update existing rooms with latest data
              const updatedRooms = existingRooms.map((room: Room) => {
                const apiRoom = data.find(
                  (r: Room) => r.esp_id === room.esp_id
                );
                if (apiRoom) {
                  // Update the switches
                  const updatedSwitches = apiRoom.switches.map((sw: Switch) => {
                    const existingSwitch = room.switches.find(
                      (s: Switch) => s._id === sw._id
                    );
                    if (existingSwitch) {
                      // Update the switch
                      return {
                        ...existingSwitch,
                        name: sw.name,
                        icon: sw.icon,
                        state: sw.state,
                      };
                    } else {
                      // Add new switch if it doesn't exist
                      return sw;
                    }
                  });
                  return {
                    ...room,
                    name: apiRoom.name,
                    icon: apiRoom.icon,
                    switches: updatedSwitches,
                  };
                }
                return room;
              });

              // Step 3: Add remaining rooms if any
              if (updatedRooms.length < data.length) {
                data.forEach((room: Room) => {
                  const found = updatedRooms.find(
                    (r: Room) => r.esp_id === room.esp_id
                  );
                  if (!found) {
                    updatedRooms.push(room);
                  }
                });
              }

              // Step 4: Set Rooms
              setRooms(updatedRooms);
            }
          }

          // Set loading to false after rooms are fetched and updated
          setLoading(false);
          // Dismiss the loading toast and show success message
          toast.dismiss(loadingToastId);
          toast.success('Rooms loaded successfully');
        })
        .catch((error) => {
          // console.error(error);

          // Set loading to false on error as well
          setLoading(false);
          // Dismiss the loading toast and show error message
          toast.dismiss(loadingToastId);
          toast.error('Failed to load rooms');
        });
    }
  }, [isAuthenticated, isOnline]);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    if (!isAuthenticated) return; // Check if user is logged in
    if (!loading) {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
    }
  }, [rooms, loading, isAuthenticated]);

  const addRoom = async (
    name: string,
    device_id: string,
    icon: string,
    cb: () => void
  ) => {
    const loadingToastId = toast.loading('Adding room...');
    let esp_id = device_id;
    let switches: Switch[] = [];
    if (esp_id === 'demo') {
      esp_id = `room-${Date.now()}`;
    } else {
      const url = `${SERVER_URL}/api/v1/esps/register`;
      try {
        const response = await axios.post(
          url,
          { esp_id, name, icon },
          { withCredentials: true }
        );
        const dd = response.data;
        switches = dd.data.room.switches;
      } catch (error) {
        esp_id = null;
        toast.dismiss(loadingToastId);
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Something went wrong!');
        }
      }
    }
    if (esp_id) {
      const newRoom: Room = {
        esp_id,
        name,
        icon,
        switches: switches,
        order: rooms.length,
      };
      // To check if switch is for demo purpose..
      if (device_id === 'demo') {
        newRoom.type = 'demo';
      }
      setRooms([...rooms, newRoom]);

      toast.dismiss(loadingToastId);
      toast.success(`Room "${name}" created successfully`);
      cb();
    }
    // else {
    //   toast.dismiss(loadingToastId);
    //   toast.error('Failed to create room');
    // }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    const loadingToastId = toast.loading('Updating room...');
    try {
      await axios.patch(
        `${SERVER_URL}/api/v1/esps/${roomId}`,
        {
          name: updates.name,
          icon: updates.icon,
        },
        {
          withCredentials: true,
        }
      );
      setRooms(
        rooms.map((room) =>
          room.esp_id === roomId ? { ...room, ...updates } : room
        )
      );

      toast.dismiss(loadingToastId);
      toast.success('Room updated successfully');
    } catch (error) {
      //   console.error('Error updating room:', error);
      toast.dismiss(loadingToastId);
      toast.error('Failed to update room');
    }
  };

  const deleteRoom = async (
    roomId: string,
    resolve: () => void,
    reject: () => void
  ) => {
    // const roomName = rooms.find((room) => room.esp_id === roomId)?.name;
    // setRooms(rooms.filter((room) => room.esp_id !== roomId));
    // toast.success(`Room "${roomName}" deleted successfully`);
    // toast.warning('This feature is not available yet!');
    const loadingToastId = toast.loading('Deleting room...');
    try {
      await axios.delete(`${SERVER_URL}/api/v1/esps/${roomId}`, {
        withCredentials: true,
      });

      const roomName = rooms.find((room) => room.esp_id === roomId)?.name;
      setRooms(rooms.filter((room) => room.esp_id !== roomId));
      toast.dismiss(loadingToastId);
      toast.success(`Room "${roomName}" deleted successfully`);
      resolve();
    } catch (err) {
      const errorMessage =
        (axios.isAxiosError(err) && err.response?.data.message) ||
        'Failed to delete room';
      toast.dismiss(loadingToastId);
      toast.error(errorMessage);
      reject();
    }
  };

  //   const addSwitch = (roomId: string, name: string, icon: string) => {
  //     setRooms(
  //       rooms.map((room) => {
  //         if (room.esp_id === roomId) {
  //           return {
  //             ...room,
  //             switches: [
  //               ...room.switches,
  //               {
  //                 id: `switch-${Date.now()}`,
  //                 name,
  //                 isOn: false,
  //                 icon,
  //               },
  //             ],
  //           };
  //         }
  //         return room;
  //       })
  //     );
  //     toast.success(`Switch "${name}" added successfully`);
  //   };

  const updateSwitch = async (
    roomId: string,
    switchId: string,
    updates: Partial<Switch>
  ) => {
    const loadingToastId = toast.loading('Updating switch...');
    try {
      await axios.patch(
        `${SERVER_URL}/api/v1/esps/${roomId}/switch/${switchId}`,
        {
          name: updates.name,
          icon: updates.icon,
        },
        { withCredentials: true }
      );
      setRooms(
        rooms.map((room) => {
          if (room.esp_id === roomId) {
            return {
              ...room,
              switches: room.switches.map((sw) =>
                sw._id === switchId ? { ...sw, ...updates } : sw
              ),
            };
          }
          return room;
        })
      );

      toast.dismiss(loadingToastId);
      toast.success('Switch updated successfully');
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Failed to update switch');
    }
  };

  //   const deleteSwitch = (roomId: string, switchId: string) => {
  //     setRooms(
  //       rooms.map((room) => {
  //         if (room.esp_id === roomId) {
  //           const switchName = room.switches.find(
  //             (sw) => sw._id === switchId
  //           )?.name;
  //           toast.success(`Switch "${switchName}" deleted successfully`);
  //           return {
  //             ...room,
  //             switches: room.switches.filter((sw) => sw._id !== switchId),
  //           };
  //         }
  //         return room;
  //       })
  //     );
  //   };

  // const toggleSwitch = (roomId: string, switchId: string, espId: string) => {
  //     const esp = rooms.find((room) => room.esp_id === roomId);
  //     const room_switch = esp?.switches.find((sw) => sw._id === switchId);

  //     /*if (websocketService.isConnected()) {
  //       // console.log('Sending WebSocket message');
  //       const message = {
  //         espId,
  //         switchId,
  //         state: !room_switch?.state,
  //       };
  //       // `${espId},${switchId},${!room_switch?.state ? 1 : 0}`
  //       websocketService.sendWebSocketMessage(JSON.stringify(message));
  //     }*/

  //     setRooms(
  //       rooms.map((room) => {
  //         if (room.esp_id === roomId) {
  //           return {
  //             ...room,
  //             switches: room.switches.map((sw) => {
  //               if (sw._id === switchId) {
  //                 const newState = !sw.state;
  //                 return { ...sw, state: newState };
  //               }
  //               return sw;
  //             }),
  //           };
  //         }
  //         return room;
  //       })
  //     );
  // };

  const reorderRooms = (startIndex: number, endIndex: number) => {
    const result = Array.from(rooms);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order property
    const updatedRooms = result.map((room, index) => ({
      ...room,
      order: index,
    }));

    setRooms(updatedRooms);
  };

  const reorderSwitches = (
    roomId: string,
    startIndex: number,
    endIndex: number
  ) => {
    setRooms(
      rooms.map((room) => {
        if (room.esp_id === roomId) {
          const newSwitches = Array.from(room.switches);
          const [removed] = newSwitches.splice(startIndex, 1);
          newSwitches.splice(endIndex, 0, removed);
          return { ...room, switches: newSwitches };
        }
        return room;
      })
    );
  };

  const contextValue = {
    rooms,
    setRooms,
    loading,
    addRoom,
    updateRoom,
    deleteRoom,
    // addSwitch,
    updateSwitch,
    // deleteSwitch,
    // toggleSwitch,
    reorderRooms,
    reorderSwitches,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};

export const useRooms = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    console.error('useRooms must be used within a RoomProvider');
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
};
