const moment  = require('moment')

function formatMessages(username, text) {
    
    return {
        username,
        text,
        time: moment().format('H:mm a')
    }
}

module.exports = formatMessages