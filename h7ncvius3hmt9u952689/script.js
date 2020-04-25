(function (window, document, undefined) {
    'use strict';

    // A little helper function
    function $(selector) {
        return document.querySelector(selector);
    }

    // Init page
    let surrenderCountLeft = 1000;
    let password = generatePassword();

    const notificationBox = $('div.notification');
    const surrenderBtn = $('button[name=surrender]');
    const unlockBtn = $('button[name=unlock]')
    const passwordInput = $('input[name=password]');
    const messageSection = $('section.message');
    const messageText = $('section.message > p');

    // Page functions
    function generatePassword() {
        let password = '';
        password += (Math.random() * (10 ** 17)).toString(36);
        password += (Math.random() * (10 ** 17)).toString(36);
        return password;
    }

    function logPassword(text) {
        setTimeout(() => {
            console.warn('THE PASSWORD IS:', text);
        }, 100);
        console.info('THE PASSWORD IS:', text);
    }

    function notification(text) {
        notificationBox.timer && clearTimeout(notificationBox.timer);
        notificationBox.textContent = text;
        notificationBox.timer = setTimeout(() => {
            notificationBox.textContent = null;
        }, 10000);
    }

    surrenderBtn.addEventListener('click', (e) => {
        surrenderCountLeft += -1;

        if (surrenderCountLeft % 900 == 0) {
            notification('Por que hacer clicks si puedes inspeccionar la página')
        }

        if (surrenderCountLeft < 1) {
            clearInterval(rotatePassword);

        } else {
            surrenderBtn.textContent = `Quedan ${surrenderCountLeft} clicks para revelar la contraseña`
        }
    });

    unlockBtn.addEventListener('click', e => {

        if (passwordInput.value == password) {

            clearInterval(rotatePassword);
            notification('Contraseña Correcta!, Cargando mensaje...');

            fetch('message.json').then(resp => {
                return resp.text();
            }).then(text => {
                messageText.textContent = text;
                messageSection.style.visibility = 'visible';
            });

        } else {
            notification('Contraseña incorrecta!');
        }
    });

    // Run page
    let rotatePassword = setInterval(() => {
        password = generatePassword();
        logPassword(password);
    }, 60000);

    logPassword(password);

})(window, document);