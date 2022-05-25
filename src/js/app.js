document.addEventListener('DOMContentLoaded', function () {



    // CONFIG CALENDAR
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
    const scheduleView = 'listWeek'
    // Actions tools ===================
    const timeLine = "resourceTimelineDay";
    const generalCalendar = 'dayGridMonth,listWeek'


    // Handlers
    let dateAction = (info) => {
        alert("dia")
        console.log(info)
    }
    let dateActionNone = async () => await console.log("no action day")

    let eventAction = (info) => {
        alert("event")
        console.log(info)
    }
    let eventActionNone = async () => await console.log("no action event")


    // CALENDAR ===================================================================================================
    let calendarEl = document.getElementById('calendar');
    let buildCalendar = (
        calendarEl,
        pageView,
        page,
        isTimeBegin,
        isTimeEnd,
        arrayResources,
        arrayEvents,
        dateActionNone,
        eventAction) => {
        let calendar = new FullCalendar.Calendar(calendarEl, {
            // initialView: 'dayGridMonth',
            schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
            initialView: pageView,
            themeSystem: 'standard',
            aspectRatio: 1,
            height: "auto",
            locale: "es-us",
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: page
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
            resourceAreaHeaderContent: 'Salas',
            resources: arrayResources,
            events: arrayEvents,
            dateClick: dateActionNone,
            eventClick: eventAction
        });
        return calendar
    }

    let renders = (calendar) => {
        calendar.destroy();
        calendar.render();
    }






    // Render Calendar Default timeLine view
    let showSelect = (value) => {
        document.getElementById("resourceContent").style.visibility = value;
    }
    let showTitlePage = (value) => {
        document.getElementById("titlePage").innerHTML = value;
    }
    showSelect("hidden")
    showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`)
    let calendarResult = buildCalendar(
        calendarEl,
        timeLineView,
        timeLine,
        false,
        false,
        arrayResources,
        arrayEvents,
        dateAction,
        eventActionNone)
    renders(calendarResult);


    // menuActions ===========================================================


    $(".generalView").on("click", () => {
        showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`)
        showSelect("hidden")
        let calendarResult = buildCalendar(
            calendarEl,
            timeLineView,
            timeLine,
            false,
            false,
            arrayResources,
            arrayEvents,
            dateAction,
            eventActionNone)
        renders(calendarResult)
    });

    // Buttons ===============================================================
    // ConfigCalendar
    let configCalendarDefault = () => {
        let calendarResult = buildCalendar(
            calendarEl,
            generalCalendarView,
            generalCalendar,
            false,
            false,
            arrayResources,
            arrayEvents,
            dateAction,
            eventActionNone);

        return calendarResult
    }
    let configCalendarSchedult = () => {
        let calendarResult = buildCalendar(
            calendarEl,
            scheduleView,
            generalCalendar,
            true,
            true,
            arrayResources,
            arrayEvents,
            dateAction,
            eventActionNone);

        return calendarResult
    }

    let actionsGeneralCalendar = () => {
        showSelect("visible")
        $('.js-select').select2({
            containerCssClass: "",
            theme: 'bootstrap',
        });

        $(".fc-listWeek-button").on("click", () => {
            renders(configCalendarSchedult());
            actionsGeneralCalendar();
        });

        $(".fc-dayGridMonth-button").on("click", () => {
            renders(configCalendarDefault());
            actionsGeneralCalendar();
        });
    }

    $(".generalCalendar").on("click", () => {
        showTitlePage(`<p>Calendario general</p><i class="fa-solid fa-calendar-days"></i>`)

        renders(configCalendarDefault());
        actionsGeneralCalendar();
    });

    $(".logout").on("click", () => {
        alert("logout")
    });




});

