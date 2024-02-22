import React from 'react'
import { useLocation } from 'react-router-dom'

const Test = () => {
    const locationData = useLocation();
    if (!locationData.state){
        return;
    }
    return(<div>{locationData.state.searchText}</div>)
}

export default Test