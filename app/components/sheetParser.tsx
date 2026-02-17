'use client'
import React, { useState } from 'react';
import * as xlsx from 'xlsx'

enum EventType {
    NONE = 'No Action',
    VIEW = 'Email View',
    CLICK = 'Email Click',
    SENT = 'TM Sent',
    REPORT = 'Reported'
}

type DepartmentStats = {
    total: number;
    reported: number;
    clicked: number;
    sent: number;
    viewed: number;
    none: number;
}

type DepartmentStatsWithScore = DepartmentStats & {
    score: number;
    normalization: number;
}

export default function SheetParser(){
    const [fileData, setFileData] = useState<unknown[] | null>(null);
    const [departmentList, setDepartmentList] = useState<Set<string>>();
    const [stats, setStats] = useState<Record<string, DepartmentStats> | null>(null);
    const [arrangedStats, setArrangedStats] = useState<DepartmentStatsWithScore[]>([]);


    const [clickedScore, setClickedScore] = useState(0);
    const [sentInfoScore, setSentInfoScore] = useState(0);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file){
            const fileReader = new FileReader();

            fileReader.onload = (e) => {
                if(e.target == null){
                  return
                }
                const data = e.target.result;
                const workbook = xlsx.read(data, {type: 'buffer'});

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const json = xlsx.utils.sheet_to_json(worksheet);
                setFileData(json)
                calculateWinners(json)
            }
            fileReader.readAsArrayBuffer(file)
        }
    }
    const handleDownload = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // event.preventDefault();
        // fileData?.forEach((row) => {
        //     const dept = (row as Record<string, unknown>)['department'];
        //     if (typeof dept === 'string'){
        //         setDepartmentList((prev) => new Set(prev).add(dept));
        //     }
        // })
        // console.log(departmentList);
    }
    const handleProcessData = (event: React.FormEvent) => {
        event.preventDefault();
        if (!fileData) return;

        const depts = new Set<string>();
        fileData.forEach((row) => {
            const typedRow = row as Record<string, unknown>;
            if (typedRow.department) depts.add(String(typedRow.department));
        });
        
        setDepartmentList(depts);
    };

    const calculateWinners = (data: any[]) => {
        const results = data.reduce((acc, row) => {
            const dept = row.department || 'Unknown';
        
            const actionValue = String(row.event_type).trim();
            const actionType = Object.values(EventType).find(val => val === actionValue);

            if (!acc[dept]) {
                acc[dept] = { total: 0, reported: 0, clicked: 0, sent: 0, viewed: 0, none: 0 };
            }

            acc[dept].total += 1;
            if (actionType === EventType.REPORT) { acc[dept].reported += 1 } 
            if (actionType === EventType.CLICK) { acc[dept].clicked += 1 } 
            if (actionType === EventType.SENT) { acc[dept].sent += 1 } 
            if (actionType === EventType.VIEW) { acc[dept].viewed += 1 } 
            if (actionType === EventType.NONE) { acc[dept].none += 1 }

            return acc;

        }, {});

        setStats(results);

        console.log(results);
    }

    const rankingBasedOnScoreAndNormalization = () => {
        if (!stats) return;

        const updatedStats: DepartmentStatsWithScore[] = Object.entries(stats).map(([department, items]) => ({
            department,
            ...items,
            score: (items.clicked * clickedScore) + (items.sent * sentInfoScore),
            normalization: ((items.clicked * clickedScore) + (items.sent * sentInfoScore)) / 100,
        }));

        const arrangedStats =  updatedStats.sort((a, b) => b.normalization - a.normalization);

        setArrangedStats(arrangedStats);
    };

    console.log(arrangedStats);

    const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        setClickedScore(Number(e.target.value));
    }

    const handleSentChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        setSentInfoScore(Number(e.target.value));
    }

    const handleScoreFormAnalysis = (e: React.FormEvent) => {
        e.preventDefault();
        rankingBasedOnScoreAndNormalization();
    };


    return(
        <div>
            <form onSubmit={handleProcessData}>
                <label htmlFor="sheetInput">Upload this month's spreadsheet:</label>
                <input type="file" id="sheetInput" name="sheetInput" accept=".xlsx, .xls, .csv" onChange={handleFileUpload}/>
                {/* <button type="submit" onClick={handleDownload}>Download Report</button> */}
            </form>
            <div>
                {departmentList && Array.from(departmentList).map((dept) => (
                    <p key={dept}>{dept}</p>
                ))}
            </div>

            <div>
                <form id="score-form" style={{display: 'flex', flexDirection: 'column'}} onSubmit={handleScoreFormAnalysis}>
                    <label htmlFor="clicked-score">Clicked Score:
                        <input type="number" id="clicked-score" value={clickedScore} onChange={handleScoreChange} />
                    </label>

                    <label htmlFor="password-score">Password Score:
                        <input type="number" id="password-score" value={sentInfoScore} onChange={handleSentChange} />
                    </label>

                    <button type="submit" style={{width: 'fit-content', cursor: "pointer"}}>Submit</button>
                </form>
            </div>

            {stats && (
                <div>
                    <h3>Department Stats:</h3>
                    <table >
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Department</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Viewed</th>
                                <th className="border p-2">Clicked</th>
                                <th className="border p-2">Sent Info</th>
                                <th className="border p-2">Reported</th>
                                <th className="border p-2">Report Rate</th>
                                <th className="border p-2">Score</th>
                                <th className="border p-2">Normalization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(arrangedStats).map(([dept, count]) => {
                                const typedCount = count as { department: string; reported: number; total: number; viewed: number; clicked: number; sent: number; none: number; score: number; normalization: number};
                                // const Score = (typedCount.clicked * clickedScore) + (typedCount.sent * sentInfoScore);
                                return (
                                    <tr key={dept}>
                                        <td className="border p-2">{typedCount.department}</td>
                                        <td className="border p-2 text-center">{typedCount.total}</td>
                                        <td className="border p-2 text-center">{typedCount.viewed}</td>
                                        <td className="border p-2 text-center">{typedCount.clicked}</td>
                                        <td className="border p-2 text-center">{typedCount.sent}</td>
                                        <td className="border p-2 text-center">{typedCount.reported}</td>
                                        <td className="border p-2 text-center">
                                            {((typedCount.reported / typedCount.total) * 100).toFixed(2)}%
                                        </td>
                                        <td className="border p-2 text-center">{typedCount.score}</td>
                                        <td className="border p-2 text-center">{typedCount.normalization}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
