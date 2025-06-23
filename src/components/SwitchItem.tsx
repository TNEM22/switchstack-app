import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Settings, Pencil, Trash2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { useWebSocket } from '@/context/WebSocketContext';
import { useRooms, Switch as SwitchType } from '@/context/RoomContext';

import { DynamicIcon } from './DynamicIcon';
import { IconSelector } from './IconSelector';

interface SwitchItemProps {
  roomId: string;
  switchItem: SwitchType;
  onEdit: () => void;
  isPadded?: boolean;
}

export function SwitchItem({
  roomId,
  switchItem,
  onEdit,
  isPadded = false,
}: SwitchItemProps) {
  //   const { toggleSwitch, updateSwitch } = useRooms();
  const { updateSwitch } = useRooms();
  const { toggleSwitch } = useWebSocket();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(switchItem.name ?? 'Switch');
  const [selectedIcon, setSelectedIcon] = useState(
    switchItem.icon ?? 'toggle-left'
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // toggleSwitch(roomId, switchItem._id);
    toggleSwitch(roomId, switchItem._id, switchItem.esp);
  };

  //   const handleDelete = (e: React.MouseEvent) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     deleteSwitch(roomId, switchItem._id);
  //   };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleUpdate = () => {
    updateSwitch(roomId, switchItem._id, {
      name,
      icon: selectedIcon,
    });
    setIsEditing(false);
  };

  return (
    <>
      <motion.div
        whileHover={{
          y: -2,
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`p-4 flex justify-between items-center ${
            isPadded ? 'pl-12' : ''
          }`}
        >
          <div className='flex items-center space-x-3'>
            <div
              className={`p-2 rounded-md ${
                switchItem.state ? 'bg-primary/20' : 'bg-secondary'
              }`}
            >
              <DynamicIcon
                name={switchItem.icon ?? 'toggle-left'}
                className={`h-5 w-5 ${
                  switchItem.state ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
            </div>
            <div className='text-left'>
              <p className='font-medium'>{switchItem.name ?? 'Switch'}</p>
              <p className='text-xs text-muted-foreground'>
                {switchItem.state ? 'ON' : 'OFF'}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              size='sm'
              variant={switchItem.state ? 'default' : 'outline'}
              onClick={handleToggle}
              className={`transition-all duration-300 ${
                switchItem.state ? 'bg-primary hover:bg-primary/90' : ''
              }`}
            >
              {switchItem.state ? 'ON' : 'OFF'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className='h-4 w-4 mr-2' />
                  Edit
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  onClick={handleDelete}
                  className='text-destructive'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Switch</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Icon</Label>
              <IconSelector
                selectedIcon={selectedIcon}
                onSelectIcon={setSelectedIcon}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
