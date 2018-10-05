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
            deliveryOption: "=?deliveryOption",
            deliveryDate: "=?deliveryDate",
            openTime: "=?openTime",
            closeTime: "=?closeTime",
            storeName: "=?storeName",
            storeImage: "=?storeImg",
            storeOpen: "=?storeOpen",
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
                        scope.deliveryOption = "ASAP Delivery";
                        scope._deliveryError = true;
                    }
                }, function errorCallback(response) {
                    scope.deliveryOption = "ASAP Delivery";
                    scope._deliveryError = true;
                });

                function init(store_info) {
                    
                    var scheduler_version = $cookies.get("scheduler_version");
                    if(scheduler_version != localStorage.getSchedulerVersion()){
                        localStorage.setOrderDeliveryHrs({});
                        localStorage.setSchedulerVersion(scheduler_version);            
                    }

                    scope.buttonStyle = "";
                    scope.storeOpen = store_info.open;
                    scope.storeInfo = store_info;
                    scope.store_name = store_info.name;
                    scope.storeName = store_info.display_name;
                    scope.delFee = formatDelFeeText(store_info.del_fee, "FREE delivery");
                    scope.storeImage = "/resources/images/catalog-stores/logo/" + store_info.image;
                    scope.dates = buildSchedulerDates(scope.storeInfo.hours_scheduled, store_info.scheduler_cycle);
                    INCREMENTS = store_info.scheduler_incerements;
                    scope.deliveryOption = "ASAP Delivery";
                    let delivery_hrs = localStorage.getOrderDeliveryHrs();

                    if (delivery_hrs && delivery_hrs.hasOwnProperty(scope.store_name)) {
                        let todays_date = new Date().getTime();
                        if (delivery_hrs[scope.store_name] < todays_date + 3600000000) {
                            delete delivery_hrs[scope.store_name];
                        }
                    }

                    if (delivery_hrs && delivery_hrs.hasOwnProperty(scope.store_name)) {
                        scope.deliveryOption = "Scheduled Delivery";
                        scope.dates.selected.date = delivery_hrs[scope.store_name].date_selected;
                        scope.dates.selected.time = delivery_hrs[scope.store_name].hrs_selected;
                    } else if (scope.storeInfo.open) {
                        scope.deliveryOption = "ASAP Delivery";
                    } else {
                        if (delivery_hrs == null || delivery_hrs == "" || delivery_hrs == undefined) delivery_hrs = {};
                        let iSelected = chooseDefaultSelectedDate(scope.dates);
                        delivery_hrs[store_info.name] = {
                            "date_selected": iSelected,
                            "hrs_selected": iSelected,
                            "value": scope.dates.date_array[iSelected].hours_array[iSelected].value
                        };
                        scope.deliveryOption = "Scheduled Delivery";
                        localStorage.setOrderDeliveryHrs(delivery_hrs);
                        updateOrderDeliveryHrs();
                    }

                    scope.showDeliveryOptions = false;
                    scope.showScheduleOptions = false;
                    scope.choosenDay = scope.dates.selected.date;

                    updateDeliveryDate(
                        scope.dates.date_array[scope.dates.selected.date].display_month_name,
                        scope.dates.date_array[scope.dates.selected.date].display_month_day,
                        scope.dates.date_array[scope.dates.selected.date].hours_array[scope.dates.selected.time].display_hour
                    );

                    let tmp_time = getOpenCloseHours(scope.dates);
                    scope.openTime = tmp_time.open;
                    scope.closeTime = tmp_time.close;
                    updateBtnColor();
                }

                function clickedOffOptionsBox(e) {
                    if ((event.target.className && event.target.className.includes("del-opt-box")) || $(e.target).parents("#" + scope.storeType + " .del-opt-box").length) return;
                    scope.deliveryOptions();
                }

                scope.deliveryOptions = function () {
                    if (!scope.showDeliveryOptions) {
                        $("#" + scope.storeType + " .del-opt-icon svg").removeClass('del-opt-icon-svg-2').addClass('del-opt-icon-svg-1');
                        $("#" + scope.storeType + " .del-opt-btn").removeClass('del-opt-btn-2').addClass('del-opt-btn-1');
                        $("#del-opt-background").removeClass('del-opt-background-2').addClass('del-opt-background-1');
                        $("html").css('overflow-y', 'hidden');
                        $(".items-section").addClass('catalog-content-mobile');
                        scope.changeDelOption(scope.deliveryOption);
                        $timeout(function () {
                            scope.showDeliveryOptions = !scope.showDeliveryOptions;
                            window.addEventListener('click', clickedOffOptionsBox, false);
                        }, 200);
                    } else {
                        $("#" + scope.storeType + " .del-opt-icon svg").removeClass('del-opt-icon-svg-1').addClass('del-opt-icon-svg-2');
                        $("#" + scope.storeType + " .del-opt-btn").removeClass('del-opt-btn-1').addClass('del-opt-btn-2');
                        $("#" + scope.storeType + " .del-opt-box").addClass('del-opt-box-2');
                        $("#" + scope.storeType + " .delivery-day_" + scope.choosenDay).removeClass('delivery-day-3').addClass('delivery-day-2');
                        $("html").css('overflow-y', 'auto');
                        $(".items-section").removeClass('catalog-content-mobile');
                        scope.showDeliveryOptions = !scope.showDeliveryOptions;
                        $timeout(function () {
                            $("#" + scope.storeType + " .del-opt-box").removeClass('del-opt-box-3 del-opt-box-4');
                            $("#del-opt-background").removeClass('del-opt-background-1').addClass('del-opt-background-2');
                            scope.choosenDay = scope.dates.selected.date;
                        }, 100);
                        window.removeEventListener('click', clickedOffOptionsBox, false);
                    }
                    updateBtnColor();
                };

                scope.changeDelOption = function (option) {
                    scope.deliveryOption = option;
                    if (option == "Scheduled Delivery") {
                        $("#" + scope.storeType + " .delivery-day_" + scope.choosenDay).removeClass('delivery-day-2').addClass('delivery-day-3');
                        $("#" + scope.storeType + " .del-opt-box").removeClass('del-opt-box-4').addClass('del-opt-box-3');
                        $timeout(function () {
                            scope.showScheduleOptions = true;
                            $("#" + scope.storeType + "schd_options").addClass('fadeIn').removeClass('fadeOut');
                        }, 200);
                        updateOrderDeliveryHrs("Scheduled Delivery");
                    } else if ("ASAP Delivery") {
                        $("#" + scope.storeType + "schd_options").addClass('fadeOut').removeClass('fadeIn');
                        $("#" + scope.storeType + " .del-opt-box").removeClass('del-opt-box-3').addClass('del-opt-box-4');
                        updateOrderDeliveryHrs("ASAP Delivery");
                        $timeout(function () {
                            scope.showScheduleOptions = false;
                        }, 300);
                    }
                };

                scope.chooseDay = function (num) {
                    let day = scope.choosenDay;
                    if (day == num) return;
                    $timeout(function () {
                        $(".del-opt-box .delivery-day_" + day).removeClass('delivery-day-3').addClass('delivery-day-2');
                        $(".del-opt-box .delivery-day_" + num).removeClass('delivery-day-2').addClass('delivery-day-3');
                    }, 0);
                    scope.choosenDay = num;
                };

                scope.chooseTime = function (num) {
                    scope.dates.selected.date = scope.choosenDay;
                    scope.dates.selected.time = num;
                    updateOrderDeliveryHrs("Scheduled Delivery");
                };

                function updateOrderDeliveryHrs(option) {
                    if (scope._deliveryError) return;
                    let delivery_hrs = localStorage.getOrderDeliveryHrs();
                    let store_name = scope.store_name;
                    let date_hrs = scope.dates;
                    if (option == "ASAP Delivery") {
                        if (delivery_hrs && delivery_hrs.hasOwnProperty(store_name)) {
                            delete delivery_hrs[store_name];
                            localStorage.setOrderDeliveryHrs(delivery_hrs);
                        } else return;
                    } else if (option == "Scheduled Delivery") {
                        if (!delivery_hrs) delivery_hrs = {};
                        delivery_hrs[store_name] = {
                            "date_selected": date_hrs.selected.date,
                            "hrs_selected": date_hrs.selected.time,
                            "value": date_hrs.date_array[date_hrs.selected.date].hours_array[date_hrs.selected.time].value
                        };
                        scope.deliveryDate = {
                            month: date_hrs.date_array[date_hrs.selected.date].display_month_name,
                            day: date_hrs.date_array[date_hrs.selected.date].display_month_day,
                            time: date_hrs.date_array[date_hrs.selected.date].hours_array[date_hrs.selected.time].display_hour
                        };
                        updateDeliveryDate(
                            date_hrs.date_array[date_hrs.selected.date].display_month_name,
                            date_hrs.date_array[date_hrs.selected.date].display_month_day,
                            date_hrs.date_array[date_hrs.selected.date].hours_array[date_hrs.selected.time].display_hour
                        );
                        localStorage.setOrderDeliveryHrs(delivery_hrs);
                    }
                }

                function updateBtnColor() {
                    if (!scope.storeOpen && scope.deliveryOption == "ASAP Delivery") {
                        scope.buttonStyle = { "background-color": "#ff8d8d" };
                    } else if (scope.storeOpen && scope.deliveryOption == "ASAP Delivery") {
                        scope.buttonStyle = { "background-color": "rgb(190, 255, 157)" };
                    } else if (scope.deliveryOption == "Scheduled Delivery") {
                        scope.buttonStyle = { "background-color": "rgb(236, 251, 151)" };
                    }
                }

                function updateDeliveryDate(month, day, time) {
                    scope.deliveryDate = {
                        month: month,
                        day: day,
                        time: time
                    };
                }
            }, 0);
        }
    };
});