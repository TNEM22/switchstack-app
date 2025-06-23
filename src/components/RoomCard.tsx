import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, Route, RouteOff } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useWebSocket } from '@/context/WebSocketContext';
import { useRooms, Room, Switch as SwitchType } from '@/context/RoomContext';

import { DynamicIcon } from './DynamicIcon';

interface RoomCardProps {
  room: Room;
  index?: number;
  isDesktop?: boolean;
  isDraggingEnabled?: boolean;
  isLastItem?: boolean;
}

export function RoomCard({
  room,
  index,
  isDesktop = false,
  isDraggingEnabled = false,
  isLastItem = false,
}: RoomCardProps) {
  // const [isHovered, setIsHovered] = useState(false);
  // const { toggleSwitch, reorderRooms } = useRooms();
  //   const isDeviceOnline = false;
  const { reorderRooms } = useRooms();
  const { toggleSwitch } = useWebSocket();

  const activeSwitches = room.switches.filter((sw) => sw.state).length;
  const totalSwitches = room.switches.length;

  // console.log(room);

  const handleSwitchToggle = (e: React.MouseEvent, switchItem: SwitchType) => {
    e.preventDefault();
    e.stopPropagation();
    // toggleSwitch(room.esp_id, switchItem._id);
    toggleSwitch(room.esp_id, switchItem._id, switchItem.esp);
  };

  const moveUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof index === 'number' && index > 0) {
      reorderRooms(index, index - 1);
    }
  };

  const moveDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof index === 'number') {
      reorderRooms(index, index + 1);
    }
  };

  return (
    <Link to={`/rooms/${room.esp_id}`} className='block'>
      <motion.div
        // whileHover={{ scale: 1.02 }}
        // whileTap={{ scale: 0.98 }}
        // onHoverStart={() => setIsHovered(true)}
        // onHoverEnd={() => setIsHovered(false)}
        className='relative'
      >
        {isDesktop && isDraggingEnabled && (
          <div className='absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10'>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8 rounded-full hover:bg-background shadow-md'
              onClick={moveUp}
              disabled={typeof index !== 'number' || index === 0}
            >
              <ChevronUp className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8 rounded-full hover:bg-background shadow-md'
              onClick={moveDown}
              disabled={isLastItem}
            >
              <ChevronDown className='h-4 w-4' />
            </Button>
          </div>
        )}
        <Card className='room-card overflow-hidden h-full'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <motion.div
                // animate={
                //   isHovered
                //     ? { rotate: 10, scale: 1.1 }
                //     : { rotate: 0, scale: 1 }
                // }
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <DynamicIcon name={room.icon} className='h-5 w-5' />
              </motion.div>
              <div className='flex-1 flex justify-between'>
                {room.name}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {room.isOnline ? (
                        <Badge
                          variant='outline'
                          className='gap-1 border-green-500 text-green-500'
                        >
                          <Route className='h-3 w-3' />
                          <span className='hidden md:inline'>Connected</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='gap-1 border-destructive text-destructive cursor-pointer hover:bg-destructive/10'
                        >
                          <RouteOff className='h-3 w-3' />
                          <span>Disconnected</span>
                        </Badge>
                      )}
                    </TooltipTrigger>
                    <TooltipContent className='z-20'>
                      {room.isOnline ? 'Device is online' : 'Device is offline'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-2'>
              {/* {room.switches.slice(0, 4).map((sw) => ( */}
              {room.switches.map((sw) => (
                <motion.div
                  key={sw._id}
                  className={`flex flex-col items-center p-2 rounded-lg cursor-pointer ${
                    sw.state ? 'bg-primary/10' : 'bg-secondary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleSwitchToggle(e, sw)}
                >
                  <DynamicIcon
                    name={sw.icon ?? 'toggle-left'}
                    className={`h-6 w-6 mb-1 ${
                      sw.state ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span className='text-xs truncate w-full text-center'>
                    {sw.name ?? 'Switch'}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            {/* <Badge className='bg-primary/15 hover:bg-primary/20 text-foreground'> */}
            <Badge className='bg-primary/20 text-foreground'>
              {activeSwitches} of {totalSwitches} active
            </Badge>
            {room.type === 'demo' && (
              <Badge className='ml-2 bg-green-500/55 text-foreground'>
                Demo Room
              </Badge>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
