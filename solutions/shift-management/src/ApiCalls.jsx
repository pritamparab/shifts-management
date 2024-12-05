const VITE_REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

export const fetchAddShift = async(shiftId) => {
    try{
        const response = await fetch(`${VITE_REACT_APP_SERVER}/shifts/${shiftId}/book`,{
            method: 'POST'
        });
        const data = await response.json()
        return({"status_code": 200, 'msg': data})
    }catch(err){
        console.log(err)
        return({"status_code": 400, 'msg': err})
    }
    
}

export const fetchCancelShift = async(shiftId) => {
    try{
        const response = await fetch(`${VITE_REACT_APP_SERVER}/shifts/${shiftId}/cancel`,{
            method: 'POST'
        });
        const data = await response.json()
        return({"status_code": 200, 'msg': data})
    }catch(err){
        console.log(err)
        return({"status_code": 400, 'msg': err})
    }
    
}