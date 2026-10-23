import {
  Boxes,
  Brain,
  Code2,
  Layers,
  MapPin,
  Network,
  Search,
  Swords,
  Trees,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { FamilyId } from '../../registry';

/**
 * Icons for the registry's families and tools. The registry itself stays
 * free of UI imports so the shell can read it without pulling anything
 * heavy; the two places that render it share this map.
 */
export const familyIcons: Record<FamilyId, LucideIcon> = {
  sorting: Layers,
  searching: Search,
  pathfinding: MapPin,
  graph: Network,
  trees: Trees,
  recursion: Boxes,
  dp: Brain,
};

export const toolIcons: Record<string, LucideIcon> = {
  arena: Swords,
  playground: Code2,
  quiz: Trophy,
};
