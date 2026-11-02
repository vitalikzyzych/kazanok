import {
  AddRegular,
  ArrowCounterclockwiseRegular,
  ArrowLeftRegular,
  BookRegular,
  BowlChopsticksRegular,
  CartRegular,
  CheckmarkRegular,
  ChevronDownRegular,
  ClipboardPasteRegular,
  ClockRegular,
  CopyRegular,
  DarkThemeRegular,
  DeleteRegular,
  DismissRegular,
  EditRegular,
  ErrorCircleRegular,
  type FluentIcon as FluentIconComponent,
  HeartFilled,
  HeartRegular,
  ImageRegular,
  MoreHorizontalRegular,
  PauseRegular,
  PlayRegular,
  SearchRegular,
  SubtractRegular,
  TimerRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from "@fluentui/react-icons";

/**
 * Named imports, so only the icons listed here end up in the bundle.
 * Add an entry to use a new icon.
 */
const ICONS = {
  Add: AddRegular,
  ArrowCounterclockwise: ArrowCounterclockwiseRegular,
  ArrowLeft: ArrowLeftRegular,
  Book: BookRegular,
  Bowl: BowlChopsticksRegular,
  Cart: CartRegular,
  Checkmark: CheckmarkRegular,
  ChevronDown: ChevronDownRegular,
  ClipboardPaste: ClipboardPasteRegular,
  Clock: ClockRegular,
  Copy: CopyRegular,
  DarkTheme: DarkThemeRegular,
  Delete: DeleteRegular,
  Dismiss: DismissRegular,
  Edit: EditRegular,
  ErrorCircle: ErrorCircleRegular,
  Heart: HeartRegular,
  HeartFilled: HeartFilled,
  Image: ImageRegular,
  More: MoreHorizontalRegular,
  Pause: PauseRegular,
  Play: PlayRegular,
  Search: SearchRegular,
  Subtract: SubtractRegular,
  Timer: TimerRegular,
  WeatherMoon: WeatherMoonRegular,
  WeatherSunny: WeatherSunnyRegular,
} satisfies Record<string, FluentIconComponent>;

export type IconName = keyof typeof ICONS;

interface IFluentIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const FluentIcon = ({ name, size = 24, className }: IFluentIconProps) => {
  const Icon = ICONS[name];
  return <Icon fontSize={size} className={className} aria-hidden />;
};

export default FluentIcon;
