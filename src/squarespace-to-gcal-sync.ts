import { SquarespaceJsonResponse, Event } from "./types";


const PUBLIC_CALENDAR_ID = "c_f25e317a84c451df1387d2da576963403a9447778695b06ba5a0720a264b0a45@group.calendar.google.com";
const MAIN_URL = "https://www.nedistrict.org";
const SQUARESPACE_EVENTS_URL = `${MAIN_URL}/events?format=json`;

const NedEventsCalendar = CalendarApp.getCalendarById(PUBLIC_CALENDAR_ID);

function getUpcomingSquareSpaceEvents(): Event[] {
  const { upcoming } = JSON.parse(UrlFetchApp.fetch(SQUARESPACE_EVENTS_URL).getContentText()) as SquarespaceJsonResponse;
  return upcoming
}

function updateGoogleCalendar(upcomingSquarespaceEvents: Event[]) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 50);
  let gCalEvents = NedEventsCalendar.getEvents(startDate, endDate);

  console.log(`Processing Squarespace Events...`);

  //create or update events. removes gCalEvents from array when processed, remaining are deleted below
  upcomingSquarespaceEvents.forEach((event, index) => {
    console.log(`Processing event: "${event.title}" (${index + 1} of ${upcomingSquarespaceEvents.length})`);

    let matchingGCalEventIndex = gCalEvents.findIndex((gCalEvent) =>
      gCalEvent.getDescription() === getSquarespaceEventDescription(event));
    let matchingGCalEvent = gCalEvents.splice(matchingGCalEventIndex, 1).at(0);

    if (matchingGCalEvent) {
      console.log(`Matching Google Calender event found! (${matchingGCalEvent?.getTitle()})`)
      updateGCalEvent(event, matchingGCalEvent);
    } else {
      console.log(`No matching Google Calender found. Creating new event...`)
      matchingGCalEvent = createGCalEvent(event);
    }
    Utilities.sleep(100);
  })

  // remaining events delete here. They should have no matching Squarespace Event and should be deleted
  gCalEvents.forEach((gCalEvent) => {
    gCalEvent.deleteEvent();
    console.log(`Event: "${gCalEvent.getTitle()}" successfully deleted from google calendar`);
    Utilities.sleep(100);
  });
}

function createGCalEvent(event: Event) {
  const googleEvent = NedEventsCalendar.createEvent(
    event.title,
    new Date(event.startDate),
    new Date(event.endDate)
  )
  googleEvent.setDescription(getSquarespaceEventDescription(event))
  googleEvent.setLocation(getEventLocationString(event));
  console.log(`Event: "${event.title}" successfully created`);

  return googleEvent;
}

function updateGCalEvent(squareSpaceEvent: Event, googleEvent: GoogleAppsScript.Calendar.CalendarEvent) {
  updateGCalTitle(squareSpaceEvent, googleEvent);
  updateGCalTimes(squareSpaceEvent, googleEvent);
  updateGCalLocation(squareSpaceEvent, googleEvent);
  console.log(`Event: "${squareSpaceEvent.title}" is up-to-date with SquareSpace`);
}

function updateGCalLocation(squareSpaceEvent: Event, googleEvent: GoogleAppsScript.Calendar.CalendarEvent) {
  if (googleEvent.getLocation() !== getEventLocationString(squareSpaceEvent)) {
    console.log(`Event: "${squareSpaceEvent.title}" google calendar locations outdated...`)
    googleEvent.setLocation(getEventLocationString(squareSpaceEvent));
    console.log(`Event: "${squareSpaceEvent.title}" google calendar location successfully updated`);
  }
}

function updateGCalTimes(squareSpaceEvent: Event, googleEvent: GoogleAppsScript.Calendar.CalendarEvent) {
  const squareSpaceStartDate = new Date(squareSpaceEvent.startDate);
  const squareSpaceEndDate = new Date(squareSpaceEvent.endDate);
  const googleStartDate = googleEvent.getStartTime() as Date;
  const googleEndDate = googleEvent.getEndTime() as Date;

  if (squareSpaceStartDate !== googleStartDate || squareSpaceEndDate !== googleEndDate) {
    console.log(`Event: "${squareSpaceEvent.title}" google calendar datetimes outdated...`)
    googleEvent.setTime(squareSpaceStartDate, squareSpaceEndDate);
    console.log(`Event: "${squareSpaceEvent.title}" datetimes successfully updated`);
  }

}

function updateGCalTitle(squareSpaceEvent: Event, googleEvent: GoogleAppsScript.Calendar.CalendarEvent) {
  if (googleEvent.getTitle() !== squareSpaceEvent.title) {
    console.log(`Event: "${squareSpaceEvent.title}" google calendar title outdated...`)
    googleEvent.setTitle(squareSpaceEvent.title);
    console.log(`Event: "${squareSpaceEvent.title}" google calendar title successfully updated`);
  }
}

function getSquarespaceEventDescription(event: Event) {
  return `${MAIN_URL}${event.fullUrl}`;
}

function getEventLocationString(event: Event) {
  let address = "";
  if (event.location.addressTitle) {
    address += `${event.location.addressTitle}, `
  }
  if (event.location.addressLine1) {
    address += `${event.location.addressLine1}, `
  }
  if (event.location.addressLine2) {
    address += `${event.location.addressLine2}, `
  }
  if (event.location.addressCountry) {
    address += `${event.location.addressCountry}, `
  }
  if (address.length >= 2) {
    address = address.slice(0, address.length - 2)
  }
  return address;
}

export {
  getUpcomingSquareSpaceEvents,
  updateGoogleCalendar,
}
