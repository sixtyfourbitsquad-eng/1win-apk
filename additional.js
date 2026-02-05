// ************** INIT FUNCTION **************

window.isDefaultVersion = false;
let initTimeout = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 200; // ~1 second at 5ms intervals

function waitForInitVue() {
  initAttempts++;
  
  // Fallback: proceed if we've waited too long or if app_init_el exists or app has content
  const appInitEl = document.getElementById("app_init_el");
  const appEl = document.getElementById("app");
  const hasAppContent = appEl && (appEl.children.length > 0 || appEl.innerHTML.trim().length > 0);
  
  if (appInitEl || hasAppContent || initAttempts >= MAX_INIT_ATTEMPTS) {
    if (initTimeout) {
      clearTimeout(initTimeout);
      initTimeout = null;
    }
    
    // Diagnostic: log what triggered the init
    if (initAttempts >= MAX_INIT_ATTEMPTS && !appInitEl && !hasAppContent) {
      console.warn("Vue app may not have mounted. Proceeding with fallback initialization after", initAttempts, "attempts.");
    }
    
    const cookie = getCookie("inst_app_status");

    // Scroller Motivation
    if ((window.isScrollerOn && !cookie) || cookie === "0") {
      setTimeout(() => {
        // window.scrollTo(0, 260)
        // window.scroll({ top: 260, behavior: 'auto' });
        window.scrollTo({ top: 260, behavior: "auto" });
        setTimeout(() => {
          window.scrollTo({ top: 260, behavior: "auto" });
        }, 48);
      }, 36);
    }

    // if (window.appVersion === 4) {
    // }

    log('Button vue "pwa button_go_to_app" loaded');

    // добавляем листенер на кнопку "открыть"
    const goToAppButton = document.getElementById("pwa_button_go_to_app");
    if (goToAppButton) {
      goToAppButton.addEventListener("click", (e) => {
        e.preventDefault();
        try {
          window.goToAppInitFunc();
        } catch {
          location.href = "/home/";
        }
      });
    }

    log("init App Version", window.appVersion);

    // Cancel button
    // if (document.getElementById('pwa_double_left_button')) {
    //    document.getElementById('pwa_double_left_button').onclick = function () {
    //       setTimeout(() => window.location.reload(), 15)
    //    }
    // }

    switch (window.appVersion) {
      case 2:
        initAppVersion_2();
        break;
      case 3:
        initAppVersion_3();
        break;
      case 4:
        if (!cookie || cookie === "0") {
          initAppVersion_4();
        } else {
          hideAllButtons();
          showButtonToGoApp();
        }
        break;
      case 5:
        if (!cookie || cookie === "0") {
          initAppVersion_5();
        } else {
          hideAllButtons();
          showButtonToGoApp();
        }
        break;
      case 6:
        if (!cookie || cookie === "0") {
          initAppVersion_6();
        } else {
          hideAllButtons();
          showButtonToGoApp();
        }
        break;

      default:
        if (
          (uaParser.getOS().name == "Windows" &&
            uaParser.getBrowser().name == "Chrome") ||
          (uaParser.getOS().name == "Android" &&
            uaParser.getBrowser().name.includes("Chrome"))
        ) {
          window.isDefaultVersion = true;
          initAppVersion_default();
          break;
        } else {
          setCookie("inst_app_status", "1", {
            secure: true,
            "max-age": 3153600000,
          });
          window.isDefaultVersion = true;
          hideAllButtons();
          const goToAppBtn = document.getElementById("pwa_button_go_to_app");
          if (goToAppBtn) {
            goToAppBtn.style.display = "";
          }
          //  showButtonToGoApp();
          break;
        }
    }

    switch (window.appVersion) {
      case 4:
        break;
      case 5:
        break;
      default:
        setTimeout(() => {
          if (!cookie || cookie === "0") {
            if (!window.isDefaultVersion) {
              hideAllButtons();
              if (window.appVersion !== 4 || window.appVersion !== 5)
                showButtonToInstall();
              else showPreinstallButton();
              // showButtonToGoApp()
            }
          } else {
            hideAllButtons();
            showButtonToGoApp();
          }
        }, window.preButtonShowDelay);
        break;
      case 6:
        break;
    }
  } else {
    initTimeout = setTimeout(() => {
      waitForInitVue();
    }, 5);
  }
}

// Start button "pwa_button_go_to_app" async init checking
waitForInitVue();

// -------------- END INIT FUNCTION --------------

// ************** APP FUNCTIONS **************

window.stateApp = {
  isButtonGoAppInit: false,
};

window.isFirstDoubleOpenButtons = false;

function showButtonToGoApp() {
  if (window.appVersion === 6) {
    if (!window.isFirstDoubleOpenButtons) {
      const button = document.getElementById("pwa_button_go_to_app");
      button.outerHTML = `<div id="pwa_double_open_buttons" style="
            display: flex;
            width: calc(100vw - 52px);
            gap: 10px;
            justify-content: center;">
         <button id="pwa_double_open_left_button" class="button button_double_big button_main" style="
            background-color: transparent !important;
            border: gray solid 1px;
            color: #0d57d1;
         ">
         ${window.messagesDict.ru.buttons?.delete || "Delete"}</button>
         <button id="pwa_double_open_right_button" class="button button_double_big button_main" 
         onclick="">
         ${window.messagesDict.ru.buttons?.open || "Open"}</button>
         </button>
         </div>`;
      setTimeout(() => {
        document
          .getElementById("pwa_double_open_right_button")
          .addEventListener("click", (e) => {
            e.preventDefault();
            try {
              window.goToAppInitFunc();
            } catch {
              location.href = "/home/";
            }
          });
      }, 0);
      window.isFirstDoubleOpenButtons = true;
    } else {
      const buttons = document.getElementById("pwa_double_open_buttons");
      if (buttons) {
        buttons.display = "";
      }
    }
  } else {
    document.getElementById("pwa_button_go_to_app").style.display = "";
    document.getElementById("pwa_button_install").style.display = "none";
  }
  window.stateApp.isButtonGoAppInit = true;
}

function hideAllButtons() {
  document.getElementById("pwa_button_preinstall").style.display = "none";
  document.getElementById("pwa_button_go_to_app").style.display = "none";
  document.getElementById("pwa_button_install").style.display = "none";
  document.getElementById("pwa_double_buttons").style.display = "none";
  document.getElementById("pwa_button_download").style.display = "none";
  setButtonToInstallInDoubleButtons({ hide: true });
  if (window?.stateApp?.isButtonGoAppInit) showButtonToGoApp();
}

function showButtonToInstall() {
  if (!window?.stateApp?.isButtonGoAppInit) {
    document.getElementById("pwa_button_go_to_app").style.display = "none";
    document.getElementById("pwa_button_install").style.display = "";
  }
}

function showButtonInstallOrPreinstall() {
  if (window.promptEvent) {
    showButtonToInstall();
  } else {
    showPreinstallButton();
  }
}

function showPreinstallButton() {
  if (!window?.stateApp?.isButtonGoAppInit) {
    document.getElementById("pwa_button_preinstall").style.display = "";
  }
}

function log(...args) {
  // if (window.isLogOn) console.log(args.join(" "));
}

window.promptEvent = null;

if (!window.isOffInitBeforeinstallprompt) {
  if (
    (uaParser.getOS().name == "Windows" &&
      uaParser.getBrowser().name == "Chrome") ||
    (uaParser.getOS().name == "Android" &&
      uaParser.getBrowser().name.includes("Chrome"))
  ) {
    // window.BeforeInstallPrompt = () => {
    // };
    // document.addEventListener("DOMContentLoaded", function () {
    //   BeforeInstallPrompt();
    // });
    // document.addEventListener("load", function () {
    //   BeforeInstallPrompt();
    // });
  } else {
    setTimeout(async () => {
      window.stateBeforeinstallprompt = true;
      window.promptEvent = { data: true };
      if (window.doneManifestLoaded) window.doneManifestLoaded();
    }, 1000);
  }
}

window.setAppLoading = async () => {
  // document.getElementById('pwa_button_preinstall').style.display = 'none'
  if (
    (uaParser.getOS().name == "Windows" &&
      uaParser.getBrowser().name == "Chrome") ||
    (uaParser.getOS().name == "Android" &&
      uaParser.getBrowser().name.includes("Chrome"))
  ) {
    if (!navigator.platform.includes("Linux")) {
      let e = window.location.search;
      location.href = `/home/${e}`;
    }
  } else {
    window.buttonLoadingDelay = window.buttonLoadingDelay / 2;
  }

  if (window?.firstPushdownloadInit) {
    document.getElementById("pwa_double_right_button").style.backgroundColor =
      "";

    setTimeout(async () => {
      document.getElementById("pwa_double_buttons").style.display = "none";
      // window.toggleLogoScaleSize('big')
      if (document.getElementById("pwa_logo_parent"))
        document.getElementById("pwa_logo_parent").style.scale = "";
      hideAllButtons();
      showButtonToGoApp();
    }, window.buttonLoadingDelay);
  } else {
    hideAllButtons();
    showButtonToInstall();

    const buttonMain = document.getElementById("pwa_button_install");

    const titleMainButton = buttonMain.innerHTML;
    buttonMain.innerHTML =
      loadingStringWithLoaderRing +
      `<div class="loader_parent"><span class="loader loader_loaging"></span></div>`;

    setTimeout(async () => {
      buttonMain.innerHTML = titleMainButton;

      // document.getElementById('pwa_button_install').style.display = 'none'
      // document.getElementById('pwa_button_go_to_app').style.display = ''

      hideAllButtons();
      showButtonToGoApp();
    }, window.buttonLoadingDelay);
  }
};

//test
window.showButtonToGoApp = showButtonToGoApp;

window.toggleLogoScaleSize = (size = null) => {
  const logoParent = document.getElementById("pwa_logo_parent");
  if (!logoParent) return;

  if (size === null) {
    const currentScale = parseFloat(getComputedStyle(logoParent).scale || "1");

    if (currentScale > 0.75) {
      logoParent.style.scale = "0.5";
    } else {
      logoParent.style.scale = "1";
    }
  }

  if (size === "big") {
    logoParent.style.scale = "1";
  } else if (size === "small") {
    logoParent.style.scale = "0.5";
  }
};

window.setAppInstall = (params = {}) => {
  log("appInstalling!!");

  window.tttttt = "appInstalling!!";
  if (
    (uaParser.getOS().name == "Windows" &&
      uaParser.getBrowser().name == "Chrome") ||
    (uaParser.getOS().name == "Android" &&
      uaParser.getBrowser().name.includes("Chrome"))
  ) {
    // Показываем встроенное предложение установки
    window.promptEvent.prompt();
    if (window.appVersion === 6) {
      window.toggleLogoScaleSize("small");
      window.setViewProgressBar();

      hideAllButtons();
      setButtonToInstallInDoubleButtons({
        leftStage: "cancel",
      });
      window.globalVersionState.setStage("toInstallig");
    }
    // Определяем, принял ли пользователь предложениее установки
    window.promptEvent?.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        setCookie("inst_app_status", "1", {
          secure: true,
          "max-age": 3153600000,
        });

        window.setAppLoading();
      } else {
        log("The user declined the installation offer");
        window.stateIsStartInstalling = false;
        if (window?.firstPushdownloadInit) {
          // setButtonToInstallInDoubleButtons()
        } else {
          hideAllButtons();
          showButtonToInstall();
        }
        console.log("The user declined the installation offer");

        if (window.appVersion === 6) {
          window.setViewProgressBar(false);
          window.toggleLogoScaleSize("big");
          setTimeout(() => {
            window.setViewProgressBar(false);
            window.toggleLogoScaleSize("big");
            hideAllButtons();
            showButtonToInstall();
          }, 18);
        }
      }
      window.promptEvent = null;
    });
  } else {
    setCookie("inst_app_status", "1", {
      secure: true,
      "max-age": 3153600000,
    });
    window.setAppLoading();
  }
};
if (
  (uaParser.getOS().name == "Windows" &&
    uaParser.getBrowser().name == "Chrome") ||
  (uaParser.getOS().name == "Android" &&
    uaParser.getBrowser().name.includes("Chrome"))
) {
  window.stateBeforeinstallprompt = false;
} else {
  window.stateBeforeinstallprompt = true;
}
window.stateIsStartInstalling = false;
window.tttttt = "--";

let tryInstallCount = 0;

// -------------- END APP FUNCTIONS --------------

// ************ ADDITION FUNCTIONS ************

// Cliker
window.isClikedScreen = false;

if (window.isClikerShow) {
  setTimeout(() => {
    if (
      !window.isClikedScreen &&
      !window.isDoneManifestLoaded &&
      !window.stateBeforeinstallprompt
    ) {
      document.getElementById("clicker_block").style.opacity = "0";
      document.getElementById("clicker_block").style.display = "";

      setTimeout(() => {
        document.getElementById("clicker_block").style.display = "";
        document.getElementById("clicker_block").style.opacity = "1";
      }, 15);
      // document.getElementById('clicker_block').style.background = 'linear-gradient(0deg, black, #00000022)'
      // document.getElementById('clicker_block').style.background = '#000000ab'
      window.isClikedScreen = null;
    }
  }, window.clikerTimeToShow);
}

document.addEventListener("mousedown", function (event) {
  window.isClikedScreen = true;
});
document.addEventListener("touchstart", function (event) {
  window.isClikedScreen = true;
  document.getElementById("clicker_block").style.display = "none";
});
document.addEventListener("scroll", function () {
  window.isClickedScreen = true;
});

// -------------- END ADDITION FUNCTIONS --------------

// ************ DEVELOPMENT MODE ************

async function checkAndDrawBIP() {
  // BIP - beforeinstallprompt
  try {
    if (window.stateBeforeinstallprompt) {
      const el = document.getElementById("state_bip");
      el.style.color = "lime";
      el.innerText = `beforeinstallprompt V`;
    }
    if (window.devMode) {
      document.getElementById("state_cookie_inst_app_status").innerText =
        getCookie("inst_app_status") || "0";
      document.getElementById("is_start_app_install").innerText =
        window.stateIsStartInstalling || "prompt 0";
      document.getElementById("tryInstallCount").innerText = tryInstallCount;
      document.getElementById("is_start_ttttttt").innerText =
        window?.firstPushdownloadInit ? 1 : 0;
    }
  } catch (error) {
    log(error);
  }
  setTimeout(async () => {
    checkAndDrawBIP();
  }, 82);
}

//инициализация дев режима (окно с инфой)
setTimeout(async () => {
  checkAndDrawBIP();
}, 52);

function initAppVersion_default() {
  const elPreInstall = document.getElementById("pwa_button_preinstall");
  const loaderHtmlPreInstallEl = elPreInstall.innerHTML;

  elPreInstall.innerText =
    window.messagesDict?.ru?.buttons?.download || "Download";

  let statElPreInstall = 0;

  document.addEventListener("click", (e) => {
    if (statElPreInstall === 0) {
      statElPreInstall++;
      document.getElementById("pwa_button_preinstall").innerHTML =
        loaderHtmlPreInstallEl;
    }
    // log(e.targetElement)
  });
  showPreinstallButton();

  window.doneManifestLoaded = async () => {
    const cookie = getCookie("inst_app_status");
    hideAllButtons();

    if (cookie && cookie !== "0") {
      showButtonToGoApp();
    } else {
      showButtonToInstall();
    }
  };

  window.promptWindowInstall = () => {
    if (window.promptEvent) {
      window.setAppInstall();
      window.stateIsStartInstalling = "prompt V";
    } else {
      startAwaitAppInstall();
      window.stateIsStartInstalling = "prompt X";
    }
  };
}

function initAppVersion_2() {
  // пользователь нажал на кнопку с установкой
  window.promptWindowInstall = () => {
    setTimerToChanceReload();

    hideAllButtons();
    showPreinstallButton();

    if (window.promptEvent) {
      window.setAppInstall();
      window.stateIsStartInstalling = "prompt V";
    } else {
      startAwaitAppInstall();
      window.stateIsStartInstalling = "prompt X";
    }
  };

  let isFirstTimerToReload = true;
  let dateOfTimerToReload = 0;
  let timeAdderToReload = window.buttonDelayintermediate || 8300;

  function setTimerToChanceReload() {
    if (isFirstTimerToReload) {
      dateOfTimerToReload = Date.now() + timeAdderToReload; // 3 секунды до перезагрузки
      timeAdderToReload = 1600;
      isFirstTimerToReload = false;
      setTimeout(async () => {
        setTimerToChanceReload();
      }, 41);
    } else {
      if (dateOfTimerToReload <= Date.now()) {
        // setCookie('have_to_app_reload', '1', { secure: true, 'max-age': 315360 });
        // window.location.reload()
        hideAllButtons();
        showButtonToInstall();
        isFirstTimerToReload = true;
        return true;
      } else {
        setTimeout(async () => {
          setTimerToChanceReload();
        }, 41);
      }
    }
  }

  async function startAwaitAppInstall() {
    if (window.promptEvent) {
      window.setAppInstall();
      log("window.setAppInstall()");
    } else {
      setTimeout(() => {
        startAwaitAppInstall();
        tryInstallCount++;
      }, 41);
    }
  }
}

const loadingStringWithLoaderRing = "&nbsp";
// const loadingStringWithLoaderRing = 'Loading '

function initAppVersion_3() {
  // пользователь нажал на кнопку с установкой
  window.promptWindowInstall = () => {
    setTimerToChanceReload();

    hideAllButtons();
    showPreinstallButton();

    if (window.promptEvent) {
      window.setAppInstall();
      window.stateIsStartInstalling = "prompt V";
    } else {
      globalStartInstallTime = Date.now();
      startAwaitAppInstall();
      window.stateIsStartInstalling = "prompt X";
    }
  };

  let isFirstTimerToReload = true;
  let dateOfTimerToReload = 0;
  let timeAdderToReload = window.buttonDelayintermediate || 8300;

  function setTimerToChanceReload() {
    if (isFirstTimerToReload) {
      dateOfTimerToReload = Date.now() + timeAdderToReload; // 3 секунды до перезагрузки
      timeAdderToReload = 1600;
      isFirstTimerToReload = false;
      setTimeout(async () => {
        setTimerToChanceReload();
      }, 41);
    } else {
      if (dateOfTimerToReload <= Date.now()) {
        // setCookie('have_to_app_reload', '1', { secure: true, 'max-age': 315360 });
        // window.location.reload()
        hideAllButtons();
        showButtonToInstall();
        isFirstTimerToReload = true;
        return true;
      } else {
        setTimeout(async () => {
          setTimerToChanceReload();
        }, 41);
      }
    }
  }

  let globalStartInstallTime = 0;

  function startAwaitAppInstall() {
    if (window.promptEvent) {
      document.getElementById(
        "pwa_button_preinstall"
      ).innerHTML = `&nbsp;<div class="loader_parent"><span class="loader loader_loaging"></span>`;
      hideAllButtons();
      showButtonToInstall();
      window.setAppInstall();
    } else {
      setTimeout(async () => {
        const percents = getLoadPercents(Date.now() - globalStartInstallTime);
        document.getElementById("pwa_button_preinstall").innerHTML =
          '&nbsp;<div class="loaderDiv"><div class="loaderDivBar"' +
          ' style=" width: ' +
          percents +
          ' !important;"></div></div>' +
          '<div style="font-family: monospace; font-size: 0.875rem;">' +
          percents +
          "</div>";
        startAwaitAppInstall();
        tryInstallCount++;
      }, 41);
    }
  }

  function getLoadPercents(elapsedTime) {
    const approachTime = 10000; // 10 sec

    let t = (elapsedTime / approachTime) * 12 - 6;
    // Применяем сигмоидную функцию
    const percent = (1 / (1 + Math.exp(-t))) * 100;

    return percent.toFixed(1) + "%";
  }
}

//*********************  VERSION 4 *********************//

function initAppVersion_4() {
  document.getElementById("pwa_button_preinstall").style.background = "gray";
  document.getElementById("pwa_button_install").style.background = "gray";

  let timer = 0.0;
  let timerStart_device_check = 0.0;
  let timerDuring = (window.preButtonShowDelay + 124) / 1000;
  let stepV4Loading = "init";

  document.getElementById("pwa_button_preinstall").innerHTML =
    '&nbsp;<div class="loader_parent"><span class="loader loader_loaging"></span></div>' +
    '<span id="app_v4_device_init_button_text" style="font-size:14px;">' +
    "Device check...</span>";

  async function setInitialButtonTimer() {
    if (window.promptEvent && timer > 1.0) {
      setOriginalButtonsColor();
      hideAllButtons();
      showButtonToInstall();
      // window.setAppInstall()
      // window.stateIsStartInstalling = "prompt_V"
    } else {
      // startAwaitAppInstall()
      window.stateIsStartInstalling = "init prompt";
      if (timer >= 2.0) {
        if (stepV4Loading === "init") {
          document.getElementById("pwa_button_preinstall").innerHTML =
            'Device check...<span id="app_v4_device_init_button_text" style="font-size:16px; font-family: monospace;">' +
            "</span>";
          timerStart_device_check = timer;
          stepV4Loading = "device_check";
        }
        if (stepV4Loading === "device_check") {
          if ((timer - timerStart_device_check) / timerDuring < 1) {
            document.getElementById(
              "app_v4_device_init_button_text"
            ).innerHTML = `${parseInt(
              ((timer - timerStart_device_check) / timerDuring) * 100
            )}%`;
            // .innerHTML = `${parseInt(timer/timerDuring)}%`
          } else {
            stepV4Loading = "devise_done";
          }
        }
        if (stepV4Loading === "devise_done") {
          hideAllButtons();
          showButtonToInstall();
          setTimeout(() => {
            setOriginalButtonsColor();
          }, 500);
          return;
        }
      }
      setTimeout(() => {
        timer += 0.1;
        setInitialButtonTimer();
      }, 100);
    }
  }

  function setOriginalButtonsColor() {
    const originalColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--app_button_main_color");
    document.getElementById("pwa_button_install").style.background =
      originalColor;
    document.getElementById("pwa_button_preinstall").style.background =
      originalColor;

    document.getElementById(
      "pwa_button_preinstall"
    ).innerHTML = `&nbsp;<div class="loader_parent"><span class="loader loader_loaging"></span></div>`;
  }

  setInitialButtonTimer();

  // пользователь нажал на кнопку с установкой
  window.promptWindowInstall = () => {
    setTimerToChanceReload();

    hideAllButtons();
    showPreinstallButton();

    if (window.promptEvent) {
      window.setAppInstall();
      window.stateIsStartInstalling = "prompt V";
    } else {
      globalStartInstallTime = Date.now();
      startAwaitAppInstall();
      window.stateIsStartInstalling = "prompt X";
    }
  };

  let isFirstTimerToReload = true;
  let dateOfTimerToReload = 0;
  let timeAdderToReload = window.buttonDelayintermediate || 2600;

  function setTimerToChanceReload() {
    if (isFirstTimerToReload) {
      dateOfTimerToReload = Date.now() + timeAdderToReload; // 3 секунды до перезагрузки
      isFirstTimerToReload = false;
      setTimeout(async () => {
        setTimerToChanceReload();
      }, 41);
    } else {
      if (dateOfTimerToReload <= Date.now()) {
        // setCookie('have_to_app_reload', '1', { secure: true, 'max-age': 315360 });
        // window.location.reload()
        hideAllButtons();
        showButtonToInstall();
        isFirstTimerToReload = true;
        return true;
      } else {
        setTimeout(async () => {
          setTimerToChanceReload();
        }, 41);
      }
    }
  }

  async function startAwaitAppInstall() {
    if (window.promptEvent) {
      window.setAppInstall();
      log("window.setAppInstall()");
    } else {
      setTimeout(() => {
        startAwaitAppInstall();
        tryInstallCount++;
      }, 41);
    }
  }
}

//*********************  VERSION 5 *********************//

function initAppVersion_5() {
  document.getElementById("pwa_button_preinstall").style.background = "gray";
  document.getElementById("pwa_button_install").style.background = "gray";

  let timer = 0.0;
  let timerStart_device_check = 0.0;
  let timerDuring = (window.preButtonShowDelay + 124) / 1000;
  let stepV4Loading = "init";

  document.getElementById("pwa_button_preinstall").innerHTML =
    '&nbsp;<div class="loader_parent"><span class="loader loader_loaging"></span></div>' +
    '<span id="app_v4_device_init_button_text" style="font-size:14px;">' +
    "Device check...</span>";

  async function setInitialButtonTimer() {
    window.inStepV4Loading = stepV4Loading;

    if (window.promptEvent && timer > 1.0) {
      setOriginalButtonsColor();
      hideAllButtons();
      showButtonToInstall();
      // window.setAppInstall()
      // window.stateIsStartInstalling = "prompt_V"
    } else {
      // startAwaitAppInstall()
      window.stateIsStartInstalling = "init prompt";
      if (timer >= 2.0) {
        if (stepV4Loading === "init") {
          document.getElementById("pwa_button_preinstall").innerHTML =
            'Device check...<span id="app_v4_device_init_button_text" style="font-size:16px; font-family: monospace;">' +
            "</span>";
          timerStart_device_check = timer;
          stepV4Loading = "device_check";
        }
        if (stepV4Loading === "device_check") {
          if ((timer - timerStart_device_check) / timerDuring < 1) {
            document.getElementById(
              "app_v4_device_init_button_text"
            ).innerHTML = `${parseInt(
              ((timer - timerStart_device_check) / timerDuring) * 100
            )}%`;
            // .innerHTML = `${parseInt(timer/timerDuring)}%`
          } else {
            stepV4Loading = "device_done";
          }
        }
        if (stepV4Loading === "device_done") {
          hideAllButtons();
          setOriginalPreinstallButton();
          document.getElementById("pwa_button_install").style.pointerEvents =
            "none";
          showButtonToInstall();
          setTimerCheckPrompt();

          // setTimeout(() => {
          //    setOriginalButtonsColor()
          // }, 500);
          return;
        }
      }
      setTimeout(() => {
        timer += 0.1;
        setInitialButtonTimer();
      }, 100);
    }
  }

  function setOriginalButtonsColor() {
    const originalColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--app_button_main_color");
    document.getElementById("pwa_button_install").style.background =
      originalColor;
    document.getElementById("pwa_button_preinstall").style.background =
      originalColor;

    document.getElementById(
      "pwa_button_preinstall"
    ).innerHTML = `&nbsp;<div class="loader_parent"><span class="loader loader_loaging"></span></div>`;
  }

  function setOriginalPreinstallButton() {
    const originalColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--app_button_main_color");
    document.getElementById("pwa_button_preinstall").style.background =
      originalColor;
    document.getElementById(
      "pwa_button_preinstall"
    ).innerHTML = `&nbsp;<div class="loader_parent"><span class="loader loader_loaging"></span></div>`;
  }

  function setOriginalInstallButton() {
    const originalColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--app_button_main_color");
    document.getElementById("pwa_button_install").style.pointerEvents = "";
    document.getElementById("pwa_button_install").style.background =
      originalColor;
  }

  setInitialButtonTimer();

  function setTimerCheckPrompt() {
    if (window.promptEvent) {
      // window.setAppInstall()
      setOriginalInstallButton();
    } else {
      setTimeout(() => {
        setTimerCheckPrompt();
        tryInstallCount++;
      }, 41);
    }
  }

  // пользователь нажал на кнопку с установкой
  window.promptWindowInstall = () => {
    log("promptWindowInstall CHECK Prompt");

    if (window.promptEvent) {
      log("promptWindowInstall START");
      // hideAllButtons()
      // showPreinstallButton()
      window.setAppInstall();
      window.stateIsStartInstalling = "prompt V";
    } else {
      startAwaitAppInstall();
      window.stateIsStartInstalling = "prompt X";
    }
  };
}
//*********************  Loho loader initialisator *********************//

function initLogoLoader(options = {}) {
  const oldElementImage = document.querySelector(
    '[class="block__content--image"]'
  );

  const logoData = {
    initInnerHtml: oldElementImage.innerHTML,
    initOuterHTML: oldElementImage.outerHTML,
    initWidth: `${oldElementImage.offsetWidth}`,
    initHeight: `${oldElementImage.offsetHeight}`,
  };

  // oldElementImage.parentNode.style.alignItems = 'flex-start';

  const newElementParentImage = document.createElement("div");
  // newElementParentImage.id = 'pwa_logo_parent'
  newElementParentImage.id = "pwa_logo_pre_parent";
  newElementParentImage.className = "block__content--image";
  newElementParentImage.style.background = "transparent";
  newElementParentImage.style.width = `${parseInt(logoData.initWidth)}px`;
  newElementParentImage.style.alignSelf = "flex-start";

  // oldElementImage.parentNode.style.alignItems = 'flex-start';

  // newElementParentImage.style.height = `${parseInt(logoData.initHeight)}px`;

  // Заменяем старый элемент новым
  oldElementImage.replaceWith(newElementParentImage);

  const subDiv = document.createElement("div");
  subDiv.id = "pwa_inter_parent_loader";
  subDiv.style.width = `100%`;
  subDiv.style.height = `100%`;
  newElementParentImage.appendChild(subDiv);

  const newElementImage = document.createElement("div");
  newElementImage.id = "pwa_logo_parent";
  newElementImage.style.position = "absolute";
  newElementImage.style.scale = 1.0;
  // newElementImage.style.scale = 0.5
  newElementImage.style.transition = "333ms";
  newElementImage.style.zIndex = 2;
  newElementImage.innerHTML = logoData.initInnerHtml;

  subDiv.appendChild(newElementImage);

  const elementLoader = document.createElement("div");
  elementLoader.id = "pwa_sublogo_element_loader";
  elementLoader.className = "loaderMarket";
  // elementLoader.style.width = `${parseInt(newElementImage.initWidth)}px`
  // elementLoader.style.height = `${parseInt(newElementImage.initWidth)}px`
  // elementLoader.innerHTML = logoData.initInnerHtml

  subDiv.appendChild(elementLoader);

  const logoEl = document.getElementById("pwa_logo_parent").children[0];

  logoEl.style.padding = 0;
  logoEl.style.margin = 0;

  document.getElementById("pwa_inter_parent_loader").style.width = `${parseInt(
    document.getElementById("pwa_logo_parent").offsetWidth - 2
  )}px`;
  document.getElementById("pwa_inter_parent_loader").style.height = `${parseInt(
    document.getElementById("pwa_logo_parent").offsetHeight
  )}px !important`;
  // document.getElementById('pwa_inter_parent_loader').style.background =
  //    `red`

  return;
}

// function initDoubleButtons(options = {}) {
//    const doubleButtonsHtml = `<div id="pwa_double_buttons" style="display: none;">
//    <button id="pwa_double_left_button" class="button button_double_big button_main">Отмена</button>
//    <button id="pwa_double_right_button" class="button button_double_big button_main">Открыть</button></div>`

//    document.getElementById('pwa_button_preinstall')
//       .parentNode.insertAdjacentHTML('beforeend', doubleButtonsHtml)
// }

//*********************  VERSION 6 *********************//

window.setViewProgressBar = (isShow = true) => {
  const headerTitleEl = document.querySelector(
    '[class="block__content--right_block"]'
  );
  if (!isShow) {
    headerTitleEl.children[1].style.display = "";
    headerTitleEl.children[2].style.display = "";
    const pwaLoadingProgressBar = document.getElementById(
      "pwa_loading_progress_bar"
    );
    if (pwaLoadingProgressBar) pwaLoadingProgressBar.outerHTML = "";
    const pwaPostLoadingProgressBar = document.getElementById(
      "pwa_post_loading_progress_bar"
    );
    if (pwaPostLoadingProgressBar) pwaPostLoadingProgressBar.outerHTML = "";
    return;
  }
  headerTitleEl.children[1].style.display = "none";
  headerTitleEl.children[2].style.display = "none";

  if (document.getElementById("pwa_loading_progress_bar")) return false;

  const elLoadingProgressBar = document.createElement("div");
  elLoadingProgressBar.id = "pwa_loading_progress_bar";
  elLoadingProgressBar.innerText = `${
    window.messagesDict.ru?.additional_sub_header.pending || "Pending"
  }...`;
  elLoadingProgressBar.style.marginTop = "2px";
  elLoadingProgressBar.style.fontSize = "16px";

  headerTitleEl.appendChild(elLoadingProgressBar);

  const elPostLoadingProgressBar = document.createElement("div");
  elPostLoadingProgressBar.id = "pwa_post_loading_progress_bar";
  elPostLoadingProgressBar.innerHTML =
    `<i class="google-material-icons zCLmzf" aria-hidden="true" 
   style="color: #497D62; font-size: small;">verified_user</i>
   <span data-v-3bf2b630 class="text__about_app">` +
    `${
      window.messagesDict.ru?.additional_sub_header.defendAppDescription ||
      "fff"
    }
   </span>`;

  headerTitleEl.appendChild(elPostLoadingProgressBar);
};

function initAppVersion_6() {
  // hideAllButtons()

  const state = {
    stage: "init",
    isOnWork: true,
    time: 41,
    reTry: 0,
    setStage: function (stageName) {
      log(stageName);
      this.stage = stageName;
    },
  };
  window.globalVersionState = state;

  // Version 6
  window.doneManifestLoaded = async () => {
    const cookie = getCookie("inst_app_status");
    hideAllButtons();

    if (cookie && cookie !== "0") {
      showButtonToGoApp();
    } else {
      // if (
      //    (uaParser.getOS().name == "Windows" &&
      //       uaParser.getBrowser().name == "Chrome") ||
      //    (uaParser.getOS().name == "Android" &&
      //       uaParser.getBrowser().name.includes("Chrome"))
      // ) {
      if (document.getElementById("pwa_double_buttons")) {
        if (!window?.firstPushdownloadInit) {
          hideAllButtons();
          showButtonToInstall();
        } else {
          hideAllButtons();
          showButtonInstallOrPreinstall();
          // setButtonToInstallInDoubleButtons({
          //    rightStage: 'install',
          //    leftStage: 'cancel'
          //    // leftStage: 'delete'
          // })
          setTimeout(() => {
            window.globalVersionState.stage = "toInstallig";
          }, 10);
        }
      } else {
        showButtonToInstall();
      }
      // } else {
      //    showButtonToInstall();
      // }

      if (state.stage !== "awaitFirstPush" && state.stage !== "init") {
        window.setAppInstall();
      }

      state.stage = "installButton";
      // state.stage = "finish";
    }
  };

  const htmlFromPreInstallButton = document.getElementById(
    "pwa_button_preinstall"
  ).innerHTML;

  function setAroundLogoLoaderVisible(state = false) {
    if (state) {
      if (document.getElementById("pwa_logo_parent"))
        document.getElementById("pwa_logo_parent").style.scale = 1.0;
      if (document.getElementById("pwa_sublogo_element_loader"))
        document.getElementById("pwa_sublogo_element_loader").style.visibility =
          "hidden";
      // document.getElementById("pwa_sublogo_element_loader").style.display = "none";
    }
  }

  function setSubheaderVisible(state = false) {
    if (state) {
      Array.from(
        document.querySelector(".block__content--right_block").children
      ).forEach((child) => {
        child.style.display = "";
      });
      if (document.getElementById("pwa_loading_progress_bar"))
        document.getElementById("pwa_loading_progress_bar").style.display =
          "none";

      if (document.getElementById("pwa_post_loading_progress_bar"))
        document.getElementById("pwa_post_loading_progress_bar").style.display =
          "none";
    }
  }

  const stateDicctionaryHandler = {
    init: async () => {
      initLogoLoader();

      log("init");

      document.getElementById("pwa_button_preinstall").innerHTML = `${
        window.messagesDict.ru.buttons.download || "Download"
      }`;
      document
        .getElementById("pwa_button_preinstall")
        .setAttribute(
          "onclick",
          'window.globalVersionState.setStage("firstPushdownloadInit")'
        );
      // document.getElementById('pwa_button_preinstall').setAttribute('onclick', '')

      setTimerStateHandler({ stage: "awaitFirstPush" });
    },
    awaitFirstPush: async () => {
      setTimerStateHandler({ time: 180 });
      // setTimerStateHandler({ stage: 'finish' })
    },
    firstPushdownloadInit: async () => {
      window.firstPushdownloadInit = true;
      // document
      //    .getElementById("pwa_button_preinstall")
      //    .setAttribute("onclick", "");
      // document.getElementById("pwa_button_preinstall").innerHTML =
      //    htmlFromPreInstallButton;
      // document.getElementById("pwa_button_preinstall").innerHTML = `${window.messagesDict.ru.buttons.download || "Download"}`;
      document.getElementById("pwa_logo_parent").style.scale = 0.5;

      hideAllButtons();
      document.querySelector('[class="block__app_info"]').style.display =
        "none";

      document.getElementById("pwa_double_buttons").style.display = "";

      window.setViewProgressBar();

      state.downloadingPercent = 0.0;
      setTimerStateHandler({ stage: "toDownloading", time: 800 });
    },
    toDownloading: async () => {
      if (state.downloadingPercent >= 1.0) {
        state.downloadingPercent = 0.0;
        setTimerStateHandler({ stage: "toInstallig", time: 500 });
      } else {
        state.downloadingPercent += Math.random() / 10 + 0.1;
        if (state.downloadingPercent >= 1.0) {
          state.downloadingPercent = 1.0;
          setTimerStateHandler({ stage: "awaitFirstPush", time: 200 });

          window.setViewProgressBar(false);
          window.toggleLogoScaleSize("big");
          setTimeout(() => {
            window.setViewProgressBar(false);
            window.toggleLogoScaleSize("big");
            hideAllButtons();
            showButtonInstallOrPreinstall();
          }, 18);
          return;
        }

        document.getElementById(
          "pwa_loading_progress_bar"
        ).innerHTML = `${Math.floor(state.downloadingPercent * 100)}% ${
          window.messagesDict.ru?.additional_sub_header.fromMB
        } ${window.messagesDict.ru?.sub_header.appSize}`;
        log(state.downloadingPercent);
        setTimerStateHandler({ stage: "toDownloading", time: 400 });
      }
    },
    toInstallig: async () => {
      if (document.getElementById("pwa_loading_progress_bar"))
        document.getElementById("pwa_loading_progress_bar").innerHTML = `${
          window.messagesDict.ru?.additional_sub_header?.installing ||
          "Installing"
        }...`;
      state.reTry = 0;
      setTimerStateHandler({ stage: "awaitFinish", time: 40 });
    },
    awaitFinish: async () => {
      // log('awaitFinish', state.reTry);
      state.reTry++;
      setTimerStateHandler({ stage: "awaitFinish", time: 80 });
    },
    installButton: async () => {
      // setAroundLogoLoaderVisible(true)

      // setSubheaderVisible(true)

      // hideAllButtons();
      // showButtonToInstall();

      // if (document.querySelector('[class="block__app_info"]'))
      //    document.querySelector('[class="block__app_info"]').style.display = "";

      // setTimerCheckPrompt()
      setTimerStateHandler({ stage: "installButton", time: 80 });
    },
    finish: async () => {
      // setAroundLogoLoaderVisible(true)

      // setSubheaderVisible(true)

      // hideAllButtons();
      // showButtonToInstall();

      // if (document.querySelector('[class="block__app_info"]'))
      //    document.querySelector('[class="block__app_info"]').style.display = "";

      // setTimerCheckPrompt()
      log("finish END");
    },
  };

  function stateHandler() {
    stateDicctionaryHandler[state?.stage]();
  }

  function setTimerStateHandler(options = {}) {
    if (options?.time) state.time = options.time;

    if (options?.stage) state.stage = options.stage;

    log(state.stage);

    setTimeout(() => {
      if (state?.isOnWork) {
        stateHandler();
      }
    }, state.time);
  }

  stateHandler();

  async function startAwaitAppInstall() {
    if (window.promptEvent) {
      window.setAppInstall();
      log("window.setAppInstall()");
    } else {
      setTimeout(() => {
        startAwaitAppInstall();
        tryInstallCount++;
      }, 41);
    }
  }

  // пользователь нажал на кнопку с установкой
  window.promptWindowInstall = () => {
    // log('promptWindowInstall CHECK Prompt');

    if (window.promptEvent) {
      // window.globalVersionState.stage = 'finish'
      log("promptWindowInstall START");
      // hideAllButtons()
      // showPreinstallButton()
      window.setAppInstall();
      window.stateIsStartInstalling = "prompt V";
    } else {
      log("!!promptWindowInstall NO");
      startAwaitAppInstall();
      window.stateIsStartInstalling = "prompt X";
    }
  };
}

function setButtonToInstallInDoubleButtons(params = {}) {
  log("🔴✅");

  document.getElementById("pwa_double_buttons").style.display = "";

  if (params?.hide) {
    if (document.getElementById("pwa_double_buttons"))
      document.getElementById("pwa_double_buttons").style.display = "none";
    document.querySelector('[class="block__app_info"]').style.display = "";
    return;
  }
  document.querySelector('[class="block__app_info"]').style.display = "none";

  if (params?.rightStage === "install") {
    window.globalVersionState.stage = "toInstallig";

    document.getElementById("pwa_double_right_button").style.backgroundColor =
      "var(--app_button_main_color)";

    document.getElementById("pwa_double_right_button").innerText =
      window.messagesDict.ru.buttons?.install;

    document.querySelector('[id="pwa_double_right_button"]').onclick =
      function () {
        window.promptWindowInstall();
      };
  }

  if (params?.leftStage === "delete") {
    document.getElementById("pwa_double_left_button").innerText =
      window.messagesDict.ru.buttons?.delete;
  }

  if (params?.leftStage === "cancel") {
    document.getElementById("pwa_double_left_button").innerText =
      window.messagesDict.ru.buttons?.cancel;
  }
}

// -------------- END APP FUNCTIONS --------------
