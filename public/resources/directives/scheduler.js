/**
 * This directive is used to add scheduled order option
 */
app.directive("scheduler", function (localStorage, $interval, $cookies, $timeout, $http, helpers) {

    let INCREMENTS = 30;            //default increments are in minutes 
    const DISPLAY_DIVIDER = `:`;    //divider between time and hours for display 
    const TODAY = "Today";          //display variable
    const TOMORROW = "Tomorrow";    //display variable

    function buildSchedulerDates(data, startDate) {
        let localObject = {};
        let localArray = [];
        let weekObject = purifyObject(data);
        let date = new Date();
        let weekDay = date.getDay() + 1;     //selector 
        let timeStamp = date.getTime();
        let today = weekDay;
        let oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        let previousDay = weekDay - 1;


        if (previousDay <= 0) {
            previousDay += 7;
        }

        let todaysObject = getTodaysObject(date, weekObject[today], weekObject[previousDay], startDate);

        if (todaysObject && startDate === 0) {
            localArray.push(todaysObject);
        } else {
            startDate -= 1;
        }

        do {
            previousDay = weekDay;               //remember today as previous day
            weekDay++;                           //go to the next day
            timeStamp += oneDayInMilliseconds;   //go to the next day

            if (weekDay > 7) {
                weekDay -= 7;
            }

            if (startDate > 0) {
                startDate -= 1;
                continue;
            }

            localArray.push(getOrdinaryDayObject(
                new Date(timeStamp), weekObject[weekDay], (weekDay - today) == 1)); //handle it for the rest of the week

        } while (weekDay != today);

        localObject.date_array = localArray;
        let iSelected = chooseDefaultSelectedDate(localObject);
        localObject.selected = {
            time: iSelected,
            date: iSelected
        };

        return localObject;
    }

    function getTodaysObject(dateObject, dayObject, prevDayObject) {
        let localObject = {};
        let localArray = [];
        let currentTimeInMinutes = dateObject.getHours() * 60 + dateObject.getMinutes();

        if (prevDayObject.close > 24 * 60 && (currentTimeInMinutes + 24 * 60 + 60) < prevDayObject.close) {
            localArray.push.apply(localArray, (buildHoursArray(dateObject, purifySingleTime(currentTimeInMinutes + 60), prevDayObject.close)));
            localArray.push.apply(localArray, (buildHoursArray(dateObject, dayObject.open, 24 * 60)));
        }

        if (currentTimeInMinutes > dayObject.open) {
            localArray.push.apply(localArray, (buildHoursArray(dateObject, purifySingleTime(currentTimeInMinutes + 60), dayObject.close)));
        } else {
            localArray.push.apply(localArray, (buildHoursArray(dateObject, purifySingleTime(dayObject.open + 60), dayObject.close)));
        }

        localObject.display_week_day = TODAY;
        localObject.display_month_day = dateObject.getDate();
        localObject.display_month_name = helpers.getMonthString(dateObject.getMonth());
        localObject.hours_array = localArray;

        if (localArray.length == 0) {
            return undefined;
        }

        return localObject;
    }

    function getOrdinaryDayObject(dateObject, dayObject, dayAfterToday) {
        let localObject = {};
        let localArray = [];

        if (dayAfterToday) {
            localObject.display_week_day = TOMORROW;
        } else {
            localObject.display_week_day = getStringWeekDay(dateObject.getDay());
        }

        localObject.display_month_day = dateObject.getDate();
        localObject.display_month_name = helpers.getMonthString(dateObject.getMonth());
        localArray.push.apply(localArray, (buildHoursArray(dateObject, (dayObject.open + 60), dayObject.close)));
        localObject.hours_array = localArray;

        return localObject;
    }

    function purifyObject(receivedObject) {
        let localObject = {};

        for (i = 1; i < Object.keys(receivedObject).length + 1; i++) {
            let tmp = {};
            tmp.open = allMinutes(receivedObject[i].open);
            tmp.close = allMinutes(receivedObject[i].close);
            localObject[i] = tmp;
        }

        return localObject;
    }

    function purifySingleTime(data) {
        return (parseInt(data / INCREMENTS) + Math.round((data % INCREMENTS) / INCREMENTS)) * INCREMENTS;
    }

    function allMinutes(dataString) {
        let splitArray = dataString.split(DISPLAY_DIVIDER);
        let minutesFromHour = parseInt(splitArray[0]) * 60;
        let minutes = ((parseInt(splitArray[1]) / INCREMENTS) +
            Math.round((parseInt(splitArray[1]) % INCREMENTS) / INCREMENTS)) * INCREMENTS;

        return minutesFromHour + minutes;
    }

    function buildHoursArray(date, start, end) {
        let localArray = [];
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let hours = parseInt(start / 60);
        let minutes = start % 60;
        let startWithDiff = start + INCREMENTS;
        let timeStamp = new Date(year, month, day, hours, minutes).getTime();

        while (startWithDiff <= end) {
            let localObject = {};
            localObject.display_hour = beautifulize(start, startWithDiff);
            localObject.value = timeStamp;
            localArray.push(localObject);

            start += INCREMENTS;
            startWithDiff += INCREMENTS;
            timeStamp += INCREMENTS * 60 * 1000; //add increments to timestamp each iteration
        }

        return localArray;
    }

    function beautifulize(time1, time2) {
        let string = "";
        let hours1 = {};
        let hours2 = {};
        hours1 = getHourObject(time1);
        hours2 = getHourObject(time2);
        let mins1 = time1 % 60;
        let mins2 = time2 % 60;

        if (mins1 === 0) {
            string = string + hours1.value + hours1.tag;
        } else {
            string = string + hours1.value + DISPLAY_DIVIDER + mins1 + hours1.tag;
        }

        string = string + " - ";

        if (mins2 === 0) {
            string = string + hours2.value + hours2.tag;
        } else {
            string = string + hours2.value + DISPLAY_DIVIDER + mins2 + hours2.tag;
        }
        return string;
    }

    function getHourObject(time) {
        return {
            tag: (parseInt(time / 720) % 2 == 0) ? "am" : "pm",
            value: parseInt(time / 60) % 12 === 0 ? "00" : parseInt(time / 60) % 12
        };
    }

    function getOpenCloseHours(data) {
        let localObject = {};
        let today = new Date().getDay();
        let open24Hours = data.date_array[today].hours_array.length == 96;
        let nextAvailableDay = findNextAvailableDay(data.date_array, today);

        if (open24Hours) {   // for stores that are open 000 - 2400
            localObject.open = undefined;
            localObject.close = "24/7";
        } else {
            let openDate = new Date(nextAvailableDay.openTime);
            let closeDate = new Date(nextAvailableDay.closeTime - 30 * 60 * 1000);

            localObject.open = ("0" + openDate.getHours()).slice(-2) + DISPLAY_DIVIDER + ("0" + openDate.getMinutes()).slice(-2) + ", " + helpers.getMonthString(openDate.getMonth()) + " " + openDate.getDate();
            localObject.close = "Until: " + closeDate.getHours() + DISPLAY_DIVIDER + closeDate.getMinutes();
        }
        return localObject;
    }

    function formatDelFeeText(rawText, freeDeliveryText) {
        if (rawText != undefined) {
            return (rawText == 0 ? freeDeliveryText : "C$" + rawText + " Delivery");
        } else {
            throw "Error while fomatting delivery fee text, Scheduler.js directive";
        }
    }

    function findNextAvailableDay(inArray, startIteration) {
        let i = startIteration;

        for (let counter = 0; counter < 7; counter++) {
            if (inArray[i].hours_array.length > 0) {
                return {
                    openTime: inArray[i].hours_array[0].value - 60 * 60 * 1000,
                    closeTime: inArray[i].hours_array[inArray[i].hours_array.length - 1].value,
                    day: inArray[i].display_month_day,
                    month: inArray[i].display_month_name
                };
            } else {
                i = (i + 1) % 7;
            }
        }
    }

    function getStringWeekDay(data) {
        switch (data) {
            case 0:
                return "Sun";
            case 1:
                return "Mon";
            case 2:
                return "Tue";
            case 3:
                return "Wed";
            case 4:
                return "Thu";
            case 5:
                return "Fri";
            case 6:
                return "Sat";
            default:
                return "Invalid Day";
        }
    }

    function chooseDefaultSelectedDate(dates) {
        for (let x = 0; x < dates.date_array.length; x++) {
            if (dates.date_array[x].hours_array.length) return x;
        }
    }

    return {
        restrict: "E", // restrict to element
        scope: {
            storeType: "<storeType",
            optionsLoaded: "=?optionsLoaded",
            storeName: "=?storeName",
            storeImage: "=?storeImg",
            storeOpen: "=?storeOpen",
            screenMob: "<screenMob",
            delFee: "=?delFee"
        },
        templateUrl: '/resources/templates/scheduler.html',
        link: function (scope, element, attrs) {
            $timeout(function () {
                $http({
                    method: 'POST',
                    url: "/api/hub/getstoreinfo",
                    data: {
                        store_type: [scope.storeType]
                    }
                }).then(function successCallback(response) {
                    if (response.data.success) {
                        init(response.data.store_infos[0]);
                    } else {
                        scope.selectedOption = "ASAP Delivery";
                        scope._deliveryError = true;
                    }
                }, function errorCallback(response) {
                    scope.selectedOption = "ASAP Delivery";
                    scope._deliveryError = true;
                });

                function init(store_info) {
                    scope.showOptionsModal = false;
                    scope.selectedOption = "";

                    var scheduler_version = $cookies.get("scheduler_version");
                    if (scheduler_version != localStorage.getSchedulerVersion()) {
                        localStorage.setOrderDeliveryHrs({});
                        localStorage.setSchedulerVersion(scheduler_version);
                    }

                    scope.buttonStyle = "";
                    scope.selectedOption = "";
                    scope.optionsLoaded = true;
                    scope.setButtonTxt = "Set Delivery Time";
                    scope.asapBtnTxt = "ASAP Delivery";
                    scope.scheduleBtnTxt = "Schedule Delivery";
                    scope.storeOpenOnSelectedDay = true;
                    scope.hrsIsNotSelected = false;
                    scope.showDayOptions = false;
                    scope.storeOpen = store_info.open;
                    scope.storeInfo = store_info;
                    scope.store_name = store_info.name;
                    scope.storeName = store_info.display_name;
                    scope.delFee = formatDelFeeText(store_info.del_fee, "FREE delivery");
                    scope.storeImage = "/resources/images/catalog-stores/logo/" + store_info.image;
                    scope.dates = buildSchedulerDates(scope.storeInfo.hours_scheduled, store_info.scheduler_cycle);
                    INCREMENTS = store_info.scheduler_incerements;
                    let delivery_hrs = localStorage.getOrderDeliveryHrs();

                    if (delivery_hrs && delivery_hrs.hasOwnProperty(scope.store_name)) {
                        let todays_date = new Date().getTime();
                        if (delivery_hrs[scope.store_name].value < todays_date + 3600000) {
                            delete delivery_hrs[scope.store_name];
                        }
                    }
                    if (delivery_hrs && delivery_hrs.hasOwnProperty(scope.store_name) && delivery_hrs[scope.store_name]["schedule"]) {
                        scope.selectedOption = "schedule";
                        scope.dates.selected.date = delivery_hrs[scope.store_name].date_selected;
                        scope.dates.selected.time = delivery_hrs[scope.store_name].hrs_selected;
                        updateDeliveryDate(
                            scope.dates.date_array[scope.dates.selected.date].display_month_name,
                            scope.dates.date_array[scope.dates.selected.date].display_month_day,
                            scope.dates.date_array[scope.dates.selected.date].hours_array[scope.dates.selected.time].display_hour
                        );
                    } else if (delivery_hrs && delivery_hrs.hasOwnProperty(scope.store_name) && delivery_hrs[scope.store_name]["asap"]) {
                        scope.selectedOption = "asap";
                        scope.asapBtnTxt = "45-60 MIN";
                    }

                    scope.choosenDay = chooseDefaultSelectedDate(scope.dates);

                    //Add closes in 30 min
                    let tmp_time = getOpenCloseHours(scope.dates);
                    scope.openTime = tmp_time.open;
                    scope.closeTime = tmp_time.close;
                }

                /**
                 * Updates user selected delivery option
                 * @param {string} type 
                 */
                scope.setDeliveryOption = function (type) {
                    if (!scope.storeOpen || type == "schedule" || scope.screenMob) {
                        scope.showOptionsModal = true;
                        window.addEventListener('click', clickedOffOptionsModal, false);
                        $("html").css("overflow", "hidden");
                    }
                    if (type == "asap") {
                        if (scope.storeOpen) {
                            scope.asapBtnTxt = "45-60 MIN";
                            updateOptionsInStorage("asap", false);
                        } else {
                            scope.setButtonTxt = "Schedule Delivery";
                        }
                        resetViewValues();
                    } else if (type == "schedule") {
                        scope.setButtonTxt = "Set Delivery Time";
                        scope.asapBtnTxt = "ASAP Delivery";
                    }
                    scope.selectedOption = type;
                };

                /**
                 * Returns today's date in view format
                 */
                scope.getTodaysDate = function () {
                    let today = new Date();
                    return helpers.getMonthString(today.getMonth()) + " " + today.getDay();
                };

                /**
                 * Returns user selected day for delivery
                 */
                scope.getSelectedDay = function () {
                    if (!scope.dates) return;
                    let tmp_date = scope.dates.date_array[scope.choosenDay];
                    return tmp_date.display_week_day + ", " + tmp_date.display_month_name + " " + tmp_date.display_month_day;
                };

                /**
                 * Return user selected hours for delivery
                 */
                scope.getSelectedHrs = function () {
                    if (!scope.dates) return;
                    return scope.dates.date_array[scope.choosenDay].hours_array[scope.dates.selected.time].display_hour;
                };

                /**
                 * Updates user selected day for the delivery
                 * @param {integer} num 
                 */
                scope.chooseDay = function (num) {
                    let day = scope.choosenDay;
                    if (day == num) return;
                    if (!scope.dates.date_array[num].hours_array.length) {
                        scope.storeOpenOnSelectedDay = false;
                    } else {
                        scope.storeOpenOnSelectedDay = true;
                    }
                    $timeout(function () {
                        scope.choosenDay = num;
                        scope.showDayOptions = !scope.showDayOptions;
                    }, 0);
                };

                /**
                 * Updates user selected hours for the delivery
                 * @param {integer} num 
                 */
                scope.chooseTime = function (num) {
                    scope.dates.selected.date = scope.choosenDay;
                    scope.dates.selected.time = num;
                    scope.hrsIsNotSelected = false;
                };

                function clickedOffOptionsModal(e) {
                    if ((event.target.className && event.target.className.includes("del-modal-body")) || $(e.target).parents(".delivery-options").length || $(e.target).parents(".del-modal-body").length) return;
                    $timeout(function () {
                        scope.closeModal();
                    }, 0);
                }

                /**
                 * Closes options modal and reverts view to previously selected option, if not selected
                 */
                scope.closeModal = function () {
                    scope.showOptionsModal = false;
                    window.removeEventListener('click', clickedOffOptionsModal, false);
                    $("html").css("overflow", "auto");

                    let delivery_hrs = localStorage.getOrderDeliveryHrs();
                    if (!delivery_hrs.hasOwnProperty(scope.store_name)) {
                        scope.selectedOption = "";
                    } else if (delivery_hrs[scope.store_name]["asap"]) {
                        scope.selectedOption = "asap";
                        scope.asapBtnTxt = "45-60 MIN";
                    } else if (delivery_hrs[scope.store_name]["schedule"]) {
                        let date_hrs = scope.dates;
                        updateDeliveryDate(
                            date_hrs.date_array[date_hrs.selected.date].display_month_name,
                            date_hrs.date_array[date_hrs.selected.date].display_month_day,
                            date_hrs.date_array[date_hrs.selected.date].hours_array[date_hrs.selected.time].display_hour
                        );
                        scope.selectedOption = "schedule";
                    }
                };

                /**
                 * Final set of selected delivery option
                 * @param {string} option 
                 */
                scope.updateOrderDeliveryHrs = function (option) {
                    if (scope._deliveryError || !scope.storeOpenOnSelectedDay) return;
                    if (scope.dates.selected.date != scope.choosenDay) {
                        scope.hrsIsNotSelected = true;
                        return;
                    }
                    let delivery_hrs = localStorage.getOrderDeliveryHrs();
                    let date_hrs = scope.dates;
                    if (option == "asap") {
                        if (!scope.storeOpen) {
                            scope.selectedOption = "schedule";
                            return;
                        }
                        scope.asapBtnTxt = "45-60 MIN";
                        delivery_hrs[scope.store_name] = {
                            "asap": true
                        };
                        resetViewValues();
                    } else if (option == "schedule") {
                        updateOptionsInStorage("schedule", false);
                        updateDeliveryDate(
                            date_hrs.date_array[date_hrs.selected.date].display_month_name,
                            date_hrs.date_array[date_hrs.selected.date].display_month_day,
                            date_hrs.date_array[date_hrs.selected.date].hours_array[date_hrs.selected.time].display_hour
                        );
                    }
                    $timeout(function () {
                        scope.closeModal();
                    }, 200);
                };

                /**
                 * Used to update user selected delivery option details in local storage
                 * @param {string} option 
                 * @param {boolean} remove 
                 */
                function updateOptionsInStorage(option, remove){
                    let delivery_hrs = localStorage.getOrderDeliveryHrs();
                    let date_hrs = scope.dates;
                    if (!delivery_hrs) {
                        delivery_hrs = {};
                    } else if (delivery_hrs && delivery_hrs.hasOwnProperty(scope.store_name)) {
                        delete delivery_hrs[scope.store_name];
                    }
                    if(option == "schedule" && !remove){
                        delivery_hrs[scope.store_name] = {
                            "schedule": true,
                            "date_selected": date_hrs.selected.date,
                            "hrs_selected": date_hrs.selected.time,
                            "value": date_hrs.date_array[date_hrs.selected.date].hours_array[date_hrs.selected.time].value
                        };
                    } else if(option == "asap" && !remove){
                        delivery_hrs[scope.store_name] = {
                            "asap": true
                        };
                    }
                    localStorage.setOrderDeliveryHrs(delivery_hrs);
                }

                scope.$on("showSchedulerModal", function (event) {
                    $timeout(function () {
                        scope.showOptionsModal = true;
                        window.addEventListener('click', clickedOffOptionsModal, false);
                        if (scope.storeOpen) {
                            scope.setDeliveryOption('asap');
                        } else {
                            scope.setDeliveryOption('schedule');
                        }
                    }, 200);
                });

                function resetViewValues() {
                    scope.choosenDay = 0;
                    scope.dates.selected.date = 0;
                    scope.dates.selected.time = 0;
                    updateDeliveryDate();
                }

                function updateDeliveryDate(month, day, time) {
                    if (month && day && time) {
                        scope.scheduleBtnTxt = month + " " + day + " From " + time;
                    } else {
                        scope.scheduleBtnTxt = "Schedule Delivery";
                    }
                }
            }, 0);
        }
    };
});