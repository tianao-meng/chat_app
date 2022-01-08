import React from 'react';

import {useAuthState} from '../context/auth';
import {Route, useLocation, Navigate} from 'react-router-dom'

export default function DynamicRoute(props) {
    const {user} = useAuthState();
    let location = useLocation();
    console.log(props)
    if(props.authencated && !user){

        return  <Navigate to="/login" state={{ from: location }} />;
    } else if (props.guest && user){
        return <Navigate to="/" state={{ from: location }} />;
    } else {
        return props.children;
    }


}
