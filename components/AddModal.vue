<template>
    <div class="addmodal-comp">
        <button  class="addmodal-btn" v-on:click="openModal">予定追加</button>
        <div class="addmodal-overlay" v-show="showContent">
            <div class="addmodal">
                <h4 class="addmodal-title">予定追加</h4>
                <div class="addmodal-input-area">
                    <div class="addmodal-input-section">
                        <div class="addmodal-input-label">タイトル</div>
                        <input class="addmodal-input-form" type="text" maxlength="30" v-model="title">
                    </div>
                    <div class="addmodal-input-section">
                        <div class="addmodal-input-label">開始日</div>
                        <input type="date" class="addmodal-input-form" v-model="start">
                    </div>
                    <div class="addmodal-input-section">
                        <div class="addmodal-input-label">終了日</div>
                        <input type="date" class="addmodal-input-form" v-model="end">
                    </div>
                    <p v-if="isInValidDate" class="day-error-msg">開始日&lt;=終了日となるようにしてください</p>
                    <div class="addmodal-input-section" :style="`background-color:${color}`">
                        <div class="addmodal-input-label">色</div>
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
                    <div class="addmodal-input-section">
                        <div class="addmodal-input-label">メモ</div>
                        <div class="addmodal-input-textare">
                            <textarea v-model="memo"></textarea>
                            <div class="addmodal-count-area">
                                <span :class="{warning : isInValidMemo}">{{countaMemo}}</span>/200
                            </div></div>
                    </div>
                </div>
                <div class="addmodal-btn-area">
                    <button class="addmodal-btn" @click="eventAdd" :disabled="checkValid">登録する</button>
                    <button class="addmodal-btn" v-on:click="closeModal">閉じる</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { db } from '~/plugins/firestore';
import { collection, addDoc, } from 'firebase/firestore';
import moment from 'moment';

export default {
      components: {
  },
  data(){
    return{
        title:'',
        start:'',
        end:'',
        color:'',
        memo:'',
        showContent: false,
    }
  },
  methods:{
    eventAdd: async function(){
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
        const docRef = await addDoc(collection(db, 'events'), {
            title: this.title,
            start: Number(moment(this.start).format('YYYYMMDD')),
            end: Number(moment(this.end).format('YYYYMMDD')),
            color: this.color,
            months: months,
            memo: this.memo,
        });
        this.closeModal();
        this.$emit('reloadChalender');
      }else{
        alert('登録値を入力してください');
      }
    },
    openModal:function(){
      this.showContent = true;
    },
    openModalByDaysec:function(day){
        this.start = moment(day).format('YYYY-MM-DD');
        this.end = moment(day).format('YYYY-MM-DD');
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
.addmodal-btn{
    height:25px;
    border:1px solid rgb(160, 158, 158);
    background-color: #fafafa;
    border-radius:4px;
    font-size: 12px;
}
.addmodal-overlay{
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
.addmodal{
  position: relative;
  z-index:4000;
  height: 400px;
  width: 300px;
  padding: 1em;
  background:rgb(255, 255, 255);
  border: 1px solid gray;;
  border-radius:4px;
}
.addmodal-title{
    margin: 10px 0 10px 0;
}
.addmodal-input-area{
    padding: 7px;
    font-size: 13px
}
.addmodal-input-section{
    margin: 0 0 15px 0;
    position: relative;
    width:95%;
    display: flex;
}
.addmodal-input-label{
    width: 75px;
    height: 100%;
    margin: 0;
}
.addmodal-input-form{
    flex:1;
}
.day-error-msg {
  color: red;
  margin: 0px 5px 10px 75px;
  font-size: 10px;
}
.addmodal-btn-area{
    position: absolute;
    bottom: 20px;
    left:33%;
    width:fit-content;
}
.addmodal-count-area{
    position: absolute;
    right: 5px;
    bottom: 0;
    right: 0;
    font-size: 12px;
}
.warning{
    color: red;
}
.addmodal-input-textare{
    flex:1;
    height: 130px;
}
div.addmodal-input-section textarea{
    resize:none;
    width: 97%;
    height: 100px;
}

</style>