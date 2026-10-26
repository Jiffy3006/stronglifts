const { useState, useEffect } = React;

// Hauptkomponente der StrongLifts 5x5 App
function App() {
    // State für aktive Ansicht ('workout', 'history', 'settings')
    const [view, setView] = useState('workout');
    
    // Aktives Workout (A oder B)
    const [workoutType, setWorkoutType] = useState('A');
    
    // Gewichte und Trainingsstatus
    const [weights, setWeights] = useState({
        Squat: 60,
        BenchPress: 50,
        BarbellRow: 40,
        OverheadPress: 35,
        Deadlift: 80
    });

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [timerDuration, setTimerDuration] = useState(90); // Standard 90 Sekunden

    // Timer-Logik
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            // Optional: Kleiner Sound/Vibration wenn Timer abläuft
            if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startTimer = (seconds) => {
        setTimerDuration(seconds);
        setTimeLeft(seconds);
        setTimerActive(true);
    };

    const stopTimer = () => {
        setTimerActive(false);
        setTimeLeft(0);
    };

    // Definition der Workouts A und B
    const workouts = {
        A: [
            { name: 'Kniebeugen (Squat)', key: 'Squat', sets: 5, reps: 5 },
            { name: 'Bankdrücken (Bench Press)', key: 'BenchPress', sets: 5, reps: 5 },
            { name: 'Langhantel-Rudern (Barbell Row)', key: 'BarbellRow', sets: 5, reps: 5 }
        ],
        B: [
            { name: 'Kniebeugen (Squat)', key: 'Squat', sets: 5, reps: 5 },
            { name: 'Schulterdrücken (Overhead Press)', key: 'OverheadPress', sets: 5, reps: 5 },
            { name: 'Kreuzheben (Deadlift)', key: 'Deadlift', sets: 1, reps: 5 }
        ]
    };

    return (
        <div className="max-w-md mx-auto p-4 pb-24">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-emerald-400">StrongLifts 5x5</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('workout')} 
                        className={`px-3 py-1 rounded text-sm ${view === 'workout' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        Training
                    </button>
                    <button 
                        onClick={() => setView('settings')} 
                        className={`px-3 py-1 rounded text-sm ${view === 'settings' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        Gewichte
                    </button>
                </div>
            </header>

            {/* Aktiver Pausen-Timer (wird eingeblendet wenn aktiv) */}
            {timerActive && (
                <div className="bg-slate-900 border border-emerald-500/50 p-4 rounded-xl mb-6 text-center shadow-lg animate-pulse">
                    <p className="text-sm text-slate-400 mb-1">Pause läuft</p>
                    <div className="text-3xl font-mono font-bold text-emerald-400 mb-2">
                        {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <button 
                        onClick={stopTimer} 
                        className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs px-3 py-1 rounded">
                        Timer stoppen
                    </button>
                </div>
            )}

            {/* Ansicht: Workout */}
            {view === 'workout' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Workout {workoutType}</h2>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setWorkoutType('A')} 
                                className={`px-3 py-1 rounded font-bold text-sm ${workoutType === 'A' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                A
                            </button>
                            <button 
                                onClick={() => setWorkoutType('B')} 
                                className={`px-3 py-1 rounded font-bold text-sm ${workoutType === 'B' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                B
                            </button>
                        </div>
                    </div>

                    {/* Übungsliste */}
                    <div className="space-y-4">
                        {workouts[workoutType].map((exercise, index) => (
                            <div key={index} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium text-slate-200">{exercise.name}</h3>
                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono">
                                        {weights[exercise.key]} kg
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">{exercise.sets} Sätze à {exercise.reps} Wiederholungen</p>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => startTimer(90)} 
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded text-xs font-medium">
                                        ⏱️ 90s Pause
                                    </button>
                                    <button 
                                        onClick={() => startTimer(180)} 
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded text-xs font-medium">
                                        ⏱️ 3 Min Pause
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => alert('Workout beendet und gespeichert!')}
                        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg transition">
                        Training abschließen
                    </button>
                </div>
            )}

            {/* Ansicht: Einstellungen / Gewichte */}
            {view === 'settings' && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">Startgewichte anpassen</h2>
                    <div className="space-y-4">
                        {Object.keys(weights).map((key) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">{key}</span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setWeights({...weights, [key]: Math.max(0, weights[key] - 2.5)})}
                                        className="bg-slate-800 px-3 py-1 rounded text-sm">-</button>
                                    <span className="w-12 text-center font-mono text-sm">{weights[key]} kg</span>
                                    <button 
                                        onClick={() => setWeights({...weights, [key]: weights[key] + 2.5})}
                                        className="bg-slate-800 px-3 py-1 rounded text-sm">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));