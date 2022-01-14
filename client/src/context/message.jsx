/* eslint-disable default-case */
import React, {createContext, useReducer, useContext} from 'react'

const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

const messageReducer = (state, action) => {
    let usersCopy;
    const {username, message,  messages, reaction} = action.payload;
    let userIndex;
    switch (action.type) {
        case 'SET_USERS':
            return {
                ...state,
                users: action.payload
            }
        case 'SET_USER_MESSAGES':
            usersCopy = [...state.users];
            userIndex = usersCopy.findIndex((user) => user.username === username);

            usersCopy[userIndex] = {...usersCopy[userIndex], messages}
            return {
                ...state,
                users: usersCopy
            }

        case 'SET_SELECTED_USER':
            usersCopy = state.users.map((user) => ({
                ...user,
                selected: user.username === action.payload
            }))
            return {
                ...state,
                users:usersCopy
            }
        case 'ADD_MESSAGE':
            usersCopy = [...state.users];
            userIndex = usersCopy.findIndex((user) => user.username === username);
            message.reactions = [];
            usersCopy[userIndex].messages = usersCopy[userIndex].messages ? [message, ...usersCopy[userIndex].messages] : null;
            usersCopy[userIndex].latestMessage = message;

            return {
                ...state,
                users: usersCopy,
            }

        case 'ADD_REACTION':
            console.log('add reaction')
            usersCopy = [...state.users];
            userIndex = usersCopy.findIndex((user) => user.username === username);
            
            let userCopy = {...usersCopy[userIndex]};
            
            const messageIndex = userCopy.messages?.findIndex(m => m.uuid === reaction.message.uuid);
            

            if(messageIndex > -1){
                let messagesCopy = [...userCopy.messages];
                let reactionsCopy = [...messagesCopy[messageIndex].reactions];

                const reactionIndex = reactionsCopy.findIndex(r => r.uuid === reaction.uuid);
                console.log('reactionIndex: ', reactionIndex) 
                if(reactionIndex > -1){
                    reactionsCopy[reactionIndex] = reaction;
                } else {
                    reactionsCopy = [...reactionsCopy, reaction]
                }

                messagesCopy[messageIndex] = {
                    ...messagesCopy[messageIndex],
                    reactions: reactionsCopy
                }

                userCopy = {...userCopy, messages:messagesCopy};

                usersCopy[userIndex] = userCopy;
            }

            return {
                ...state,
                users: usersCopy,
            }
            
        
        default:
            throw new Error(`Unknown action type: ${action.type}`)
    }
}

export const MessageProvider = ({children}) => {

    const [state, dispatch] = useReducer(messageReducer, {users: null});
    return (
       <MessageDispatchContext.Provider value={dispatch}>
           <MessageStateContext.Provider value={state}>
               {children}
           </MessageStateContext.Provider>
       </MessageDispatchContext.Provider>
    )
}

export const useMessageState = () => useContext(MessageStateContext);
export const useMessageDispatch = () => useContext(MessageDispatchContext);