// Professional SVG Icon Components
// Replace all emojis with clean, professional SVG icons

import React from 'react';

// Paw Print Icon - for pet-related buttons
export const PawIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M8.35 3C9.53 2.83 10.78 4.12 11.14 5.9C11.5 7.67 10.85 9.25 9.67 9.43C8.5 9.6 7.24 8.31 6.87 6.54C6.5 4.77 7.17 3.18 8.35 3M15.5 3C16.68 3.18 17.35 4.77 17 6.54C16.62 8.31 15.37 9.6 14.19 9.43C13 9.25 12.35 7.67 12.72 5.9C13.08 4.12 14.33 2.83 15.5 3M3 7.6C4.14 7.11 5.69 8 6.5 9.55C7.26 11.13 7 12.79 5.87 13.28C4.74 13.77 3.2 12.89 2.41 11.32C1.62 9.75 1.9 8.08 3 7.6M21 7.6C22.1 8.08 22.38 9.75 21.59 11.32C20.8 12.89 19.26 13.77 18.13 13.28C17 12.79 16.74 11.13 17.5 9.55C18.31 8 19.86 7.11 21 7.6M12 22C7.5 22 4 17.89 4 15.5C4 14.12 5.62 13 7 13C8.06 13 9.67 13.59 12 15.25C14.33 13.59 15.94 13 17 13C18.38 13 20 14.12 20 15.5C20 17.89 16.5 22 12 22Z" />
    </svg>
);

// Heart Icon - for favorites and love
export const HeartIcon = ({ size = 20, color = 'currentColor', filled = true, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

// Bell/Notification Icon
export const BellIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

// User/Profile Icon
export const UserIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

// Logout/Exit Icon
export const LogoutIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

// Phone Icon
export const PhoneIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

// Email/Mail Icon
export const MailIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

// Arrow Right Icon
export const ArrowRightIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

// Arrow Left Icon
export const ArrowLeftIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

// Sparkle/Star Icon (for "Happy Tales" etc)
export const SparkleIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M12 2L13.09 8.26L19 6.5L15.18 11.5L21 14L14.69 14.41L16.5 21L12 16.36L7.5 21L9.31 14.41L3 14L8.82 11.5L5 6.5L10.91 8.26L12 2Z" />
    </svg>
);

// Facebook Icon
export const FacebookIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

// Instagram Icon
export const InstagramIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

// Twitter/X Icon
export const TwitterIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// Chat/Message Icon
export const ChatIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

// Sun Icon (for light mode)
export const SunIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

// Moon Icon (for dark mode)
export const MoonIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

// Close/X Icon
export const CloseIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// Check/Success Icon
export const CheckIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Warning Icon
export const WarningIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// Info Icon
export const InfoIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

// Home Icon
export const HomeIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

// Search Icon
export const SearchIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// Dog Icon
export const DogIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M18,4c-1,0-2,0.5-3,1.5c-1-1-2-1.5-3-1.5s-2,0.5-3,1.5c-1-1-2-1.5-3-1.5C4.5,4,3,5.5,3,7c0,1.5,1.5,3,3,4.5V20c0,0.5,0.5,1,1,1h10c0.5,0,1-0.5,1-1v-8.5c1.5-1.5,3-3,3-4.5C21,5.5,19.5,4,18,4z M8,18H6v-2h2V18z M8,14H6v-2h2V14z M12,18h-2v-2h2V18z M12,14h-2v-2h2V14z M16,18h-2v-2h2V18z M16,14h-2v-2h2V14z" />
    </svg>
);

// Cat Icon
export const CatIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M12,8L10.67,8.09C9.81,7.07 7.4,4.5 5,4.5C5,4.5 3.03,7.46 4.96,11.41C4.41,12.24 4.07,12.67 4,13.66L2.07,13.95L2.28,14.93L4.04,14.67L4.18,15.38L2.61,16.32L3.08,17.21L4.53,16.32C5.68,18.76 8.59,20 12,20C15.41,20 18.32,18.76 19.47,16.32L20.92,17.21L21.39,16.32L19.82,15.38L19.96,14.67L21.72,14.93L21.93,13.95L20,13.66C19.93,12.67 19.59,12.24 19.04,11.41C20.97,7.46 19,4.5 19,4.5C16.6,4.5 14.19,7.07 13.33,8.09L12,8M9,11A1,1 0 0,1 10,12A1,1 0 0,1 9,13A1,1 0 0,1 8,12A1,1 0 0,1 9,11M15,11A1,1 0 0,1 16,12A1,1 0 0,1 15,13A1,1 0 0,1 14,12A1,1 0 0,1 15,11Z" />
    </svg>
);

// Location/Map Pin Icon
export const LocationIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

// Calendar Icon
export const CalendarIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// Volunteer/Hands Icon
export const VolunteerIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
        <path d="M16.5,5C15.54,5 14.68,5.44 14.11,6.13L12,8.25L9.89,6.13C9.32,5.44 8.46,5 7.5,5C5.57,5 4,6.57 4,8.5C4,10.43 5.57,12 7.5,12H8.5L12,17L15.5,12H16.5C18.43,12 20,10.43 20,8.5C20,6.57 18.43,5 16.5,5M16.5,10H15L12,14.5L9,10H7.5C6.67,10 6,9.33 6,8.5C6,7.67 6.67,7 7.5,7C8.25,7 8.87,7.53 9,8.23L12,11L15,8.23C15.13,7.53 15.75,7 16.5,7C17.33,7 18,7.67 18,8.5C18,9.33 17.33,10 16.5,10Z" />
    </svg>
);

// Donate/Gift Icon
export const DonateIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);

// Send Icon
export const SendIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

// Menu/Hamburger Icon
export const MenuIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

// Loading Spinner
export const LoadingSpinner = ({ size = 24, color = 'currentColor', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
        <path d="M12 2C6.48 2 2 6.48 2 12" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export default {
    PawIcon,
    HeartIcon,
    BellIcon,
    UserIcon,
    LogoutIcon,
    PhoneIcon,
    MailIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    SparkleIcon,
    FacebookIcon,
    InstagramIcon,
    TwitterIcon,
    ChatIcon,
    SunIcon,
    MoonIcon,
    CloseIcon,
    CheckIcon,
    WarningIcon,
    InfoIcon,
    HomeIcon,
    SearchIcon,
    DogIcon,
    CatIcon,
    LocationIcon,
    CalendarIcon,
    VolunteerIcon,
    DonateIcon,
    SendIcon,
    MenuIcon,
    LoadingSpinner,
};
