import { createContext, useState, useEffect, useCallback } from 'react';

const VITE_REACT_APP_SERVER = import.meta.env.VITE_REACT_APP_SERVER;
const ApiContext = createContext(null);

const ApiProvider = ({ children }) => {
    const [shifts, setShifts] = useState([]);
    const [availShifts, setAvailShifts] = useState([])
    const [loadingShift, setLoadingShift] = useState(true);

    const isShiftOngoing = (shift) => {
        const now = Date.now();
        return now >= shift.startTime && now <= shift.endTime;
    };

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

    const groupAvailShiftsByDay = (shifts) => {
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

    const fetchShifts = useCallback(() => {
        fetch(`${VITE_REACT_APP_SERVER}/shifts`)
        .then(res => res.json())
        .then(data => {
            setShifts(data)
            setAvailShifts(data)
            groupShiftsByDay(data)
        })
        .catch(err => {
            console.log(err)
        })
        .finally(() => {
            setLoadingShift(false);
        })
    },[])

    useEffect(() => {
        fetchShifts()
    }, [])

    return (
        <ApiContext.Provider value={{ shifts, loadingShift, fetchShifts, isShiftOngoing, availShifts, groupAvailShiftsByDay}}>
            {children}
        </ApiContext.Provider>
    );
};

export { ApiProvider, ApiContext };
