# Schedule

smol has an advanced built-in scheduler for handling automated tasks. Schedules are defined in schedule files within `/schedule` for the project, and within `/core/<coreName>/schedule` for individual cores.

# Scheduler Installation

The scheduler works by running a cron job every minute that calls `smol schedule run` from the project directory. To install this cron job, run `sudo smol schedule init <userName>`. For example, if the app should run as the user `ubuntu`, run `sudo smol schedule init ubuntu`.

```
$ sudo smol schedule init ubuntu
Installing schedule cron job...
Installed cron job to /etc/crontab:
* * * * *   ubuntu      cd /var/www/someproject && npx smol schedule run >> /dev/null 2>&1
```

There is no database or file that stores the state of when schedules last ran, instead, it is calculated at runtime. A job that runs every 30 minutes for instance will just check to see that it's either h:00 or h:30 and run any jobs that should run at those times.

# Creating Schedules

To create a new schedule, run `smol make schedule <name>`. For example, let's create simple test schedule that stores the number of users we have in a log file.

```
$ smol make schedule logUsers
Created schedule/logUsers.js
```

This will create a file called `schedule/logUsers.js`:

```js
module.exports = {
  description: '',
  canOverlap: false,
  allowInMaintenanceMode: false,
  order: 0,
  time: 'daily',
  exec: async schedule => {
  },
}
```

We can set the description, which is used when getting information about this schedule.

```js
module.exports = {
  description: 'Record total users in storage/users.log',
  canOverlap: false,
  allowInMaintenanceMode: false,
  order: 0,
  time: 'daily',
  exec: async schedule => {

  },
}
```

# Enabling and Disabling Schedules

Run `smol schedule status` to see a list of schedules. The checkmark indicates which are enabled/disabled.

```
$ smol schedule status
Schedule system is enabled
 ✓  Name       Core  Time                         Next Run                 Description
 ✓  Log Users        Daily                        Sat Jun 13 2020 12:00am  Record total users in storage/users.log
```

You can disable the global scheduler by running `smol schedule disable`. This will still show checks next to each individual schedule that's enabled, but none of them will run because the scheduler itself is disabled.

To disable individual schedules, you can run `smol schedule disable <scheduleName>`, so we would run `smol schedule disable logUsers` to disable that schedule.

To re-enable schedules, run `smol schedule enable` to enable the global scheduler, or `smol schedule enable <scheduleName>` to enable a specific schedule.

Which schedules are enabled and disabled can also be set by editing `config/smol.json` and putting the disabled schedule names into the `disabledSchedules` array. The global scheduler is enabled/disabled using the `scheduleEnabled` key.

# Time Rules

Each schedule is run at its designated time. By default, schedules run daily at midnight. Schedule times are defined by their `time` key. This value is parsed to look for keywords. Words other than keywords are ignored, so you can add any phrases that might make it easier to read without causing problems. Here are some examples:

- "daily", "every day" (run at midnight)
- "hourly", "every hour" (run every time it's :00 minutes)
- "mon", "monday", "mondays", "every monday" (run on monday at midnight)
- "weekdays", "weekends" (run mon-fri and sat-sun respectively)
- "weekly" (run monday at midnight)
- "12:00", "12 o'clock", "12oclock", "noon" (run daily at 12:00 pm)
- "0:00", "0:", "12am", "12 AM", "midnight" (run at 12:00 am)
- "13:00", "1pm", "1 PM" (run daily at 1pm)
- "monthly", "every month" (run the 1st at midnight)
- "yearly", "every year" (run January 1st of the year at midnight)
- "quarterly" (run January 1st, April 1st, July 1st, October 1st)
- "biyearly" (run January 1st and July 1st)
- ":25", "25 minutes", "25min" (run every hour at :25)
- "20th", "20" (run on the 20th of every month)

You can also combine these rules. The more specific rules override less specific rules, for example, "daily" runs at midnight, but if you say "daily at 2pm", it won't run at midnight and 2pm.

Here are some examples of more complex rules:

- "Wednesdays, Thursdays, and Fridays at 2pm and 4pm"
- "Twice an hour at :15 and :45" (The phrase "twice an hour" and the word "and" mean nothing, so are ignored. Just :15 and :45 are parsed)
- "Every payday on the 10th and 25th" (The extra phrases are ignored but are explanatory for human readers)
- "The 1st, 2nd, and 3rd of July and October"

Here are some gotchas that won't work as you might expect:

- "January 3rd and August 1st" (this will actually run January 1st, January 3rd, August 1st, and August 3rd)
- "Every 15 minutes" (this will just run hourly at :15, not every 15 minutes. To run every 15 minutes, use a phrase containing ":00 :15 :30 :45")
- "Monday thru Friday at 4pm" (this will just run Mondays and Fridays at 4pm)
- "Hourly between 8am and 4pm" (this will just run at 8am and 4pm)

Use `smol schedule status <scheduleName>` to see the next 10 times a schedule will run to be sure its pattern is correct. It's also important to write times clearly so people reading them will unambiguously understand when they will run.

For example, let's set our `logUsers` command to run "tuesdays and thursdays at noon and midnight", then run `smol schedule status logUsers`:

```
$ smol schedule status logUsers
Schedule system is enabled
 ✓  Name       Core  Time                                         Next 10 Runs             Description
 ✓  Log Users        Tuesdays And Thursdays At Noon And Midnight  Tue Jun 16 2020 12:00am  Record total users in storage/users.log
                                                                  Tue Jun 16 2020 12:00pm
                                                                  Thu Jun 18 2020 12:00am
                                                                  Thu Jun 18 2020 12:00pm
                                                                  Tue Jun 23 2020 12:00am
                                                                  Tue Jun 23 2020 12:00pm
                                                                  Thu Jun 25 2020 12:00am
                                                                  Thu Jun 25 2020 12:00pm
                                                                  Tue Jun 30 2020 12:00am
                                                                  Tue Jun 30 2020 12:00pm
```

# Schedule Order

Schedules are designed to run asynchronously in parallel. After all, if you have 10 things that you want to happen at 1pm and one of them takes 20 minutes, it would be undesireable to have the later schedules start at 1:20pm.

By default, schedules have an order of 0. All schedules will the same number will start simultaneously before going on to schedules with higher orders. For example, if we have schedule A and B with an order of 0, and schedule C with and order of 1, both A and B will start at the same time, then schedule C will begin once both have completed.

This is useful for having schedules that rely on other schedules completing. Orders do not have to be contiguous, you can for example have schedules of order 0, then have none with values 1-99, then have the next be 100 or any other arbitrary number.

# Maintenance Mode

By default, schedules do not run while in maintenance mode (see Maintenance Mode doc). You may have some very important schedules that you always want to run, or you would like to manually enable/disable.

To enable a schedule to run even while the app is in maintenance mode, set `allowInMaintenanceMode` to true.

# Overlapping Schedules

Some scheduled operations may take a very long time to finish, for example, a very long data import process. In this case, you may set the import schedule to run every 30 minutes, but occasionally it takes 40 minutes to finish the operation. Because it's a very cpu-intensive process and relies on the results of the last import, you don't want to wind up running the schedule twice at the same time.

By default, schedules will not overlap, but you can allow them to overlap by setting `canOverlap` to true.

Overlapping is managed by creating lock files within `storage/schedule/running`. This path can be configured by setting `runningSchedulePath` in `config/smol.json`. This works by storing the process ID of the command running the schedule within the lock file.

This file is cleared when the schedule completes to allow the schedule to be run again. If the schedule fails or is aborted and the file is not cleaned up, the process ID within the file is checked. If the stored process ID is not still running, the schedule will be allowed to run.

# Schedule Functionality

Schedule functionality is defined by a single `exec` callback on the schedule definition. This is passed a `schedule` object which is very similar to the `command` object used by command definitions (see Commands doc).

The schedule object has a `time` key which stores a `moment` object describing the date the schedule started. This will not be the exact time the function was called, it will be the time all of the schedules for the matching time were started.

For example, if you have 10 things set to run at 1:00pm and the 5 things that have order 0 take 10 minutes to complete, `schedule.time` will still be 1:00pm, not 1:10pm.

The `schedule` object also has the following in common with the `command` object used in commands: `ask`, `confirm`, `colors`, `run`, `runAsync`, `spawn` (see Commands doc).

It's important to use the time provided by `schedule.time`, as the user may run a simulated time (see below).

# Core Schedules

Just as with commands, you can create schedules for specific cores by running `smol make <coreName> schedule <scheduleName>`. These will be stored in `core/<coreName>/schedule`.

The `schedule` object passed to `exec` would then have a `core` key just like when running commands (see Commands doc).

# Manually Running and Simulating Times

You can manually run individual schedules by running `smol schedule run <scheduleName>`. This will run regardless of whether it is time for the schedule to run, and ignores maintenance mode. It does however, respect overlap rules.

To simulate a specific time, you can use the `--time` option:

```
$ smol schedule run --time="2020-01-01 00:00:00"
```

This will run all schedules as if it's that time. Their schedule objects will be passed a `moment` object with the input time. This will also respect order just as if the schedule were running at that time.

This is very useful for development so you don't have to wait for a specific time to test a schedule, and you can view the console output of the schedule's exec function.
