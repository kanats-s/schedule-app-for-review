<template>
    <div class="updmodal-comp">
        <div class="updmodal-overlay" v-show="showContent">
            <div class="updmodal">
                <h4 class="updmodal-title">予定編集</h4>
                <div class="updmodal-input-area">
                    <div class="updmodal-input-section">
                        <div class="updmodal-input-label">タイトル</div>
                        <input class="updmodal-input-form" type="text" maxlength="30" v-model="title">
                    </div>
                    <div class="updmodal-input-section">
                        <div class="updmodal-input-label">開始日</div>
                        <input type="date" class="updmodal-input-form" v-model="start">
                    </div>
                    <div class="updmodal-input-section">
                        <div class="updmodal-input-label">終了日</div>
                        <input type="date" class="updmodal-input-form" v-model="end">
                    </div>
                    <p v-if="isInValidDate" class="day-error-msg">開始日&lt;=終了日となるようにしてください</p>
                    <div class="updmodal-input-section" :style="`background-color:${color}`">
                        <div class="updmodal-input-label">色</div>
                        <select v-model="color">
                            <option value="#abf">blue</option>
                            <option value="#afa">green</option>
                            <option value="#ffa">yellow</option>
                            <option value="#faa">red</option>
                            <option value="#baf">purple</option>
                            <option value="#bff">light blue</option>
                            <option value="#aaa">gray</option>
                        </select>
                    </div>
                    <div class="updmodal-input-section">
                        <div class="updmodal-input-label">メモ</div>
                        <div class="updmodal-input-textare">
                            <textarea v-model="memo"></textarea>
                            <div class="updmodal-count-area">
                                <span :class="{warning : isInValidMemo}">{{countaMemo}}</span>/200
                            </div></div>
                    </div>
                </div>
                <div class="updmodal-btn-area">
                    <button class="updmodal-btn" :disabled="checkValid" @click="eventSet">更新する</button>
                    <button class="updmodal-btn" @click="eventDel" >削除する</button>
                    <button class="updmodal-btn" v-on:click="closeModal">閉じる</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { db } from '~/plugins/firestore';
import { doc, runTransaction, } from 'firebase/firestore';
import moment from 'moment';

export default {
      components: {
  },
  data(){
    return{
        id:'',
        title:'',
        start:'',
        end:'',
        color:'',
        memo:'',
        showContent: false,
    }
  },
  methods:{
      eventDel: async function(){
          const sfDocRef = doc(db, "events", String(this.id));
            try {
                await runTransaction(db, async (transaction) => {
                    const sfDoc = await transaction.get(sfDocRef);
                    if (!sfDoc.exists()) {
                        throw "存在しない予定です";
                    }
                    transaction.delete(sfDocRef);
                });
                this.backToCalender();
            } catch (e) {
                alert(e);
                this.backToCalender();
            }
      },
      eventSet: async function(){
        if(this.title !='' && this.start !='' && this.end !='' && this.color !=''){
            let sDateOfMonth = moment(this.start).startOf('month');
            let eDateOfMonth = moment(this.end).endOf('month');
            let diffMonth = moment(eDateOfMonth).diff(moment(sDateOfMonth),'months');
            let months =[];
            let setMonth = sDateOfMonth;
            for (let i = 0; i <= diffMonth; i++){
                months.push(String(moment(setMonth).format('YYYYMM')));
                setMonth = moment(setMonth).add(1, 'month');
            }
            const sfDocRef = doc(db, "events", String(this.id));
            try {
                await runTransaction(db, async (transaction) => {
                    const sfDoc = await transaction.get(sfDocRef);
                    if (!sfDoc.exists()) {
                        throw "存在しない予定です";
                    }
                    transaction.update(sfDocRef, {
                        title: this.title,
                        start: Number(moment(this.start).format('YYYYMMDD')),
                        end: Number(moment(this.end).format('YYYYMMDD')),
                        color: this.color,
                        months: months,
                        memo: this.memo,
                    });
                });
                this.backToCalender();
            } catch (e) {
                alert(e);
                this.backToCalender();
            }
        }else{
            alert('登録値を入力してください');
        }
      },
    openModal:function(dayEvent){
        this.id = dayEvent.id;
        this.title = dayEvent.title;
        this.start = moment(dayEvent.start).format('YYYY-MM-DD');
        this.end = moment(dayEvent.end).format('YYYY-MM-DD');
        this.color = dayEvent.color;
        this.memo = dayEvent.memo;
        this.showContent = true;
    },
    closeModal:function(){
        this.showContent = false;
        this.initAddArea();
    },
    initAddArea:function(){
        this.title = '';
        this.start = '';
        this.end = '';
        this.color = '';
        this.memo = '';
    },
    backToCalender:function(){
        this.closeModal();
        this.$emit('reloadChalender');
    }
  },
  computed:{
    checkValid(){
        if(this.isInValidDate){
            return true;
        } else if(this.isInValidMemo){
            return true;
        } else {
            return false;
        }
    },
    isInValidDate(){
      let startDate = moment(this.start);
      let endDate = moment(this.end);
      if( endDate < startDate ){
        return true;
      }
      return false;
    },
    isInValidMemo(){
        if(200<this.countaMemo){
            return true;
        }
        return false;
    },
    countaMemo(){
        return  this.memo.length;
    },
  }
}
</script>

<style>
.updmodal-btn{
    height:25px;
    border:1px solid rgb(160, 158, 158);
    background-color: #fafafa;
    border-radius:4px;
}
.updmodal-overlay{
  /*　画面全体を覆う設定　*/
  position:fixed;
  /*　要素を重ねた時の順番　*/
  z-index:1000;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background-color:rgba(0,0,0,0.5);

  /*　画面の中央に要素を表示させる設定　*/
  display: flex;
  align-items: center;
  justify-content: center;

}
.updmodal{
  position: relative;
  z-index:4000;
  height: 400px;
  width: 300px;
  padding: 1em;
  background:rgb(255, 255, 255);
  border: 1px solid gray;;
  border-radius:4px;
}
.updmodal-title{
    margin: 10px 0 10px 0;
}
.updmodal-input-area{
    padding: 7px;
    font-size: 13px
}
.updmodal-input-section{
    margin: 0 0 15px 0;
    position: relative;
    width:95%;
    display: flex;
}
.updmodal-input-label{
    width: 75px;
    height: 100%;
    margin: 0;
}
.updmodal-input-form{
    flex:1;
}
.day-error-msg {
  color: red;
  margin: 0px 5px 10px 75px;
  font-size: 10px;
}
.updmodal-btn-area{
    position: absolute;
    bottom: 20px;
    left:22%;
    width:fit-content;
}
.updmodal-count-area{
    position: absolute;
    right: 5px;
    bottom: 0;
    right: 0;
    font-size: 12px;
}
.warning{
    color: red;
}
.updmodal-input-textare{
    flex:1;
    height: 130px;
}
div.updmodal-input-section textarea{
    resize:none;
    width: 97%;
    height: 100px;
}

</style>