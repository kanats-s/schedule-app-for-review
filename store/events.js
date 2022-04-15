import { db } from '~/plugins/firestore';
import {collection, getDocs, query, where} from 'firebase/firestore';


export const state = () => ({
    events: [],
})

export const getters = {
  getEvents:function(state){
    return state.events;
  },
  getEventsById:(state) => (id) => {
    return state.events.find( event => String(event.id) === String(id));
  },
}

export const mutations = {
  initEvents(state){
    state.events=[];
  },
  setEvents(state,event){
    state.events.push({
      id:String(event.id),
      title:String(event.title),
      start:String(event.start),
      end:String(event.end),
      color:String(event.color),
      memo:String(event.memo)
    });
  },
  assignIndex(state,params){
    let stackIndex = Number(params.stackIndex);
    Object.assign(state.events.find( event => String(event.id) === String(params.id)),{stackIndex});
  },
}

export const actions = {
  async getEventListByMonth({ commit, state }, {months}){
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('months', 'array-contains-any', months));
      const querySnapshot = await getDocs(q);
      commit('initEvents');
      querySnapshot.forEach((doc) => {
        let id = doc.id;
        commit('setEvents',{...doc.data(),id});
      });
    } catch(e) {
      console.error('Failed to get data,');
      console.error(e);
    }
  },
  async getAllEventList({ commit, state }, {param}){
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      commit('initEvents');
      querySnapshot.forEach((doc) => {
        let id = doc.id;
        commit('setEvents',{...doc.data(),id});
      });
    } catch(e) {
      console.error('Failed to get data,');
      console.error(e);
    }
  },
}