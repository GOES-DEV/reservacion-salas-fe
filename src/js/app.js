document.addEventListener('DOMContentLoaded', function () {


    // menuActions
    $(".generalView").on("click", () => {
        alert("view")
    });
    $(".generalCalendar").on("click", () => {
        alert("calendar")
    });
    $(".logout").on("click", () => {
        alert("logout")
    });

    // Config calendar
    // Resources =======================
    let arrayResources = [
        {
            id: 'a',
            title: 'Sala 1',
        },
        {
            id: 'B',
            title: 'Sala 2',
        },
        {
            id: 'C                                     ',
            title: 'Sala 3',
        },
    ];
    // Events ==========================
    let arrayEvents = [
        {
            id: 'a',
            resourceId: 'a',
            title: 'my event',
            start: '2022-05-10T13:30:00',
            end: '2022-05-10T15:30:00',
            backgroundColor: '#fe9900'
        },
        {
            id: 'b',
            resourceId: 'a',
            title: 'my event2',
            start: '2022-05-10T16:30:00',
            end: '2022-05-10T17:30:00',
            backgroundColor: '#fe9900'
        },
        {
            id: 'c',
            resourceId: 'B',
            title: 'my event3',
            start: '2022-05-11T16:30:00',
            end: '2022-05-11T17:30:00',
            backgroundColor: '#fe7900'
        }
    ];



    // Initial view ====================
    const timeLineView = "resourceTimelineDay";
    const generalCalendarView = 'dayGridMonth'
    // Actions tools ===================
    const timeLine = "resourceTimelineDay";
    const generalCalendar = 'dayGridMonth,listWeek'

    // Info time
    isTimeBegin = false;
    isTimeEnd = false;


    // Handlers
    let dateAction = (info) => {
        alert("dia")
        console.log(info)
    }
    let  dateActionNone = async () => await console.log("no action day")

    let eventAction = (info) => {
        alert("event")
        console.log(info)
    }
    let  eventActionNone = async () => await console.log("no action event")


    // CALENDAR ===================================================================================================

    let calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        // initialView: 'dayGridMonth',
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        initialView: generalCalendarView,
        themeSystem: 'standard',
        aspectRatio: 1,
        height: "auto",
        locale: "es-us",
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: generalCalendar
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Dia',
            list: 'Agenda'
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            meridiem: false
        },
        slotLabelFormat: { hour: 'numeric', omitZeroMinute: true, hour12: true },
        displayEventTime: isTimeBegin,
        displayEventEnd: isTimeEnd,
        dayHeaderFormat: { weekday: 'short', omitCommas: true },
        hiddenDays: [],
        eventDisplay: 'block',
        eventBorderColor: 'rgba(0, 0, 0, 0)',
        events: arrayEvents,
        resourceAreaHeaderContent: 'Salas',
        resources: arrayResources,
        dateClick: dateActionNone,
        eventClick: eventAction
    });
    calendar.render();

    // Buttons
    $(".fc-resourceTimelineDay-button").on("click", () => {


        // destroy event
    });

});

