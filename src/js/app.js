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
    let calendarEl = document.getElementById('calendar');
    let calendar = "";
    sessionStorage.setItem("activeTab", btoa("generalView"))

    // @@instance of Luxon library
    let DateTime = luxon.DateTime;



    // @@Function to close session and remove all variables on session storage
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

    // @@Function to save selected room´s color in session storage
    let getColor = (sala_id) => {
        api.post('/obtenerSala', {
            api_token: token,
            sala_id
        }).then(function ({
            data
        }) {
            let {
                datos
            } = data
            sessionStorage.setItem("colorRoom", datos.color)
        }).catch(function (error) {
            logoutSession();
        });
    }


    // @@Function to save capacity room´s color in session storage
    let getCapacity = (sala_id) => {
        api.get('/listarCapacidad', {
            params: {
                api_token: token,
            }
        }).then(function ({
            data
        }) {
            let {
                datos
            } = data

            let options = `<option value="">Seleccionar</option>`;
            datos.forEach(item => {
                let {
                    capacidad
                } = item;

                options += `<option value="${capacidad}">${capacidad}</option>`
            });
            $("#capacityFilter").html(options)
        }).catch(function (error) {
            logoutSession();
        });
    }

    getCapacity()


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
        document.getElementById("titlePage").innerHTML = `<p><i class="fa-solid fa-calendar-days"></i> GRUPO ${title}</p>`;
    }
    $('.js-select').select2({
        containerCssClass: "",
        // theme: 'bootstrap',
    });

    // @@Function click for show/hide the navbar on mobile
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

    // @@Clean modal Event
    let cleanModal = () => {
        $('#name').val("");
        $("#nameApplicant").val("");
        $('#timeBegin').val("00:01");
        $('#timeEnd').val("00:30");
        $('#tipoEvento').val("");
        $('#tipoEvento').prop("disabled", false);

        let nameInput = [
            "drinks",
            "snacks",
            "others"
        ];
        nameInput.forEach(name => {
            $(`#${name}`).prop("checked", false);
            $(`#${name}Quantity`).val("");
            $(`#${name}Quantity`).attr('readonly', "")
        });
    }

    // @@Load event when modal is triggered
    let loadEventsOnModal = () => {
        let nameInput = $("#name");
        let applicantInput = $("#nameApplicant");
        let typeEventInput = $("#tipoEvento");
        let assistantsInput = $("#assistantsQuantity");


        nameInput.on("keyup", () => {
            nameInput.css("box-shadow", "none")
        })

        applicantInput.on("keyup", () => {
            applicantInput.css("box-shadow", "none")
        })

        typeEventInput.on("input", () => {
            typeEventInput.css("box-shadow", "none")
        })

        assistantsInput.on("keyup", () => {
            assistantsInput.css("box-shadow", "none")

            let value = assistantsInput.val();

            const maxValue = parseInt(assistantsInput.attr("max"))
            if (value > maxValue) {
                assistantsInput.val(maxValue)
            }
        })

        // Cancel button
        $("#cancel").on("click", () => {
            $('#modal').modal("hide");
        });

        // Add event button
        $("#add").on("click", () => {
            $("#add").prop("disabled", true);
            let sala_id = parseInt($("#room").attr("data"));
            let sala = $("#room").attr("data-name");
            let descripcion = $("#name").val();
            let solicitante = $("#nameApplicant").val();
            let date = $("#date").val();
            let timeBegin = $("#timeBegin").val();
            let timeEnd = $("#timeEnd").val();
            let usuario_id = atob(sessionStorage.getItem("user"));
            let color = sessionStorage.getItem("colorRoom")

            let asistentes = $("#assistantsQuantity").val();
            let bebida = $("#drinksQuantity").val();
            let aperitivo = $("#snacksQuantity").val();
            let tipoEvento = $("#tipoEvento").val();
            let otro = $("#othersQuantity").val();


            let isName = true;
            let isApplicant = true;
            let isTypeEvent = true;
            let isAssistants = true;

            if (bebida == "") {
                bebida = 0
            }
            if (aperitivo == "") {
                aperitivo = 0
            }

            if (otro == "") {
                otro = null
            }

            if (asistentes <= 0 || asistentes == null) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Complete el campo número de asistentes | minimo de asistentes 1!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                assistantsInput.css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isAssistants = false;
                $("#add").prop("disabled", false);
            }

            if (tipoEvento == "") {
                Swal.fire({
                    icon: 'error',
                    title: '¡Complete el campo tipo de evento!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                typeEventInput.css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isTypeEvent = false;
                $("#add").prop("disabled", false);
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



            if (isName == true && isApplicant == true && isTypeEvent == true && isAssistants == true) {

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
                        agua: bebida,
                        cafe: aperitivo,
                        tipo_evento: tipoEvento,
                        otro,
                        sala,
                        asistentes
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
        resource = "empty",
        view
    }) => {


        let rol = parseInt(atob(sessionStorage.getItem("rol")))
        let idInputs = [
            "drinks",
            "snacks",
            "others",
        ];

        idInputs.forEach(name => {
            $(`#${name}QuantitySection`).hide()
            $(`#${name}Row`).show()
        });

        let now = new Date();
        let timeLimitForRegister = new Date()
        timeLimitForRegister.setHours(23)
        timeLimitForRegister.setMinutes(00)
        timeLimitForRegister.setSeconds(00)

        // @@Validation for 11 oclock pm
        if (now > timeLimitForRegister) {
            Swal.fire({
                icon: 'info',
                title: '¡No puedes agregar eventos en el rango de 11:00 p.m. a 12:00 a.m.!',
                toast: true,
                timer: 1500,
                showConfirmButton: false,
            });
        } else {




            if (rol == 1 || rol == 2) {
                $(".info-event").css("display", "flex");
                $("#name").attr("readonly", false)
                $("#nameApplicant").attr("readonly", false)
                $("#assistantsQuantity").attr("readonly", false);
                $("#assistantsQuantity").val(1)


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

                // When clicked day sum one day more
                if (view.type == "dayGridMonth") {
                    clickedDate.setDate(clickedDate.getDate() + 1);
                }

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
                        // Get session storage name room selected
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


                    let time;
                    if (view.type == "resourceTimelineDay") {

                        let rightNow = new Date()
                        let dateSelectedNow = new Date(dateStr)

                        if (dateSelectedNow < rightNow) {
                            time = new Date();
                        } else {
                            time = new Date(dateStr);
                        }

                    } else {
                        time = new Date();
                    }


                    let hours = parseInt(time.getHours());
                    let minutes = parseInt(time.getMinutes());

                    let hoursEnd;
                    let minutesEnd;

                    if (view.type == "resourceTimelineDay") {
                        let rightNow = new Date()
                        let dateSelectedNow = new Date(dateStr)

                        if (dateSelectedNow < rightNow) {
                            // Si la hora en timeline es menor a la actual
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
                        } else {
                            // Si la hora en timeline es mayor a la actual
                            if (minutes < 29) {
                                minutes = "01";
                                minutesEnd = "30"


                                hoursEnd = hours
                                if (hoursEnd < 10) {
                                    hoursEnd = `0${hoursEnd}`;
                                }
                                if (hours < 10) {
                                    hours = `0${hours}`;
                                }

                            } else {
                                minutes = "31";
                                minutesEnd = "00"

                                hours = hours
                                hoursEnd = hours + 1;
                                if (hours < 10) {
                                    hours = `0${hours}`;
                                }
                                if (hoursEnd < 10) {
                                    hoursEnd = `0${hoursEnd}`;
                                }
                            }


                            // Si selecciona el rango de las 11:30
                            if (minutes == "31" && hours == "23") {
                                minutes = "01";
                                minutesEnd = "30"

                                hours = "23";
                                hoursEnd = "23"
                            }

                        }
                    } else {
                        // Si es la vista de mes
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
                    }

                    $("#timeBegin").val(`${hours}:${minutes}`)
                    $("#timeEnd").val(`${hoursEnd}:${minutesEnd}`)

                    $('#drinks').prop("disabled", false);
                    $('#snacks').prop("disabled", false);
                    $('#others').prop("disabled", false);
                    document.getElementById("date").value = dateText;
                    document.getElementById("room").value = titleEvent;
                    document.getElementById("room").setAttribute("data", idEvent);

                    let allrooms = JSON.parse(atob(sessionStorage.getItem("rooms")))
                    allrooms.forEach(item => {
                        if (item.id == idEvent) {
                            let capacidad = parseInt(item.capacidad)
                            let result = capacidad + Math.ceil((capacidad * 50) / 100)
                            document.getElementById("assistantsQuantity").setAttribute("max", result);
                        }
                    });

                    document.getElementById("room").setAttribute("data-name", titleEvent);
                    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-square-plus"></i> Agregar evento`;
                    document.getElementById("buttons").innerHTML = "";
                    document.getElementById("buttons").innerHTML = `${btnAdd} <button id="cancel" class="btn" data-dismiss="modal">Cancelar</button>`;


                    $('#plusBegin').prop("disabled", false);
                    $('#minusBegin').prop("disabled", false);

                    $('#plusEnd').prop("disabled", false);
                    $('#minusEnd').prop("disabled", false);

                    $('#modal').modal("show");

                    let sala_id = parseInt($("#room").attr("data"));
                    getColor(sala_id);

                    $("#nameApplicant").val(atob(sessionStorage.getItem("username")))
                    loadEventsOnModal();
                }
            }
        }

    }


    let eventAction = (info) => {

        let rol = parseInt(atob(sessionStorage.getItem("rol")))
        if (rol == 1 || rol == 2) {

            cleanModal();
            $(".info-event").css("display", "none");



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

                    let assistants = datos.asistentes;
                    let drinks = datos.agua;
                    let snacks = datos.cafe;
                    let tipoEvento = datos.tipo_evento;
                    let others = datos.otro;




                    let setExtras = (input, id) => {
                        if (input == 0) {
                            $(`#${id}Quantity`).val("")
                            $(`#${id}Quantity`).attr('readonly', "");
                            $(`#${id}`).attr('disabled', true);
                            $(`#${id}QuantitySection`).hide()
                            $(`#${id}Row`).hide()
                        } else {
                            $(`#${id}`).prop("checked", true);
                            $(`#${id}`).attr('disabled', true);
                            $(`#${id}Quantity`).val(input)
                            $(`#${id}Quantity`).attr('readonly', "");
                            $(`#${id}QuantitySection`).show()
                            $(`#${id}Row`).show()
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


                    let element = document.getElementById("tipoEvento");
                    element.value = tipoEvento;
                    $(`#tipoEvento `).prop("disabled", true);

                    setExtras(drinks, "drinks")
                    setExtras(snacks, "snacks")
                    setExtras(others, "others")

                    $("#timeBegin").val(`${hoursBegin}:${minutesBegin}`);
                    $("#timeEnd").val(`${hoursEnd}:${minutesEnd}`);
                    $("#name").attr("readonly", true);
                    $("#nameApplicant").attr("readonly", true);
                    $("#name").attr("data", info.event.id);
                    $("#name").val(info.event.title);
                    $("#nameApplicant").val(applicant);
                    $("#assistantsQuantity").val(assistants);
                    $("#assistantsQuantity").attr("readonly", true);
                    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-trash"></i> Eliminar evento`;
                    document.getElementById("buttons").innerHTML = "";
                    document.getElementById("buttons").innerHTML = `${btnDelete} <button id="cancel" class="btn" data-dismiss="modal">Cancelar</button>`;



                    $('#plusBegin').prop("disabled", true);
                    $('#minusBegin').prop("disabled", true);

                    $('#plusEnd').prop("disabled", true);
                    $('#minusEnd').prop("disabled", true);


                    $('#modal').modal("show");
                    loadEventsOnModal();
                    let now = new Date();



                    // Verify in order
                    /**
                     * 1- Month
                     * 2- Day
                     * 3- Same user
                     */
                    if (timeBegin.getMonth() + 1 < now.getMonth() + 1) {
                        $("#delete").hide();
                    } else {
                        if (timeBegin.getDate() < now.getDate()) {
                            $("#delete").hide();
                        } else {
                            if (datos.usuario_id == atob(sessionStorage.getItem("user"))) {
                                $("#delete").show();
                            } else {
                                $("#delete").hide();
                            }
                        }
                    }



                    // if (now > timeBegin) {
                    //     $("#delete").hide();
                    // } else {
                    //     $("#delete").show();
                    // }

                }).catch(function (error) {
                    console.log(error);
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
        sessionStorage.setItem("username", btoa(datos.nombre));
        sessionStorage.setItem("rol", btoa(datos.rol));
        sessionStorage.setItem("group", datos.grupo);

        showTitlePage();

    }).catch(function (error) {
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

    // @@Clean input from modal event "extras" section
    let cleanInput = (input) => {
        $(`#${input}Quantity`).val("")
        $(`#${input}Quantity`).attr('readonly', "");
        $(`#${input}QuantitySection`).hide()
    }

    // @@Show the inputs in "extras" section
    let showSection = (input) => {
        $(`#${input}Quantity`).removeAttr('readonly')

        let assistantValue = parseInt($("#assistantsQuantity").val());
        let assistantsMax = parseInt($("#assistantsQuantity").attr("max"));

        $(`#${input}Quantity`).attr('max', assistantsMax)
        input != "others" && $(`#${input}Quantity`).val(assistantValue)
        $(`#${input}QuantitySection`).show()
    }

    let idInputs = [
        "drinks",
        "snacks",
        "others",
    ]

    idInputs.forEach(name => {
        $(`#${name}QuantitySection`).hide()
        $(`#${name}`).on("click", () => {
            let isChecked = $(`#${name}`).prop("checked");
            isChecked ? showSection(name) : cleanInput(name)
        })
    });

    // @@Set the max and min value for the number of person in "extras" section
    let verifyNumberMaxMin = (input) => {
        let value = $(`#${input}`).val();
        let min = parseInt($(`#${input}`).attr("min"))
        let max = parseInt($(`#${input}`).attr("max"))
        // if (value < min) {
        //     $(`#${input}`).val(min);
        // }
        if (value > max) {
            $(`#${input}`).val(max);
        }
    }

    let inputsName = [
        "drinksQuantity",
        "snacksQuantity",
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
        let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));
        // let arrayEvents = JSON.parse(sessionStorage.getItem("events"));

        let now = new Date();
        let hour;
        let minutes;

        if (now.getHours() < 10) {
            hour = `0${now.getHours()}`;
        } else {
            hour = now.getHours();
        }

        if (now.getMinutes() < 10) {
            minutes = `0${now.getMinutes()}`;
        } else {
            minutes = now.getMinutes();
        }

        //-> @@Config default
        calendar = new FullCalendar.Calendar(calendarEl, {
            schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
            initialView: "resourceTimelineDay",
            slotMinTime: "01:00:00",
            slotMaxTime: "24:00:00",
            scrollTime: `${hour}:${minutes}:00`,
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
                minute: '2-digit',
                omitZeroMinute: false,
                hour12: false,
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


        // @@FNnameday==========================================================================

        let nameDay = calendar.getDate().toLocaleString('es', {
            weekday: 'long'
        })
        nameDay = nameDay.charAt(0).toUpperCase() + nameDay.slice(1)
        let getTitle = $("#fc-dom-1").text()
        $("#fc-dom-1").text(`${nameDay}, ${getTitle}`);
        // ==========================================================================
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

        sessionStorage.setItem("events", btoa(JSON.stringify(datos)));
        runCalendar();
        iniciateAndLoadEvents();
    }).catch(function (error) {
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
            let arrayEvents = JSON.parse(atob(sessionStorage.getItem("events")));
            // let arrayEvents = JSON.parse(sessionStorage.getItem("events"));

            setTimeout(() => {
                arrayEvents.forEach(evento => {
                    calendar.addEvent(evento);
                })
            }, 500);
        }

        // TODO: Close loader
    }

    // @@Load events on calendar timeline view o moth view
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
                sessionStorage.setItem("events", btoa(JSON.stringify(datos)));
                // sessionStorage.setItem("events", JSON.stringify(datos));
                iniciateAndLoadEvents();
            }).catch(function (error) {
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
                sessionStorage.setItem("events", btoa(JSON.stringify(datos)))
                // sessionStorage.setItem("events", JSON.stringify(datos))
                iniciateAndLoadEvents();
            }).catch(function (error) {
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

        let {
            c
        } = DateTime.local(time.year, time.month, time.day, time.hours, time.minutes);
        // Verify the limit
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


    // For iphone
    $("#timeBegin").on("click", () => {
        $('#timeBegin').blur();
    });

    $("#timeEnd").on("click", () => {
        $('#timeEnd').blur();
    });


    // ________________________________________________________________________________________________________________________
    // @6° CALENDAR & MENU BUTTONS ACTIONS __________________________________________________________________________________________________
    // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

    // @@Load events
    let startEventsToUI = () => {

        let [primerDia, ultimoDia] = getCurrentMonth(calendar.getDate());
        // SetTime
        sessionStorage.setItem("firstDate", primerDia);
        sessionStorage.setItem("lastDate", ultimoDia);
        loadEvents();
    }

    // @@Set Action on rooms for show details
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

                    let nameIcons = [
                        "tv",
                        "videoConferency",
                        "hdmi"
                    ]

                    // @@Set the correct icon for each case
                    nameIcons.forEach(name => {
                        let value;
                        if (name == "tv") {
                            value = datos.tv
                        } else if (name == "videoConferency") {
                            value = datos.video_conferencia
                        } else {
                            value = datos.hdmi
                        }

                        if (value === null || value == 0) {
                            $(`#${name}`).html(`<i class="fa-solid fa-circle-xmark"></i>`)
                        } else {
                            $(`#${name}`).html(`<i class="fa-solid fa-circle-check"></i>`)
                        }
                    });

                    $("#description").html(datos.descripcion)

                }).catch(function (error) {
                    logoutSession();
                });


                $('#modalInfo').modal("show");
            })
        });
    }




    // @@Delay for render first the calendar and after the events
    setTimeout(() => {

        // @@Events click on rooms
        let idRecursosClickeables = () => {
            let content = document.getElementsByClassName("fc-datagrid-cell")
            let count = 0;
            let arrayIdResources = [];
            for (let item of content) {
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
                        item.appendChild(p);
                    }
                }
                count++;
            }

            runActionOnRooms(arrayIdResources);

            // @@Re asignent actions on rooms
            $(".fc-datagrid-expander").on("click", () => {

                setTimeout(() => {
                    idRecursosClickeables()
                }, 1000);
            })
        }
        idRecursosClickeables()


        let AddNameDay = () => {
            let stage = parseInt(sessionStorage.getItem("dateStage"));
            let dayInstance = calendar.getDate()
            let year = dayInstance.getFullYear()
            let numberDay = dayInstance.getDate()
            const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ];
            let nameMonth = monthNames[dayInstance.getMonth()]
            let nameDay = dayInstance.toLocaleString('es', {
                weekday: 'long'
            })
            nameDay = nameDay.charAt(0).toUpperCase() + nameDay.slice(1)


            if (stage == 1) {
                $("#fc-dom-1").text("")
                $("#fc-dom-1").text(`${nameDay}, ${numberDay} de ${nameMonth} de ${year}`);
            } else {
                $("#fc-dom-1").text("")
                $("#fc-dom-1").text(`${nameMonth} de ${year}`);
            }
        }

        //-> @@Calendar buttons
        $(".fc-resourceTimelineDay-button").on("click", () => {
            $(".fc-resourceTimelineDay-button").prop('disabled', true);
            $(".fc-dayGridMonth-button").prop('disabled', false);
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

            AddNameDay()
        });


        $(".fc-dayGridMonth-button").on("click", () => {
            $(".fc-resourceTimelineDay-button").prop('disabled', false);
            $(".fc-dayGridMonth-button").prop('disabled', true);
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
            AddNameDay()
        });


        // TODO agregar aqui la insercion y eliminacion de eventos
        $(".fc-next-button").on("click", () => {
            AddNameDay()
            // alert("next");
            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();

            startEventsToUI();
        });

        $(".fc-prev-button").on("click", () => {
            AddNameDay()
            // alert("prev");
            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();

            startEventsToUI();
        });




        $("#btnRestoreFilter").on("click", () => {
            $(location).prop('href', 'calendar.html');
        })

        $("#capacityFilter").on("change", () => {
            $("#capacityFilter").css("box-shadow", "none");
        })

        $("#btnApplyFilter").on("click", () => {
            let date = $("#dateFilter").val();
            if (date == "") {
                Swal.fire({
                    icon: 'info',
                    title: '¡Campo fecha vacío!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                $("#dateFilter").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
            } else {
                $("#dateFilter").css("box-shadow", "none");

                let dia = date.substring(0, 2)
                let mes = date.substring(3, 5)
                let anio = date.substring(6, 10)


                date = `${anio}-${mes}-${dia}`;
                let capacidad = $("#capacityFilter").val();
                let tv = $("#tvFilter").prop("checked");
                let video_conferencia = $("#videoFilter").prop("checked");
                let hdmi = $("#hdmiFilter").prop("checked");
                let isOkCapacity = false;
                let isOkDate = false;


                if (capacidad == "") {
                    Swal.fire({
                        icon: 'info',
                        title: '¡Campo capacidad vacío!',
                        toast: true,
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    $("#capacityFilter").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                    isOkCapacity = false;
                } else {
                    $("#capacityFilter").css("box-shadow", "none");
                    isOkCapacity = true;
                }



                if (date.length == 0) {
                    Swal.fire({
                        icon: 'info',
                        title: '¡Campo fecha vacío!',
                        toast: true,
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    $("#dateFilter").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                    isOkDate = false;
                } else {
                    $("#dateFilter").css("box-shadow", "none");
                    isOkDate = true;
                }


                if (isOkDate && isOkCapacity) {

                    $("#btnApplyFilter").prop("disabled", true);
                    $('#modalLoad').modal("show");
                    tv ? tv = 1 : tv = 0;
                    video_conferencia ? video_conferencia = 1 : video_conferencia = 0;
                    hdmi ? hdmi = 1 : hdmi = 0;

                    api.post('/listarSalasFiltradas', {
                        api_token: token,
                        capacidad,
                        tv,
                        video_conferencia,
                        hdmi
                    }).then(function ({
                        data
                    }) {
                        let {
                            datos
                        } = data
                        let salas_ids = [];


                        setTimeout(() => {
                            datos.forEach(item => {
                                salas_ids.push(item.id)
                            })

                            if (salas_ids.length > 0) {
                                calendar.getEvents().forEach(evento => evento.remove())
                                calendar.getResources().forEach(resource => resource.remove());

                                datos.forEach(item => {
                                    calendar.addResource(item);
                                })


                                fillSelect(datos)

                                setTimeout(() => {
                                    api.post('/obtenerTodosEventosFiltrados', {
                                        api_token: token,
                                        salas_ids,
                                        fecha_inicio: `${date} 00:00:00`,
                                        fecha_fin: `${date} 23:59:00`
                                    }).then(function ({
                                        data
                                    }) {
                                        let {
                                            datos
                                        } = data

                                        setTimeout(() => {
                                            datos.forEach(evento => {
                                                calendar.addEvent(evento);
                                            })

                                            calendar.gotoDate(date)

                                            $("#btnApplyFilter").prop("disabled", false);
                                            $('#modalLoad').modal("hide");
                                            $('#modalFilter').modal("hide");
                                            idRecursosClickeables()
                                            AddNameDay()
                                        }, 500);

                                    }).catch(function (error) {
                                        console.log(error)
                                        logoutSession();
                                    });
                                }, 500);


                            } else {
                                Swal.fire({
                                    title: '¡No se encontraron resultados!',
                                    text: "Prueba con otros parámetros de búsqueda",
                                    icon: 'info',
                                    confirmButtonColor: '#313945',
                                    confirmButtonText: 'Entendido',
                                    allowOutsideClick: false
                                });
                                $("#btnApplyFilter").prop("disabled", false);
                                $('#modalLoad').modal("hide");
                            }

                        }, 500);

                    }).catch(function (error) {
                        console.log(error)
                        logoutSession();
                    });

                }
            }


        })

        $(".fc-today-button").on("click", () => {
            AddNameDay()
        })
    }, 1000);


    //Show input password
    let showInputPass = (button, input) => {
        $(`#${button}`).on("click", () => {
            let typeInput = $(`#${input}`).attr("type")
            if (typeInput == "password") {
                $(`#${input}`).attr("type", "text")
                $(`#${button}`).html(`<i class="fa-solid fa-eye-slash"></i>`)

            } else {
                $(`#${input}`).attr("type", "password")
                $(`#${button}`).html(`<i class="fa-solid fa-eye"></i>`)

            }
        })
    }

    showInputPass("oldPassShow", "oldPass")
    showInputPass("newPassShow", "newPass")
    showInputPass("reNewPassShow", "reNewPass")



    $(`.userView`).on("click", () => {
        $('#modalProfile').modal("show");
        $(`#oldPass`).val("");
        $(`#newPass`).val("");
        $(`#reNewPass`).val("");


        $(`#changePass`).on("click", () => {


            $(`#reNewPass`).on("keyup", () => {
                $(`#reNewPass`).css("box-shadow", "none")
            })

            $(`#newPass`).on("keyup", () => {
                $(`#newPass`).css("box-shadow", "none")
            })

            $(`#oldPass`).on("keyup", () => {
                $(`#oldPass`).css("box-shadow", "none")
            })

            let oldPass = $(`#oldPass`).val();
            let newPass = $(`#newPass`).val();
            let reNewPass = $(`#reNewPass`).val();

            let isOldPass = false;
            let isNewPass = false;
            let isReNewPass = false;

            if (reNewPass.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Campo Reescribe nueva contraseña vacio!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                $(`#reNewPass`).css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isReNewPass = false;
            } else {
                isReNewPass = true;
            }

            if (newPass.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Campo nueva contraseña vacio!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                $(`#newPass`).css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isNewPass = false;
            } else {
                isNewPass = true;
            }

            if (oldPass.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: '¡Campo antigua contraseña vacio!',
                    toast: true,
                    timer: 1500,
                    showConfirmButton: false,
                });
                $(`#oldPass`).css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                isOldPass = false;
            } else {
                isOldPass = true;
            }

            if (isOldPass && isNewPass && isReNewPass) {

                Swal.fire({
                    title: '¿Desea cambiar su contraseña?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si, cambiar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (newPass == reNewPass) {
                            api.post('/cambiarContra', {
                                api_token: token,
                                contraAntigua: oldPass,
                                contraNueva: newPass,
                                contraRepetida: reNewPass
                            }).then(function ({
                                data
                            }) {
                                let {
                                    datos
                                } = data


                                if (datos == 1 || datos == "1") {
                                    Swal.fire({
                                        icon: 'success',
                                        title: '¡Contraseña cambiada!',
                                        allowOutsideClick: false
                                    });
                                    $('#modalProfile').modal("hide");
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: `¡${datos}!`,
                                        toast: true,
                                        timer: 1500,
                                        showConfirmButton: false,
                                    });
                                }
                            }).catch(function (error) {
                                logoutSession();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: '¡Campos de nueva contraseña no coinciden!',
                                toast: true,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        }
                    }
                })
            }
        });


        if (window.screen.width < 430) {
            $('#btnMenuResponsive').html(`<i class="fa-solid fa-bars"></i>`);
            $('#btnMenuResponsive').attr("data", 0);
            $('#btnMenuResponsive').css("left", "0em")
            $('.nav').css("left", "-12em")
        }
    });

    $(`.filterView`).on("click", () => {
        $("#dateFilter").datepicker({
            minDate: 0,
            dayNamesMin: ["Do", "Lu", "Ma", "Me", "Ju", "Vi", "Sa"],
            monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            dateFormat: "dd-mm-yy"
        });

        IMask(document.getElementById('dateFilter'), {
            mask: '00-00-0000'
        });

        $('#modalFilter').modal("show");
        if (window.screen.width < 430) {
            $('#btnMenuResponsive').html(`<i class="fa-solid fa-bars"></i>`);
            $('#btnMenuResponsive').attr("data", 0);
            $('#btnMenuResponsive').css("left", "0em")
            $('.nav').css("left", "-12em")
        }
    })

    //-> @@Menu buttons
    $(".generalView").on("click", () => {


        let activeTab = atob(sessionStorage.getItem("activeTab"))
        if (activeTab != "generalView") {
            sessionStorage.setItem("activeTab", btoa("generalViews"))

            sessionStorage.setItem("instanceLoaded", 2);
            clearEvents();
            sessionStorage.setItem("dateStage", 1);
            showSelect("hidden");
            calendar.changeView('resourceTimelineDay');

            startEventsToUI();
        }

    });

    // @@Logout session
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
                    logoutSession();
                });
            }
        })
    });


    // FN: Check the rol and validate the option for create user


    setTimeout(() => {

        let rolValidate = parseInt(atob(sessionStorage.getItem("rol")))
        if (rolValidate == 1) {
            $("#opCreateUser").removeClass("noneItem")
            sessionStorage.removeItem("eOk");

            // Fill select in create user
            api.get('/obtenerRoles', {
                params: {
                    api_token: token,
                }
            }).then(function ({
                data
            }) {
                let {
                    datos
                } = data

                let options = `<option value="">Seleccionar</option>`;
                datos.forEach(item => {
                    let {
                        id, descripcion
                    } = item;

                    options += `<option value="${id}">${descripcion}</option>`
                });
                $("#rolUser").html(options)
            }).catch(function (error) {
                logoutSession();
            });

            api.get('/obtenerGrupos', {
                params: {
                    api_token: token,
                }
            }).then(function ({
                data
            }) {
                let {
                    datos
                } = data

                let options = `<option value="">Seleccionar</option>`;
                datos.forEach(item => {
                    let {
                        id, nombre
                    } = item;

                    options += `<option value="${id}">${nombre}</option>`
                });
                $("#grupoUser").html(options)
            }).catch(function (error) {
                logoutSession();
            });



            $("#nombreUser").on("input", () => {
                $("#nombreUser").css("box-shadow", "none")
            })

            $("#mailUser").on("input", () => {
                $("#mailUser").css("box-shadow", "none")
            })

            $("#passUser").on("input", () => {
                $("#passUser").css("box-shadow", "none")
            })

            $("#rolUser").on("input", () => {
                $("#rolUser").css("box-shadow", "none")
            })

            $("#grupoUser").on("input", () => {
                $("#grupoUser").css("box-shadow", "none")
            })

            let expresiones = {
                textMail: /[*{}\[\]\^~`"'`´¨,;:_|()=°¬\s]/g,
                mail: /^[-\w%-.$#+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i
            };


            let mailTest = () => {
                //Replace some special characters at correo
                let mail = document.getElementById("mailUser");
                mail.setAttribute("maxlength", 40);

                mail.addEventListener("input", (e) => {
                    //Replace special characters
                    let valor = e.target.value;
                    let nuevoValor = valor.replace(expresiones.textMail, '');
                    document.getElementById(e.target.id).value = nuevoValor.toLowerCase();
                });


                mail.addEventListener("input", () => {
                    setTimeout(() => {
                        let valido = document.getElementById('emailOK');
                        if (expresiones.mail.test(mail.value)) {
                            valido.innerHTML = `Correo electrónico <i class="far fa-check-circle"></i>`;
                            sessionStorage.setItem("eOk", 1)
                        } else {
                            valido.innerHTML = `Correo electrónico <i class="far fa-times-circle"></i>`;
                            sessionStorage.setItem("eOk", 0)
                        }
                    }, 500);
                });
            }
            mailTest();



            $(".opCreateUser").on("click", () => {

                if (window.screen.width < 430) {
                    $('#btnMenuResponsive').html(`<i class="fa-solid fa-bars"></i>`);
                    $('#btnMenuResponsive').attr("data", 0);
                    $('#btnMenuResponsive').css("left", "0em")
                    $('.nav').css("left", "-12em")
                }


                // Start modal functions 
                $("#nombreUser").val("");
                $("#mailUser").val("");
                $("#passUser").val("");
                $("#rolUser").val("");
                $("#grupoUser").val("");

                $('#modaladdUser').modal("show");
                $("#passShow").on("click", () => {
                    let typeInput = $("#passUser").attr("type")
                    if (typeInput == "password") {
                        $("#passUser").attr("type", "text")
                        $("#passShow").html(`<i class="fa-solid fa-eye-slash"></i>`)

                    } else {
                        $("#passUser").attr("type", "password")
                        $("#passShow").html(`<i class="fa-solid fa-eye"></i>`)
                    }
                })




                $("#btnCreateUser").on("click", () => {
                    $("#btnCreateUser").attr("disabled", true);
                    let nombre = $("#nombreUser").val();
                    let correo = $("#mailUser").val();
                    let contra = $("#passUser").val();
                    let rol_id = $("#rolUser").val();
                    let grupo_id = $("#grupoUser").val();


                    let isValidateName = false;
                    let isValidateMail = false;
                    let isValidatePass = false;
                    let isValidateRol = false;
                    let isValidateGroup = false;


                    // ===============
                    // Validate group
                    if (grupo_id == "") {
                        isValidateGroup = false;
                        $("#grupoUser").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                        Swal.fire({
                            icon: 'info',
                            title: '¡Seleccione un grupo!',
                            toast: true,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    } else {
                        $("#grupoUser").css("box-shadow", "none");
                        isValidateGroup = true;
                    }

                    // Validate rol
                    if (rol_id == "") {
                        isValidateRol = false;
                        $("#rolUser").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                        Swal.fire({
                            icon: 'info',
                            title: '¡Seleccione un rol!',
                            toast: true,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    } else {
                        isValidateRol = true;
                        $("#rolUser").css("box-shadow", "none")
                    }


                    // Validate pass
                    if (contra == "") {
                        isValidatePass = false;
                        $("#passUser").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                        Swal.fire({
                            icon: 'info',
                            title: '¡Campo contraseña vacío!',
                            toast: true,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    } else {
                        isValidatePass = true;
                        $("#passUser").css("box-shadow", "none")
                    }


                    // Validate mail
                    if (correo == "") {
                        isValidateMail = false;
                        $("#mailUser").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                        Swal.fire({
                            icon: 'info',
                            title: '¡Campo correo eléctronico vacío!',
                            toast: true,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    } else {
                        if (parseInt(sessionStorage.getItem("eOk")) == 0) {
                            isValidateMail = false;
                            $("#mailUser").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                            Swal.fire({
                                icon: 'info',
                                title: 'Complete formato de correo eléctronico',
                                toast: true,
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        } else {
                            $("#mailUser").css("box-shadow", "none");
                            isValidateMail = true;
                        }

                    }

                    // Validate name
                    if (nombre == "") {
                        isValidateName = false;
                        $("#nombreUser").css("box-shadow", "inset 0px 0px 0.5em #ff000080");
                        Swal.fire({
                            icon: 'info',
                            title: '¡Campo nombre vacío!',
                            toast: true,
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    } else {
                        $("#nombreUser").css("box-shadow", "none");
                        isValidateName = true;
                    }

                    if (isValidateGroup == true && isValidateRol == true && isValidatePass == true && isValidateMail == true && isValidateName == true) {
                        api.post('/crearUsuario', {
                            api_token: token,
                            rol_id,
                            dui: "00000000-0",
                            nombre,
                            correo,
                            contra,
                            telefono: "0000-0000",
                            grupo_id
                        }).then(function ({
                            data
                        }) {
                            let {
                                datos
                            } = data;
                            Swal.fire({
                                title: '¡Usuario creado con exito!',
                                icon: 'success',
                                confirmButtonColor: '#313945',
                                confirmButtonText: 'Entendido',
                                allowOutsideClick: false
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    $("#btnCreateUser").attr("disabled", false);
                                    $('#modaladdUser').modal("hide");
                                }
                            })
                        }).catch(function (error) {
                            $("#btnCreateUser").attr("disabled", false);
                            logoutSession();
                        });
                    } else {
                        $("#btnCreateUser").attr("disabled", false);
                    }

                });


            });
        }
    }, 300);




})