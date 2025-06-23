import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DynamicIcon } from './DynamicIcon';

// Available icon names from lucide-react
const availableIcons = [
  'house',
  'lamp',
  'lightbulb',
  'monitor',
  'power',
  'toggle-left',
  'toggle-right',
  'settings',
  'bell',
  'circle',
  'plug',
  'lock',
  'door-closed',
  'menu',
  'arrow-down',
  'circle-check',
  'circle-x',
  'bell-ring',
];

interface IconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

export function IconSelector({
  selectedIcon,
  onSelectIcon,
}: IconSelectorProps) {
  return (
    <div className='border rounded-md p-2'>
      <ScrollArea className='h-[200px]'>
        <div className='grid grid-cols-4 gap-2 p-2'>
          {availableIcons.map((icon) => (
            <Button
              key={icon}
              variant='outline'
              size='icon'
              className={`h-12 w-12 ${
                selectedIcon === icon ? 'border-primary bg-primary/10' : ''
              }`}
              onClick={() => onSelectIcon(icon)}
            >
              <DynamicIcon name={icon} className='h-6 w-6' />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
