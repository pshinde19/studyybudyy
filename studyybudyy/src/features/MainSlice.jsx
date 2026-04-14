import { createSlice } from '@reduxjs/toolkit';
const intialstate={
  "collection":[],
  "currentSelectedcollection":"NA"
}
const mainSlice = createSlice({
  name: 'counter',
  initialState: intialstate,
  reducers: {
     updateCollection: (state, action) => {
      // console.log(action);
      state.collection =[...state.collection,...action.payload.collections]
    },
    updateCurrentCollection:(state, action) => {
      // console.log(action);
      state.currentSelectedcollection =action.payload.currentSelectedcollection
    }
  }
});

export const { updateCollection,updateCurrentCollection } = mainSlice.actions;
export default mainSlice.reducer;