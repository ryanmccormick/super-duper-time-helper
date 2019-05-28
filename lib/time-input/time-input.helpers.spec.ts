import {
  calcTimeWorked,
  checkIs12HourTime,
  checkIs24HourTime,
  convertDateToTimeString,
  convertDoubleDigitString,
  convertTwelveToTwentyFourHourParts,
  convertTwentyFourToTwelveHourParts,
  editableTimeBlockList,
  findOverlappingRangesByIndex,
  formatEntriesForSave,
  getDateFromInput,
  getSanitizedDate,
  parse12HourTime,
  parse24HourTime,
  parseTwelveHourParts,
  parseTwentyFourHourParts,
  timeBlockToNumberRangeItem,
  timeInputIsValid,
  timeWorkedDisplay,
} from './time-input.helpers';
import { TwelveHourParts, TwentyFourHourParts, TimeBlock, TimeBlockCalc } from '../models';

describe('Time input pure function helpers', () => {
  let dateReference: Date;

  beforeEach(() => {
    dateReference = new Date(1546656089025);
    dateReference.setHours(0);
    dateReference.setMinutes(0);
    dateReference.setSeconds(0);
    dateReference.setMilliseconds(0);
  });

  describe('timeWorkedDisplay', () => {
    it('should be defined', () => {
      expect(timeWorkedDisplay).toBeDefined();
    });

    it('should display time based on a TimeBlockCalc object', () => {
      const input = { hours: 1, minutes: 31 };
      const expected = '1h 31m';
      expect(timeWorkedDisplay(input)).toEqual(expected);
    });

    it('should only display minutes when hours are zero', () => {
      const input = { hours: 0, minutes: 31 };
      const expected = '31m';
      expect(timeWorkedDisplay(input)).toEqual(expected);
    });

    it('should display an empty string when input is null', () => {
      // @ts-ignore
      expect(timeWorkedDisplay(null)).toEqual('');
    });

    it('should display an empty string when input is junk', () => {
      // @ts-ignore
      expect(timeWorkedDisplay({ inasd: 'asdsdasd' })).toEqual('');
    });

    it('should display an empty string when input is undefined', () => {
      // @ts-ignore
      expect(timeWorkedDisplay()).toEqual('');
    });
  });

  describe('calcTimeWorked', () => {
    it('should be defined', () => {
      expect(calcTimeWorked).toBeDefined();
    });

    it('should calculate the time worked between two date objects', () => {
      const baseDate = getSanitizedDate();
      const timeBlock = new TimeBlock(getDateFromInput('8:00am', baseDate), getDateFromInput('11:31am', baseDate));
      const expected: TimeBlockCalc = { hours: 3, minutes: 31 };
      expect(calcTimeWorked(timeBlock)).toEqual(expected);
    });

    it('should calculate zero hours and the minutes worked between two date objects', () => {
      const baseDate = getSanitizedDate();
      const timeBlock = new TimeBlock(getDateFromInput('8:00am', baseDate), getDateFromInput('8:31am', baseDate));
      const expected: TimeBlockCalc = { hours: 0, minutes: 31 };
      expect(calcTimeWorked(timeBlock)).toEqual(expected);
    });

    it('should return null when the out time is before the in time', () => {
      const baseDate = getSanitizedDate();
      const timeBlock = new TimeBlock(getDateFromInput('8:00pm', baseDate), getDateFromInput('11:31am', baseDate));
      expect(calcTimeWorked(timeBlock)).toEqual(null);
    });

    it('should return null when the input is junk', () => {
      // @ts-ignore
      expect(calcTimeWorked({ in: 'aksbjdkabsd' })).toEqual(null);
    });

    it('should return null when the input is null', () => {
      // @ts-ignore
      expect(calcTimeWorked(null)).toEqual(null);
    });

    it('should return null when the input is undefined', () => {
      // @ts-ignore
      expect(calcTimeWorked()).toEqual(null);
    });
  });

  describe('formatEntriesForSave', () => {
    it('should be defined', () => {
      expect(formatEntriesForSave).toBeDefined();
    });

    it('will remove unnecessary null rows and order by start time', () => {
      const baseDate = getSanitizedDate();
      const input = [
        { inTime: getDateFromInput('2:30pm', baseDate), outTime: getDateFromInput('5:00pm', baseDate) },
        { inTime: null, outTime: null },
        { inTime: getDateFromInput('11:30am', baseDate), outTime: getDateFromInput('2:00pm', baseDate) },
        { inTime: null, outTime: null },
        { inTime: getDateFromInput('8:00am', baseDate), outTime: getDateFromInput('11:00am', baseDate) },
        { inTime: getDateFromInput('6:00pm', baseDate), outTime: null },
        { inTime: null, outTime: null },
        { inTime: null, outTime: null },
        { inTime: null, outTime: null },
      ];
      const expected = [
        { inTime: getDateFromInput('8:00am', baseDate), outTime: getDateFromInput('11:00am', baseDate) },
        { inTime: getDateFromInput('11:30am', baseDate), outTime: getDateFromInput('2:00pm', baseDate) },
        { inTime: getDateFromInput('2:30pm', baseDate), outTime: getDateFromInput('5:00pm', baseDate) },
        { inTime: getDateFromInput('6:00pm', baseDate), outTime: null },
      ];
      const result = formatEntriesForSave(input);
      expect(result).toEqual(expected);
    });
  });

  describe('editableTimeBlockList', () => {
    it('should be defined', () => {
      expect(editableTimeBlockList).toBeDefined();
    });

    it('should add a blank row to an empty list', () => {
      const input: any = [];
      const expected = [{ inTime: null, outTime: null }];
      const result = editableTimeBlockList(input);
      expect(result).toEqual(expected);
    });

    it('should add a blank row to a list of items that have a final row that is complete', () => {
      const baseDate = getSanitizedDate();
      const input = [
        { inTime: getDateFromInput('8:00am', baseDate), outTime: getDateFromInput('11:00am', baseDate) },
        { inTime: getDateFromInput('11:30am', baseDate), outTime: getDateFromInput('5:00pm', baseDate) },
      ];
      const expected = [
        { inTime: getDateFromInput('8:00am', baseDate), outTime: getDateFromInput('11:00am', baseDate) },
        { inTime: getDateFromInput('11:30am', baseDate), outTime: getDateFromInput('5:00pm', baseDate) },
        { inTime: null, outTime: null },
      ];
      const result = editableTimeBlockList(input);
      expect(result).toEqual(expected);
    });

    it('should not add a blank row to a list of items that have incomplete rows', () => {
      const baseDate = getSanitizedDate();
      const input = [
        { inTime: getDateFromInput('8:00am', baseDate), outTime: getDateFromInput('11:00am', baseDate) },
        { inTime: getDateFromInput('11:30am', baseDate), outTime: null },
      ];
      const expected = [
        { inTime: getDateFromInput('8:00am', baseDate), outTime: getDateFromInput('11:00am', baseDate) },
        { inTime: getDateFromInput('11:30am', baseDate), outTime: null },
        { inTime: null, outTime: null },
      ];
      const result = editableTimeBlockList(input);
      expect(result).toEqual(expected);
    });
  });

  describe('timeInputIsValid', () => {
    it('should be defined', () => {
      expect(timeInputIsValid).toBeDefined();
    });

    it('should return true when input is 12 hour time', () => {
      expect(timeInputIsValid('1:00am')).toEqual(true);
      expect(timeInputIsValid('11:00am')).toEqual(true);
      expect(timeInputIsValid('01:00am')).toEqual(true);
      expect(timeInputIsValid('12:00am')).toEqual(true);
      expect(timeInputIsValid('12:00pm')).toEqual(true);
    });

    it('should return true when input is 24 hour time', () => {
      expect(timeInputIsValid('0:00')).toEqual(true);
      expect(timeInputIsValid('00:00')).toEqual(true);
      expect(timeInputIsValid('05:00')).toEqual(true);
      expect(timeInputIsValid('5:00')).toEqual(true);
      expect(timeInputIsValid('15:00')).toEqual(true);
      expect(timeInputIsValid('23:00')).toEqual(true);
      expect(timeInputIsValid('23:59')).toEqual(true);
    });

    it('should return false when input is neither 12 or 24 hour time', () => {
      expect(timeInputIsValid('25:00')).toEqual(false);
      expect(timeInputIsValid('25:00pm')).toEqual(false);
      expect(timeInputIsValid('15:00pm')).toEqual(false);
      expect(timeInputIsValid('12')).toEqual(false);
      expect(timeInputIsValid('abcdef')).toEqual(false);
    });

    it('should return false when input is junk', () => {
      // @ts-ignore
      expect(timeInputIsValid({ time: 'akbhsdkbsd' })).toEqual(false);
    });

    it('should return false when input is null', () => {
      // @ts-ignore
      expect(timeInputIsValid(null)).toEqual(false);
    });

    it('should return false when input is undefined', () => {
      // @ts-ignore
      expect(timeInputIsValid()).toEqual(false);
    });
  });

  describe('findOverlappingRangesByIndex', () => {
    it('should be defined', () => {
      expect(findOverlappingRangesByIndex).toBeDefined();
    });

    it('should create a list of range index values that overlap with other values', () => {
      const ranges = [
        { index: 0, begin: 1, end: 10 },
        { index: 1, begin: 11, end: 15 }, // overlapped
        { index: 2, begin: 14, end: 20 }, // overlap
        { index: 3, begin: 22, end: 30 }, // overlapped
        { index: 4, begin: 31, end: 60 }, // overlapped
        { index: 5, begin: 85, end: 122 }, // overlapped
        { index: 6, begin: 90, end: 160 }, // overlap
        { index: 7, begin: 70, end: 80 },
        { index: 8, begin: 61, end: 65 },
        { index: 9, begin: 23, end: 32 }, // overlap two
        { index: 10, begin: 169, end: 189 },
      ];

      const expected = [1, 2, 3, 4, 5, 6, 9];

      const results = findOverlappingRangesByIndex(ranges);
      expect(results.length).toEqual(7);
      expect(results[0]).toEqual(expected[0]);
      expect(results[1]).toEqual(expected[1]);
      expect(results[2]).toEqual(expected[2]);
      expect(results[3]).toEqual(expected[3]);
      expect(results[4]).toEqual(expected[4]);
      expect(results[5]).toEqual(expected[5]);
      expect(results[6]).toEqual(expected[6]);
    });
  });

  describe('timeBlockToNumberRangeItem', () => {
    it('should be defined', () => {
      expect(timeBlockToNumberRangeItem).toBeDefined();
    });

    it('should take in a timeblock object and return a timeBlockItem', () => {
      const timeBlock = new TimeBlock();
      timeBlock.inTime = new Date(1546783200000);
      timeBlock.outTime = new Date(1546795800000);

      const result = timeBlockToNumberRangeItem(timeBlock);
      // @ts-ignore
      const { begin, end } = result;
      expect(begin).toEqual(1546783200000);
      expect(end).toEqual(1546795800000);
    });
  });

  describe('convertTwentyFourToTwelveHourParts', () => {
    it('should be defined', () => {
      expect(convertTwentyFourToTwelveHourParts).toBeDefined();
    });

    it('should take twenty four hour parts for 00:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 0, minute: 0 };
      const expected: TwelveHourParts = { hour: 12, minute: 0, isMorning: true };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 03:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 3, minute: 0 };
      const expected: TwelveHourParts = { hour: 3, minute: 0, isMorning: true };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 06:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 6, minute: 0 };
      const expected: TwelveHourParts = { hour: 6, minute: 0, isMorning: true };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 06:01 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 6, minute: 1 };
      const expected: TwelveHourParts = { hour: 6, minute: 1, isMorning: true };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 09:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 9, minute: 0 };
      const expected: TwelveHourParts = { hour: 9, minute: 0, isMorning: true };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 12:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 12, minute: 0 };
      const expected: TwelveHourParts = { hour: 12, minute: 0, isMorning: false };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 15:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 15, minute: 0 };
      const expected: TwelveHourParts = { hour: 3, minute: 0, isMorning: false };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 18:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 18, minute: 0 };
      const expected: TwelveHourParts = { hour: 6, minute: 0, isMorning: false };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 21:00 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 21, minute: 0 };
      const expected: TwelveHourParts = { hour: 9, minute: 0, isMorning: false };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should take twenty four hour parts for 23:59 and return twelve hour equivalent', () => {
      const input: TwentyFourHourParts = { hour: 23, minute: 59 };
      const expected: TwelveHourParts = { hour: 11, minute: 59, isMorning: false };
      const result = convertTwentyFourToTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });
  });

  describe('convertTwelveToTwentyFourHourParts', () => {
    it('should be defined', () => {
      expect(convertTwelveToTwentyFourHourParts).toBeDefined();
    });

    it('should take twelve hour parts for 12:00am and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 12, minute: 0, isMorning: true };
      const expected: TwentyFourHourParts = { hour: 0, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 12:01am and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 12, minute: 1, isMorning: true };
      const expected: TwentyFourHourParts = { hour: 0, minute: 1 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 3:00am and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 3, minute: 0, isMorning: true };
      const expected: TwentyFourHourParts = { hour: 3, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 6:00am and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 6, minute: 0, isMorning: true };
      const expected: TwentyFourHourParts = { hour: 6, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 6:01am and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 6, minute: 1, isMorning: true };
      const expected: TwentyFourHourParts = { hour: 6, minute: 1 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 9:00am and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 9, minute: 0, isMorning: true };
      const expected: TwentyFourHourParts = { hour: 9, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 12:00pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 12, minute: 0, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 12, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 12:01pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 12, minute: 1, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 12, minute: 1 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 3:00pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 3, minute: 0, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 15, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 6:00pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 6, minute: 0, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 18, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 9:00pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 9, minute: 0, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 21, minute: 0 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 9:01pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 9, minute: 1, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 21, minute: 1 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('should take twelve hour parts for 11:59pm and return twenty four hour equivalent', () => {
      const input: TwelveHourParts = { hour: 11, minute: 59, isMorning: false };
      const expected: TwentyFourHourParts = { hour: 23, minute: 59 };
      const result = convertTwelveToTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });
  });

  describe('parseTwentyFourHourParts', () => {
    it('should be defined', () => {
      expect(parseTwentyFourHourParts).toBeDefined();
    });

    it('return time parts for 00:00', () => {
      const input = '00:00';
      const expected: TwentyFourHourParts = { hour: 0, minute: 0 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 00:01', () => {
      const input = '00:01';
      const expected: TwentyFourHourParts = { hour: 0, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 03:01', () => {
      const input = '03:01';
      const expected: TwentyFourHourParts = { hour: 3, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 06:01', () => {
      const input = '06:01';
      const expected: TwentyFourHourParts = { hour: 6, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 09:01', () => {
      const input = '09:01';
      const expected: TwentyFourHourParts = { hour: 9, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 12:01', () => {
      const input = '12:01';
      const expected: TwentyFourHourParts = { hour: 12, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 15:01', () => {
      const input = '15:01';
      const expected: TwentyFourHourParts = { hour: 15, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 18:00', () => {
      const input = '18:00';
      const expected: TwentyFourHourParts = { hour: 18, minute: 0 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 21:01', () => {
      const input = '21:01';
      const expected: TwentyFourHourParts = { hour: 21, minute: 1 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });

    it('return time parts for 21:59', () => {
      const input = '21:59';
      const expected: TwentyFourHourParts = { hour: 21, minute: 59 };
      const result = parseTwentyFourHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
    });
  });

  describe('parseTwelveHourParts', () => {
    it('should be defined', () => {
      expect(parseTwelveHourParts).toBeDefined();
    });

    it('should return time parts for 12:01am', () => {
      const input = '12:01am';
      const expected: TwelveHourParts = { hour: 12, minute: 1, isMorning: true };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 3:01am', () => {
      const input = '3:01am';
      const expected: TwelveHourParts = { hour: 3, minute: 1, isMorning: true };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 6:01am', () => {
      const input = '6:01am';
      const expected: TwelveHourParts = { hour: 6, minute: 1, isMorning: true };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 9:01am', () => {
      const input = '9:01am';
      const expected: TwelveHourParts = { hour: 9, minute: 1, isMorning: true };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 12:01pm', () => {
      const input = '12:01pm';
      const expected: TwelveHourParts = { hour: 12, minute: 1, isMorning: false };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 3:00pm', () => {
      const input = '3:00pm';
      const expected: TwelveHourParts = { hour: 3, minute: 0, isMorning: false };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 6:01pm', () => {
      const input = '6:01pm';
      const expected: TwelveHourParts = { hour: 6, minute: 1, isMorning: false };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 9:01pm', () => {
      const input = '9:01pm';
      const expected: TwelveHourParts = { hour: 9, minute: 1, isMorning: false };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });

    it('should return time parts for 11:59pm', () => {
      const input = '11:59pm';
      const expected: TwelveHourParts = { hour: 11, minute: 59, isMorning: false };
      const result = parseTwelveHourParts(input);
      expect(result.hour).toEqual(expected.hour);
      expect(result.minute).toEqual(expected.minute);
      expect(result.isMorning).toEqual(expected.isMorning);
    });
  });

  describe('getSanitizedDate', () => {
    it('should be defined', () => {
      expect(getSanitizedDate).toBeDefined();
    });

    it('should return a date with the same date, hours and minutes with 0 for seconds and milliseconds', () => {
      const startDate = new Date();
      const result = getSanitizedDate(startDate);
      expect(result.getSeconds()).toEqual(0);
      expect(result.getMilliseconds()).toEqual(0);
    });

    it('should return a new date object and not modify the input date', () => {
      const startDate = new Date();
      const result = getSanitizedDate(startDate);
      expect(result).not.toEqual(startDate);
    });
  });

  describe('parse24HourTime', () => {
    let baseDate: Date;

    beforeEach(() => {
      const newbaseDate = new Date();
      newbaseDate.setHours(0);
      newbaseDate.setMinutes(0);
      newbaseDate.setSeconds(0);
      newbaseDate.setMilliseconds(0);
      baseDate = newbaseDate;
    });

    it('should be defined', () => {
      expect(parse24HourTime).toBeDefined();
    });

    /* 00:00
    -------------------------------------*/
    it('should parse 00:00 to a date object of midnight', () => {
      const input = '00:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(0);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 00:00 to a date object of the same day', () => {
      const input = '00:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(0);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 03:00
    -------------------------------------*/
    it('should parse 03:00 to a date object', () => {
      const input = '03:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(3);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 03:00 to a date object of the same day', () => {
      const input = '03:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(3);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 06:00
    -------------------------------------*/
    it('should parse 06:00 to a date object', () => {
      const input = '06:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(6);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 06:00 to a date object of the same day', () => {
      const input = '06:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(6);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 09:00
    -------------------------------------*/
    it('should parse 09:00 to a date object', () => {
      const input = '09:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(9);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 09:00 to a date object of the same day', () => {
      const input = '09:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(9);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 12:00
    -------------------------------------*/
    it('should parse 12:00 to a date object', () => {
      const input = '12:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(12);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 12:00 to a date object of the same day', () => {
      const input = '12:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(12);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 15:00
    -------------------------------------*/
    it('should parse 15:00 to a date object', () => {
      const input = '15:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(15);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 15:00 to a date object of the same day', () => {
      const input = '15:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(15);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 18:00
    -------------------------------------*/
    it('should parse 18:00 to a date object', () => {
      const input = '18:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(18);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 18:00 to a date object of the same day', () => {
      const input = '18:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(18);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 21:00
    -------------------------------------*/
    it('should parse 21:00 to a date object', () => {
      const input = '21:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(21);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 21:00 to a date object of the same day', () => {
      const input = '21:00';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(21);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 21:59
    -------------------------------------*/
    it('should parse 21:59 to a date object', () => {
      const input = '21:59';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(21);
      comparisonDate.setMinutes(59);
      const result = parse24HourTime(input, baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 21:59 to a date object of the same day', () => {
      const input = '21:59';
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(21);
      comparisonDate.setMinutes(59);
      const result = parse24HourTime(input, baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });
  });

  describe('parse12HourTime', () => {
    let baseDate: Date;

    beforeEach(() => {
      const newbaseDate = new Date();
      newbaseDate.setHours(0);
      newbaseDate.setMinutes(0);
      newbaseDate.setSeconds(0);
      newbaseDate.setMilliseconds(0);
      baseDate = newbaseDate;
    });

    it('should be defined', () => {
      expect(parse12HourTime).toBeDefined();
    });

    /* 12:00am
    -------------------------------------*/
    it('should parse 12:00am to a date object of midnight', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(0);
      const result = parse12HourTime('12:00am', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 12:00am to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(0);
      const result = parse12HourTime('12:00am', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 3:00am
    -------------------------------------*/
    it('should parse 3:00am to a date object of midnight', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(3);
      const result = parse12HourTime('3:00am', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 3:00am to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(3);
      const result = parse12HourTime('3:00am', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 6:00am
    -------------------------------------*/
    it('should parse 6:00am to a date object of midnight', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(6);
      const result = parse12HourTime('6:00am', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 6:00am to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(6);
      const result = parse12HourTime('6:00am', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 9:00am
    -------------------------------------*/
    it('should parse 9:00am to a date object of midnight', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(9);
      const result = parse12HourTime('9:00am', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 9:00am to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(9);
      const result = parse12HourTime('9:00am', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 12:00pm
    -------------------------------------*/
    it('should parse 12:00pm to a date object of noon', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(12);
      const result = parse12HourTime('12:00pm', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 12:00pm to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(12);
      const result = parse12HourTime('12:00pm', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 3:00pm
    -------------------------------------*/
    it('should parse 3:00pm to a date object of noon', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(15);
      const result = parse12HourTime('3:00pm', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 3:00pm to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(15);
      const result = parse12HourTime('3:00pm', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 6:00pm
    -------------------------------------*/
    it('should parse 6:00pm to a date object of noon', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(18);
      const result = parse12HourTime('6:00pm', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 6:00pm to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(18);
      const result = parse12HourTime('6:00pm', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });

    /* 9:00pm
    -------------------------------------*/
    it('should parse 9:00pm to a date object of noon', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(21);
      const result = parse12HourTime('9:00pm', baseDate);
      const resultHours = result.getHours();
      const comparisonHours = comparisonDate.getHours();

      expect(resultHours).toEqual(comparisonHours);
    });

    it('should parse 9:00pm to a date object of the same day', () => {
      const comparisonDate = new Date(baseDate);
      comparisonDate.setHours(21);
      const result = parse12HourTime('9:00pm', baseDate);
      const resultDay = result.getDate();
      const comparisonDay = comparisonDate.getDate();

      expect(resultDay).toEqual(comparisonDay);
    });
  });

  describe('convertDateToTimeString', () => {
    it('should be defined', () => {
      expect(convertDateToTimeString).toBeDefined();
    });

    it('should return a date string for am time', () => {
      dateReference.setHours(5);
      dateReference.setMinutes(0);
      const expected = '5:00am';
      expect(convertDateToTimeString(dateReference)).toEqual(expected);
    });

    it('should return a date string for pm time', () => {
      dateReference.setHours(14);
      dateReference.setMinutes(0);
      const expected = '2:00pm';
      expect(convertDateToTimeString(dateReference)).toEqual(expected);
    });

    it('should return a date string for midnight time', () => {
      dateReference.setHours(0);
      dateReference.setMinutes(0);
      const expected = '12:00am';
      expect(convertDateToTimeString(dateReference)).toEqual(expected);
    });

    it('should return a date string for afternoon time', () => {
      dateReference.setHours(0);
      dateReference.setMinutes(0);
      const expected = '12:00am';
      expect(convertDateToTimeString(dateReference)).toEqual(expected);
    });

    it('will fail gracefully when passed a null value', () => {
      // @ts-ignore
      expect(convertDateToTimeString(null)).toEqual('');
    });

    it('will fail gracefully when passed a junk value', () => {
      // @ts-ignore
      expect(convertDateToTimeString({ iam: 'junk' })).toEqual('');
    });

    it('will fail gracefully when passed an undefined value', () => {
      // @ts-ignore
      expect(convertDateToTimeString()).toEqual('');
    });
  });

  describe('convertDoubleDigitString', () => {
    it('should be defined', () => {
      expect(convertDoubleDigitString).toBeDefined();
    });

    it('should convert a single digit number to a string with a leading zero', () => {
      expect(convertDoubleDigitString(5)).toEqual('05');
    });

    it('should pass through any double digit values', () => {
      expect(convertDoubleDigitString(20)).toEqual('20');
    });
  });

  describe('checkIs24HourTime', () => {
    it('should be defined', () => {
      expect(checkIs24HourTime).toBeDefined();
    });

    it('should return true when a supplied value is recognized as 24 hour time', () => {
      expect(checkIs24HourTime('05:00')).toEqual(true);
      expect(checkIs24HourTime('5:00')).toEqual(true);
      expect(checkIs24HourTime('23:55')).toEqual(true);
      expect(checkIs24HourTime('9:02')).toEqual(true);
      expect(checkIs24HourTime('9:53')).toEqual(true);
      expect(checkIs24HourTime('9:43')).toEqual(true);
      expect(checkIs24HourTime('9:33')).toEqual(true);
      expect(checkIs24HourTime('9:23')).toEqual(true);
      expect(checkIs24HourTime('9:13')).toEqual(true);
      expect(checkIs24HourTime('9:03')).toEqual(true);
      expect(checkIs24HourTime('09:02')).toEqual(true);
      expect(checkIs24HourTime('09:53')).toEqual(true);
      expect(checkIs24HourTime('09:43')).toEqual(true);
      expect(checkIs24HourTime('09:33')).toEqual(true);
      expect(checkIs24HourTime('09:23')).toEqual(true);
      expect(checkIs24HourTime('09:13')).toEqual(true);
      expect(checkIs24HourTime('09:03')).toEqual(true);
      expect(checkIs24HourTime('10:02')).toEqual(true);
      expect(checkIs24HourTime('11:02')).toEqual(true);
      expect(checkIs24HourTime('12:02')).toEqual(true);
      expect(checkIs24HourTime('13:02')).toEqual(true);
      expect(checkIs24HourTime('15:04')).toEqual(true);
      expect(checkIs24HourTime('16:17')).toEqual(true);
      expect(checkIs24HourTime('16:26')).toEqual(true);
      expect(checkIs24HourTime('16:36')).toEqual(true);
      expect(checkIs24HourTime('16:46')).toEqual(true);
      expect(checkIs24HourTime('16:56')).toEqual(true);
      expect(checkIs24HourTime('17:50')).toEqual(true);
      expect(checkIs24HourTime('18:50')).toEqual(true);
      expect(checkIs24HourTime('19:50')).toEqual(true);
      expect(checkIs24HourTime('20:50')).toEqual(true);
      expect(checkIs24HourTime('21:50')).toEqual(true);
      expect(checkIs24HourTime('22:50')).toEqual(true);
      expect(checkIs24HourTime('23:50')).toEqual(true);
      expect(checkIs24HourTime('00:50')).toEqual(true);
    });

    it('should return false when a value is not recognized as 24 hour time', () => {
      expect(checkIs24HourTime('09:13pm')).toEqual(false);
      expect(checkIs24HourTime('09:03am')).toEqual(false);
      expect(checkIs24HourTime('10:02pm')).toEqual(false);
      expect(checkIs24HourTime('11:02pm')).toEqual(false);
      expect(checkIs24HourTime('12:02pm')).toEqual(false);
      expect(checkIs24HourTime('13:02pm')).toEqual(false);
    });

    it('should return false when provided with an invalid value', () => {
      expect(checkIs24HourTime('kjabsdkhbasd')).toEqual(false);
    });

    it('should return false when provided with a value of the wrong type', () => {
      // @ts-ignore
      expect(checkIs24HourTime({ val: 'aksjdbakjsd' })).toEqual(false);
    });

    it('should return false when provided with a value of null', () => {
      // @ts-ignore
      expect(checkIs24HourTime(null)).toEqual(false);
    });

    it('should return false when provided with undefined', () => {
      // @ts-ignore
      expect(checkIs24HourTime()).toEqual(false);
    });
  });

  describe('checkIs12HourTime', () => {
    it('should be defined', () => {
      expect(checkIs12HourTime).toBeDefined();
    });

    it('should return true if a supplied value is recognized as 12 hour time', () => {
      expect(checkIs12HourTime('1:22am')).toEqual(true);
      expect(checkIs12HourTime('2:22am')).toEqual(true);
      expect(checkIs12HourTime('3:22am')).toEqual(true);
      expect(checkIs12HourTime('4:22am')).toEqual(true);
      expect(checkIs12HourTime('5:22am')).toEqual(true);
      expect(checkIs12HourTime('6:22pm')).toEqual(true);
      expect(checkIs12HourTime('7:22pm')).toEqual(true);
      expect(checkIs12HourTime('8:22pm')).toEqual(true);
      expect(checkIs12HourTime('9:22pm')).toEqual(true);
      expect(checkIs12HourTime('10:22pm')).toEqual(true);
      expect(checkIs12HourTime('11:22pm')).toEqual(true);
      expect(checkIs12HourTime('12:22pm')).toEqual(true);
      expect(checkIs12HourTime('01:22am')).toEqual(true);
      expect(checkIs12HourTime('02:22am')).toEqual(true);
      expect(checkIs12HourTime('03:22am')).toEqual(true);
      expect(checkIs12HourTime('04:22am')).toEqual(true);
      expect(checkIs12HourTime('05:22am')).toEqual(true);
      expect(checkIs12HourTime('06:22pm')).toEqual(true);
      expect(checkIs12HourTime('07:22pm')).toEqual(true);
      expect(checkIs12HourTime('08:22pm')).toEqual(true);
      expect(checkIs12HourTime('09:22pm')).toEqual(true);
      expect(checkIs12HourTime('10:22pm')).toEqual(true);
      expect(checkIs12HourTime('11:22pm')).toEqual(true);
      expect(checkIs12HourTime('12:22pm')).toEqual(true);
    });

    it('should return false when the input value is not 12 hour time', () => {
      expect(checkIs12HourTime('13:22am')).toEqual(false);
      expect(checkIs12HourTime('24:22am')).toEqual(false);
      expect(checkIs12HourTime('3:65am')).toEqual(false);
      expect(checkIs12HourTime('22:22')).toEqual(false);
      expect(checkIs12HourTime('13:22am')).toEqual(false);
      expect(checkIs12HourTime('05:00')).toEqual(false);
      expect(checkIs12HourTime('00:22pm')).toEqual(false);
      expect(checkIs12HourTime('16:22pm')).toEqual(false);
    });

    it('should fail gracefully when supplied with bad input', () => {
      expect(checkIs12HourTime('sdfdfsdfsdf')).toEqual(false);
    });

    it('should fail gracefully when supplied with invalid input', () => {
      // @ts-ignore
      expect(checkIs12HourTime({ val: 'sdfdfsdfsdf' })).toEqual(false);
    });

    it('should fail gracefully when supplied with null input', () => {
      // @ts-ignore
      expect(checkIs12HourTime(null)).toEqual(false);
    });

    it('should fail gracefully when supplied with undefined input', () => {
      // @ts-ignore
      expect(checkIs12HourTime()).toEqual(false);
    });

    it('should fail gracefully when supplied with junk input', () => {
      // @ts-ignore
      expect(checkIs12HourTime(new RegExp('2334'))).toEqual(false);
    });
  });
});
