import { assign, createMachine } from "xstate";
import { fetchCountries } from "../Utils/api";

const fillCountries = {
  initial: 'loading',
  states: {
    loading: {
      invoke:{
        id: 'getCountries',
        src: ()=>fetchCountries,
        onDone:{
          target: 'success',
          actions: assign({
            countries:(context,event)=>event.data
          })
        },
        onError:{
          target: 'failure',
          actions: assign({
            error: 'Fallo el request'
          })
        }
      }
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: 'loading'}
      }
    }
  }
}

const bookingMachine = createMachine({
  id: "buy plane tickets",
  initial: "initial",
  context:{
    countries:[],
    passengers:[],
    selectedCountry:'',
    error:'',
  },
  states: {
    initial: {
      // entry:assign({
      //   selectedCountry: (context, event)=>'',
      //   passengers: (context, event)=>[],
      // }),
      entry:assign((context, event)=>{context.passengers = [];context.selectedCountry=''}),
      on: {
        START: {
          target: "search",
        },
      },
    },
    search: {
      on: {
        CONTINUE: {
          target: "passengers",
          actions: assign({
            selectedCountry: (context, event)=>event.selectedCountry
          })
        },
        CANCEL: "initial",
      },
      ...fillCountries,
    },
    tickets: {
      // after:{
      //   5000: "initial"
      // },
      on: {
        FINISH: "initial",
      },
    },
    passengers: {
      on: {
        DONE: {
          target: "tickets",
          cond: "moreThanOnePassenger"
        },
        CANCEL: "initial",
        ADD:{
          target: 'passengers',
          actions: assign((context, event) =>context.passengers.push(event.newPassenger))
        }
      },
    },
  }
},{
  actions:{
    
  },
  guards:{
    moreThanOnePassenger: context =>context.passengers.length>0,
  }
});

export default bookingMachine;