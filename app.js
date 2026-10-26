const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [workoutType, setWorkoutType] = useState('A');
    
    // Gewichte verwalten
    const [weights, setWeights] = useState({
        Squat: 45,
        BenchPress: 35,
        BarbellRow: 35,
        OverheadPress: 30,
        Deadlift: 65
    });

    // Übungsnamen (können umbenannt werden)
    const [exerciseNames, setExerciseNames] = useState({
        Squat: 'Kniebeugen (Squat)',
        BenchPress: 'Bankdrücken (Bench Press)',
        BarbellRow: 'Langhantelrudern (Barbell Row)',
        OverheadPress: 'Schulterdrücken (Overhead Press)',
        Deadlift: 'Kreuzheben (Deadlift)'
    });

    // Assistenzübungen
    const [assistanceExercises, setAssistanceExercises] = useState([
        { id: 'dips', name: 'Dips (Eigengewicht)', sets: 3, reps: 10, weight: 0 },
        { id: 'pullups', name: 'Klimmzüge (Pull-Ups)', sets: 3, reps: 8, weight: 0 },
        { id: 'facepulls', name: 'Face Pulls (Kabelzug)', sets: 3, reps: 12, weight: 15 },
        { id: 'biceps', name: 'Bizeps Curls', sets: 3, reps: 10, weight: 10 }
    ]);

    // Modal State für neue Assistenzübung
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExName, setNewExName] = useState('');
    const [newExWeight, setNewExWeight] = useState(0);
    const [newExSets, setNewExSets] = useState(3);
    const [newExReps, setNewExReps] = useState(10);

    // Timer State
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

    // Übung umbenennen per Prompt
    const handleRename = (key) => {
        const currentName = exerciseNames[key] || key;
        const newName = prompt("Übung umbenennen:", currentName);
        if (newName && newName.trim() !== "") {
            setExerciseNames(prev => ({ ...prev, [key]: newName.trim() }));
        }
    };

    // Assistenzübung hinzufügen
    const handleAddAssistance = (e) => {
        e.preventDefault();
        if (!newExName.trim()) return;

        const newEntry = {
            id: 'custom_' + Date.now(),
            name: newExName.trim(),
            sets: Number(newExSets),
            reps: Number(newExReps),
            weight: Number(newExWeight)
        };

        setAssistanceExercises(prev => [...prev, newEntry]);
        setNewExName('');
        setShowAddModal(false);
    };

    return (
        <div className="max-w-md mx-auto bg-[#0b0f19] text-slate-100 min-h-screen pb-28 font-sans selection:bg-orange-500 selection:text-white">
            
            {/* Header */}
            <header className="flex justify-between items-center px-4 py-4 border-b border-slate-800/80 bg-[#0b0f19]/90 sticky top-0 z-20 backdrop-blur">
                <div className="flex items-center gap-2.5">
                    <div className="bg-orange-600 p-2 rounded-xl text-white font-bold text-xs shadow-md shadow-orange-600/30">
                        🏋️‍♂️
                    </div>
                    <h1 className="text-lg font-bold tracking-wide text-white">StrongLifts 5x5</h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Offline
                    </span>
                </div>
            </header>

            {/* Pausen-Timer Overlay */}
            {timerActive && (
                <div className="mx-4 mt-4 bg-slate-900 border border-orange-500/50 p-4 rounded-2xl text-center shadow-xl animate-pulse">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Pausen-Timer</p>
                    <div className="text-3xl font-mono font-bold text-orange-400 mb-2">
                        {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <button 
                        onClick={stopTimer} 
                        className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs px-4 py-1.5 rounded-lg font-medium transition">
                        Timer stoppen
                    </button>
                </div>
            )}

            {/* Hauptinhalt */}
            <main className="p-4 space-y-6">

                {/* --- TAB: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* Empfohlenes Rhythmus-Workout (Orange Karte) */}
                        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl p-5 shadow-xl shadow-orange-950/50 border border-orange-500/30 text-white">
                            <div className="inline-block bg-orange-800/60 text-orange-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 backdrop-blur-sm">
                                Empfohlenes Rhythmus-Workout
                            </div>
                            <h2 className="text-2xl font-black mb-4 tracking-tight">Workout {workoutType}</h2>
                            
                            <div className="space-y-2 mb-6">
                                <div className="bg-orange-950/30 backdrop-blur-sm flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium">
                                    <span>{workoutType === 'A' ? exerciseNames.Squat : exerciseNames.Squat}</span>
                                    <span className="font-mono font-bold">{weights.Squat} kg</span>
                                </div>
                                <div className="bg-orange-950/30 backdrop-blur-sm flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium">
                                    <span>{workoutType === 'A' ? exerciseNames.BenchPress : exerciseNames.OverheadPress}</span>
                                    <span className="font-mono font-bold">{workoutType === 'A' ? weights.BenchPress : weights.OverheadPress} kg</span>
                                </div>
                                <div className="bg-orange-950/30 backdrop-blur-sm flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium">
                                    <span>{workoutType === 'A' ? exerciseNames.BarbellRow : exerciseNames.Deadlift}</span>
                                    <span className="font-mono font-bold">{workoutType === 'A' ? weights.BarbellRow : weights.Deadlift} kg</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => startTimer(90)}
                                className="w-full bg-white text-orange-700 hover:bg-orange-50 font-bold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2">
                                <span>▶ Workout {workoutType} Starten (90s Pause)</span>
                            </button>
                        </div>

                        {/* Workout Auswählen */}
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Workout auswählen</p>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setWorkoutType('A')}
                                    className={`p-3.5 rounded-2xl border text-left transition ${workoutType === 'A' ? 'bg-slate-900 border-orange-500 shadow-md shadow-orange-950/20' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'}`}>
                                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Haupt-A</div>
                                    <div className="font-bold text-sm text-white mt-0.5">Workout A</div>
                                </button>
                                <button 
                                    onClick={() => setWorkoutType('B')}
                                    className={`p-3.5 rounded-2xl border text-left transition ${workoutType === 'B' ? 'bg-slate-900 border-orange-500 shadow-md shadow-orange-950/20' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'}`}>
                                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Haupt-B</div>
                                    <div className="font-bold text-sm text-white mt-0.5">Workout B</div>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('assistance')}
                                    className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-left transition">
                                    <div className="text-[10px] text-orange-400 font-semibold uppercase">Frei / Extra</div>
                                    <div className="font-bold text-sm text-orange-400 mt-0.5">+ Assistenz</div>
                                </button>
                            </div>
                        </div>

                        {/* Assistenzübungen Sektion */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 shadow-lg">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="text-orange-500">➕</span> Assistenzübungen
                                </span>
                                <button 
                                    onClick={() => setActiveTab('assistance')}
                                    className="text-xs font-semibold text-orange-400 hover:text-orange-300">
                                    Verwalten ({assistanceExercises.length})
                                </button>
                            </div>
                            <div className="space-y-2">
                                {assistanceExercises.map(ex => (
                                    <div key={ex.id} className="bg-slate-950/60 border border-slate-800/60 px-3.5 py-3 rounded-2xl flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-200">{ex.name}</span>
                                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-500/20">
                                            {ex.sets}x{ex.reps} @ {ex.weight}kg
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hauptübungen (5x5) Sektion mit Umbenennen-Option */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 shadow-lg">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Hauptübungen (5x5)
                                </span>
                                <button 
                                    onClick={() => setActiveTab('setup')}
                                    className="text-xs font-semibold text-orange-400 hover:text-orange-300">
                                    Gewichte anpassen
                                </button>
                            </div>
                            <div className="space-y-2">
                                {Object.keys(weights).map(key => (
                                    <div key={key} className="bg-slate-950/60 border border-slate-800/60 px-3.5 py-3 rounded-2xl flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-200">{exerciseNames[key] || key}</span>
                                            <button 
                                                onClick={() => handleRename(key)}
                                                className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800" title="Umbenennen">
                                                ✏️
                                            </button>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-orange-400">{weights[key]} kg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* --- TAB: ASSISTENZ --- */}
                {activeTab === 'assistance' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Assistenzübungen</h2>
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition">
                                + Neue Übung
                            </button>
                        </div>
                        <div className="space-y-2">
                            {assistanceExercises.map(ex => (
                                <div key={ex.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-sm text-slate-200">{ex.name}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{ex.sets} Sätze à {ex.reps} Wiederholungen</div>
                                    </div>
                                    <span className="font-mono text-orange-400 font-bold text-sm bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-500/20">
                                        {ex.weight} kg
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TAB: VERLAUF --- */}
                {activeTab === 'history' && (
                    <div className="text-center py-16 space-y-3">
                        <div className="text-4xl">📜</div>
                        <h2 className="text-lg font-bold">Trainingsverlauf</h2>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto">Deine absolvierten Trainingseinheiten werden hier gespeichert.</p>
                    </div>
                )}

                {/* --- TAB: SETUP / GEWICHTE --- */}
                {activeTab === 'setup' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold">Startgewichte anpassen</h2>
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4">
                            {Object.keys(weights).map(key => (
                                <div key={key} className="flex justify-between items-center border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-300">{exerciseNames[key] || key}</span>
                                        <button 
                                            onClick={() => handleRename(key)}
                                            className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 bg-slate-800 rounded" title="Umbenennen">
                                            ✏️
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setWeights({...weights, [key]: Math.max(0, weights[key] - 2.5)})}
                                            className="bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-xl font-bold text-sm">-</button>
                                        <span className="w-14 text-center font-mono font-bold text-sm text-orange-400">{weights[key]} kg</span>
                                        <button 
                                            onClick={() => setWeights({...weights, [key]: weights[key] + 2.5})}
                                            className="bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-xl font-bold text-sm">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Modal zum Hinzufügen von Assistenzübungen */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4 text-white">Neue Assistenzübung</h3>
                        <form onSubmit={handleAddAssistance} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Übungsname</label>
                                <input 
                                    type="text" 
                                    value={newExName} 
                                    onChange={(e) => setNewExName(e.target.value)}
                                    placeholder="z.B. Klimmzüge, Dips..." 
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
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
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">Wiederholungen</label>
                                    <input 
                                        type="number" 
                                        value={newExReps} 
                                        onChange={(e) => setNewExReps(e.target.value)}
                                        min="1" max="100" 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
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
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-sm font-medium transition">
                                    Abbrechen
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-orange-600 hover:bg-orange-500 py-3 rounded-xl text-sm font-semibold transition text-white">
                                    Hinzufügen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Feste untere Navigationsleiste */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0b0f19]/95 backdrop-blur border-t border-slate-800 px-6 py-3 flex justify-between items-center z-30 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'dashboard' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <span className="text-xl">🏠</span>
                    <span className="text-[10px] font-medium">Dashboard</span>
                </button>
                <button 
                    onClick={() => setActiveTab('assistance')} 
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'assistance' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <span className="text-xl">➕</span>
                    <span className="text-[10px] font-medium">Assistenz</span>
                </button>
                <button 
                    onClick={() => setActiveTab('history')} 
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'history' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <span className="text-xl">📜</span>
                    <span className="text-[10px] font-medium">Verlauf</span>
                </button>
                <button 
                    onClick={() => setActiveTab('setup')} 
                    className={`flex flex-col items-center gap-1 transition ${activeTab === 'setup' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200'}`}>
                    <span className="text-xl">⚙️</span>
                    <span className="text-[10px] font-medium">Setup</span>
                </button>
            </nav>

        </div>
    );
}

// React 18 sicherer Render-Aufruf
const rootElement = document.getElementById('root');
if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootElement).render(<App />);
} else {
    ReactDOM.render(<App />, rootElement);
}