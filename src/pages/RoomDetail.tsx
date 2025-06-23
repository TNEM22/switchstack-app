import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { NavBar } from '@/components/NavBar';
import { useRooms } from '@/context/RoomContext';
import { SwitchItem } from '@/components/SwitchItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconSelector } from '@/components/IconSelector';
import {
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  ToggleRight,
  Move,
  Save,
  GripVertical,
  ArrowUp,
  ArrowDown,
  UserRoundCog,
  Loader2,
  UserPlus,
  X,
  Shield,
  User,
  Mail,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';
import { SERVER_URL } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { set } from 'react-hook-form';

// Add interface for room users
interface RoomUser {
  email: string;
  name?: string;
  isAdmin: boolean;
  avatar?: string;
}

const RoomUsersDialog = ({
  roomId,
  roomName,
  isOpen,
  onOpenChange,
}: {
  roomId: string;
  roomName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [removingUserEmail, setRemovingUserEmail] = useState<string | null>(
    null
  );
  const { user: currentUser } = useAuth();
  const isMobile = useIsMobile();

  const isCurrentUserAdmin =
    currentUser?.email === users.find((u) => u.isAdmin)?.email;

  // Define fetchUsers with useCallback to avoid dependency issues
  const fetchUsers = useCallback(async () => {
    if (!roomId || !currentUser) return;

    setLoadingUsers(true);
    try {
      // Fetch room users from the API
      const response = await axios.get(
        `${SERVER_URL}/api/v1/esps/${roomId}/users`,
        {
          withCredentials: true,
        }
      );

      setUsers(response.data.data.users || []);
    } catch (error) {
      toast.error('Failed to load room users');
    } finally {
      setLoadingUsers(false);
    }
  }, [roomId, currentUser]);

  // Fetch room users
  useEffect(() => {
    if (isOpen && roomId) {
      fetchUsers();
    }
  }, [isOpen, roomId, fetchUsers]);

  const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !roomId) return;

    toast.loading(`Adding ${newUserEmail}...`, {
      id: `adding-${newUserEmail}`,
    });
    setAddingUser(true);
    try {
      // Add user to the room via API
      const response = await axios.post(
        `${SERVER_URL}/api/v1/esps/${roomId}/users`,
        { userEmail: newUserEmail.trim() },
        {
          withCredentials: true,
        }
      );

      // toast.success(`Invitation sent to ${newUserEmail}`);
      toast.dismiss(`adding-${newUserEmail}`);
      toast.success(response.data.message || 'User added successfully');
      setNewUserEmail('');
      fetchUsers(); // Refresh the users list
    } catch (error) {
      //   console.log('Error adding user:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to add user'
        : 'Failed to add user';
      toast.dismiss(`adding-${newUserEmail}`);
      toast.error(errorMessage);
    } finally {
      setAddingUser(false);
    }
  };

  const removeUser = async (userEmail: string) => {
    if (!roomId) return;

    toast.loading(`Removing ${userEmail}...`, {
      id: `removing-${userEmail}`,
    });
    setRemovingUserEmail(userEmail);
    try {
      // Remove user from the room via API
      const response = await axios.delete(
        `${SERVER_URL}/api/v1/esps/${roomId}/users/${userEmail}`,
        {
          withCredentials: true,
        }
      );

      toast.dismiss(`removing-${userEmail}`);
      toast.success(response?.data?.message || 'User removed from room');
      setUsers(users.filter((user) => user.email !== userEmail));
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to remove user'
        : 'Failed to remove user';
      toast.dismiss(`removing-${userEmail}`);
      toast.error(errorMessage);
    } finally {
      setRemovingUserEmail(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon' className='h-9 w-9'>
          <UserRoundCog className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`w-[90vw] max-w-md mx-auto ${isMobile ? 'p-4' : 'p-6'}`}
      >
        <DialogHeader className={isMobile ? 'mb-2' : 'mb-0'}>
          <DialogTitle>Room Users</DialogTitle>
          <DialogDescription>
            Manage users for the room "{roomName}".
          </DialogDescription>
        </DialogHeader>

        <div className={isMobile ? 'py-2' : 'py-4'}>
          {/* User management content */}
          {loadingUsers ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
              <span className='ml-2'>Loading users...</span>
            </div>
          ) : (
            <>
              <ScrollArea className={`${isMobile ? 'h-48' : 'h-60'} pr-4`}>
                <div className='space-y-2'>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <div
                        key={user.email}
                        className={`flex items-center justify-between ${
                          isMobile ? 'p-2' : 'p-3'
                        } bg-muted/50 rounded-md`}
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar
                            className={isMobile ? 'h-8 w-8' : 'h-10 w-10'}
                          >
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {(user.name || user.email)
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex flex-col'>
                            <div className='flex items-center flex-wrap gap-1'>
                              <span className='font-medium truncate max-w-[120px] sm:max-w-full'>
                                {user.name || user.email.split('@')[0]}
                              </span>
                              {user.isAdmin && (
                                <Badge
                                  variant='outline'
                                  className='bg-primary/10 text-primary text-xs ml-1'
                                >
                                  <Shield className='h-3 w-3 mr-1' /> Admin
                                </Badge>
                              )}
                            </div>
                            <span className='text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[220px]'>
                              {user.email}
                            </span>
                          </div>
                        </div>
                        {!user.isAdmin && isCurrentUserAdmin && (
                          <Button
                            variant='destructive'
                            size='icon'
                            className={`${
                              isMobile ? 'h-7 w-7' : 'h-8 w-8'
                            } ml-1 flex-shrink-0`}
                            onClick={() => removeUser(user.email)}
                            disabled={removingUserEmail === user.email}
                          >
                            {removingUserEmail === user.email ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <X
                                className={`${
                                  isMobile ? 'h-3 w-3' : 'h-4 w-4'
                                }`}
                              />
                            )}
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      <UserRoundCog className='h-10 w-10 mx-auto mb-2 opacity-20' />
                      <p>No users added to this room yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Show Add User Form if the current user is admin */}
              {isCurrentUserAdmin && (
                <form
                  onSubmit={addUser}
                  className={`${isMobile ? 'mt-3 pt-3' : 'mt-4 pt-4'} border-t`}
                >
                  <Label
                    htmlFor='new-user-email'
                    className={`${isMobile ? 'mb-1' : 'mb-2'} block text-sm`}
                  >
                    Add New User
                  </Label>
                  <div className='flex gap-2'>
                    <div className='relative flex-1'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='new-user-email'
                        type='email'
                        placeholder='Email address'
                        className={`pl-9 ${isMobile ? 'text-sm h-9' : ''}`}
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      size={isMobile ? 'sm' : 'default'}
                      disabled={!newUserEmail.trim() || addingUser}
                    >
                      {addingUser ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin mr-2' />
                          {isMobile ? '' : 'Adding...'}
                        </>
                      ) : (
                        'Add'
                      )}
                    </Button>
                  </div>
                  <p
                    className={`text-xs text-muted-foreground ${
                      isMobile ? 'mt-1' : 'mt-2'
                    }`}
                  >
                    Once added, this user will have access to control this
                    device.
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function RoomDetail() {
  // console.log('Rendering RoomDetail component');

  const { roomId } = useParams<{ roomId: string }>();
  // console.log('Room ID from params:', roomId);

  // Debug if RoomContext is available
  const roomsContext = useRooms();
  // console.log('RoomContext available:', roomsContext ? 'Yes' : 'No');

  const { rooms, deleteRoom, updateRoom, reorderSwitches } = roomsContext;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // console.log('Rooms from context:', rooms);

  const room = rooms.find((r) => r.esp_id === roomId);
  //   console.log('Room found:', room);

  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomName, setRoomName] = useState(room?.name || '');
  const [roomIcon, setRoomIcon] = useState(room?.icon || 'house');
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);

  // Fetch room users
  useEffect(() => {
    if (isUserDialogOpen && roomId) {
      // fetchUsers();
    }
  }, [isUserDialogOpen, roomId]);

  const handleUpdateRoom = () => {
    if (roomName.trim()) {
      updateRoom(roomId!, { name: roomName.trim(), icon: roomIcon });
      setIsEditingRoom(false);
    }
  };

  const handleDeleteRoom = () => {
    setDeletingRoom(true);
    deleteRoom(
      roomId!,
      () => navigate('/'),
      () => setDeletingRoom(false)
    );
  };

  const toggleDraggingMode = () => {
    setIsDraggingEnabled(!isDraggingEnabled);
    if (!isDraggingEnabled) {
      //   toast.info(
      //     'Drag mode enabled. Rearrange your switches by dragging them.'
      //   );
      toast.info('Drag mode enabled');
    } else {
      toast.success('Switch positions saved');
    }
  };

  const moveSwitch = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Check if the new index is valid
    if (newIndex >= 0 && newIndex < room.switches.length) {
      reorderSwitches(roomId!, index, newIndex);
      //   toast.success(`Switch ${direction === 'up' ? 'moved up' : 'moved down'}`);
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

  return (
    <PageTransition>
      <div className='min-h-screen bg-background'>
        <NavBar />
        {room !== undefined ? (
          <div className='max-w-7xl mx-auto px-4 pb-6'>
            <div className='sticky top-[57px] bg-background/80 backdrop-blur-sm py-4 z-10 mb-4'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                {/* Header section with room name and icon */}
                <div className='flex items-center gap-4'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => navigate('/')}
                    className='rounded-full'
                  >
                    <ArrowLeft className='h-5 w-5' />
                  </Button>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 bg-primary/10 rounded-md'>
                      <DynamicIcon
                        name={room.icon}
                        className='h-5 w-5 text-primary'
                      />
                    </div>
                    <h1 className='text-xl md:text-2xl font-bold truncate max-w-[180px] md:max-w-full'>
                      {room.name}
                    </h1>
                  </div>
                </div>

                {/* Actions section with edit, delete, and dragging toggle buttons */}
                <div className='flex flex-wrap gap-2 ml-11 md:ml-0'>
                  {/* Room Users Management Dialog */}
                  <RoomUsersDialog
                    roomId={roomId!}
                    roomName={room.name}
                    isOpen={isUserDialogOpen}
                    onOpenChange={setIsUserDialogOpen}
                  />
                  {/* Edit room dialog */}
                  <Dialog open={isEditingRoom} onOpenChange={setIsEditingRoom}>
                    <DialogTrigger asChild>
                      <Button variant='outline' size='icon' className='h-9 w-9'>
                        <Edit className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Room</DialogTitle>
                      </DialogHeader>
                      <div className='grid gap-4 py-4'>
                        <div className='grid gap-2'>
                          <Label htmlFor='room-name'>Room Name</Label>
                          <Input
                            id='room-name'
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                          />
                        </div>
                        <div className='grid gap-2'>
                          <Label>Room Icon</Label>
                          <IconSelector
                            selectedIcon={roomIcon}
                            onSelectIcon={setRoomIcon}
                          />
                        </div>
                      </div>
                      <DialogFooter className='gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => setIsEditingRoom(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateRoom}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete room dialog */}
                  <Dialog
                    open={isDeletingRoom}
                    onOpenChange={setIsDeletingRoom}
                  >
                    <DialogTrigger asChild>
                      <Button variant='outline' size='icon' className='h-9 w-9'>
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Room</DialogTitle>
                        <DialogDescription>
                          <span className='text-base'>
                            Are you sure you want to delete{' '}
                            <strong>"{room.name}"</strong>?
                          </span>
                          <br />
                          <span className='font-bold text-destructive'>
                            This action cannot be undone.
                          </span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className='gap-2'>
                        <Button
                          variant='outline'
                          onClick={() => setIsDeletingRoom(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='destructive'
                          onClick={handleDeleteRoom}
                        >
                          {deletingRoom ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {room.switches.length > 1 && (
                    <Button
                      variant={isDraggingEnabled ? 'default' : 'outline'}
                      size={isMobile ? 'sm' : 'default'}
                      onClick={toggleDraggingMode}
                      className='flex gap-2 items-center'
                    >
                      {isDraggingEnabled ? (
                        <>
                          <Save className='h-4 w-4' />
                          {!isMobile && 'Save Positions'}
                        </>
                      ) : (
                        <>
                          <Move className='h-4 w-4' />
                          {!isMobile && 'Rearrange Switches'}
                        </>
                      )}
                    </Button>
                  )}

                  {/* <Button
                  onClick={() => setIsAddingSwitch(true)}
                  size={isMobile ? 'sm' : 'default'}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  {isMobile ? 'Add' : 'Add Switch'}
                </Button> */}
                </div>
              </div>
            </div>

            <motion.div
              variants={container}
              initial='hidden'
              animate='show'
              className='space-y-4'
            >
              <AnimatePresence>
                {room.switches.length > 0 ? (
                  room.switches.map((switchItem, index) => (
                    <motion.div
                      key={switchItem._id}
                      variants={item}
                      layout
                      transition={{
                        layout: { type: 'spring', stiffness: 300, damping: 30 },
                      }}
                      className={isDraggingEnabled ? 'relative' : ''}
                    >
                      <div className='flex items-stretch'>
                        {/* Show arrows for both mobile and desktop when in reordering mode */}
                        {isDraggingEnabled && (
                          <div className='flex flex-col justify-center mr-2 space-y-1'>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-8 w-8 rounded-full hover:bg-transparent'
                              onClick={() => moveSwitch(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-8 w-8 rounded-full hover:bg-transparent'
                              onClick={() => moveSwitch(index, 'down')}
                              disabled={index === room.switches.length - 1}
                            >
                              <ArrowDown className='h-4 w-4' />
                            </Button>
                          </div>
                        )}
                        <div className='flex-1'>
                          <SwitchItem
                            roomId={room.esp_id}
                            switchItem={switchItem}
                            onEdit={() => {}}
                            isPadded={isDraggingEnabled}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    variants={item}
                    className='flex flex-col items-center justify-center p-12 text-center'
                  >
                    <div className='rounded-full bg-primary/10 p-6 mb-4'>
                      <ToggleRight className='h-10 w-10 text-primary' />
                    </div>
                    <h3 className='text-xl font-semibold mb-2'>
                      No switches yet
                    </h3>
                    {/* <p className='text-muted-foreground mb-6'>
                    Add switches to control your devices in this room
                  </p> */}
                    {/* <Button onClick={() => setIsAddingSwitch(true)}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Your First Switch
                  </Button> */}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {isDraggingEnabled && isMobile && room.switches.length > 1 && (
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
        ) : (
          <div>Room Loading...</div>
        )}
      </div>
      {/* Switch adding form/dialog */}
      {/* <Dialog open={isAddingSwitch} onOpenChange={setIsAddingSwitch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Switch</DialogTitle>
            <DialogDescription>
              Create a new switch for {room.name}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='switch-name'>Switch Name</Label>
              <Input
                id='switch-name'
                placeholder='Main Light, TV, Fan, etc.'
                value={newSwitchName}
                onChange={(e) => setNewSwitchName(e.target.value)}
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
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddingSwitch(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSwitch}>Add Switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </PageTransition>
  );
}
