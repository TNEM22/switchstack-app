import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { NavBar } from '@/components/NavBar';
import { useRooms } from '@/context/RoomContext';
import { RoomCard } from '@/components/RoomCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  House,
  House as HouseIcon,
  Move,
  Save,
  GripVertical,
  MoveVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { IconSelector } from '@/components/IconSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';

export default function Dashboard() {
  const { rooms, addRoom, reorderRooms } = useRooms();
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('house');
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);
  const isMobile = useIsMobile();

  const handleAddRoom = async () => {
    if (newRoomName.trim() && newDeviceId.trim()) {
      addRoom(newRoomName.trim(), newDeviceId.trim(), selectedIcon, () => {
        setNewRoomName('');
        setNewDeviceId('');
        setSelectedIcon('house');
        setIsAddingRoom(false);
      });
    }
  };

  const toggleDraggingMode = () => {
    setIsDraggingEnabled(!isDraggingEnabled);
    if (!isDraggingEnabled) {
      //   toast.info('Drag mode enabled. Rearrange your rooms by dragging them.');
      toast.info('Drag mode enabled');
    } else {
      toast.success('Room positions saved');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Function to move a room up in the order
  const moveRoomUp = (index: number) => {
    if (index > 0) {
      reorderRooms(index, index - 1);
      //   toast.success('Room moved up');
    }
  };

  // Function to move a room down in the order
  const moveRoomDown = (index: number) => {
    if (index < rooms.length - 1) {
      reorderRooms(index, index + 1);
      //   toast.success('Room moved down');
    }
  };

  return (
    <PageTransition>
      <div className='min-h-screen bg-background'>
        <NavBar />
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4'>
            <div>
              <h1 className='text-2xl font-bold'>My Home</h1>
              <p className='text-muted-foreground'>
                Manage your rooms and switches
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              {rooms && rooms.length > 0 && (
                <Button
                  variant={isDraggingEnabled ? 'default' : 'outline'}
                  onClick={toggleDraggingMode}
                  className='flex gap-2 items-center'
                >
                  {isDraggingEnabled ? (
                    <>
                      <Save className='h-4 w-4' />
                      Save Positions
                    </>
                  ) : (
                    <>
                      <Move className='h-4 w-4' />
                      Rearrange Rooms
                    </>
                  )}
                </Button>
              )}
              <Button onClick={() => setIsAddingRoom(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Add Room
              </Button>
            </div>
          </div>

          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative'
          >
            <AnimatePresence>
              {rooms && rooms.length > 0 ? (
                rooms.map((room, index) => (
                  <motion.div
                    key={room.esp_id}
                    variants={item}
                    layout
                    transition={{
                      layout: { type: 'spring', stiffness: 300, damping: 30 },
                    }}
                    className={`${isDraggingEnabled ? 'relative' : ''}`}
                  >
                    {isMobile ? (
                      /* For mobile, use context menu for better drag experience */
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div className='relative'>
                            {isDraggingEnabled && (
                              <div className='absolute left-2 top-4 bg-primary/10 rounded-full p-1 z-10 flex flex-col items-center gap-1 shadow-sm'>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7 rounded-full bg-primary/20 hover:bg-primary/20'
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    moveRoomUp(index);
                                  }}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className='h-4 w-4 text-primary' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7 rounded-full bg-primary/20 hover:bg-primary/20'
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    moveRoomDown(index);
                                  }}
                                  disabled={index === rooms.length - 1}
                                >
                                  <ChevronDown className='h-4 w-4 text-primary' />
                                </Button>
                              </div>
                            )}
                            <div className={isDraggingEnabled ? 'pl-10' : ''}>
                              <RoomCard room={room} />
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className='w-48'>
                          <ContextMenuItem
                            className='flex items-center cursor-pointer'
                            onClick={() => moveRoomUp(index)}
                            disabled={index === 0}
                          >
                            <ChevronUp className='mr-2 h-4 w-4' />
                            <span>Move Up</span>
                          </ContextMenuItem>
                          <ContextMenuItem
                            className='flex items-center cursor-pointer'
                            onClick={() => moveRoomDown(index)}
                            disabled={index === rooms.length - 1}
                          >
                            <ChevronDown className='mr-2 h-4 w-4' />
                            <span>Move Down</span>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ) : (
                      /* Enhanced desktop drag experience */
                      <RoomCard
                        room={room}
                        index={index}
                        isDesktop={!isMobile}
                        isDraggingEnabled={isDraggingEnabled}
                        isLastItem={index === rooms.length - 1}
                      />
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  variants={item}
                  className='col-span-full flex flex-col items-center justify-center p-12 text-center'
                >
                  <div className='rounded-full bg-primary/10 p-6 mb-4'>
                    <HouseIcon className='h-10 w-10 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold mb-2'>No rooms yet</h3>
                  <p className='text-muted-foreground mb-6'>
                    Create your first room to get started with SwitchStack
                  </p>
                  <Button onClick={() => setIsAddingRoom(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Your First Room
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {isDraggingEnabled && isMobile && (
            <div className='fixed bottom-4 left-0 right-0 flex justify-center'>
              <Button
                size='lg'
                onClick={toggleDraggingMode}
                className='rounded-full shadow-lg'
              >
                <Save className='h-4 w-4 mr-2' />
                Save Positions
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room and customize it with an icon.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='room-name'>Room Name</Label>
              <Input
                id='room-name'
                placeholder='Living Room, Kitchen, etc.'
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='device-name'>Device Id</Label>
              <Input
                id='device-name'
                placeholder='For Demo use demo'
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Select Icon</Label>
              <IconSelector
                selectedIcon={selectedIcon}
                onSelectIcon={setSelectedIcon}
              />
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setIsAddingRoom(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRoom}>Add Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
