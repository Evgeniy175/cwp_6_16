const moment = require('moment-timezone');

const INTERSECTION_TYPES = {
  NO_INTERSECTION: 'NO_INTERSECTION',
  FULLY_EQUAL: 'FULLY_EQUAL',
  TASK_START_TIME_INSIDE: 'TASK_START_TIME_INSIDE',
  TASK_END_TIME_INSIDE: 'TASK_END_TIME_INSIDE',
  TASK_TIME_INSIDE: 'TASK_TIME_INSIDE',
  ANOTHER_TASK_START_TIME_INSIDE: 'ANOTHER_TASK_START_TIME_INSIDE',
  ANOTHER_TASK_END_TIME_INSIDE: 'ANOTHER_TASK_END_TIME_INSIDE',
  ANOTHER_TASK_TIME_INSIDE: 'ANOTHER_TASK_TIME_INSIDE'
};

class TasksIntersection {
  static getIntersections(tasks, anotherTasks) {
    const result = [];

    tasks.forEach(task => {
      task.time = TasksIntersection.getWorkTime(task);
      const intersectionData = TasksIntersection._getTasksIntersectionTypes(task.time, anotherTasks);
      const intersections = TasksIntersection._recognizeIntersections(task, intersectionData);

      if (intersections.length) {
        result.push({
          task,
          intersections
        });
      }
    });

    return result;
  }

  static _getTasksIntersectionTypes(time, anotherTasks) {
    return anotherTasks.map(anotherTask => {
      const anotherTime = TasksIntersection.getWorkTime(anotherTask);
      anotherTask.time = anotherTime;

      const isSameStart = time.startAt.isSame(anotherTime.startAt);
      const isSameEnd = time.endAt.isSame(anotherTime.endAt);

      if (isSameStart && isSameEnd) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.FULLY_EQUAL, anotherTask);

      const isStartTimeBetween = time.startAt.isBetween(anotherTime.startAt, anotherTime.endAt);
      const isEndTimeBetween = time.endAt.isBetween(anotherTime.startAt, anotherTime.endAt);

      if (isStartTimeBetween && isEndTimeBetween) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.TASK_TIME_INSIDE, anotherTask);
      if (isStartTimeBetween) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.TASK_START_TIME_INSIDE, anotherTask);
      if (isEndTimeBetween) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.TASK_END_TIME_INSIDE, anotherTask);

      const isAnotherStartTimeBetween = anotherTime.startAt.isBetween(time.startAt, time.endAt);
      const isAnotherEndTimeBetween = anotherTime.endAt.isBetween(time.startAt, time.endAt);

      if (isAnotherStartTimeBetween && isAnotherEndTimeBetween) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.ANOTHER_TASK_TIME_INSIDE, anotherTask);
      if (isAnotherStartTimeBetween) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.ANOTHER_TASK_START_TIME_INSIDE, anotherTask);
      if (isAnotherEndTimeBetween) return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.ANOTHER_TASK_END_TIME_INSIDE, anotherTask);

      return TasksIntersection._formatIntersectionType(INTERSECTION_TYPES.NO_INTERSECTION, anotherTask);
    })
    .filter(task => task.type !== INTERSECTION_TYPES.NO_INTERSECTION);
  }

  static _formatIntersectionType(type, task) {
    return {
      type,
      task
    }
  }

  static getWorkTime(task) {
    const workTime = moment(task.workTime, 'HH:mm');
    const startAt = moment.tz(task.workStarts, 'HH:mm', task.timezone).utc();
    const endAt = startAt.clone().add({ hour: workTime.hour(), minute: workTime.minute() });

    return {
      startAt,
      endAt,
      timezone: task.timezone
    };
  }

  static _recognizeIntersections(task, intersectionData) {
    const result = [];

    intersectionData.forEach(another => {
      const intersection = this.INTERSECTION_RESOLVERS[another.type](task, another.task);
      result.push({
        withTask: another.task,
        intersection
      });
    });

    return result;
  }

  static fullyEqualResolver(task) {
    return {
      from: moment.tz(task.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(task.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }

  static taskStartTimeInsideResolver(task, anotherTask) {
    return {
      from: moment.tz(task.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(anotherTask.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }

  static taskEndTimeInsideResolver(task, anotherTask) {
    return {
      from: moment.tz(anotherTask.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(task.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }

  static taskTimeInsideResolver(task) {
    return {
      from: moment.tz(task.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(task.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }

  static anotherStartTimeInsideResolver(task, anotherTask) {
    return {
      from: moment.tz(anotherTask.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(task.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }

  static anotherEndTimeInsideResolver(task, anotherTask) {
    return {
      from: moment.tz(task.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(anotherTask.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }

  static anotherTimeInsideResolver(task, anotherTask) {
    return {
      from: moment.tz(anotherTask.time.startAt, task.timezone).format('HH:mm'),
      to: moment.tz(anotherTask.time.endAt, task.timezone).format('HH:mm'),
      timezone: task.timezone
    }
  }
}

TasksIntersection.INTERSECTION_RESOLVERS = {
  'FULLY_EQUAL': TasksIntersection.fullyEqualResolver,
  'TASK_START_TIME_INSIDE': TasksIntersection.taskStartTimeInsideResolver,
  'TASK_END_TIME_INSIDE': TasksIntersection.taskEndTimeInsideResolver,
  'TASK_TIME_INSIDE': TasksIntersection.taskTimeInsideResolver,
  'ANOTHER_TASK_START_TIME_INSIDE': TasksIntersection.anotherStartTimeInsideResolver,
  'ANOTHER_TASK_END_TIME_INSIDE': TasksIntersection.anotherEndTimeInsideResolver,
  'ANOTHER_TASK_TIME_INSIDE': TasksIntersection.anotherTimeInsideResolver
};

module.exports = TasksIntersection;
