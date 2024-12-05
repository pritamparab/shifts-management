import React, { useState, useEffect, useContext } from "react";
import { Tab, Segment, SegmentGroup, List, Header, Button } from "semantic-ui-react";
import '../css/AvailShifts.css';
import { ApiContext } from "../ApiContext";
import { fetchAddShift, fetchCancelShift } from "../ApiCalls";

const AvailShifts = () => {
    const { loadingShift, fetchShifts, availShifts, isShiftOngoing, groupAvailShiftsByDay } = useContext(ApiContext)
    const [selectedCity, setSelectedCity] = useState("Helsinki");
    const [groupedShifts, setGroupedShifts] = useState({});
    const [totalShifts, setTotalShifts] = useState({})
    const [loading, setLoading] = useState(false)

    const filterShiftsByCity = () => {
        const filteredShifts = availShifts.filter((shift) => shift.area === selectedCity);
        const grouped = groupAvailShiftsByDay(filteredShifts);
        setTotalShifts({
            "Helsinki": availShifts.filter((shift) => shift.area === "Helsinki").length,
            "Tampere": availShifts.filter((shift) => shift.area === "Tampere").length,
            "Turku": availShifts.filter((shift) => shift.area === "Turku").length
        })
        setGroupedShifts(grouped);
    };
    
    useEffect(() => {
        filterShiftsByCity();
    }, [selectedCity, availShifts]);

    const isOverlapping = (shift) => {
        return availShifts.some(
            (s) =>
            s.booked &&
            ((shift.startTime >= s.startTime && shift.startTime < s.endTime) ||
                (shift.endTime > s.startTime && shift.endTime <= s.endTime))
        );
    };

    const handleBookShift = async(shiftId) => {
        setLoading({[shiftId]:true})
        console.log(`Booking shift with ID: ${shiftId}`);
        const addShift = await fetchAddShift(shiftId)
        if(addShift.status_code == 200){
            fetchShifts()
        }
        setLoading({[shiftId]:false})
    };

    const handleCancelShift = async (shiftId) => {
        setLoading({[shiftId]:true})
        console.log(`Cancelling shift with ID: ${shiftId}`);
        const cancelShift = await fetchCancelShift(shiftId)
        if(cancelShift.status_code == 200){
            fetchShifts()
        }
        setLoading({[shiftId]:false})
    };

    const panes = [
        { menuItem: `Helsinki ${totalShifts['Helsinki']}`, render: () => setSelectedCity("Helsinki") },
        { menuItem: `Tampere ${totalShifts['Tampere']}`, render: () => setSelectedCity("Tampere") },
        { menuItem: `Turku ${totalShifts['Turku']}`, render: () => setSelectedCity("Turku") },
    ];

    return (
    <div className='overflow-list'>
        {loadingShift ? <Loader active size='massive'/>: <>
        <Tab
            menu={{ secondary: true, text: true, color: 'blue', font:'big', style: { fontSize: '20px', justifyContent:'space-evenly' } }}
            panes={panes.map((pane) => ({
            menuItem: pane.menuItem,
            render: () => pane.render(),
            }))}
        />
        <SegmentGroup>
        {Object.keys(groupedShifts).map((day) => ( 
        <>        
            <Header as="h3" attached='top'>
                {day}
            </Header>
            <Segment key={day}>
            <List divided relaxed>
                {groupedShifts[day].map((shift) => (
                <List.Item key={shift.id}>
                    <List.Content floated="right">
                        <span
                        className={`${shift.booked ? "color-booked" : ""} ${
                            isOverlapping(shift) ? "color-overlapping" : ""
                          }`}
                        >
                            {shift.booked
                            ? "Booked"
                            : isOverlapping(shift)
                            ? "Overlapping"
                            : ""}
                        </span>
                        {/* Book Button */}
                        {!shift.booked && (
                            <Button
                            loading={loading[shift.id]}
                            basic color="green"
                            disabled={isOverlapping(shift)}
                            onClick={() => handleBookShift(shift.id)}
                            >
                            {isOverlapping(shift) ? "Overlapping" : "Book"}
                            </Button>
                        )}
                        {/* Cancel Button */}
                        {shift.booked && (
                            <Button
                            loading={loading[shift.id]}
                            basic color="red"
                            disabled={isShiftOngoing(shift)}
                            onClick={() => handleCancelShift(shift.id)}
                            >
                            {isShiftOngoing(shift) ? "Ongoing" : "Cancel"}
                            </Button>
                        )}
                        
                    </List.Content>
                    <div className='list-color'>{new Date(shift.startTime).toLocaleTimeString()}-{new Date(shift.endTime).toLocaleTimeString()}</div>
                </List.Item>
                ))}
            </List>
            </Segment>
        </>  
        ))}
        </SegmentGroup>
        </>}
    </div>
    );
};

export default AvailShifts;
