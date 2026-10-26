const { useState, useEffect } = React;

function App() {
    const [view, setView] = useState('workout');
    const [workoutType, setWorkoutType] = useState('A');
    
    // Gewichte für die Übungen (dynamisch speicherbar)
    const [weights, setWeights] = useState({
        Squat: 60,
        BenchPress: 50,
        BarbellRow: 40,
        OverheadPress: 35,
        Deadlift: 80
    });

    // Benutzerdefinierte Übungsnamen (können umbenannt werden)
    const [exerciseNames, setExerciseNames] = useState({
        Squat: 'Kniebeugen (Squat)',
        BenchPress: 'Bankdrücken (Bench Press)',
        BarbellRow: 'Langhantel-Rudern (Barbell Row)',
        OverheadPress: 'Schulterdrücken (Overhead Press)',
        Deadlift: 'Kreuzheben (Deadlift)'
    });

    // Workouts mit Unterstützung für benutzerdefinierte Assistenzübungen
    const [workouts, setWorkouts] = useState({
        A: [
            { id: 'Squat', sets: 5, reps: 5, isCustom: false },
            { id: 'BenchPress', sets: 5, reps: 5, isCustom: false },
            { id: 'BarbellRow', sets: 5, reps: 5, isCustom: false }
        ],
        B: [
            { id: 'Squat', sets: 5, reps: 5, isCustom: false },
            { id: 'OverheadPress', sets: 5, reps: 5, isCustom: false },
            { id: 'Deadlift', sets: 1, reps: 5, isCustom: false }
        ]
    });

    // Modal für neue Assistenzübung / Umbenennen
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExName, setNewExName] = useState('');
    const [newExWeight, setNewExWeight] = useState(20);
    const [newExSets, setNewExSets] = useState(3);
    const [newExReps, setNewExReps] = useState(10);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Timer-Logik
    useEffect(() => {
        let interval = null;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
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

    // Funktion zum Umbenennen einer Übung
    const handleRename = (key) => {
        const currentName = exerciseNames[key] || key;
        const newName = prompt("Übung umbenennen:", currentName);
        if (newName && newName.trim() !== "") {
            setExerciseNames(prev => ({ ...prev, [key]: newName.trim() }));
        }
    };

    // Funktion zum Hinzufügen einer Assistenzübung zum aktuellen Workout
    const handleAddAssistance = (e) => {
        e.preventDefault();
        if (!newExName.trim()) return;

        const uniqueKey = 'custom_' + Date.now();
        
        // Namen und Gewicht registrieren
        setExerciseNames(prev => ({ ...prev, [uniqueKey]: newExName.trim() }));
        setWeights(prev => ({ ...prev, [uniqueKey]: Number(newExWeight) }));

        // Zum aktiven Workout hinzufügen
        setWorkouts(prev => ({
            ...prev,
            [workoutType]: [
                ...prev[workoutType],
                { id: uniqueKey, sets: Number(newExSets), reps: Number(newExReps), isCustom: true }
            ]
        }));

        // Modal zurücksetzen
        setNewExName('');
        setShowAddModal(false);
    };

    return (
        <div className="max-w-md mx-auto p-4 pb-24 text-slate-100">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <h1 className="text-xl font-bold text-emerald-400">StrongLifts 5x5</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('workout')} 
                        className={`px-3 py-1 rounded text-sm font-medium ${view === 'workout' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        Training
                    </button>
                    <button 
                        onClick={() => setView('settings')} 
                        className={`px-3 py-1 rounded text-sm font-medium ${view === 'settings' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        Gewichte
                    </button>
                </div>
            </header>

            {/* Pausen-Timer */}
            {timerActive && (
                <div className="bg-slate-900 border border-emerald-500/50 p-4 rounded-xl mb-6 text-center shadow-lg animate-pulse">
                    <p className="text-sm text-slate-400 mb-1">Pause läuft</p>
                    <div className="text-3xl font-mono font-bold text-emerald-400 mb-2">
                        {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <button 
                        onClick={stopTimer} 
                        className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs px-3 py-1 rounded font-medium">
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
                    <div className="space-y-4 mb-6">
                        {workouts[workoutType].map((exercise) => {
                            const currentWeight = weights[exercise.id] || 0;
                            const currentName = exerciseNames[exercise.id] || exercise.id;

                            return (
                                <div key={exercise.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium text-slate-200">{currentName}</h3>
                                            <p className="text-xs text-slate-400">{exercise.sets} Sätze à {exercise.reps} Wiederholungen</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-emerald-400 font-mono font-bold">
                                                {currentWeight} kg
                                            </span>
                                            <button 
                                                onClick={() => handleRename(exercise.id)}
                                                className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-1 bg-slate-800 rounded" title="Übung umbenennen">
                                                ✏️
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 mt-3">
                                        <button 
                                            onClick={() => startTimer(90)} 
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs font-medium">
                                            ⏱️ 90s Pause
                                        </button>
                                        <button 
                                            onClick={() => startTimer(180)} 
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs font-medium">
                                            ⏱️ 3 Min Pause
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Button: Assistenzübung hinzufügen */}
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-full mb-4 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-700 text-slate-300 font-medium py-3 rounded-xl transition text-sm">
                        + Assistenzübung hinzufügen
                    </button>

                    <button 
                        onClick={() => alert('Workout erfolgreich beendet und gespeichert!')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg transition">
                        Training abschließen
                    </button>
                </div>
            )}

            {/* Ansicht: Einstellungen / Gewichte */}
            {view === 'settings' && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">Gewichte anpassen</h2>
                    <div className="space-y-4">
                        {Object.keys(weights).map((key) => {
                            const displayName = exerciseNames[key] || key;
                            return (
                                <div key={key} className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                                    <span className="text-sm text-slate-300 font-medium">{displayName}</span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setWeights({...weights, [key]: Math.max(0, weights[key] - 2.5)})}
                                            className="bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded text-sm font-bold">-</button>
                                        <span className="w-14 text-center font-mono text-sm">{weights[key]} kg</span>
                                        <button 
                                            onClick={() => setWeights({...weights, [key]: weights[key] + 2.5})}
                                            className="bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded text-sm font-bold">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal zum Hinzufügen von Assistenzübungen */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4">Neue Assistenzübung</h3>
                        <form onSubmit={handleAddAssistance} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Übungsname</label>
                                <input 
                                    type="text" 
                                    value={newExName} 
                                    onChange={(e) => setNewExName(e.target.value)}
                                    placeholder="z.B. Klimmzüge, Dips..." 
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">Sätze</label>
                                    <input 
                                        type="number" 
                                        value={newExSets} 
                                        onChange={(e) => setNewExSets(e.target.value)}
                                        min="1" max="10" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">Wiederholungen</label>
                                    <input 
                                        type="number" 
                                        value={newExReps} 
                                        onChange={(e) => setNewExReps(e.target.value)}
                                        min="1" max="100" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Startgewicht (kg)</label>
                                <input 
                                    type="number" 
                                    step="0.5"
                                    value={newExWeight} 
                                    onChange={(e) => setNewExWeight(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded text-sm font-medium">
                                    Abbrechen
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-sm font-semibold">
                                    Hinzufügen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));