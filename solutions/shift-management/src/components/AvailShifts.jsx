import React, { useState, useEffect } from "react";
import { Tab, Segment, SegmentGroup, List, Header, Button } from "semantic-ui-react";
import '../css/AvailShifts.css';
import { fetchAddShift, fetchCancelShift } from "../ApiCalls";

const VITE_REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;

const AvailShifts = () => {
    const [selectedCity, setSelectedCity] = useState("Helsinki");
    const [groupedShifts, setGroupedShifts] = useState({});
    const [totalShifts, setTotalShifts] = useState({})
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false)

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

    const handleBookShift = async(shiftId) => {
        setLoading({[shiftId]:true})
        console.log(`Booking shift with ID: ${shiftId}`);
        const addShift = await fetchAddShift(shiftId)
        if(addShift.status_code == 200){
            fetchShifts()
        }
        setTimeout(() => {
            setLoading({[shiftId]:false})
        }, 4000);
    };

    const handleCancelShift = async (shiftId) => {
        setLoading({[shiftId]:true})
        console.log(`Cancelling shift with ID: ${shiftId}`);
        const cancelShift = await fetchCancelShift(shiftId)
        if(cancelShift.status_code == 200){
            fetchShifts()
        }
        setTimeout(() => {
            setLoading({[shiftId]:false})
        }, 4000);
    };

    const panes = [
        { menuItem: `Helsinki ${totalShifts['Helsinki']}`, render: () => setSelectedCity("Helsinki") },
        { menuItem: `Tampere ${totalShifts['Tampere']}`, render: () => setSelectedCity("Tampere") },
        { menuItem: `Turku ${totalShifts['Turku']}`, render: () => setSelectedCity("Turku") },
    ];

    return (
    <div className='overflow-list'>
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
    </div>
    );
};

export default AvailShifts;
