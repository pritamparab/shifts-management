import { useEffect } from "react"

const {REACT_APP_SERVER} = process.env


export default function MyShifts() {
    useEffect(()=>{
        fetch(`${REACT_APP_SERVER}/shifts`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })

    },[])

    return(
        <>
        My Shifts
        </>
    )
}