import React, { useState, useEffect } from "react";
import { Tab, Segment, SegmentGroup, List, Header, Button } from "semantic-ui-react";
import '../css/AvailShifts.css';

const VITE_REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

const AvailShifts = () => {
    const [selectedCity, setSelectedCity] = useState("Helsinki");
    const [groupedShifts, setGroupedShifts] = useState({});
    const [totalShifts, setTotalShifts] = useState({})
    const [shifts, setShifts] = useState([]);

    const groupShiftsByDay = (shifts) => {
        if (!Array.isArray(shifts)) return {};
        const today = new Date();
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const oneDay = 24 * 60 * 60 * 1000;

        return shifts.reduce((acc, shift) => {
            const shiftDate = new Date(shift.startTime);
            const diff = Math.floor((shiftDate - dayStart) / oneDay);
            const key = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : shiftDate.toDateString();

            if (!acc[key]) acc[key] = [];
            acc[key].push(shift);
            return acc;
        }, {});
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

    const filterShiftsByCity = () => {
        const filteredShifts = shifts.filter((shift) => shift.area === selectedCity);
        const grouped = groupShiftsByDay(filteredShifts);
        setTotalShifts({
            "Helsinki": shifts.filter((shift) => shift.area === "Helsinki").length,
            "Tampere": shifts.filter((shift) => shift.area === "Tampere").length,
            "Turku": shifts.filter((shift) => shift.area === "Turku").length
        })
        setGroupedShifts(grouped);
    };
    
    useEffect(() => {
        filterShiftsByCity();
    }, [selectedCity, shifts]);

    const isShiftOngoing = (shift) => {
        const now = Date.now();
        return now >= shift.startTime && now <= shift.endTime;
    };

    const isOverlapping = (shift) => {
        return shifts.some(
            (s) =>
            s.booked &&
            ((shift.startTime >= s.startTime && shift.startTime < s.endTime) ||
                (shift.endTime > s.startTime && shift.endTime <= s.endTime))
        );
    };

    const handleBookShift = (shiftId) => {
        console.log(`Booking shift with ID: ${shiftId}`);
        // Add booking logic here
    };

    const handleCancelShift = (shiftId) => {
        console.log(`Cancelling shift with ID: ${shiftId}`);
        // Add cancellation logic here
    };

    const panes = [
        { menuItem: `Helsinki ${totalShifts['Helsinki']}`, render: () => setSelectedCity("Helsinki") },
        { menuItem: `Tampere ${totalShifts['Tampere']}`, render: () => setSelectedCity("Tampere") },
        { menuItem: `Turku ${totalShifts['Turku']}`, render: () => setSelectedCity("Turku") },
    ];

    return (
    <div>
        <Tab
            menu={{ secondary: true, text: true, font:'big', style: { fontSize: '20px' } }}
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
                        <span>
                            {isShiftOngoing(shift) ? 'Booked':
                            isOverlapping(shift) ? 'Overlapping':
                            shift.booked ? 'Booked' : ''
                            }
                            {shift.booked ? "Booked" : isOverlapping(shift) ? "Overlapping" : "Book"}
                        </span>
                        <Button
                        color="green"
                        disabled={shift.booked || isOverlapping(shift)}
                        onClick={() => handleBookShift(shift.id)}
                        >
                            {shift.booked ? "Booked" : isOverlapping(shift) ? "Overlapping" : "Book"}
                        </Button>
                        {shift.booked && (
                        <Button
                            color="red"
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
    </div>
    );
};

export default AvailShifts;
