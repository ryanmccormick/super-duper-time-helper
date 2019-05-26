export class TimeBlock {
  inTime: Date | null;
  outTime: Date | null;

  constructor(inTime: null | Date = null, outTime: null | Date = null) {
    this.inTime = inTime;
    this.outTime = outTime;
  }
}
