import { useChamberStore } from '../../stores/chamberStore';
import LauncherEntry from './LauncherEntry';
import LauncherQuick from './LauncherQuick';
import LauncherCustom from './LauncherCustom';

export default function Launcher() {
  const launchMode = useChamberStore((s) => s.launchMode);

  if (launchMode === 'quick') return <LauncherQuick />;
  if (launchMode === 'custom') return <LauncherCustom />;
  return <LauncherEntry />;
}
