const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [workoutType, setWorkoutType] = useState('A');
    
    const [weights, setWeights] = useState({
        Squat: 45,
        BenchPress: 35,
        BarbellRow: 35,
        OverheadPress: 30,
        Deadlift: 65
    });

    const [exerciseNames, setExerciseNames] = useState({
        Squat: 'Kniebeugen (Squat)',
        BenchPress: 'Bankdrücken (Bench Press)',
        BarbellRow: 'Langhantelrudern (Barbell Row)',
        OverheadPress: 'Schulterdrücken (Overhead Press)',
        Deadlift: 'Kreuzheben (Deadlift)'
    });

    const [assistanceExercises, setAssistanceExercises] = useState([
        { id: 'dips', name: 'Dips (Eigengewicht)', sets: 3, reps: 10, weight: 0 },
        { id: 'pullups', name: 'Klimmzüge (Pull-Ups)', sets: 3, reps: 8, weight: 0 },
        { id: 'facepulls', name: 'Face Pulls (Kabelzug)', sets: 3, reps: 12, weight: 15 },
        { id: 'biceps', name: 'Bizeps Curls', sets: 3, reps: 10, weight: 10 }
    ]);

    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startTimer = (seconds) => {
        setTimeLeft(seconds);
        setTimerActive(true);
    };

    const stopTimer = () => {
        setTimerActive(false);
        setTimeLeft(0);
    };

    return (
        <div className="max-w-md mx-auto bg-[#0b0f19] text-slate-100 min-h-screen pb-24 font-sans">
            
            {/* Header */}
            <header className="flex justify-between items-center px-4 py-4 border-b border-slate-800/80 bg-[#0b0f19] sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                    <div className="bg-orange-600 p-2 rounded-xl text-white font-bold text-xs shadow-md">
                        SL
                    </div>
                    <h1 className="text-lg font-bold tracking-wide text-white">StrongLifts 5x5</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Offline
                    </span>
                </div>
