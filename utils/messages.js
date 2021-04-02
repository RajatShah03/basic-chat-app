const moment = require("moment");

const formatMessages = (username, text) => ({
  username,
  message: text,
  time: moment().format('h:mm a')
})

module.exports = formatMessages