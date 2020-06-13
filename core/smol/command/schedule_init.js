const fs = require('fs')

module.exports = {
  description: 'Install cron job for scheduler',
  args: [
    'user: OS username to run cron job as',
  ],
  exec: async command => {

    try {

      // don't add if already present
      let crontab = fs.readFileSync('/etc/crontab', 'utf-8')
      if (crontab.match(`cd ${process.cwd()} && npx smol schedule run`)) return console.log(command.colors.yellow('Schedule cron job already installed'))

      // install
      console.log(command.colors.yellow('Installing schedule cron job...'))
      let cronLine = `* * * * *   ${command.args.user}    cd ${process.cwd()} && npx smol schedule run >> /dev/null 2>&1`
      crontab += `\n${cronLine}\n`
      fs.writeFileSync('/etc/crontab', crontab)
      console.log(command.colors.green('Installed cron job to /etc/crontab:'))
      console.log(cronLine)

    } catch (err) {
      console.log(`${command.colors.yellow('Could not install schedule.')} Do you have permission?`)
    }

  },
}
