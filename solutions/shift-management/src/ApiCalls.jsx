const VITE_REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

export const fetchAddShift = async(shiftId) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try{
        const response = await fetch(`${VITE_REACT_APP_SERVER}/shifts/${shiftId}/book`,{
            method: 'POST',
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json()
        return({"status_code": 200, 'msg': data})
    }catch(err){
        console.log(err)
        return({"status_code": 400, 'msg': err})
    }
    
}

export const fetchCancelShift = async(shiftId) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try{
        const response = await fetch(`${VITE_REACT_APP_SERVER}/shifts/${shiftId}/cancel`,{
            method: 'POST',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json()
        return({"status_code": 200, 'msg': data})
    }catch(err){
        console.log(err)
        return({"status_code": 400, 'msg': err})
    }
}