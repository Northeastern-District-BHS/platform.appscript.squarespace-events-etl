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

  //create or update events. removes gCalEvents from array when processed, remaining are deleted below
  upcomingSquarespaceEvents.forEach((event, index) => {
    if (index % 10 === 0) {
      Utilities.sleep(1000);
    }

    let matchingGCalEventIndex = gCalEvents.findIndex((gCalEvent) =>
      gCalEvent.getDescription());
    let matchingGCalEvent = gCalEvents.splice(matchingGCalEventIndex, 1).at(0);


    if (!matchingGCalEvent) {
      matchingGCalEvent = NedEventsCalendar.createEvent(
        event.title,
        new Date(event.startDate),
        new Date(event.endDate)
      )
    } else {
      matchingGCalEvent.setTitle(event.title);
      matchingGCalEvent.setTime(new Date(event.startDate), new Date(event.endDate));
    }
    matchingGCalEvent.setDescription(getSquarespaceEventDescription(event))
    matchingGCalEvent.setLocation(getEventLocationString(event));
  })

  // remaining events delete here. They should have no matching Squarespace Event and should be deleted
  gCalEvents.forEach((event, index) => {
    if (index % 10 === 0) {
      Utilities.sleep(1000);
    }
    event.deleteEvent();
  });
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
  updateGoogleCalendar
}
