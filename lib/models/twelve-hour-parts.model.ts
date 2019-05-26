export class TwelveHourParts {
  hour: number;
  minute: number;
  isMorning: boolean;

  constructor(hour?: number, minute?: number, isMorning?: boolean) {
    this.hour = hour || 0;
    this.minute = minute || 0;
    this.isMorning = isMorning || false;
  }
}
