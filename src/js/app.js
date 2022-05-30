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



    //-> @@html buttons
    const btnAdd = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnUpdate = `<button id="update"  class="btn"><i class="fa-solid fa-square-pen"></i>Modificar</button>`;
    const btnDelete = `<button  id="delete" class="btn"><i class="fa-solid fa-trash"></i>Borrar</button>`;
    const btnCancel = `<button id="cancel" class="btn">Cancelar</button>`;

    // let clean modal
    let cleanModal = () => {
        $('#name').val("");
        $('#timeBegin').val("00:01");
        $('#timeEnd').val("00:30");
    }

    let loadEventsOnModal = () => {

        // Cancel button
        $("#cancel").on("click", () => {
            $('#modal').modal("hide");
        });

        // Add event button
        $("#add").on("click", () => {
            // TODO VALIDATION input name
            let sala_id = parseInt($("#room").attr("data"));
            let descripcion = $("#name").val();
            let date = $("#date").val();
            let timeBegin = $("#timeBegin").val();
            let timeEnd = $("#timeEnd").val();
            let usuario_id = atob(sessionStorage.getItem("user"));


            if (descripcion.length == 0) {
                alert("Debe llenar")
            } else {
                api.post('/crearEvento', {
                    api_token: token,
                    sala_id,
                    usuario_id,
                    descripcion,
                    inicio_evento: `${date} ${timeBegin}:00`,
                    fin_evento: `${date} ${timeEnd}:00`
                }).then(function ({ data }) {
                    let { datos } = data;
                    if (datos == 1) {
                        $('#modal').modal("hide");
                        alert("Se guardo correctamente");
                        location.reload();
                    } else {
                        console.log("No se ha podido registrar su evento, verifica que el rango de horario que buscas este disponible en la sala")
                        console.log(datos)
                    }

                }).catch(function (error) {
                    console.log(error);
                    alert("Ha ocurrido un error")
                });
            }
        });
    }

    //-> @@Handlers actions calendar (use modal)
    let dateAction = ({ dateStr, resource = "empty" }) => {

        let clickedDate = new Date(dateStr)
        let today = new Date()
        clickedDate.setHours(00)
        clickedDate.setMinutes(00)
        clickedDate.setSeconds(00)
        clickedDate.setMilliseconds(00)
        today.setHours(00)
        today.setMinutes(00)
        today.setSeconds(00)
        today.setMilliseconds(00)


        if (clickedDate >= today) {


            cleanModal();
            let dateText;
            if (dateStr.length > 10) {
                let positionLetter = dateStr.indexOf("T");
                dateText = dateStr.substr(0, positionLetter);
            } else {
                dateText = dateStr;
            }

            let titleEvent = "";
            let idEvent = "";

            if (resource == "empty") {
                // Obtener de session storage name room selected
                let info = atob(sessionStorage.getItem("roomSelected"));
                let { id, title } = JSON.parse(info);

                titleEvent = title;
                idEvent = id;
            } else {
                const { _resource } = resource;
                titleEvent = _resource.title
                idEvent = _resource.id;
            }

            console.log("Evaluar hora")
            console.log(clickedDate)
            console.log(today)
            if (clickedDate <= today) {

                let time = new Date();
                console.log("Obtener tiempo");
                let hours = parseInt(time.getHours());
                let minutes = parseInt(time.getMinutes());

                let hoursEnd;
                let minutesEnd;

                if (minutes < 31) {
                    minutes = 31;
                    minutesEnd = "00"


                    hoursEnd = hours + 1
                    if (hoursEnd < 10) {
                        hoursEnd = `0${hoursEnd}`;
                    }
                } else {
                    minutes = "01";
                    minutesEnd = "31"

                    hours = hours + 1
                    hoursEnd = hours;
                    if (hours < 10) {
                        hours = `0${hours}`;
                    }
                }

                console.log(`${hours}:${minutes}`);
                console.log(`${hoursEnd}:${minutesEnd}`);

                $("#timeBegin").val(`${hours}:${minutes}`)
                $("#timeEnd").val(`${hoursEnd}:${minutesEnd}`)
            }



            document.getElementById("date").value = dateText;
            document.getElementById("room").value = titleEvent;
            document.getElementById("room").setAttribute("data", idEvent);
            document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-square-plus"></i> Agregar evento`;
            document.getElementById("buttons").innerHTML = "";
            document.getElementById("buttons").innerHTML = `${btnAdd} ${btnCancel}`;
            $('#modal').modal("show");

            loadEventsOnModal();

        }

    }
    let eventAction = (info) => {
        cleanModal();
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

    api.get('/obtenerUsuario', {
        params: {
            api_token: token
        }
    }).then(function ({ data }) {
        let { datos } = data;
        sessionStorage.setItem("user", btoa(datos.usuario_id));

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
        sessionStorage.setItem("roomSelected", roomInfo);
        clearEvents()
        loadEvents();
    })


    // TODO: Al clickear en los botones de navegacion ejecutar api de consulta por sala y rango de fecha
    //-> @@Get events (Default get resourceTimelineDay events)


    // Add the estage of the date
    // -----> 1 | Day 
    // -----> 2 | Week 
    // -----> 3 | Month
    sessionStorage.setItem("dateStage", 1);
    // Info: Default load actual date (month)

    let addZero = (day) => {

        if (day.getDate() < 10) {
            dayFormat = `0${day.getDate()}`;
        } else {
            dayFormat = day.getDate();
        }

        if (day.getMonth() + 1 < 10) {
            monthFormat = `0${day.getMonth() + 1}`;
        } else {
            monthFormat = day.getMonth() + 1;
        }

        return format = [
            dayFormat,
            monthFormat
        ];

    }

    // Set hours, minutes and seconds
    let setTimeFormat = (primerDia, ultimoDia) => {

        let formatBegin = addZero(primerDia);
        let formatEnd = addZero(ultimoDia);

        let formatDayBegin = `${primerDia.getFullYear()}-${formatBegin[1]}-${formatBegin[0]} 00:00:00`;
        let formatDayEnd = `${ultimoDia.getFullYear()}-${formatEnd[1]}-${formatEnd[0]} 23:59:59`;
        return [
            formatDayBegin, formatDayEnd
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

    let runCalendar = () => {
        //-> @@Resources and events
        let arrayResources = JSON.parse(atob(sessionStorage.getItem("rooms")));
        // let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));
        let arrayEvents = JSON.parse(sessionStorage.getItem("events"));


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
                right: "resourceTimelineDay dayGridMonth"
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
        sessionStorage.setItem("instanceLoaded", 1);
    }
    // Load default events important
    let primerDiaValue = sessionStorage.getItem("firstDate");
    let ultimoDiaValue = sessionStorage.getItem("lastDate");

    api.post('/obtenerTodosEventos', {
        api_token: token,
        fecha_inicio: primerDiaValue,
        fecha_fin: ultimoDiaValue
    }).then(function ({ data }) {
        let { datos } = data;
        console.log("obtenerTodosEventos");
        console.log(datos);
        // sessionStorage.setItem("events", btoa(JSON.stringify(datos)));
        sessionStorage.setItem("events", JSON.stringify(datos));
        runCalendar();
        iniciateAndLoadEvents();
    }).catch(function (error) {
        console.log(error);
        alert("Ha ocurrido un error")
    });


    //-> @@Load default title and hide select rooms control
    showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`);
    showSelect("hidden");





    // TODO evaluate event
    let clearEvents = () => {
        calendar.getEvents().forEach(evento => evento.remove())
        // TODO: Open loader
    }
    let iniciateAndLoadEvents = () => {
        if (sessionStorage.getItem("instanceLoaded") == 2) {
            // let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));
            let arrayEvents = JSON.parse(sessionStorage.getItem("events"));
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
        let primerDiaValue = sessionStorage.getItem("firstDate");
        let ultimoDiaValue = sessionStorage.getItem("lastDate");


        if (sessionStorage.getItem("dateStage") == 1) {
            api.post('/obtenerTodosEventos', {
                api_token: token,
                fecha_inicio: primerDiaValue,
                fecha_fin: ultimoDiaValue
            }).then(function ({ data }) {
                let { datos } = data;
                // sessionStorage.setItem("events", btoa(JSON.stringify(datos)));
                sessionStorage.setItem("events", JSON.stringify(datos));
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
                let { datos } = data;
                // sessionStorage.setItem("events", btoa(JSON.stringify(datos)))
                sessionStorage.setItem("events", JSON.stringify(datos))
                iniciateAndLoadEvents();
            }).catch(function (error) {
                console.log(error);
                alert("Ha ocurrido un error")
            });
        }

    }



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
        // console.log("time que pasa")
        // console.log(time)

        let { c } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        // Verify the limit
        // console.log("c plus click ============")
        // console.log(c)
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


    setTimeout(() => {
        //-> @@Calendar buttons
        $(".fc-resourceTimelineDay-button").on("click", () => {
            // alert("resourceTimelineDay");
            sessionStorage.setItem("instanceLoaded", 2);
            showSelect("hidden");
            clearEvents();
            sessionStorage.setItem("dateStage", 1);
            console.log("calendar resourceTimelineDay ========");
            console.log(calendar.getDate());
            startEventsToUI();
        });


        $(".fc-dayGridMonth-button").on("click", () => {
            // alert("dayGridMonth");
            sessionStorage.setItem("instanceLoaded", 2);
            showSelect("visible");
            clearEvents();
            sessionStorage.setItem("dateStage", 3);
            console.log("calendar dayGridMonth ========");
            console.log(calendar.getDate());
            startEventsToUI();
        });


        // TODO agregar aqui la insercion y eliminacion de eventos
        $(".fc-next-button").on("click", () => {
            // alert("next");
            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();
            console.log("calendar ========");
            console.log(calendar.getDate());
            startEventsToUI();
        });

        $(".fc-prev-button").on("click", () => {
            // alert("prev");
            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();
            console.log("calendar ========");
            console.log(calendar.getDate());
            startEventsToUI();
        });

    }, 500);


    //-> @@Menu buttons
    $(".generalView").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 1);
        showTitlePage(`<p>Vista general</p><i class="fa-solid fa-clock"></i>`)
        showSelect("hidden");
        calendar.changeView('resourceTimelineDay');
        console.log("calendar ========");
        console.log(calendar.getDate());
        startEventsToUI();
    });

    $(".logout").on("click", () => {
    });

    // Modal

})