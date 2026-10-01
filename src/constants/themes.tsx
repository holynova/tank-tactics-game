export type ThemeKey = 'land' | 'sea';
export interface Theme { name: string; unitType: 'tank' | 'ship'; codename: string }
export const THEMES: Record<ThemeKey, Theme> = {
  land: { name: '陆战风云', unitType: 'tank', codename: 'DUST FRONT' },
  sea: { name: '怒海争锋', unitType: 'ship', codename: 'DEEP BLUE' }
};
export const FACTIONS = {
  red: { name: '赤铁军团', tank: '重装攻城坦克', ship: '重型战列舰', code: 'IRON LEGION' },
  blue: { name: '苍蓝先锋', tank: '快速侦察坦克', ship: '导弹驱逐舰', code: 'AZURE VANGUARD' }
};
