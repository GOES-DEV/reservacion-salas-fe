document.addEventListener('DOMContentLoaded', function () {


    // CONFIG CALENDAR
    // Resources =======================
    let arrayResources = [
        {
            id: '1',
            title: 'LOS COBANOS',
        },
        {
            id: '2',
            title: 'EL TUNCO',
        },
        {
            id: '3',
            title: 'SAN BLAS',
        },
        {
            id: '4',
            title: 'TAQUILLO',
        },
        {
            id: '5',
            title: 'TASAJERA',
        },
        {
            id: '6',
            title: 'LAS TUNAS',
        },
        {
            id: '7',
            title: 'EL ESPINO',
        },
        {
            id: '8',
            title: 'MIZATA',
        },
        {
            id: '9',
            title: 'ZUNGANERA',
        },
        {
            id: '10',
            title: 'COSTA AZUL',
        },
        {
            id: '11',
            title: 'EL MAJAHUAL',
        },
        {
            id: '12',
            title: 'TAMARINDO',
        },
        {
            id: '13',
            title: 'EL ZAPOTE',
        },
        {
            id: '14',
            title: 'EL PALMARCITO',
        },
        {
            id: '15',
            title: 'BARRA DE SANTIAGO',
        },
        {
            id: '16',
            title: 'COSTA DEL SOL',
        },
        {
            id: '17',
            title: 'SALINITAS',
        },
        {
            id: '18',
            title: 'EL CUCO',
        },
        {
            id: '19',
            title: 'EL SUNZAL',
        },
    ];

    // Select fill and change event
    let select = document.getElementById("resourcesSelect");
    let count = 1;
    select.innerHTML = "";
    arrayResources.forEach(({ id, title }) => {
        // let option = `<option value="${id}">${title}</option>`
        if (count == 1) {
            let roomInfo = btoa(JSON.stringify({ id, title }));
            sessionStorage.setItem("roomSelected", roomInfo)
        }
        let option = document.createElement("option");
        option.value = id;
        option.innerText = title;
        select.appendChild(option)
        count++;
    });
    // Change event on select
    $("#resourcesSelect").on("change",(e)=>{
        console.log(e)
    })
    // =========================================================

    // Events ==========================
    let arrayEvents = [
        {
            id: '1',
            resourceId: '1',
            title: 'My event',
            start: '2022-05-25 05:30:00',
            end: '2022-05-25 09:30:00',
            backgroundColor: '#fe9900'
        },
        {
            id: '2',
            resourceId: '1',
            title: 'My event2',
            start: '2022-05-25 09:30:00',
            end: '2022-05-25 13:30:00',
            backgroundColor: '#fe9900'
        },
        {
            id: '3',
            resourceId: '1',
            title: 'My event3',
            start: '2022-05-25 14:30:00',
            end: '2022-05-25 17:30:00',
            backgroundColor: '#fe7900'
        },
        {
            id: '4',
            resourceId: '2',
            title: 'My event4',
            start: '2022-05-25 04:30:00',
            end: '2022-05-25 13:30:00',
            backgroundColor: '#fe7900'
        },
        {
            id: '5',
            resourceId: '2',
            title: 'My event5',
            start: '2022-05-25 15:30:00',
            end: '2022-05-25 17:30:00',
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

    // html buttons
    const btnAdd = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnUpdate = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnDelete = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnCancel = `<button id="cancel" class="btn">Cancelar</button>`;

    // Handlers
    let dateAction = ({ dateStr, resource = "empty" }) => {
        let postionLetter = dateStr.indexOf("T");
        let dateText = dateStr.substr(0, postionLetter);
        let titleEvent ="";
        if (resource == "empty") {
            // Obtener de session storage name room selected
            let info = atob(sessionStorage.getItem("roomSelected"))
            let { id, title } = JSON.parse(info);
            
            titleEvent = title;
        } else {
            const { _resource } = resource;
            titleEvent = _resource.title
            // const { id, title } = _resource;
        }


        document.getElementById("date").value = dateText;
        document.getElementById("room").value = titleEvent;
        document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-square-plus"></i> Agregar evento`;
        document.getElementById("buttons").innerHTML = `${btnAdd} ${btnCancel}`;
        $('#modal').modal("show");
    }
    let dateActionNone = async () => await console.log("no action day")

    let eventAction = (info) => {
        console.log(info)
        // let postionLetter = dateStr.indexOf("T");
        // let dateText = dateStr.substr(0, postionLetter)

        // document.getElementById("date").value = dateText;
        // document.getElementById("room").value = title;
        document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-square-plus"></i> Modificar evento`;
        document.getElementById("buttons").innerHTML = `${btnUpdate} ${btnDelete}  ${btnCancel}`;
        $('#modal').modal("show");
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
        eventAction)
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
            eventAction)
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
            eventAction);

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
            dateActionNone,
            eventAction);

        return calendarResult
    }

    let actionsGeneralCalendar = () => {
        showSelect("visible")
        $('.js-select').select2({
            containerCssClass: "",
            // theme: 'bootstrap',
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

