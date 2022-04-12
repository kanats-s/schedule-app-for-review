<template>
<div id="wrapper">
  <div id="container">
    <h2>スケジュール</h2>
    <Calender/>
  </div>
</div>
</template>

<script>
import Calender from '~/components/Calender.vue';

export default {
  components: {
    Calender,
  },
  data(){
    return{
    }
  },
  methods:{
  },
  computed:{
  }
}
</script>

<style>
#wrapper{
  position: relative;
  width: 100%;
  height: 100%;
}
h2{
  margin:8px auto;
}
#container{
  position: relative;
  max-width: 700px;
  min-width: 350px;
  margin: 0 auto 50px auto;
}
</style>