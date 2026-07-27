export interface RoleTheme {
  main: string;
  lightBg: string;
  darkBg: string;
  textOnColor: string;
}

export type RoleType = 
  | 'super_admin' 
  | 'tenant_admin' 
  | 'tenant_staff' 
  | 'viewer' 
  | 'support' 
  | 'billing' 
  | 'system';

export const ROLE_THEMES: Record<RoleType, RoleTheme> = {
  super_admin: {
    main: '#7C3AED',
    lightBg: '#EDE9FE',
    darkBg: '#4C1D95',
    textOnColor: '#FFFFFF',
  },
  tenant_admin: {
    main: '#2563EB',
    lightBg: '#DBEAFE',
    darkBg: '#1E40AF',
    textOnColor: '#FFFFFF',
  },
  tenant_staff: {
    main: '#0F766E',
    lightBg: '#CCFBF1',
    darkBg: '#134E4A',
    textOnColor: '#FFFFFF',
  },
  viewer: {
    main: '#16A34A',
    lightBg: '#DCFCE7',
    darkBg: '#166534',
    textOnColor: '#FFFFFF',
  },
  support: {
    main: '#F59E0B',
    lightBg: '#FEF3C7',
    darkBg: '#B45309',
    textOnColor: '#111827',
  },
  billing: {
    main: '#DC2626',
    lightBg: '#FEE2E2',
    darkBg: '#991B1B',
    textOnColor: '#FFFFFF',
  },
  system: {
    main: '#64748B',
    lightBg: '#E2E8F0',
    darkBg: '#334155',
    textOnColor: '#FFFFFF',
  },
};

/**
 * Normalizes user role inputs to matching color role keys.
 */
export function normalizeRole(role: string | undefined): RoleType {
  if (!role) return 'viewer';
  const r = role.toLowerCase().replace('-', '_');
  if (r === 'admin' || r === 'tenant_admin') return 'tenant_admin';
  if (r === 'staff' || r === 'tenant_staff') return 'tenant_staff';
  if (r === 'super_admin') return 'super_admin';
  if (r === 'support' || r === 'support_ops') return 'support';
  if (r === 'billing' || r === 'finance') return 'billing';
  if (r === 'system' || r === 'automation') return 'system';
  return 'viewer';
}

/**
 * Returns dynamic CSS variables for theme binding.
 */
export function getRoleThemeStyles(role: string | undefined): React.CSSProperties {
  const normalized = normalizeRole(role);
  const theme = ROLE_THEMES[normalized];
  return {
    '--role-main': theme.main,
    '--role-light-bg': theme.lightBg,
    '--role-dark-bg': theme.darkBg,
    '--role-text': theme.textOnColor,
  } as React.CSSProperties;
}
