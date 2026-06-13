import { deleteAllGoogleCalenderEvents, getUpcomingSquareSpaceEvents, updateGoogleCalendar } from "./squarespace-to-gcal-sync"

// NOTE: only `export {...}` syntax will work. You cannot define and export a trigger in
// the same line.

function onTimer(_e: GoogleAppsScript.Events.TimeDriven) {
  let upcomingEvents = getUpcomingSquareSpaceEvents();
  updateGoogleCalendar(upcomingEvents);
}

function onRun() {
  deleteAllGoogleCalenderEvents();
}

export {
  onRun,
  onTimer,
}
