/* eslint-disable default-case */
import React, {createContext, useReducer, useContext} from 'react'

const VideoStateContext = createContext();
const VideoDispatchContext = createContext();



const videoReducer = (state, action) => {
    switch (action.type) {
        case 'SET_P2P_CLIENT': 
            return {
                ...state,
                p2pClient: action.payload
            }
        default:
            throw new Error(`Unknown action type: ${action.type}`)
    }
}

export const VideoProvider = ({children}) => {

    const [state, dispatch] = useReducer(videoReducer, {p2pClient: null});
    return (
       <VideoDispatchContext.Provider value={dispatch}>
           <VideoStateContext.Provider value={state}>
               {children}
           </VideoStateContext.Provider>
       </VideoDispatchContext.Provider>
    )
}

export const useVideoState = () => useContext(VideoStateContext);
export const useVideoDispatch = () => useContext(VideoDispatchContext);