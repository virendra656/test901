let moment = require("moment");
let _ = require("lodash");

/**
 * 
 * @param {*} availabilitiesKeys 
 * @param {*} date 
 * @return matched date keys for a given day on recurring events
 */

function getAvailabilitiesKeysByDay(availabilitiesKeys, date, weekly_recurring) {

    let matchedDateKeys = [];
    availabilitiesKeys.forEach(dateKey => {
        if (weekly_recurring && date.format("d") === moment(new Date(dateKey)).format("d")) {
            matchedDateKeys.push(dateKey);
        }
        else if (!weekly_recurring && date.format("YYYY-MM-DD") === dateKey) {
            matchedDateKeys.push(dateKey);
        }
    });
    return matchedDateKeys;
}

(async () => {
    let date = new Date("2019-09-21");
    const availabilities = new Map();
    let availabilitiesKeys = [];
    for (let i = 0; i < 16; ++i) {
        const tmpDate = moment(date).add(i, "days");
        availabilities.set(tmpDate.format("YYYY-MM-DD"), {
            date: tmpDate.toDate(),
            slots: []
        });
    }

    availabilitiesKeys = Array.from(availabilities.keys());

    let events = [
        {
            kind: "appointment",
            starts_at: new Date("2019-09-29 10:30"),
            ends_at: new Date("2019-09-29 11:30")
          },
          {
            kind: "opening",
            starts_at: new Date("2019-09-15 09:30"),
            ends_at: new Date("2019-09-15 12:30"),
            weekly_recurring: true
          },
          {
            kind: "opening",
            starts_at: new Date("2019-09-30 09:30"),
            ends_at: new Date("2019-09-30 12:30"),
            weekly_recurring: false
          }
    ]

    events = _.orderBy(events, 'kind', 'desc');;

    /* 
    const events = await knex
        .select("kind", "starts_at", "ends_at", "weekly_recurring")
        .from("events")
        .where(function () {
            this.where("weekly_recurring", true).orWhere("ends_at", ">", +date);
        }); */

    for (const event of events) {

        for (
            let date = moment(event.starts_at);
            date.isBefore(event.ends_at);
            date.add(30, "minutes")
        ) {
            const day = availabilities.get(date.format("d"));


            const availabilitiesKeysByDay = getAvailabilitiesKeysByDay(availabilitiesKeys, date, event.weekly_recurring);

            if (event.kind === "opening") {

                availabilitiesKeysByDay.forEach(dateKey => {
                    const day = availabilities.get(dateKey);

                    if (day.slots.indexOf(date.format("H:mm")) < 0) {
                        day.slots.push(date.format("H:mm"));
                    }

                });
            } else if (event.kind === "appointment") {
                availabilitiesKeysByDay.forEach(dateKey => {
                    const day = availabilities.get(dateKey);
                    day.slots = day.slots.filter(
                        slot => slot.indexOf(date.format("H:mm")) === -1
                    );
                });

            }
        }
    }

    console.log(Array.from(availabilities.values()));
})();
