import '../css/MyShifts.css'
import { useContext, useState } from "react"
import { Header, Segment, List, Button, SegmentGroup, Loader } from 'semantic-ui-react'
import { fetchCancelShift } from '../ApiCalls';
import { ApiContext } from '../ApiContext';

export default function MyShifts() {
    const [loading, setLoading] = useState(false)
    const {shifts, loadingShift, fetchShifts, isShiftOngoing} = useContext(ApiContext)

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} h ${remainingMinutes} m`;
    };

    const handleCancelShift = async(shiftId) => {
        setLoading({[shiftId]:true})
        console.log(`Cancelling shift with ID: ${shiftId}`);
        const cancelShift = await fetchCancelShift(shiftId)
        if(cancelShift.status_code == 200){
            fetchShifts()
        }
        setLoading({[shiftId]:false})
    };

    return(
    <div className='overflow-list'>
        {loadingShift ? <Loader active size='massive'/>:
        <SegmentGroup>
        {Object.keys(shifts).map((day) => (
        <>
            <Header as="h3" attached='top'>
                {day}
                <span className='total-shifts-font'>
                    {shifts[day].shifts.length} shifts,{" "}
                    {formatDuration(shifts[day].totalDuration)}
                </span>
            </Header>
            <Segment key={day} attached>
                <List divided relaxed>
                {shifts[day].shifts.map((shift) => (
                <List.Item key={shift.id}>
                    <List.Content floated="right">
                        <Button 
                        loading={loading[shift.id]}
                        basic color='red' 
                        disabled={isShiftOngoing(shift)}
                        onClick={() => handleCancelShift(shift.id)}>
                            Cancel
                        </Button>
                    </List.Content>
                    <div className='list-color'>{new Date(shift.startTime).toLocaleTimeString()}-{new Date(shift.endTime).toLocaleTimeString()}</div>
                    <div className='list-color'>{shift.area}</div>           
                </List.Item>
                ))}
                </List>
            </Segment>
        </>
      ))}
      </SegmentGroup>
    }
    </div>
    )
}