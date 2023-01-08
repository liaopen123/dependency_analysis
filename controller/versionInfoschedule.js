const schedule = require('node-schedule');
const refreshDBDataService = require('./refresh_db_data');

module.exports={
      scheduleCron : ()=>{
        //每分钟的第30秒定时执行一次:
        schedule.scheduleJob('30 1 1 * * *',()=>{
            refreshDBDataService.refreshVersionService.refreshVersionInfoFromALi();
        });
    }
}

