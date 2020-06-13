const moment = require('moment')

let getRule = scheduleTime => {

  // break time into tokens
  scheduleTime = scheduleTime.toLowerCase().replace(/[\,\']/g, '')
  scheduleTime = scheduleTime.replace(/every minute/g, '')
  scheduleTime = scheduleTime.replace(/every hour/g, 'hourly')
  scheduleTime = scheduleTime.replace(/every day/g, 'daily')
  scheduleTime = scheduleTime.replace(/every week/g, 'weekly')
  scheduleTime = scheduleTime.replace(/every month/g, 'monthly')
  scheduleTime = scheduleTime.replace(/every year/g, 'yearly')
  scheduleTime = scheduleTime.replace(/ ?pm/g, 'pm')
  scheduleTime = scheduleTime.replace(/ ?am/g, 'am')
  scheduleTime = scheduleTime.replace(/ ?oclock/g, ':00')
  scheduleTime = scheduleTime.replace(/([^ ]+) ?min(utes)?/g, (s, min) => `:${min}`)
  scheduleTime = scheduleTime.replace(/noons?/g, '12pm')
  scheduleTime = scheduleTime.replace(/midnights?/g, '12am')
  scheduleTime = scheduleTime.replace(/quarterly/g, 'jan apr jul oct')
  scheduleTime = scheduleTime.replace(/biyearly/g, 'jan jul')  
  let tokens = scheduleTime.split(' ')

  // determine rules
  let daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  let months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  let rule = {
    daysOfWeek: [],
    months: [],
    dates: [],
    times: [],
  }
  for (let token of tokens) {

    // times
    if (token.match('am') || token.match('pm') || token.match(':')) {
      let time = {}
      let isPm = token.match('pm')
      let isAm = token.match('am')
      token = token.replace('am', '').replace('pm', '')
      if (!token.match(':')) token += ':'
      let hour = token.split(':')[0]
      let minute = token.split(':')[1]
      if (hour !== '') time.hour = Number(hour)
      if (isAm && hour == 12) time.hour = 0
      if (isPm && hour != 12) time.hour += 12
      if (minute !== '') time.minute = Number(minute)
      if (time.minute == undefined) time.minute = 0
      rule.times.push(time)
      continue
    }

    // days of week
    let prefix = token.slice(0, 3)
    if (daysOfWeek.includes(prefix) && !token.match(/^mon[^d]/)) rule.daysOfWeek.push(daysOfWeek.indexOf(prefix))
    if (token == 'weekdays') rule.daysOfWeek = rule.daysOfWeek.concat([1, 2, 3, 4, 5])
    if (token == 'weekends') rule.daysOfWeek = rule.daysOfWeek.concat([0, 6])

    // months
    if (months.includes(prefix)) rule.months.push(months.indexOf(prefix))

    // dates
    token = token.replace(/\D/g, '')
    let numberToken = Number(token.replace(/\D/g, ''))
    if (numberToken && !isNaN(numberToken)) {
      rule.dates.push({day: numberToken})
    }

  }

  // daily, every day, hourly, every hour
  for (let token of tokens) {
    if (token == 'daily' && !rule.times.length) rule.times.push({hour: 0, minute: 0})
    if (token == 'hourly' && !rule.times.length) rule.times.push({minute: 0})
  }

  // weekly, every week
  for (let token of tokens) {
    if (token == 'weekly') {
      if (!rule.daysOfWeek.length) rule.daysOfWeek.push(0)
      if (!rule.dates.length) rule.dates.push({day: 1})
      if (!rule.times.length) rule.times.push({hour: 0, minute: 0})
    }
  }

  // monthly, every month
  for (let token of tokens) {
    if (token == 'monthly') {
      if (!rule.dates.length) rule.dates.push({day: 1})
      if (!rule.times.length) rule.times.push({hour: 0, minute: 0})
    }
  }

  // yearly, every year
  for (let token of tokens) {
    if (token == 'yearly') {
      if (!rule.months.length) rule.months.push(0)
      if (!rule.dates.length) rule.dates.push({day: 1})
      if (!rule.times.length) rule.times.push({hour: 0, minute: 0})
    }
  }

  // ensure have day, hour, and minute if monthly
  if (rule.months.length && !rule.daysOfWeek.length) {
    if (!rule.dates.length) rule.dates.push({day: 1})
    if (!rule.times.length) rule.times.push({hour: 0, minute: 0})
  }

  // ensure have hour, and minute if weekly
  if (rule.daysOfWeek.length) {
    if (!rule.times.length) rule.times.push({hour: 0, minute: 0})
  }

  // return rule
  return rule

}

// return true if is time to run schedule
let isTime = (scheduleTime, currentTime) => {

  // get rule
  let rule = getRule(scheduleTime)

  // enforce rules
  if (rule.daysOfWeek.length && !rule.daysOfWeek.includes(currentTime.day())) return false
  if (rule.months.length && !rule.months.includes(currentTime.month())) return false
  let matchedDate
  for (let date of rule.dates) {
    if (date.day != undefined && date.day != currentTime.date()) continue
    matchedDate = true
  }
  if (rule.dates.length && !matchedDate) return false
  let matchedTime
  for (let time of rule.times) {
    if (time.hour != undefined && time.hour != currentTime.hours()) continue
    if (time.minute != undefined && time.minute != currentTime.minutes()) continue
    matchedTime = true
  }
  if (rule.times.length && !matchedTime) return false

  // time is valid
  return true

}

// get next time
let getNextTime = (scheduleTime, currentTime) => {

  // get current time
  currentTime = moment(currentTime)

  // set next time
  let nextTime = moment(currentTime).seconds(0)

  // get rule
  let rule = getRule(scheduleTime)

  // define sort function
  let ascending = (a, b) => {
    if (a < b) return -1
    if (b < a) return 1
    return 0
  }

  // month
  let months = rule.months.sort(ascending)
  if (months.length && !months.includes(nextTime.month())) {
    let nextMonth = months.find(month => month > nextTime.month())
    if (nextMonth != undefined) nextTime.month(nextMonth).startOf('month')
    else nextTime.startOf('year').add(1, 'year').month(months[0])
  }

  // date
  let dates = rule.dates.map(date => date.day).sort(ascending)
  if (dates.length && !dates.includes(nextTime.date())) {
    let nextDate = dates.find(date => date > nextTime.date())
    if (nextDate != undefined) nextTime.date(nextDate).startOf('day')
    else nextTime.startOf('month').add(1, 'month').date(dates[0])
  }

  // day of week
  let daysOfWeek = rule.daysOfWeek.sort(ascending)
  if (daysOfWeek.length && !daysOfWeek.includes(nextTime.day())) {
    let nextDow = daysOfWeek.find(dow => dow > nextTime.day())
    if (nextDow != undefined) nextTime.startOf('week').add(nextDow, 'days')
    else nextTime.startOf('week').add(7 + daysOfWeek[0], 'days')
  }

  // time
  let times = []
  for (let time of rule.times) {
    if (time.hour == undefined) for (let i=0; i<24; i++) times.push(i * 60 + time.minute)
    else times.push(time.hour * 60 + time.minute)
  }
  times = times.sort(ascending)
  if (times.length && !times.includes(nextTime.hours() * 60 + nextTime.minutes())) {
    let newTime = times.find(time => time > nextTime.hours() * 60 + nextTime.minutes())
    if (newTime != undefined) nextTime.hours(Math.floor(newTime/60)).minutes(newTime % 60)
    else nextTime.startOf('day').add(1, 'day').hours(Math.floor(times[0]/60)).minutes(times[0] % 60)
  }

  // return further day if time doesn't match
  if (moment(currentTime).seconds(0).isSame(nextTime)) nextTime.add(1, 'minute')
  if (!isTime(scheduleTime, nextTime)) return getNextTime(scheduleTime, nextTime)

  // return next time
  return nextTime

}

module.exports = {
  getNextTime,
  getRule,
  isTime,
}
