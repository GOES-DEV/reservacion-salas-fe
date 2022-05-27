document.addEventListener('DOMContentLoaded', function () {
    $("#login").on("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { user, pass } = Object.fromEntries(formData);

        api.post('/login', {
            dui: user,
            contra: pass
        })
            .then(function ({ data }) {
                let { datos } = data;

                if (datos == "Usuario o contraseña incorrecto") {
                    // SweetAlert pending
                    alert("Usuario o pass incorrectos")
                } else {
                    sessionStorage.setItem("tok", btoa(datos.api_token));
                    console.log(window.location.hostname);
                    console.log(window.location.pathname);
                    $(location).prop('href', 'views/calendar.html');
                }


            })
            .catch(function (error) {
                console.log(error);
                alert("Ha ocurrido un error")
            });
    })

})