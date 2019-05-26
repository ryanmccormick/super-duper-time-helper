export class TwentyFourHourParts {
  hour: number;
  minute: number;

  constructor(hour?: number, minute?: number) {
    this.hour = hour || 0;
    this.minute = minute || 0;
  }
}
