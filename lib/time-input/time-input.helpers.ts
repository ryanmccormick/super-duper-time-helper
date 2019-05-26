import { TwelveHourParts } from '../models/twelve-hour-parts.model';
import { TwentyFourHourParts } from '../models/twenty-four-hour-parts.model';
import { NumberRangeItem } from '../models/number-range-item.model';
import { TimeBlock } from '../models/time-block.model';
import { TimeBlockCalc } from '../models/time-block-calc.model';

export function timeWorkedDisplay(timeBlockCalc: TimeBlockCalc): string {
  try {
    const { hours, minutes } = timeBlockCalc;
    const hourDisplay = hours > 0 ? `${hours}h` : '';
    const minuteDisplay = minutes > 0 ? `${minutes}m` : '';
    return [hourDisplay, minuteDisplay].join(' ').trim();
  } catch (exception) {
    return '';
  }
}

export function calcTimeWorked(timeBlock: TimeBlock): TimeBlockCalc | null {
  try {
    const { inTime, outTime } = timeBlock;

    if (!!inTime && !!outTime) {
      const timeInMs = inTime.getTime();
      const timeOutMs = outTime.getTime();

      // Return null when end time is before start time.
      if (timeOutMs < timeInMs) {
        return null;
      }

      const x = timeOutMs - timeInMs;
      const y = 60 * 60 * 1000;
      const h = Math.floor(x / y);
      const m = (x - h * y) / (y / 60);

      return {
        hours: h,
        minutes: m,
      };
    } else {
      return null;
    }
  } catch (exception) {
    return null;
  }
}

export function formatEntriesForSave(value: Array<TimeBlock> = []): Array<TimeBlock> {
  return value
    .filter((item: TimeBlock) => {
      try {
        const { inTime, outTime } = item;
        return !(inTime === null && outTime === null);
      } catch (exception) {
        return false;
      }
    })
    .sort((a: TimeBlock, b: TimeBlock) => {
      try {
        const timeStart = a.inTime!.getTime();
        const timeEnd = b.inTime!.getTime();

        if (timeStart < timeEnd) {
          return -1;
        }

        if (timeStart > timeEnd) {
          return 1;
        }

        return 0;
      } catch (exception) {
        return 0;
      }
    });
}

/**
 * Adds an empty TimeBlock object to the end of a list when the list is either
 * empty or all other items have been added.
 *
 * @param {Array<TimeBlock>} value Source list.
 * @returns {Array<TimeBlock>} Formatted list.
 */
export function editableTimeBlockList(value: Array<TimeBlock> = []): Array<TimeBlock> {
  if (value.length > 0) {
    // filter out all rows where both values are null.
    const _value = [...value];

    const lastItem = _value[_value.length - 1];
    const { inTime, outTime } = lastItem;

    if (inTime instanceof Date || outTime instanceof Date) {
      return _value.concat([{ inTime: null, outTime: null }]);
    } else {
      return _value;
    }
  } else {
    return [{ inTime: null, outTime: null }];
  }
}

export function findOverlappingRangesByIndex(value: Array<NumberRangeItem>): Array<number> {
  return value
    .reduce((acc: Array<number>, curr: NumberRangeItem, index: number, array: Array<NumberRangeItem>) => {
      array.forEach((item: NumberRangeItem) => {
        const testItemIndex = curr.index,
          testItemBegin = curr.begin;

        if (testItemBegin >= item.begin && testItemBegin <= item.end && testItemIndex !== item.index) {
          if (acc.indexOf(testItemIndex) === -1) {
            acc.push(testItemIndex);
          }

          if (acc.indexOf(item.index) === -1) {
            acc.push(item.index);
          }
        }
      });

      return acc;
    }, [])
    .sort();
}

export function timeBlockToNumberRangeItem(value: TimeBlock): NumberRangeItem | null {
  if (!!value) {
    const { inTime, outTime } = value;
    const numberRangeItem = new NumberRangeItem();
    numberRangeItem.begin = inTime!.getTime();
    numberRangeItem.end = outTime!.getTime();
    return numberRangeItem;
  }

  return null;
}

export function getDateFromInput(value: string, baseDate: Date): Date | null {
  const _value = value.toLowerCase();

  if (checkIs24HourTime(_value)) {
    return parse24HourTime(_value, baseDate);
  } else if (checkIs12HourTime(_value)) {
    return parse12HourTime(_value, baseDate);
  } else {
    return null;
  }
}

export function convertDateToTimeString(value: Date): string {
  try {
    const currentHour = value.getHours();
    const currentMinute = value.getMinutes();
    const isMorning = currentHour >= 0 && currentHour < 12;

    const convertedHour = isMorning ? currentHour : currentHour - 12;
    const displayHour = convertedHour === 0 ? '12' : convertedHour;

    return `${displayHour}:${convertDoubleDigitString(currentMinute)}${isMorning ? 'am' : 'pm'}`;
  } catch (exception) {
    return '';
  }
}

export function parse24HourTime(value: string, baseDate: Date): Date {
  const payload = getSanitizedDate(baseDate);
  const parts = parseTwentyFourHourParts(value);
  const { hour, minute } = parts;
  payload.setHours(hour);
  payload.setMinutes(minute);
  return payload;
}

export function parse12HourTime(value: string, baseDate: Date): Date {
  const payload = getSanitizedDate(baseDate);
  const parts = parseTwelveHourParts(value);
  const converted = convertTwelveToTwentyFourHourParts(parts);
  const { hour, minute } = converted;
  payload.setHours(hour);
  payload.setMinutes(minute);
  return payload;
}

export function parseTwelveHourParts(value: string): TwelveHourParts {
  const _value = value.toLowerCase();
  const payload = new TwelveHourParts();
  const parts = _value.trim().split(':');
  payload.hour = parseInt(parts[0], 10);
  payload.minute = parseInt(parts[1], 10);
  payload.isMorning = parts[1].indexOf('am') > -1;
  return payload;
}

export function parseTwentyFourHourParts(value: string): TwentyFourHourParts {
  const _value = value.toLowerCase();
  const payload = new TwentyFourHourParts();
  const parts = _value.trim().split(':');
  payload.hour = parseInt(parts[0], 10);
  payload.minute = parseInt(parts[1], 10);
  return payload;
}

export function convertTwelveToTwentyFourHourParts(value: TwelveHourParts): TwentyFourHourParts {
  const payload = new TwentyFourHourParts();
  const { hour, minute, isMorning } = value;

  if (isMorning) {
    payload.hour = hour === 12 ? 0 : hour;
  } else {
    payload.hour = hour === 12 ? hour : hour + 12;
  }

  payload.minute = minute;
  return payload;
}

export function convertTwentyFourToTwelveHourParts(value: TwentyFourHourParts): TwelveHourParts {
  const payload = new TwelveHourParts();
  const { hour, minute } = value;

  if (hour === 0) {
    payload.hour = 12;
    payload.isMorning = true;
  } else if (hour === 12) {
    payload.hour = 12;
    payload.isMorning = false;
  } else {
    if (hour < 12) {
      payload.hour = hour;
      payload.isMorning = true;
    } else {
      payload.hour = hour - 12;
      payload.isMorning = false;
    }
  }

  payload.minute = minute;
  return payload;
}

export function convertDoubleDigitString(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

export function checkIs24HourTime(value: string): boolean {
  const timeTestRegex = new RegExp('^(?:(?:[0-1])(?:[0-9])|(?:[2])(?:[0-3])|(?:[0-9])):(?:(?:[0-5])(?:[0-9]))$');
  return timeTestRegex.test(value);
}

export function checkIs12HourTime(value: string): boolean {
  const timeTestRegex = new RegExp(
    '^(?:(?:[0])(?:[1-9])|(?:[1])(?:[0-2])|(?:[1-9])):(?:[0-5])(?:[0-9])(?:am|pm|AM|PM)$',
  );
  return timeTestRegex.test(value);
}

export function timeInputIsValid(value: string): boolean {
  const is12HourTime = checkIs12HourTime(value);
  const is24HourTime = checkIs24HourTime(value);
  return is12HourTime || is24HourTime;
}

export function getSanitizedDate(start: Date = new Date()): Date {
  const _start = new Date(start);
  _start.setSeconds(0);
  _start.setMilliseconds(0);
  return _start;
}
