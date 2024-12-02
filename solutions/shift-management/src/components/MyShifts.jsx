import { useEffect, useState } from "react"
import { Header, Icon, Label, Segment, List, Button } from 'semantic-ui-react'

const VITE_REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;


export default function MyShifts() {
    const [shifts, setShifts] = useState([]);

    const groupShiftsByDay = (shifts) => {
        const today = new Date();
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const oneDay = 24 * 60 * 60 * 1000;
    
        setShifts(shifts.reduce((acc, shift) => {
          const shiftDate = new Date(shift.startTime);
          const diff = Math.floor((shiftDate - dayStart) / oneDay);
          const key = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : shiftDate.toDateString();
    
          if (!acc[key]) {
            acc[key] = { shifts: [], totalDuration: 0 };
          }
          acc[key].shifts.push(shift);
          acc[key].totalDuration += (shift.endTime - shift.startTime) / (1000 * 60);
          return acc;
        }, {}));
    };

    const fetchShifts = () => {
        fetch(`${VITE_REACT_APP_SERVER}/shifts`)
        .then(res => res.json())
        .then(data => {
            setShifts(data)
            groupShiftsByDay(data)
            console.log(data)
        })
        .catch(err => {
            console.log(err)
        })
    }
    useEffect(()=>{
        fetchShifts()
    },[])

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} h ${remainingMinutes} m`;
    };
    
    const isShiftOngoing = (shift) => {
        const now = Date.now();
        return now >= shift.startTime && now <= shift.endTime;
    };

    const handleCancelShift = (shiftId) => {
    console.log(`Cancelling shift with ID: ${shiftId}`);
    // Add API call to cancel the shift here
    setShifts((prevShifts) => prevShifts.filter((shift) => shift.id !== shiftId));
    };
    
    //const groupedShifts = groupShiftsByDay(shifts);

    return(
    <>
        {Object.keys(shifts).map((day) => (
        <>
          <Header as="h3" attached='top'>
            {day} {shifts[day].shifts.length} shifts,{" "}
            {formatDuration(shifts[day].totalDuration)}
          </Header>
          <Segment attached>
          <List divided relaxed>
            {shifts[day].shifts.map((shift) => (
              <List.Item key={shift.id}>
                <List.Content floated="right">
                    <Button 
                    basic color='red' 
                    disabled={isShiftOngoing(shift)}
                    onClick={() => handleCancelShift(shift.id)}>
                        Cancel
                    </Button>
                </List.Content>
                <div>{new Date(shift.startTime).toLocaleTimeString()} {new Date(shift.endTime).toLocaleTimeString()}</div>
                <div>{shift.area}</div>           
              </List.Item>
            ))}
          </List>
          </Segment>
        </>
      ))}
    </>
    )
}