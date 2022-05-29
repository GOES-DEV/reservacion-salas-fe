document.addEventListener('DOMContentLoaded', function () {
    // ========================================================================================================================
    // @1° |  Set Global variables : token api , calendar instance
    // @2° |  Configure UI calendar data and actions : 
    // -------> @@Set title and hide/show select control rooms
    // -------> @@HTML buttons  
    // -------> @@Handlers actions calendar (use modal)
    // @3° |  Set the resources(rooms) and events in sessionStorage : 
    // -------> @@Get Rooms
    // -------> @@Select fill
    // -------> @@Change event on select
    // -------> @@Get events (Default get resourceTimelineDay events)
    // -------> @@Get current month
    // @4° |  Config calendar, get and set resources and events from sessionStorage and finally render calendar 
    // -------> @@Resources
    // -------> @@Config default
    // -------> @@Render calendar
    // @5° |  Set the resources(rooms) and events in sessionStorage : 
    // -------> @@Get the input time in number format
    // -------> @@Calc the difference of minutes
    // -------> @@Add difference of 30 min if it is not greater than that difference
    // -------> @@Buttons action time 
    // @6° |  Calendar & menu buttons actions : 
    // -------> @@Calendar buttons 
    // ---------------------------> Buttons prev & next control events call
    // -------> @@Menu buttons 
    // =======================================================================================================================


    // ________________________________________________________________________________________________________________________
    // @1° GLOBAL VARIABLES ___________________________________________________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

    const token = atob(sessionStorage.getItem("tok"));
    console.log(token)
    let calendarEl = document.getElementById('calendar');
    let calendar = "";

    //instance of Luxon library
    let DateTime = luxon.DateTime;


    // ________________________________________________________________________________________________________________________
    // @2° CONFIGURE UI CALENDAR DATA AND ACTIONS _____________________________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

    // @@Set title and hide/show select control rooms & Select2 inicialite
    let showSelect = (value) => {
        document.getElementById("resourceContent").style.visibility = value;
    }
    let showTitlePage = (value) => {
        document.getElementById("titlePage").innerHTML = value;
    }
    $('.js-select').select2({
        containerCssClass: "",
        // theme: 'bootstrap',
    });

    let showHideCalendarButtons = (value, value2) => {
        $(".fc-resourceTimelineDay-button").css("visibility", `${value}`);
        $(".fc-dayGridMonth-button").css("visibility", `${value2}`);
        $(".fc-listWeek-button").css("visibility", `${value2}`);
    }



    //-> @@html buttons
    const btnAdd = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnUpdate = `<button id="update"  class="btn"><i class="fa-solid fa-square-pen"></i>Modificar</button>`;
    const btnDelete = `<button  id="delete" class="btn"><i class="fa-solid fa-trash"></i>Borrar</button>`;
    const btnCancel = `<button id="cancel" class="btn">Cancelar</button>`;
    //-> @@Handlers actions calendar (use modal)
    let dateAction = ({ dateStr, resource = "empty" }) => {

        let dateText;
        if (dateStr.length > 10) {
            let positionLetter = dateStr.indexOf("T");
            dateText = dateStr.substr(0, positionLetter);
        } else {
            dateText = dateStr;
        }

        let titleEvent = "";

        if (resource == "empty") {
            // Obtener de session storage name room selected
            let info = atob(sessionStorage.getItem("roomSelected"));
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
        document.getElementById("buttons").innerHTML = "";
        document.getElementById("buttons").innerHTML = `${btnAdd} ${btnCancel}`;
        $('#modal').modal("show");
    }
    let eventAction = (info) => {
        // let postionLetter = dateStr.indexOf("T");
        // let dateText = dateStr.substr(0, postionLetter)

        // document.getElementById("date").value = dateText;
        // document.getElementById("room").value = title;
        document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-square-pen"></i> Modificar evento`;
        document.getElementById("buttons").innerHTML = "";
        document.getElementById("buttons").innerHTML = `${btnUpdate} ${btnDelete}  ${btnCancel}`;
        $('#modal').modal("show");
    }

    let dateActionNone = async () => await console.log("no action day");
    let eventActionNone = async () => await console.log("no action event");


    // ________________________________________________________________________________________________________________________
    // @3° SET THE RESOURCES(ROOMS) AND EVENTS IN SESSIONSTORAGE ______________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°


    //-> @@Get Rooms
    api.get('/listarSalas', {
        params: {
            api_token: token
        }
    }).then(function ({ data }) {
        let { datos } = data;
        fillSelect(datos)
        sessionStorage.setItem("rooms", btoa(JSON.stringify(datos)))

    }).catch(function (error) {
        console.log(error);
        alert("Ha ocurrido un error")
    });

    //-> @@Select fill
    let fillSelect = (arrayResources) => {
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
    }

    //-> @@Change event on select
    $("#resourcesSelect").on("change", ({ target }) => {
        let id = target.value;
        let title = target.options[target.selectedIndex].text;
        let roomInfo = btoa(JSON.stringify({ id, title }));
        sessionStorage.setItem("roomSelected", roomInfo)
    })


    // TODO: Al clickear en los botones de navegacion ejecutar api de consulta por sala y rango de fecha
    //-> @@Get events (Default get resourceTimelineDay events)


    // Add the estage of the date
    // -----> 1 | Day 
    // -----> 2 | Week 
    // -----> 3 | Month
    sessionStorage.setItem("dateStage", 1);
    // Info: Default load actual date (month)

    // Set hours, minutes and seconds
    let setTimeFormat = (primerDia, ultimoDia) => {
        primerDia.setHours(00);
        primerDia.setMinutes(00);
        primerDia.setSeconds(00);
        ultimoDia.setHours(23);
        ultimoDia.setMinutes(59);
        ultimoDia.setSeconds(00);

        return [
            primerDia, ultimoDia
        ];
    }
    //-> @@get current month
    let getCurrentMonth = (date) => {
        let stage = sessionStorage.getItem("dateStage");
        let currentDate;

        if (stage == 1) {
            console.log("Dia ======================================================")
            let primerDia = new Date(date);
            let ultimoDia = new Date(date);
            let timeFormat = setTimeFormat(primerDia, ultimoDia);

            currentDate = [
                timeFormat[0],
                timeFormat[1]
            ];
        } else if (stage == 2) {

            console.log("Semana ======================================================")
            let primerDia = new Date(date);
            let ultimoDia = new Date(date);
            let timeFormat = setTimeFormat(primerDia, ultimoDia);

            timeFormat[1].setDate(timeFormat[1].getDate() + 6);

            currentDate = [
                timeFormat[0],
                timeFormat[1]
            ];

        } else {
            console.log("Mes ======================================================")
            let primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
            let ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            let timeFormat = setTimeFormat(primerDia, ultimoDia);

            currentDate = [
                timeFormat[0],
                timeFormat[1]
            ];
        }
        return currentDate;
    }


    // Get current dat
    let [primerDia, ultimoDia] = getCurrentMonth(new Date());
    // SetTime
    sessionStorage.setItem("firstDate", primerDia);
    sessionStorage.setItem("lastDate", ultimoDia);



    // ________________________________________________________________________________________________________________________
    // @4° CONFIG CALENDAR, GET AND SET RESOURCES AND EVENTS FROM SESSIONSTORAGE AND FINALLY RENDER CALENDAR __________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

    //-> @@Resources and events
    let arrayResources = JSON.parse(atob(sessionStorage.getItem("rooms")));
    let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));


    //-> @@Config default
    calendar = new FullCalendar.Calendar(calendarEl, {
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        initialView: "resourceTimelineDay",
        themeSystem: 'standard',
        aspectRatio: 1,
        height: "auto",
        locale: "es-us",
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: "resourceTimelineDay dayGridMonth,listWeek"
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
        displayEventTime: false,
        displayEventEnd: false,
        dayHeaderFormat: { weekday: 'short', omitCommas: true },
        hiddenDays: [],
        eventDisplay: 'block',
        eventBorderColor: 'rgba(0, 0, 0, 0)',
        resourceAreaHeaderContent: 'Salas',
        resources: arrayResources,
        events: arrayEvents,
        dateClick: dateAction,
        eventClick: eventAction
    });

    //-> @@Render calendar
    calendar.render();
    console.log("Opciones a setear after render ===================================")
    console.log(calendar.currentData.calendarOptions.displayEventTime)
    console.log(calendar.currentData.calendarOptions.displayEventEnd)
    console.log("=====================================================")
    sessionStorage.setItem("instanceLoaded", 1);

    //-> @@Load default title and hide select rooms control
    showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`);
    showSelect("hidden");
    showHideCalendarButtons("visible", "hidden");




    // TODO evaluate event
    let clearEvents = () => {
        calendar.getEvents().forEach(evento => evento.remove())
        // TODO: Open loader
    }
    let iniciateAndLoadEvents = () => {
        console.log("Opciones a setear ===================================")
        console.log(calendar.currentData.calendarOptions.displayEventTime)
        console.log(calendar.currentData.calendarOptions.displayEventEnd)
        console.log("=====================================================")


        if (sessionStorage.getItem("instanceLoaded") == 2) {
            let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));
            console.log("arrayEvents ==========loaded =============");
            console.log(arrayEvents);
            setTimeout(() => {
                arrayEvents.forEach(evento => {
                    // console.log(evento)
                    calendar.addEvent(evento);
                })
            }, 500);
        }

        // TODO: Close loader
    }


    let loadEvents = () => {
        let primerDiaValue = new Date(sessionStorage.getItem("firstDate"));
        let ultimoDiaValue = new Date(sessionStorage.getItem("lastDate"));


        if (sessionStorage.getItem("dateStage") == 1) {
            api.post('/obtenerTodosEventos', {
                api_token: token,
                fecha_inicio: primerDiaValue,
                fecha_fin: ultimoDiaValue
            }).then(function ({ data }) {
                console.log(data)
                let { datos } = data;
                sessionStorage.setItem("events", btoa(JSON.stringify(datos)));
                iniciateAndLoadEvents();
            }).catch(function (error) {
                console.log(error);
                alert("Ha ocurrido un error")
            });
        } else {
            let { id } = JSON.parse(atob(sessionStorage.getItem("roomSelected")));
            api.post('/obtenerEventos', {
                api_token: token,
                sala_id: id,
                fecha_inicio: primerDiaValue,
                fecha_fin: ultimoDiaValue
            }).then(function ({ data }) {
                console.log(data)
                let { datos } = data;
                sessionStorage.setItem("events", btoa(JSON.stringify(datos)))
                iniciateAndLoadEvents();
            }).catch(function (error) {
                console.log(error);
                alert("Ha ocurrido un error")
            });
        }

    }
    loadEvents();



    // ________________________________________________________________________________________________________________________
    // @5° CONTROL TIME IN MODAL  _____________________________________________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°


    //-> @@Get the input time in number format
    // IN: "stage" -> Begin or End
    // RETURN: Time in parts
    let getTime = (stage) => {
        let dateValue = $("#date").val();
        let timeValue = $(`#time${stage}`).val();
        let year = parseInt(dateValue.substr(0, 4));
        let month = parseInt(dateValue.substr(5, 2));
        let day = parseInt(dateValue.substr(8, 2));
        let hours = parseInt(timeValue.substr(0, 2));
        let minutes = parseInt(timeValue.substr(3, 2));
        return { year, month, day, hours, minutes }
    }


    //-> @@Calc the difference of minutes
    // IN: input time begin and end
    // RETURN: Difference of minutes
    let minutesDiff = (time, time2) => {
        let timeCompare = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        let timeCompare2 = DateTime.local(time2.year, time2.month, time2.day, time2.hours, time2.minutes);

        let { milliseconds } = timeCompare2.diff(timeCompare).toObject()
        return Math.floor(milliseconds / 60000);
    }

    //-> @@Add difference of 30 min if it is not greater than that difference
    // IN: NA
    // RETURN: NA
    let carryTime = () => {
        let time = getTime("Begin");
        let time2 = getTime("End");

        let minResult = minutesDiff(time, time2);
        minResult = Math.abs(minResult);


        if (minResult < 29) {
            let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({ minutes: 30 });
            let minute;
            let hour;
            if (c.minute == 1) {
                minute = "00"
            } else {
                minute = "30"
            }
            if (c.hour < 10) {

                if (c.hour == 0 && minute == 30) {
                    hour = `00`
                } else {
                    hour = `0${c.hour}`
                }
            } else {
                hour = c.hour
            }

            $("#timeEnd").val(`${hour}:${minute}`)
        }
    }
    //-> @@Buttons action time 
    $("#plusBegin").on("click", () => {
        let time = getTime("Begin");

        let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        // Verify the limit
        if (c.minute == 01 && c.hour == 23) {
            console.log("Horario maximo")
        } else {
            let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({ minutes: 30 });
            let minute;
            let hour;
            if (c.minute == 1) {
                minute = "01"
            } else {
                minute = c.minute
            }

            if (c.hour < 10) {

                if (c.hour == 0 && minute == 30) {
                    hour = `00`
                } else {
                    hour = `0${c.hour}`
                }
            } else {
                hour = c.hour
            }

            $("#timeBegin").val(`${hour}:${minute}`);
            carryTime();
        }
    });

    $("#minusBegin").on("click", () => {
        let time = getTime("Begin");
        let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);

        // Verify the limit
        if (c.minute == 01 && c.hour == 00) {
            console.log("Horario maximo")
        } else {
            let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).minus({ minutes: 30 });
            let minute;
            let hour;
            if (c.minute == 1) {
                minute = "01"
            } else {
                minute = c.minute
            }

            if (c.hour < 10) {

                if (c.hour == 0 && minute == 30) {
                    hour = `00`
                } else {
                    hour = `0${c.hour}`
                }
            } else {
                hour = c.hour
            }

            $("#timeBegin").val(`${hour}:${minute}`)
        }
    });

    $("#plusEnd").on("click", () => {
        let time = getTime("End");

        let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);

        // Verify the limit
        if (c.minute == 30 && c.hour == 23) {
            console.log("Horario maximo")
        } else {

            let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({ minutes: 30 });
            let minute;
            let hour;
            if (c.minute == 0) {
                minute = "00"
            } else {
                minute = c.minute
            }

            if (c.hour < 10) {

                if (c.hour == 0 && minute == 30) {
                    hour = `00`
                } else {
                    hour = `0${c.hour}`
                }
            } else {
                hour = c.hour
            }
            $("#timeEnd").val(`${hour}:${minute}`)
        }
    });

    $("#minusEnd").on("click", () => {

        let time = getTime("Begin");
        let time2 = getTime("End");

        let minResult = minutesDiff(time, time2);
        // Verify the limit
        if (minResult <= 30) {
            console.log("Horario maximo")
        } else {
            let { c } = DateTime.local(time2.year, time2.month, time2.day, time2.hours, time2.minutes).minus({ minutes: 30 });
            let minute;
            let hour;
            if (c.minute == 0) {
                minute = "00"
            } else {
                minute = c.minute
            }

            if (c.hour < 10) {

                if (c.hour == 0 && minute == 30) {
                    hour = `00`
                } else {
                    hour = `0${c.hour}`
                }
            } else {
                hour = c.hour
            }

            $("#timeEnd").val(`${hour}:${minute}`)
        }
    });


    // ________________________________________________________________________________________________________________________
    // @6° CALENDAR & MENU BUTTONS ACTIONS __________________________________________________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

    // Cargar eventos

    let startEventsToUI = () => {

        let [primerDia, ultimoDia] = getCurrentMonth(calendar.getDate());
        // SetTime
        sessionStorage.setItem("firstDate", primerDia);
        sessionStorage.setItem("lastDate", ultimoDia);
        loadEvents();
    }


    //-> @@Calendar buttons
    $(".fc-resourceTimelineDay-button").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 1);
        startEventsToUI();
    });

    $(".fc-listWeek-button").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 2);
        startEventsToUI();
    });

    $(".fc-dayGridMonth-button").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 3);
        startEventsToUI();
    });


    // TODO agregar aqui la insercion y eliminacion de eventos
    $(".fc-next-button").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        startEventsToUI();
    });

    $(".fc-prev-button").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        startEventsToUI();
    });


    //-> @@Menu buttons
    $(".generalView").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 1);
        showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`)
        showSelect("hidden");
        calendar.changeView('resourceTimelineDay');
        showHideCalendarButtons("visible", "hidden");
        startEventsToUI();
    });

    $(".generalCalendar").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 3);
        showTitlePage(`<p>Calendario general</p><i class="fa-solid fa-calendar-days"></i>`)
        showSelect("visible"),
            calendar.changeView('dayGridMonth');
        showHideCalendarButtons("hidden", "visible");
        startEventsToUI();
    });

    $(".logout").on("click", () => {
    });

})