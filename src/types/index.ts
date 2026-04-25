export interface Camera {
  id: number;
  name: string;
}

export interface LineConfig {
  cy: number;
  offsetX: number;
  angle: number;
  tolerance: number;
  confidence: number;
}

export interface Detection {
  id: number;
  bbox: [number, number, number, number];
}

export interface TrackerStats {
  entries: number;
  exits: number;
}

export interface TrackerData {
  state: string;
  image: string | null;
  detections: Detection[];
  stats: TrackerStats;
  hardware?: {
    ram: { used: number; total: number; percentage: number };
    gpu: { used: number; total: number; percentage: number };
  };
  cameras?: Camera[];
}
