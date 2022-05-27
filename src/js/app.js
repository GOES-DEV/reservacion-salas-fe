document.addEventListener('DOMContentLoaded', function () {

    // Obtener token
    const token = atob(sessionStorage.getItem("tok"));
    console.log(token);


    // Get Rooms
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

    // Select fill and change event
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

    // Change event on select
    $("#resourcesSelect").on("change", ({ target }) => {
        let id = target.value;
        let title = target.options[target.selectedIndex].text;
        let roomInfo = btoa(JSON.stringify({ id, title }));
        sessionStorage.setItem("roomSelected", roomInfo)
    })




    // Eventos ===========
    // Ejecutar api que trae todos los eventos diarios por default

    // TODO: Al clickear en los botones de navegacion ejecutar api de consulta por sala y rango de fecha
    api.post('/obtenerEventos', {
        api_token: token,
        sala_id: 1,
        fecha_inicio: "2022-05-01 00:00:00",
        fecha_fin: "2022-05-31 23:59:00"
    }).then(function ({ data }) {
        console.log(data)
        let { datos } = data;
        sessionStorage.setItem("events", btoa(JSON.stringify(datos)))
    }).catch(function (error) {
        console.log(error);
        alert("Ha ocurrido un error")
    });



    // CONFIG CALENDAR
    // Resources =======================
    let arrayResources = JSON.parse(atob(sessionStorage.getItem("rooms")));
    let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));


    // =========================================================

    // Initial view ====================
    const timeLineView = "resourceTimelineDay";
    const generalCalendarView = 'dayGridMonth'
    const scheduleView = 'listWeek'
    // Actions tools ===================
    const timeLine = "resourceTimelineDay";
    const generalCalendar = 'dayGridMonth,listWeek'

    // html buttons
    const btnAdd = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnUpdate = `<button id="update"  class="btn"><i class="fa-solid fa-square-pen"></i>Modificar</button>`;
    const btnDelete = `<button  id="delete" class="btn"><i class="fa-solid fa-trash"></i>Borrar</button>`;
    const btnCancel = `<button id="cancel" class="btn">Cancelar</button>`;

    // Handlers
    let dateAction = ({ dateStr, resource = "empty" }) => {

        let dateText;
        if (dateStr.length > 10) {
            let postionLetter = dateStr.indexOf("T");
            dateText = dateStr.substr(0, postionLetter);
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

    let dateActionNone = async () => await console.log("no action day")
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
        eventsGet,
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
            events: eventsGet,
            dateClick: dateActionNone,
            eventClick: eventAction
        });
        return calendar
    }

    let renders = (calendar) => {
        calendar.destroy();
        calendar.render();
    }



    let defaultView = (stage) => {
        showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`)
        showSelect("hidden")
        // @INSTANCE Vista general
        let calendarResult = buildCalendar(
            calendarEl,
            timeLineView,
            timeLine,
            false,
            false,
            arrayResources,
            arrayEvents,
            dateAction,
            eventAction);

        console.log("TypeOf Instance")
        console.log(calendarResult)

        // sessionStorage.setItem("instanciaCvg", JSON.stringify(calendarResult))
        if (stage == "Render") {
            renders(calendarResult);
        } else {
            calendarResult.refetchEvents()
        }
        
    }





    // Render Calendar Default timeLine view
    let showSelect = (value) => {
        document.getElementById("resourceContent").style.visibility = value;
    }
    let showTitlePage = (value) => {
        document.getElementById("titlePage").innerHTML = value;
    }


    // @INSTANCIA DEFAULT
    defaultView("Render")








    // menuActions ===========================================================


    $(".generalView").on("click", () => {
        defaultView("Render");
    });

    // Buttons ===============================================================
    // ConfigCalendar
    let configCalendarDefault = () => {
        // @INSTANCE CALENDAR GENERAL -> CALENDAR
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
        // @INSTANCE CALENDAR GENERAL -> SCHEDULT
        let calendarResult = buildCalendar(
            calendarEl,
            scheduleView,
            generalCalendar,
            true,
            true,
            arrayResources,
            arrayEvents,
            dateAction,
            eventAction);

        return calendarResult
    }


    // ================================
    // FN: Load calendar button actions
    // ================================
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
        defaultView("refetch")
    });


    // FN: Get the input time in number format
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

    // @@instance of Luxon library
    let DateTime = luxon.DateTime;

    // FN: Calc the difference of minutes
    // IN: input time begin and end
    // RETURN: Difference of minutes
    let minutesDiff = (time, time2) => {
        let timeCompare = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        let timeCompare2 = DateTime.local(time2.year, time2.month, time2.day, time2.hours, time2.minutes);

        let { milliseconds } = timeCompare2.diff(timeCompare).toObject()
        return Math.floor(milliseconds / 60000);
    }

    // FN: Add difference of 30 min if it is not greater than that difference
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
    // Buttons action time 
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

            let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({ minutes: 29 });
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


});

