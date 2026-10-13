import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faTriangleExclamation, faBoxArchive, faBan, faBell, faBoxesStacked, faCheck,
  faCircleCheck, faChevronDown, faClipboardList, faMoneyBillWave, faEye, faEyeSlash, faFileLines,
  faGripVertical, faHeart, faStar, faCircleInfo, faLayerGroup, faGauge, faRightFromBracket, faEnvelope,
  faEnvelopeOpen, faLocationDot, faBars, faQuoteRight, faMinus, faMoon, faNewspaper, faBox, faPen,
  faPhone, faPlus, faRotateLeft, faGear, faShieldHalved, faBagShopping, faCartShopping, faSliders,
  faSun, faTag, faTags, faTrash, faTruck, faUpload, faUser, faCircleUser, faUserGear, faUsers,
  faXmark, faCircleXmark, faArrowRight, faShareNodes, faImage, faLock, faCalendar, faCreditCard,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular, faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faGoogle, faFacebookF, faInstagram, faXTwitter, faWhatsapp, faLinkedinIn, faGithub,
} from '@fortawesome/free-brands-svg-icons';

/**
 * Builds a component with a size/className/style API so call sites stay simple:
 *   <Search size={18} />
 * `size` is in px. Font Awesome icons are always crisp SVG; strokeWidth is not applicable.
 */
function make(icon, regularIcon) {
  function Icon({ size = 16, className, style, fill, title, ...rest }) {
    // For icons that have a filled/outline pair (heart, star): fill="none" => outline version.
    const useRegular = regularIcon && (fill === 'none' || fill === undefined);
    const tint = fill && fill !== 'none' && fill !== 'currentColor' ? fill : undefined;
    return (
      <FontAwesomeIcon
        icon={useRegular ? regularIcon : icon}
        className={className}
        title={title}
        style={{ fontSize: size, width: '1em', height: '1em', flexShrink: 0, color: tint, ...style }}
        aria-hidden={title ? undefined : true}
        {...(rest['aria-label'] ? { 'aria-label': rest['aria-label'], 'aria-hidden': undefined } : {})}
      />
    );
  }
  return Icon;
}

// Interface icons
export const Search = make(faMagnifyingGlass);
export const AlertTriangle = make(faTriangleExclamation);
export const Archive = make(faBoxArchive);
export const Ban = make(faBan);
export const Bell = make(faBell);
export const Boxes = make(faBoxesStacked);
export const Check = make(faCheck);
export const CheckCircle = make(faCircleCheck);
export const CheckCircle2 = make(faCircleCheck);
export const ChevronDown = make(faChevronDown);
export const ClipboardList = make(faClipboardList);
export const DollarSign = make(faMoneyBillWave); // PKR store — generic money icon, not a dollar sign
export const Eye = make(faEye);
export const EyeOff = make(faEyeSlash);
export const FileText = make(faFileLines);
export const GripVertical = make(faGripVertical);
export const Heart = make(faHeart, faHeartRegular);
export const Info = make(faCircleInfo);
export const Layers = make(faLayerGroup);
export const LayoutDashboard = make(faGauge);
export const LogOut = make(faRightFromBracket);
export const Mail = make(faEnvelope);
export const MailOpen = make(faEnvelopeOpen);
export const MapPin = make(faLocationDot);
export const Menu = make(faBars);
export const MessageSquareQuote = make(faQuoteRight);
export const Minus = make(faMinus);
export const Moon = make(faMoon);
export const Newspaper = make(faNewspaper);
export const Package = make(faBox);
export const Pencil = make(faPen);
export const Phone = make(faPhone);
export const Plus = make(faPlus);
export const RotateCcw = make(faRotateLeft);
export const Settings = make(faGear);
export const ShieldCheck = make(faShieldHalved);
export const ShoppingBag = make(faBagShopping);
export const ShoppingCart = make(faCartShopping);
export const SlidersHorizontal = make(faSliders);
export const Star = make(faStar, faStarRegular);
export const Sun = make(faSun);
export const Tag = make(faTag);
export const Tags = make(faTags);
export const Trash2 = make(faTrash);
export const Truck = make(faTruck);
export const Upload = make(faUpload);
export const User = make(faUser);
export const UserCircle = make(faCircleUser);
export const UserCog = make(faUserGear);
export const Users = make(faUsers);
export const X = make(faXmark);
export const XCircle = make(faCircleXmark);
export const ArrowRight = make(faArrowRight);
export const Share = make(faShareNodes);
export const ImageIcon = make(faImage);
export const Lock = make(faLock);
export const Calendar = make(faCalendar);
export const CreditCard = make(faCreditCard);

// Brand icons
export const Google = make(faGoogle);
export const Facebook = make(faFacebookF);
export const Instagram = make(faInstagram);
export const Twitter = make(faXTwitter);
export const WhatsApp = make(faWhatsapp);
export const LinkedIn = make(faLinkedinIn);
export const GitHub = make(faGithub);
