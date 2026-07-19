export interface Material {
  id: string;
  messageKey: string;
}

export const MATERIALS: Material[] = [
  { id: 'safety-glass', messageKey: 'safetyGlass' },
  { id: 'dibond', messageKey: 'dibond' },
  { id: 'acrylic-3', messageKey: 'acrylic3' },
  { id: 'acrylic-5', messageKey: 'acrylic5' },
  { id: 'acrylic-10', messageKey: 'acrylic10' },
  { id: 'acoustic-fabric', messageKey: 'acousticFabric' },
];
