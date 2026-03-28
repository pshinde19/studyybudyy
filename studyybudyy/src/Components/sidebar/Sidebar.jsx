import React, { useState } from 'react'
import style from './Sidebar.module.css'
import { Plus ,History, CircleUserRound, Menu, BookMarked, CircleCheck} from 'lucide-react';
import '../../App.css'
import Upload from '../uploadbox/Upload';
import { useSelector ,useDispatch} from 'react-redux';


const Sidebar = () => {
    const [isuploadComp,setisuploadComp]=useState(false)
    function UploadDocument(){
       console.log('clicked');
       setisuploadComp(true)
    }
    const Collections = useSelector((state) => state.metadata.collection)
    const dispatch=useDispatch()
    console.log(Collections);
    

    return (
        <div className={`${style['sidebar-continer']}`}>
            <div className={`${style.header} `}>
                <div style={{color:"#8A2BE2" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 8h2v1h-2zm0-4h2v1h-2zm0 6h2v1h-2z" />
                    <path fill="currentColor" d="M21 12V9a13.12 13.12 0 0 0-8.354 3h-1.292A13.12 13.12 0 0 0 3 9v3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v4a13.15 13.15 0 0 1 9 3.55A13.2 13.2 0 0 1 21 20v-4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><circle cx="9" cy="4" r="1" fill="currentColor" /><circle cx="15" cy="4" r="1" fill="currentColor" /><path fill="currentColor" d="M16 8H8a3.003 3.003 0 0 1-3-3V3a3.003 3.003 0 0 1 3-3h8a3.003 3.003 0 0 1 3 3v2a3.003 3.003 0 0 1-3 3M8 2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" /></svg>
                </div>
                <div className={`${style['headertitle']}`}>
                    <h6 className={`${style['gradient-text']}`}>StudyyBudyy</h6>
                    <p>Study Assistant</p>
                </div>
            </div>
            <div className={`${style.body} `}>
                <div>
                    <div className={`${style['section-header']}`}>
                        <div className={`${style['section-header-title']}`}>Collections</div>
                        <button onClick={UploadDocument} className={`${style.uploadbtn} flex items-center justify-between gap-1`}>
                            <div>Upload</div> 
                            <Plus size={16} color="#f90101" strokeWidth={2} />
                        </button>
                        {isuploadComp && <Upload setisuploadComp={setisuploadComp}/>}
                    </div>
                    <div>
                        <ul className={`${style['document-list-ul']}`}>
                            {Collections.length == 0 && <div className={`${style['nocollection']}`}>No Collection</div>}
                            {Collections.length > 0 && Collections.map((value,idx,arr)=>{
                                
                                return <li key={crypto.randomUUID()} className={`${style['document-list-li']} ${idx==0?"active":''}`}>
                                            <div className={`${style['document-list-name']}`}>
                                                <div className='flex gap-2 items-center'>
                                                    <BookMarked size={16} color="#9400d3" strokeWidth={2}/>
                                                    <p>{value}</p>
                                                </div>
                                                <div className={`${style['circlecheck']}`}>
                                                    <CircleCheck  size={16} color="#f90101" strokeWidth={2}/>
                                                </div>
                                            </div>
                                        </li>
                            })}
                            
                        </ul>
                    </div>
                </div>
                <div>
                    <div >
                        <div className={`${style['section-header']} flex items-center justify-between gap-1`}>
                            <div className={`${style['section-header-title']}`}><History size={16} color="#f90101" strokeWidth={2} />Recent Chats</div>
                        </div>
                        <div>
                            <ul className={`${style['previous-question-ul']}`}>
                                <li className={`${style['previous-question-li']}`}>last question asked</li>
                                <li className={`${style['previous-question-li']}`}>last question asked</li>
                                <li className={`${style['previous-question-li']}`}>last question asked</li>
                                <li className={`${style['previous-question-li']}`}>last question asked</li>
                                <li className={`${style['previous-question-li']}`}>last question asked</li>
                                <li className={`${style['previous-question-li']}`}>last question asked</li>
                            </ul>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
            </div>
            <div className={`${style['profile-parent']} last`}>
                   <div className={`${style.profile}`}>
                       <div>
                        <CircleUserRound size={20} color="#9400d3" strokeWidth={1} />
                       </div>
                       <div className={`${style.name}`}>Pranay Shinde</div>
                       <div className={``}>
                        <Menu size={20} strokeWidth={1}/>
                       </div>
                   </div>
            </div>
        </div>
    )
}

export default Sidebar




