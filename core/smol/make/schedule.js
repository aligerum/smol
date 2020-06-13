module.exports = {
  description: 'Scheduled action',
  files: [
    {
      to: filename => `schedule/${filename}.js`,
      from: 'schedule.js',
    },
  ],
}
