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

    !sessionStorage.getItem("tok") && $(location).prop('href', `../index.html`);
    const token = atob(sessionStorage.getItem("tok"));
    // console.log(token)
    let calendarEl = document.getElementById('calendar');
    let calendar = "";

    //instance of Luxon library
    let DateTime = luxon.DateTime;

    let logoutSession = () => {
        sessionStorage.removeItem("tok")
        sessionStorage.removeItem("rol")
        sessionStorage.removeItem("roomSelected")
        sessionStorage.removeItem("dateStage")
        sessionStorage.removeItem("lastDate")
        sessionStorage.removeItem("rooms")
        sessionStorage.removeItem("user")
        sessionStorage.removeItem("firstDate")
        sessionStorage.removeItem("events")
        sessionStorage.removeItem("instanceLoaded")
        sessionStorage.removeItem("group")
        sessionStorage.removeItem("colorRoom")
        sessionStorage.removeItem("group")
        $(location).prop('href', `../index.html`);
    }

    let getColor = (sala_id) => {
        console.log("Se busca color")
        api.post('/obtenerSala', {
            api_token: token,
            sala_id
        }).then(function ({
            data
        }) {
            let {
                datos
            } = data

            console.log("Color")
            console.log(datos.color)
            sessionStorage.setItem("colorRoom", datos.color)

        }).catch(function (error) {
            console.log(error);
            logoutSession();
        });
    }


    // ________________________________________________________________________________________________________________________
    // @2° CONFIGURE UI CALENDAR DATA AND ACTIONS _____________________________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

    // @@Set title and hide/show select control rooms & Select2 inicialite
    let showSelect = (value) => {
        document.getElementById("resourceContent").style.visibility = value;
    }
    let showTitlePage = () => {
        document.getElementById("titlePage").innerHTML = ""
        let title = sessionStorage.getItem("group")
        document.getElementById("titlePage").innerHTML = `<p><i class="fa-solid fa-square"></i> GRUPO ${title}</p>`;
    }
    $('.js-select').select2({
        containerCssClass: "",
        // theme: 'bootstrap',
    });

    $("#btnMenuResponsive").on("click", () => {
        let isOpen = parseInt($('#btnMenuResponsive').attr("data"));
        if (isOpen == 0) {
            $('#btnMenuResponsive').html(`<i class="fa-solid fa-xmark"></i>`);
            $('#btnMenuResponsive').attr("data", 1);
            $('#btnMenuResponsive').css("left", "12em")
            $('.nav').css("left", "0em")

        } else {
            $('#btnMenuResponsive').html(`<i class="fa-solid fa-bars"></i>`);
            $('#btnMenuResponsive').attr("data", 0);
            $('#btnMenuResponsive').css("left", "0em")
            $('.nav').css("left", "-12em")

        }

    });


    //-> @@html buttons
    const btnAdd = `<button id="add" class="btn"><i class="fa-solid fa-square-plus"></i>Agregar</button>`;
    const btnUpdate = `<button id="update"  class="btn"><i class="fa-solid fa-square-pen"></i>Modificar</button>`;
    const btnDelete = `<button  id="delete" class="btn"><i class="fa-solid fa-trash"></i>Borrar</button>`;
    const btnCancel = `<button id="cancel" class="btn">Cancelar</button>`;

    // let clean modal
    let cleanModal = () => {
        $('#name').val("");
        $("#nameApplicant").val("");
        $('#timeBegin').val("00:01");
        $('#timeEnd').val("00:30");

        $('#drinks').prop("checked", false);
        $('#snacks').prop("checked", false);
        $('#meals').prop("checked", false);
        $('#others').prop("checked", false);


        $('#drinksQuantity').val("");
        $('#snacksQuantity').val("");
        $('#mealsQuantity').val("");
        $('#othersQuantity').val("");

        $('#drinksQuantity').attr('readonly', "")
        $('#snacksQuantity').attr("readoly", "");
        $('#mealsQuantity').attr("readoly", "");
        $('#othersQuantity').attr("readoly", "");
    }

    let loadEventsOnModal = () => {
        let nameInput = $("#name");
        let applicantInput = $("#nameApplicant");
        nameInput.on("keyup", () => {
            nameInput.css("box-shadow", "none")
        })

        applicantInput.on("keyup", () => {
            applicantInput.css("box-shadow", "none")
        })

        // Cancel button
        $("#cancel").on("click", () => {
            $('#modal').modal("hide");
        });

        // Add event button
        $("#add").on("click", () => {
            $("#add").prop("disabled", true);
            let sala_id = parseInt($("#room").attr("data"));
            let descripcion = $("#name").val();
            let solicitante = $("#nameApplicant").val();
            let date = $("#date").val();
            let timeBegin = $("#timeBegin").val();
            let timeEnd = $("#timeEnd").val();
            let usuario_id = atob(sessionStorage.getItem("user"));
            let color = sessionStorage.getItem("colorRoom")

            let bebida = $("#drinksQuantity").val();
            let aperitivo = $("#snacksQuantity").val();
            let comida = $("#mealsQuantity").val();
            let otro = $("#othersQuantity").val();


            let isName = true;
            let isApplicant = true;

            if (bebida == "") {
                bebida = 0
            }
            if (aperitivo == "") {
                aperitivo = 0
            }
            if (comida == "") {
                comida = 0
            }
            if (otro == "") {
                otro = 0
            }


            if (solicitante.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Solicitante de evento vacio!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                applicantInput.css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isApplicant = false;
                $("#add").prop("disabled", false);

            }


            if (descripcion.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Nombre de evento vacio!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                nameInput.css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isName = false;
                $("#add").prop("disabled", false);
            }


            if (isName == true && isApplicant == true) {

                setTimeout(() => {
                    api.post('/crearEvento', {
                        api_token: token,
                        sala_id,
                        usuario_id,
                        descripcion,
                        solicitante,
                        inicio_evento: `${date} ${timeBegin}:00`,
                        fin_evento: `${date} ${timeEnd}:00`,
                        color,
                        bebida,
                        aperitivo,
                        comida,
                        otro
                    }).then(function ({
                        data
                    }) {
                        let {
                            datos
                        } = data;
                        if (datos == 1) {
                            $('#modal').modal("hide");
                            Swal.fire({
                                title: '¡Evento agregado con exito!',
                                icon: 'success',
                                confirmButtonColor: '#313945',
                                confirmButtonText: 'Entendido',
                                allowOutsideClick: false
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.reload();
                                }
                            })

                        } else {
                            Swal.fire({
                                title: '¡Verifica los datos ingresados!',
                                text: "Puede que el rango de horario ya este ocupado",
                                icon: 'info',
                                confirmButtonColor: '#313945',
                                confirmButtonText: 'Entendido',
                                allowOutsideClick: false
                            });
                            $("#add").prop("disabled", false);
                        }

                    }).catch(function (error) {
                        console.log(error);
                        Swal.fire({
                            title: '¡Verifica los datos ingresados!',
                            text: "No puedes agregar eventos antes de la hora actual",
                            icon: 'info',
                            confirmButtonColor: '#313945',
                            confirmButtonText: 'Entendido',
                            allowOutsideClick: false
                        });
                        $("#add").prop("disabled", false);
                    });
                }, 500);

            }
        });

        $("#delete").on("click", () => {
            Swal.fire({
                title: '¿Desea borrar este evento?',
                text: "El evento se borrara permanente",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, borrar evento'
            }).then((result) => {
                if (result.isConfirmed) {

                    let id = $("#name").attr("data");

                    api.post('/eliminarEvento', {
                        api_token: token,
                        id
                    }).then(function ({
                        data
                    }) {
                        $("#delete").prop("disabled", false);
                        Swal.fire({
                            icon: 'success',
                            title: '¡Evento borrado!',
                            allowOutsideClick: false
                        }).then((result) => {
                            if (result.isConfirmed) {
                                location.reload();
                            }
                        })
                    }).catch(function (error) {
                        // console.log(error);
                        Swal.fire({
                            title: '¡Error al borrar evento!',
                            text: "Intentalo más tarde",
                            icon: 'error',
                            confirmButtonColor: '#313945',
                            confirmButtonText: 'Entendido',
                            allowOutsideClick: false
                        })
                    });


                } else {
                    $("#delete").prop("disabled", false);
                }
            })
        });
    }

    //-> @@Handlers actions calendar (use modal)
    let dateAction = ({
        dateStr,
        resource = "empty"
    }) => {


        let rol = parseInt(atob(sessionStorage.getItem("rol")))

        let idInputs = [
            "drinks",
            "snacks",
            "meals",
            "others",
        ]

        idInputs.forEach(name => {
            $(`#${name}QuantitySection`).hide(1000)
        });

        let now = new Date();
        let timeLimitForRegister = new Date()
        timeLimitForRegister.setHours(23)
        timeLimitForRegister.setMinutes(00)
        timeLimitForRegister.setSeconds(00)



        if (now > timeLimitForRegister) {
            Swal.fire({
                icon: 'info',
                title: '¡No puedes agregar eventos en el rango de 11:00 p.m. a 12:00 a.m.!',
                toast: true,
                timer: 1500,
                showConfirmButton: false,
            });
        } else {
            if (rol == 1) {
                $(".info-event").css("display", "flex");
                $("#name").attr("readonly", false)
                $("#nameApplicant").attr("readonly", false)
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
                        let {
                            id,
                            title
                        } = JSON.parse(info);

                        titleEvent = title;
                        idEvent = id;
                    } else {
                        const {
                            _resource
                        } = resource;
                        titleEvent = _resource.title
                        idEvent = _resource.id;
                    }


                    if (clickedDate <= today) {

                        let time = new Date();
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
                            if (hours < 10) {
                                hours = `0${hours}`;
                            }

                        } else {
                            minutes = "01";
                            minutesEnd = "30"

                            hours = hours + 1
                            hoursEnd = hours;
                            if (hours < 10) {
                                hours = `0${hours}`;
                            }
                            if (hoursEnd < 10) {
                                hoursEnd = `0${hoursEnd}`;
                            }
                        }


                        $("#timeBegin").val(`${hours}:${minutes}`)

                        $("#timeEnd").val(`${hoursEnd}:${minutesEnd}`)

                    }


                    $('#drinks').prop("disabled", false);
                    $('#snacks').prop("disabled", false);
                    $('#meals').prop("disabled", false);
                    $('#others').prop("disabled", false);
                    document.getElementById("date").value = dateText;
                    document.getElementById("room").value = titleEvent;
                    document.getElementById("room").setAttribute("data", idEvent);
                    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-square-plus"></i> Agregar evento`;
                    document.getElementById("buttons").innerHTML = "";
                    document.getElementById("buttons").innerHTML = `${btnAdd} <button id="cancel" class="btn" data-dismiss="modal">Cancelar</button>`;
                    $('#modal').modal("show");


                    let sala_id = parseInt($("#room").attr("data"));
                    getColor(sala_id);

                    loadEventsOnModal();

                }
            }
        }

    }
    let eventAction = (info) => {

        let rol = parseInt(atob(sessionStorage.getItem("rol")))

        if (rol == 1) {

            $("#delete").prop("disabled", true);
            cleanModal();
            $(".info-event").css("display", "none");

            let idInputs = [
                "drinks",
                "snacks",
                "meals",
                "others",
            ]

            idInputs.forEach(name => {
                $(`#${name}QuantitySection`).show(1000)
            });

            setTimeout(() => {

                api.post('/detalleEvento', {
                    api_token: token,
                    id: info.event.id
                }).then(function ({
                    data
                }) {

                    let {
                        datos
                    } = data

                    let drinks = datos.bebida;
                    let snacks = datos.aperitivo;
                    let meals = datos.comida;
                    let others = datos.otro;


                    let setExtras = (input, id) => {
                        if (input == 0) {
                            $(`#${id}Quantity`).val("")
                            $(`#${id}Quantity`).attr('readonly', "");
                            $(`#${id}`).attr('disabled', true);

                        } else {
                            $(`#${id}`).prop("checked", true);
                            $(`#${id}`).attr('disabled', true);
                            $(`#${id}Quantity`).val(input)
                            $(`#${id}Quantity`).attr('readonly', "");
                        }
                    }



                    let applicant = datos.solicitante;
                    let timeBegin = new Date(info.event.start);
                    let timeEnd = new Date(info.event.end);
                    let hoursBegin = timeBegin.getHours()
                    let minutesBegin = timeBegin.getMinutes()
                    let hoursEnd = timeEnd.getHours()
                    let minutesEnd = timeEnd.getMinutes()
                    if (hoursBegin < 10) {
                        hoursBegin = `0${hoursBegin}`
                    }
                    if (minutesBegin < 10) {
                        minutesBegin = `0${minutesBegin}`
                    }

                    if (hoursEnd < 10) {
                        hoursEnd = `0${hoursEnd}`
                    }
                    if (minutesEnd < 10) {
                        minutesEnd = `0${minutesEnd}`
                    }

                    setExtras(drinks, "drinks")
                    setExtras(snacks, "snacks")
                    setExtras(meals, "meals")
                    setExtras(others, "others")

                    $("#timeBegin").val(`${hoursBegin}:${minutesBegin}`);
                    $("#timeEnd").val(`${hoursEnd}:${minutesEnd}`);
                    $("#name").attr("readonly", true);
                    $("#nameApplicant").attr("readonly", true);
                    $("#name").attr("data", info.event.id);
                    $("#name").val(info.event.title);
                    $("#nameApplicant").val(applicant);
                    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-trash"></i> Eliminar evento`;
                    document.getElementById("buttons").innerHTML = "";
                    document.getElementById("buttons").innerHTML = `${btnDelete} <button id="cancel" class="btn" data-dismiss="modal">Cancelar</button>`;
                    $('#modal').modal("show");
                    loadEventsOnModal();



                }).catch(function (error) {
                    // console.log(error);
                });


            }, 500);

        }


    }


    // ________________________________________________________________________________________________________________________
    // @3° SET THE RESOURCES(ROOMS) AND EVENTS IN SESSIONSTORAGE ______________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°


    //-> @@Get Rooms
    api.get('/listarSalas', {
        params: {
            api_token: token
        }
    }).then(function ({
        data
    }) {
        let {
            datos
        } = data;
        fillSelect(datos)
        sessionStorage.setItem("rooms", btoa(JSON.stringify(datos)))

    }).catch(function (error) {
        // console.log(error);
        logoutSession();
    });

    api.get('/obtenerUsuario', {
        params: {
            api_token: token
        }
    }).then(function ({
        data
    }) {
        let {
            datos
        } = data;
        sessionStorage.setItem("user", btoa(datos.usuario_id));
        sessionStorage.setItem("rol", btoa(datos.rol));
        sessionStorage.setItem("group", datos.grupo);

        showTitlePage();

    }).catch(function (error) {
        // console.log(error);
        logoutSession();
    });

    //-> @@Select fill
    let fillSelect = (arrayResources) => {
        let select = document.getElementById("resourcesSelect");
        let count = 1;
        select.innerHTML = "";
        arrayResources.forEach(({
            id,
            title
        }) => {
            // let option = `<option value="${id}">${title}</option>`
            if (count == 1) {
                let roomInfo = btoa(JSON.stringify({
                    id,
                    title
                }));
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
    $("#resourcesSelect").on("change", ({
        target
    }) => {
        let id = target.value;
        let title = target.options[target.selectedIndex].text;
        let roomInfo = btoa(JSON.stringify({
            id,
            title
        }));
        sessionStorage.setItem("roomSelected", roomInfo);
        clearEvents()
        loadEvents();
    })

    let cleanInput = (input) => {
        $(`#${input}Quantity`).val("")
        $(`#${input}Quantity`).attr('readonly', "");
        $(`#${input}QuantitySection`).hide(1000)
    }

    let showSection = (input) => {
        $(`#${input}Quantity`).removeAttr('readonly')
        input != "others" && $(`#${input}Quantity`).val(1)
        $(`#${input}QuantitySection`).show(1000)
    }

    let idInputs = [
        "drinks",
        "snacks",
        "meals",
        "others",
    ]

    idInputs.forEach(name => {
        $(`#${name}QuantitySection`).hide()
        $(`#${name}`).on("click", () => {
            let isChecked = $(`#${name}`).prop("checked");
            isChecked ? showSection(name) : cleanInput(name)
        })
    });


    let verifyNumberMaxMin = (input) => {
        let value = $(`#${input}`).val();
        let min = parseInt($(`#${input}`).attr("min"))
        let max = parseInt($(`#${input}`).attr("max"))

        if (value < min) {
            $(`#${input}`).val(min);
        }

        if (value > max) {
            $(`#${input}`).val(max);
        }
    }

    let inputsName = [
        "drinksQuantity",
        "snacksQuantity",
        "mealsQuantity"
    ]

    inputsName.forEach(name => {
        $(`#${name}`).on("keyup", () => {
            verifyNumberMaxMin(name)
        })

        $(`#${name}`).on("change", () => {
            verifyNumberMaxMin(name)
        })
    });




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
            // console.log("Dia ======================================================")
            let primerDia = new Date(date);
            let ultimoDia = new Date(date);
            let timeFormat = setTimeFormat(primerDia, ultimoDia);

            currentDate = [
                timeFormat[0],
                timeFormat[1]
            ];
        } else {
            // console.log("Mes ======================================================")
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
            slotLabelFormat: {
                hour: 'numeric',
                omitZeroMinute: true,
                hour12: true
            },
            displayEventTime: false,
            displayEventEnd: false,
            dayHeaderFormat: {
                weekday: 'short',
                omitCommas: true
            },
            hiddenDays: [],
            eventDisplay: 'block',
            eventBorderColor: 'rgba(0, 0, 0, 0)',
            resourceAreaHeaderContent: 'Salas',
            resourceGroupField: "building",
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
    }).then(function ({
        data
    }) {
        let {
            datos
        } = data;

        sessionStorage.setItem("events", JSON.stringify(datos));
        runCalendar();
        iniciateAndLoadEvents();
    }).catch(function (error) {
        // console.log(error);
        logoutSession();
    });


    //-> @@Load default title and hide select rooms control
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
            }).then(function ({
                data
            }) {
                let {
                    datos
                } = data;
                // sessionStorage.setItem("events", btoa(JSON.stringify(datos)));
                sessionStorage.setItem("events", JSON.stringify(datos));
                iniciateAndLoadEvents();
            }).catch(function (error) {
                // console.log(error);
                logoutSession();
            });
        } else {
            let {
                id
            } = JSON.parse(atob(sessionStorage.getItem("roomSelected")));
            api.post('/obtenerEventos', {
                api_token: token,
                sala_id: id,
                fecha_inicio: primerDiaValue,
                fecha_fin: ultimoDiaValue
            }).then(function ({
                data
            }) {
                let {
                    datos
                } = data;
                // sessionStorage.setItem("events", btoa(JSON.stringify(datos)))
                sessionStorage.setItem("events", JSON.stringify(datos))
                iniciateAndLoadEvents();
            }).catch(function (error) {
                // console.log(error);
                logoutSession();
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
        return {
            year,
            month,
            day,
            hours,
            minutes
        }
    }


    //-> @@Calc the difference of minutes
    // IN: input time begin and end
    // RETURN: Difference of minutes
    let minutesDiff = (time, time2) => {
        let timeCompare = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        let timeCompare2 = DateTime.local(time2.year, time2.month, time2.day, time2.hours, time2.minutes);

        let {
            milliseconds
        } = timeCompare2.diff(timeCompare).toObject()
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
            let {
                c
            } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({
                minutes: 30
            });
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

        let {
            c
        } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        // Verify the limit
        // console.log("c plus click ============")
        // console.log(c)
        if (c.minute == 01 && c.hour == 23) {
            console.log("Horario maximo")
        } else {
            let {
                c
            } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({
                minutes: 30
            });
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
        let {
            c
        } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);

        // Verify the limit
        if (c.minute == 01 && c.hour == 00) {
            console.log("Horario maximo")
        } else {
            let {
                c
            } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).minus({
                minutes: 30
            });
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

        let {
            c
        } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);

        // Verify the limit
        if (c.minute == 30 && c.hour == 23) {
            console.log("Horario maximo")
        } else {

            let {
                c
            } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes).plus({
                minutes: 30
            });
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
            let {
                c
            } = DateTime.local(time2.year, time2.month, time2.day, time2.hours, time2.minutes).minus({
                minutes: 30
            });
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

    let runActionOnRooms = (arrayIdResources) => {
        arrayIdResources.forEach(idSala => {
            $(`#${idSala}`).on("click", () => {

                let sala_id = $(`#${idSala}`).data("resource-id")

                api.post('/obtenerSala', {
                    api_token: token,
                    sala_id
                }).then(function ({
                    data
                }) {
                    let {
                        datos
                    } = data

                    $("#nombreGrupo").html(`Grupo ${datos.grupo}`)
                    $("#nombreSala").html(datos.nombre)
                    $("#capacity").html(`<span>${datos.capacidad}</span> personas`)


                    if (datos.tv === null || datos.tv == 0) {
                        $("#tv").html(`<i class="fa-solid fa-circle-xmark"></i>`)
                    } else {
                        $("#tv").html(`<i class="fa-solid fa-circle-check"></i>`)
                    }

                    if (datos.video_conferencia === null || datos.video_conferencia == 0) {
                        $("#videoConferency").html(`<i class="fa-solid fa-circle-xmark"></i>`)
                    } else {
                        $("#videoConferency").html(`<i class="fa-solid fa-circle-check"></i>`)
                    }

                    if (datos.hdmi === null || datos.hdmi == 0) {
                        $("#hdmi").html(`<i class="fa-solid fa-circle-xmark"></i>`)
                    } else {
                        $("#hdmi").html(`<i class="fa-solid fa-circle-check"></i>`)
                    }

                    $("#description").html(datos.descripcion)

                }).catch(function (error) {
                    // console.log(error);
                    logoutSession();
                });


                $('#modalInfo').modal("show");
            })
        });
    }
    setTimeout(() => {

        let idRecursosClickeables = () => {
            let content = document.getElementsByClassName("fc-datagrid-cell")
            let contentButtons = document.getElementsByClassName("fc-datagrid-expander")
            let count = 0;
            let arrayIdResources = [];

            for (let item of content) {

                // console.log(item.getAttribute("data-resource-id"))
                if (count != 0) {

                    if (item.getAttribute("data-resource-id") != null) {
                        item.setAttribute("id", `sala${item.getAttribute("data-resource-id")}`)
                        arrayIdResources.push(`sala${item.getAttribute("data-resource-id")}`)
                        item.setAttribute("style", "cursor:pointer")

                        const p = document.createElement("p");
                        const i = document.createElement("i");
                        i.classList.add("fa-solid")
                        i.classList.add("fa-square-caret-down")
                        p.appendChild(i);
                        p.setAttribute("id", "moreIcon");

                        // const icon = document.createElement("i");
                        item.appendChild(p);
                    }
                }
                count++;
            }

            runActionOnRooms(arrayIdResources);

            // Re asignent actions on rooms
            $(".fc-datagrid-expander").on("click", () => {
                setTimeout(() => {
                    idRecursosClickeables()
                }, 500);
            })
        }


        idRecursosClickeables()


        //-> @@Calendar buttons
        $(".fc-resourceTimelineDay-button").on("click", () => {
            $(".fc-resourceTimelineDay-button").disa
            // alert("resourceTimelineDay");
            sessionStorage.setItem("instanceLoaded", 2);
            showSelect("hidden");
            clearEvents();
            sessionStorage.setItem("dateStage", 1);

            startEventsToUI();
            idRecursosClickeables()

            if (window.screen.width < 430) {
                $("#titlePage").css({
                    "border-radius": "8px 8px 8px 8px",
                    "margin-top": "3em"
                })
                $(".info-section").css({
                    "height": "5em"
                })
            }


        });


        $(".fc-dayGridMonth-button").on("click", () => {
            // alert("dayGridMonth");
            sessionStorage.setItem("instanceLoaded", 2);
            showSelect("visible");
            clearEvents();
            sessionStorage.setItem("dateStage", 3);

            startEventsToUI();

            if (window.screen.width < 430) {
                $("#titlePage").css({
                    "border-radius": "8px 8px 0px 0px",
                    "margin-top": "0em"
                })
                $(".info-section").css({
                    "height": "8em"
                })
            }
        });


        // TODO agregar aqui la insercion y eliminacion de eventos
        $(".fc-next-button").on("click", () => {
            // alert("next");
            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();

            startEventsToUI();
        });

        $(".fc-prev-button").on("click", () => {
            // alert("prev");
            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();

            startEventsToUI();
        });

    }, 500);


    //-> @@Menu buttons
    $(".generalView").on("click", () => {
        sessionStorage.setItem("instanceLoaded", 2);
        clearEvents();
        sessionStorage.setItem("dateStage", 1);
        showSelect("hidden");
        calendar.changeView('resourceTimelineDay');

        startEventsToUI();
    });

    $(".logout").on("click", () => {

        Swal.fire({
            title: '¿Desea cerrar sesión?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                api.get('/logout', {
                    params: {
                        api_token: token
                    }
                }).then(function ({
                    data
                }) {
                    logoutSession();
                }).catch(function (error) {
                    console.log(error);
                    logoutSession();
                });



            }
        })
    });

    // Modal

})