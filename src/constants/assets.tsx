import { PlayerColor } from '../types/game';
export const art = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`;
export const unitImage = (type: 'tank' | 'ship', color: PlayerColor) => art(`${type}-${color}`);
export const ART_FILES = ['tank-red', 'tank-blue', 'ship-red', 'ship-blue',
  'tank-red-drive', 'tank-blue-drive', 'terrain-land', 'terrain-sea',
  'scene-lobby', 'scene-victory', 'scene-victory-red', 'scene-defeat', 'fx-muzzle', 'fx-explosion', 'fx-splash', 'fx-wake', 'fx-shell', 'fx-dust'];
export async function preloadArt() {
  await Promise.all(ART_FILES.map(name => new Promise<void>((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve();
    img.onerror = () => reject(new Error(`资源加载失败：${name}`)); img.src = art(name);
  })));
}
