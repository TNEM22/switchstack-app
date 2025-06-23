import {
  House,
  Lamp,
  Lightbulb,
  Monitor,
  Power,
  ToggleLeft,
  ToggleRight,
  Settings,
  Bell,
  Circle,
  Plug,
  Lock,
  DoorClosed,
  Menu,
  ArrowDown,
  CircleCheck,
  CircleX,
  BellRing,
  LucideIcon,
} from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  house: House,
  lamp: Lamp,
  lightbulb: Lightbulb,
  monitor: Monitor,
  power: Power,
  'toggle-left': ToggleLeft,
  'toggle-right': ToggleRight,
  settings: Settings,
  bell: Bell,
  circle: Circle,
  plug: Plug,
  lock: Lock,
  'door-closed': DoorClosed,
  menu: Menu,
  'arrow-down': ArrowDown,
  'circle-check': CircleCheck,
  'circle-x': CircleX,
  'bell-ring': BellRing,
};

export function DynamicIcon({ name, className }: DynamicIconProps) {
  // Default to Circle icon if not found
  const IconComponent = iconMap[name] || Circle;

  return <IconComponent className={className} />;
}
