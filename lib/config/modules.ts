import {
    LayoutDashboard,
    Users,
    GraduationCap,
    FileText,
    Settings,
    Briefcase,
    UserPlus,
    Calendar,
    Clock,
    MapPin,
    BookOpen,
    Languages,
    Award,
    Globe,
    User,
    ShieldCheck,
    Shield,
    type LucideIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MODULE CONFIG  — Single Source of Truth
//
// To add a new module:
//   1. Add ONE entry to NAV_ITEMS below.
//   2. In the backend controller, use @RequirePermissions({ module: '<permissionModule>', ... })
//   3. Done — sidebar and roles matrix update automatically.
//
// Fields:
//   permissionModule  — must match the module name used in backend @RequirePermissions
//   label             — human-readable name shown in sidebar & roles table
//   href              — route path
//   icon              — Lucide icon component
//   ownerBased        — true if this module supports "View Own / View All" (owner filtering)
// ─────────────────────────────────────────────────────────────────────────────

export interface NavItem {
    /** Backend permission module key — must match @RequirePermissions module name */
    permissionModule: string;
    /** Display label for sidebar and roles table */
    label: string;
    /** Route href */
    href: string;
    /** Lucide icon */
    icon: LucideIcon;
    /**
     * If true, this module supports View Own / View All (owner-based row filtering).
     * If false, the roles UI hides those columns and auto-grants 'view' with 'menu_access'.
     */
    ownerBased: boolean;
}

export const NAV_ITEMS: NavItem[] = [
    // ── Core ─────────────────────────────────────────────────────────────
    { permissionModule: 'Dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, ownerBased: false },
    { permissionModule: 'Leads', label: 'Leads', href: '/leads', icon: UserPlus, ownerBased: true },
    { permissionModule: 'Students', label: 'Students', href: '/students', icon: Users, ownerBased: true },
    { permissionModule: 'Applications', label: 'Applications', href: '/applications', icon: FileText, ownerBased: true },

    // ── Academic ──────────────────────────────────────────────────────────
    // Semesters shares the 'Academic Years' permission module
    { permissionModule: 'Academic Years', label: 'Academic Years', href: '/academic-years', icon: Calendar, ownerBased: false },
    { permissionModule: 'Academic Years', label: 'Semesters', href: '/semesters', icon: Clock, ownerBased: false },

    // ── Programs ──────────────────────────────────────────────────────────
    // Degrees shares the 'Programs' permission module
    { permissionModule: 'Programs', label: 'Programs', href: '/programs', icon: GraduationCap, ownerBased: false },
    { permissionModule: 'Programs', label: 'Degrees', href: '/degrees', icon: GraduationCap, ownerBased: false },

    // ── Faculties ─────────────────────────────────────────────────────────
    // Specialties shares the 'Faculties' permission module
    { permissionModule: 'Faculties', label: 'Faculties', href: '/faculties', icon: BookOpen, ownerBased: false },
    { permissionModule: 'Faculties', label: 'Specialties', href: '/specialties', icon: Award, ownerBased: false },

    // ── Geography ─────────────────────────────────────────────────────────
    { permissionModule: 'Countries & Cities', label: 'Countries', href: '/countries', icon: Globe, ownerBased: false },
    { permissionModule: 'Countries & Cities', label: 'Cities', href: '/cities', icon: MapPin, ownerBased: false },

    // ── Localization ──────────────────────────────────────────────────────
    { permissionModule: 'Languages & Titles', label: 'Languages', href: '/languages', icon: Languages, ownerBased: false },
    { permissionModule: 'Languages & Titles', label: 'Titles', href: '/titles', icon: FileText, ownerBased: false },

    // ── Partners ──────────────────────────────────────────────────────────
    { permissionModule: 'Agents', label: 'Agents', href: '/agents', icon: Briefcase, ownerBased: false },

    // ── Admin ─────────────────────────────────────────────────────────────
    { permissionModule: 'User Management', label: 'Users', href: '/users', icon: ShieldCheck, ownerBased: false },
    { permissionModule: 'Roles & Permissions', label: 'Roles', href: '/roles', icon: Shield, ownerBased: false },
    { permissionModule: 'Settings', label: 'Settings', href: '/settings', icon: Settings, ownerBased: false },
    { permissionModule: 'Profile', label: 'Profile', href: '/profile', icon: User, ownerBased: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Derived lists — used by roles page and sidebar automatically
// ─────────────────────────────────────────────────────────────────────────────

/** Unique permission module keys — used in the roles permission matrix */
export const PERMISSION_MODULES = [...new Set(NAV_ITEMS.map(item => item.permissionModule))];

/** Permission modules that support View Own / View All */
export const OWNER_BASED_MODULES = [...new Set(
    NAV_ITEMS.filter(item => item.ownerBased).map(item => item.permissionModule)
)];
