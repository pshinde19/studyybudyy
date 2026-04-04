import React from 'react'
import style from './Chatsection.module.css'
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Mic, Send, Square } from 'lucide-react';

const Chatsection = () => {
  const currentSelectedcollection=useSelector(state=>state.metadata.currentSelectedcollection)
  
  
  return (
    <div className={`${style.chatsection_parent}`}>
        <div className={`${style['currentselected-collection']}`}>
          <FileText size={20} color="hsl(184, 87%, 49%)" strokeWidth={2}/>
           <p>{currentSelectedcollection}</p>
        </div>
        <div>
          message section
        </div>
        <div className={`${style['userinputbox']}`}>
           <div className={`${style['usertextareabox']}`}>
               <textarea rows={2} name="Userinput" id="Userinput" className={`${style['textarea']}`}></textarea>
           </div>
           <div className={`${style['micbox']}`}>
                <Mic size={20} color="#f90101" strokeWidth={2} />
           </div>
           <div className={`${style['actionbtns']}`}>
              <Send size={20} color="#fff" strokeWidth={2} className={``}/>
              <Square size={20} color="#fff" strokeWidth={2} className={`hidden`}/>
           </div>
        </div>
    </div>
  )
}

export default Chatsection