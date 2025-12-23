export type LatLon = { lat: number; lon: number };

export type BBox = [west: number, south: number, east: number, north: number];

export type RegionBias =
  | { type: "none" }
  | {
      type: "centerRadius";
      center: LatLon;
      radiusMeters: number;
      strict?: boolean;
    }
  | {
      type: "bbox";
      bbox: BBox;
      strict?: boolean;
    };
