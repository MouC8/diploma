export enum QrPosition {
    TOP_LEFT = 'TOP_LEFT',
    TOP_RIGHT = 'TOP_RIGHT',
    BOTTOM_LEFT = 'BOTTOM_LEFT',
    BOTTOM_RIGHT = 'BOTTOM_RIGHT',
    CENTER = 'CENTER',
  }
  
  export class OverlayOptionsDto {
    qrSize?: number;
    position?: QrPosition;
    x?: number;
    y?: number;
    margin?: number;
  }
  