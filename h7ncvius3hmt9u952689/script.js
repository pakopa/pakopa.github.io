(function (window, document, undefined) {
    'use strict';

    // const SURRENDER_COUNT = 1000;
    const SURRENDER_COUNT = 1000;

    // A little helper function
    function $(selector) {
        return document.querySelector(selector);
    }

    // Init page
    let surrenderCountLeft = SURRENDER_COUNT;
    let password = null;
    let surrenderIncreaseInterval = null;

    const notificationBox = $('div.notification');
    const surrenderBtn = $('button[name=surrender]');
    const unlockBtn = $('button[name=unlock]')
    const passwordInput = $('input[name=password]');
    const messageSection = $('section.message');
    const messageText = $('section.message > .text');
    const hintBox = $('div.hint');

    // Page functions
    function generatePassword() {
        let password = '';
        password += (Math.random() * (10 ** 17)).toString(36);
        password += (Math.random() * (10 ** 17)).toString(36);
        return password.replace(/[^A-Za-z0-9]/g, '');
    }

    function updatePassword(newPassword) {
        password = newPassword;
        hintBox.textContent = password;
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
            notificationBox.textContent = ' ';
        }, 10000);
    }

    function updateSurrender() {
        surrenderBtn.textContent = `Quedan ${surrenderCountLeft} clicks para revelar la contraseña`;
        hintBox.style.opacity = Math.pow(10, (10 * (SURRENDER_COUNT - surrenderCountLeft) / SURRENDER_COUNT) - 10);
    }

    function activateSurrenderIncrease() {

        clearInterval(surrenderIncreaseInterval);

        surrenderIncreaseInterval = setInterval(() => {

            if (surrenderCountLeft < SURRENDER_COUNT) {
                surrenderCountLeft += 1;
                updateSurrender();
            }
        }, 1500);
    }

    function deactivateSurrenderIncrease() {
        clearInterval(surrenderIncreaseInterval);
    }

    surrenderBtn.addEventListener('click', (e) => {
        surrenderCountLeft += -1;
        surrenderCountLeft = Math.max(surrenderCountLeft, 0);

        if (surrenderCountLeft == 990) {
            notification('Uf... en serio?');
        }

        if (surrenderCountLeft == 950) {
            notification('Bueno, pues ánimo');
        }

        if (surrenderCountLeft == 900) {
            notification('Si vas a seguir por este camino mejor no parar...');
        }

        if (surrenderCountLeft == 800) {
            notification('Por que hacer clicks si puedes inspeccionar la página');
        }

        if (surrenderCountLeft == 700) {
            notification('Como lo haría un hacker...');
        }

        if (surrenderCountLeft  == 600) {
            notification('Haciendo trampas seguro...');
        }

        if (surrenderCountLeft == 500) {
            notification('Bueno, pues ya vas por la mitad');
        }

        if (surrenderCountLeft == 450) {
            notification('¿Como va esa mano?');
        }

        if (surrenderCountLeft == 400) {
            notification('Me estarás odiando ahora mismo, pero has preferido hacerlo a lo bruto');
        }

        if (surrenderCountLeft == 300) {
            notification('Ya falta menos');
        }

        if (surrenderCountLeft == 200) {
            notification('Yo diría que se empieza a ver algo');
        }

        if (surrenderCountLeft == 100) {
            notification('Ya que estamos aquí, por que no llegar hasta el final');
        }

        if (surrenderCountLeft < 1) {
            clearInterval(rotatePassword);
            deactivateSurrenderIncrease();
            hintBox.style.visibility = 'hidden';
            passwordInput.value = password;
        } else {
            updateSurrender();
            activateSurrenderIncrease();
        }
    });

    unlockBtn.addEventListener('click', e => {

        if (passwordInput.value == password) {

            clearInterval(rotatePassword);
            notification('Contraseña Correcta!, Cargando mensaje...');

            fetch('message.txt').then(resp => {
                return resp.text();
            }).then(text => {
                messageText.innerHTML = text;
                messageSection.style.visibility = 'visible';
            });

        } else {
            notification('Contraseña incorrecta!');
        }
    });

    // Run page
    updatePassword(generatePassword());

    let rotatePassword = setInterval(() => {
        updatePassword(generatePassword());
        logPassword(password);
    }, 60000);


    let surrenderIncreaser = activateSurrenderIncrease();

    logPassword(password);

})(window, document);