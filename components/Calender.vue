<template>
    <div class="calender-comp">
        <div class="calender-header">
            <UpdModal ref="updmodal" @reloadChalender="reloadChalender" />
            <div class="header-addModal-section">
                <AddModal class="addModal" ref="addmodal" @reloadChalender="reloadChalender"/>
            </div>
            <div class="header-dispmonth-section">
                <div class="display-month-section">{{displayMonth}}</div>
            </div>
            <div class="header-chgmonth-section">
                <div class="change-month-area">
                    <button class="btn prevMonth" @click="prevMonth">
                        <div class="prev"></div>
                    </button>
                    <button class="btn thisMonth" @click="thisMonth">今月</button>
                    <button class="btn nextMonth" @click="nextMonth">
                        <div class="next"></div>
                    </button>
                </div>
            </div>
        </div>
        <div class="calender-body">
            <div class="calender-weekdays">
                <div v-for="n in 7" :key="n" class="calender-section">
                    <div class="calender-weekday">{{getWeekdays(n-1)}}</div>
                </div>
            </div>
            <div v-for="(week,index) in calender" :key="index" class="calender-weekly">
                <div v-for="(day,index) in week" :key="index" class="calender-section" :class="{outside: currentMonth !== day.month,today: today == day.day}" @click="openAddModal(day)">
                    <div class="calender-date">{{day.date}}</div>
                    <div v-for="dayEvent in day.dayEvents" :key="dayEvent.id">
                        <div
                            v-if="dayEvent.width"
                            @click.stop="openUpdModal(dayEvent)"
                            class="calendar-event"
                            :style="`width:${dayEvent.width}%;background-color:${dayEvent.color}`"
                            draggable="true"
                        >
                            {{dayEvent.title}}
                        </div>
                        <div v-else style="height:15px;margin-bottom:3px;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import AddModal from '~/components/modals/AddModal.vue';
import UpdModal from '~/components/modals/UpdModal.vue';

export default {
    components: {
        AddModal,
        UpdModal,
    },
    data(){
        return {
            currentDate:moment(),
            today:moment().format('YYYYMMDD'),
        };
    },
    methods: {
        openAddModal:function(day){
            this.$refs.addmodal.openModalByDaysec(day.day);
        },
        openUpdModal:function(dayEvent){
            this.$refs.updmodal.openModal(dayEvent);
        },
        getWeekdays:function(index){
            const weekdays = ['月','火','水','木','金','土','日'];
            return weekdays[index];
        },
        getStartDate:function(){
            let date = moment(this.currentDate);
            date.startOf('month');
            const youbiNum = date.day();
            const diffFrmMonday = youbiNum == 0 ? 6 : (youbiNum - 1) ;
            return date.subtract(diffFrmMonday, 'days');
        },
        getEndDate:function(){
            let date = moment(this.currentDate);
            date.endOf('month');
            const youbiNum = date.day();
            const diffFrmSunday = youbiNum == 0 ? 0 : (7 - youbiNum) ;
            return date.add(diffFrmSunday, 'days');
        },
        getCalender:function(){
            let startDate = this.getStartDate();
            let endDate = this.getEndDate();
            let numberOfWeek = Math.ceil(endDate.diff(startDate, 'days')/7);
            let calender =[];
            let setDate = startDate;
            for (let week = 0; week < numberOfWeek; week++){
                let weekRow =[];
                for (let day = 0; day < 7; day++){
                    let dayEvents = this.getDayEvents(setDate);
                    weekRow.push({
                        day:setDate.format('YYYYMMDD'),
                        date:setDate.get('date'),
                        month:setDate.format('YYYYMM'),
                        dayEvents,
                    });
                    setDate.add(1, 'day');
                }
                calender.push(weekRow);
            }
            return calender;
        },
        prevMonth:function(){
            this.currentDate = moment(this.currentDate).subtract(1, 'month');
            let months = this.getPrevNowNextMonth(this.currentDate);
            this.getEventsFromFs(months);
        },
        nextMonth:function(){
            this.currentDate = moment(this.currentDate).add(1, 'month');
            let months = this.getPrevNowNextMonth(this.currentDate);
            this.getEventsFromFs(months);
        },
        thisMonth:function(){
            this.currentDate = moment();
            let months = this.getPrevNowNextMonth(this.currentDate);
            this.getEventsFromFs(months);
        },
        reloadChalender:function(){
            let keepCurrentDate = this.currentDate;
            this.currentDate = moment(keepCurrentDate);
            let months = this.getPrevNowNextMonth(this.currentDate);
            this.getEventsFromFs(months);
        },
        getDayEvents:function(date){
            let stackIndex = 0;
            let dayEvents = [];
            let startedEvents = [];
            this.sortByStartDate(this.getEventsList).forEach(event => {
                let startDate = moment(event.start).format('YYYYMMDD');
                let endDate = moment(event.end).format('YYYYMMDD');
                let Date = date.format('YYYYMMDD');
                if(startDate <= Date && endDate >= Date){
                    if(startDate === Date){
                        [stackIndex, dayEvents] = this.getStackEvents(event, moment(date).day(), stackIndex, dayEvents, startedEvents, event.start);
                    }else if(moment(date).day() === 1){
                        [stackIndex, dayEvents] = this.getStackEvents(event, moment(date).day(), stackIndex, dayEvents, startedEvents, Date);
                    }else{
                        startedEvents.push(event);
                    }
                }
            });
            return dayEvents;
        },
        getEventWidth:function(startDate,endDate,youbiNum){
            let eventTerm = moment(endDate).diff(moment(startDate),'days');
            let diffFrmSunday = youbiNum == 0 ? 0 : (7 - youbiNum);
            if (eventTerm > diffFrmSunday){
                return diffFrmSunday * 100 + 95;
            } else {
                return eventTerm * 100 + 95;
            }
        },
        sortByStartDate:function(events){
            return events.slice().sort(function(a,b){
                let a_startDate = moment(a.start).format('YYYYMMDD');
                let b_startDate = moment(b.start).format('YYYYMMDD');
                if(a_startDate < b_startDate) return -1;
                if(a_startDate > b_startDate) return 1;
                return 0;
            })
        },
        getStackEvents:function(event, day, stackIndex, dayEvents, startedEvents, start){
            [stackIndex, dayEvents] = this.getStartedEvents(stackIndex, startedEvents, dayEvents);
            let width = this.getEventWidth(start, event.end, day);
            this.$store.commit('events/assignIndex',{id:event.id, stackIndex:stackIndex});
            dayEvents.push({...event, width});
            stackIndex++;
            return [stackIndex,dayEvents];
        },
        getStartedEvents:function(stackIndex, startedEvents, dayEvents){
            let startedEvent;
            do{
                startedEvent = startedEvents.find(event => event.stackIndex === stackIndex);
                if(startedEvent) {
                    dayEvents.push(startedEvent);
                    stackIndex++;
                }
            }while(typeof startedEvent !== 'undefined');
            return [stackIndex, dayEvents];
        },
        getEventsFromFs:function(months){
            this.$store.dispatch('events/getEventListByMonth',{months:months});
        },
        getPrevNowNextMonth:function(basicDate){
            let nowMonth = moment(basicDate);
            let prevMonth = moment(nowMonth).subtract(1, 'month');
            let nextMonth = moment(nowMonth).add(1, 'month');
            return [prevMonth.format('YYYYMM'),nowMonth.format('YYYYMM'),nextMonth.format('YYYYMM')]
        },
    },
    computed: {
        displayMonth(){
            return this.currentDate.format('YYYY[年]MM[月]');
        },
        calender(){
            return this.getCalender();
        },
        currentMonth(){
            return this.currentDate.format('YYYYMM');
        },
        getEventsList(){
            return this.$store.getters['events/getEvents'];
        },
        showUpdModal(){},
    },
    mounted(){
        let months = this.getPrevNowNextMonth(this.currentDate);
        this.getEventsFromFs(months);
    },
}
</script>

<style>
.calender-comp{
    width: 100%;
    margin: 0 auto 0px auto;
    position: relative;
    z-index: 50;
    background-color: rgb(255, 255, 255);
}
.calender-header{
    border-left:1px solid gray;
    border-top:1px solid gray;
    border-right:1px solid gray;
    border-radius: 4px 4px 0 0;
    display:flex;
    padding: 10px 0px;
}
.header-addModal-section{
    min-width: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.header-dispmonth-section{
    min-width: 40%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.header-chgmonth-section{
    min-width: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.addModal{
    margin: 0 auto 0 10%;
    width: fit-content;
}
.change-month-area{
    display:flex;
    width:fit-content;
    margin: 0 10% 0 auto;
}
.display-month-section{
    width: fit-content;
    height: fit-content;
    /* margin: auto; */
    
}
.btn{
    height:25px;
    border:1px solid rgb(160, 158, 158);
    background-color: #fafafa;
    border-radius:4px;
    font-size: 12px;
    padding: 1px 8px
}
.thisMonth{
    width: 45px;
    margin: 0px 10px 0px 10px ;
}
.prevMonth{
    width: 22px;
}
.nextMonth{
    width: 22px;
    margin: 0px 0px 0px 0px ;
}
.next{
  width: 0;
  height: 0;
  border-left: 5px solid black;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}
.prev{
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-right: 5px solid black;
  border-bottom: 5px solid transparent;
}
.calender-body{
    position: relative;
    z-index: 100;
    width: 100%;
    border-top:1px solid gray;
    margin: 0px auto 0px;
}
.calender-weekdays{
    font-size: 8pt;
    display:flex;
    min-height: 24px;
    border-left:1px solid gray;
}
.calender-weekly{
    display:flex;
    /* min-height: 70pt; */
    min-height: 90px;
    border-left:1px solid gray;
    background-color: rgb(255, 255, 255);
}
@media screen and (max-width: 480px){
    .calender-weekly{
        display:flex;
        min-height: 80px;
        border-left:1px solid gray;
        background-color: rgb(255, 255, 255);
    }
}
.calender-section{
    flex:1;
    border-right:1px solid gray;
    border-bottom:1px solid gray;
}
.outside{
    background-color: #d1cdcd;
}
.today{
    background-color: #ffd;
}
.calender-date{
    font-size: 8pt;
    margin: 0 0 0 3px;
}
.calender-weekday{
    text-align: center;
    color: black;
    font-size: 12px;
    margin: 2px;
}
.calendar-event{
    font-size: 7pt;
    color: rgb(53, 53, 53);
    margin-bottom:3px;
    height:15px;
    line-height:15x;
    position: relative;
    z-index:300;
    border-radius:4px;
    padding-left:4px;
    box-shadow: 0 2px 0 rgb(175, 174, 174);
    /* 【#1】追加 */
    word-break: break-all;
    overflow: hidden;
}
</style>