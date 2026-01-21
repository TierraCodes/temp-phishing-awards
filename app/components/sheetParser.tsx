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

export default function SheetParser(){
    const [fileData, setFileData] = useState<unknown[] | null>(null);
    const [departmentList, setDepartmentList] = useState<Set<string>>();
    const [stats, setStats] = useState(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file){
            const fileReader = new FileReader();

            fileReader.onload = (e) => {
                if(e.target == null){
                  return
                }
                const data = e.target.result;
                const workbook = xlsx.read(data, {type: 'binary'});

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const json = xlsx.utils.sheet_to_json(worksheet);
                setFileData(json)
                calculateWinners(json)
            }
            fileReader.readAsArrayBuffer(file)
        }
    }
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        fileData?.forEach((row) => {
            const dept = (row as Record<string, unknown>)['department'];
            if (typeof dept === 'string'){
                setDepartmentList((prev) => new Set(prev).add(dept));
            }
        })
        console.log(departmentList);
    }

    const calculateWinners = (data: any[]) => {
        const results = data.reduce((acc, row) => {
            const dept = row.department || 'Unknown';
        
            const actionValue = String(row.event_type).trim();
            const actionType = Object.values(EventType).find(val => val === actionValue);

            if (!acc[dept]) {
                acc[dept] = { total: 0, reported: 0, clicked: 0, sent: 0, view: 0, none: 0 };
            }

            acc[dept].total += 1;
            if (actionType === EventType.REPORT) {
                acc[dept].reported += 1;
            } 
            if (actionType === EventType.CLICK) {
                acc[dept].clicked += 1;
            } 
            if (actionType === EventType.SENT) {
                acc[dept].sent += 1;
            } 
            if (actionType === EventType.VIEW) {
                acc[dept].view += 1;
            } 
            if (actionType === EventType.NONE) {
                acc[dept].none += 1;
            }

            return acc;
        }, {});
        setStats(results);
    }

    return(
        <div>
            <form action="">
                <label htmlFor="sheetInput">Upload this month's spreadsheet:</label>
                <input type="file" id="sheetInput" name="sheetInput" accept=".xlsx, .xls, .csv" onChange={handleFileUpload}/>
                <button type="submit" onClick={handleButtonClick}>Parse Sheet</button>
            </form>
            <div>
                {departmentList && Array.from(departmentList).map((dept) => (
                    <p key={dept}>{dept}</p>
                ))}
            </div>
            {stats && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Department Stats:</h3>
                    <table className="min-w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Department</th>
                                <th className="border p-2">Viewed</th>
                                <th className="border p-2">Clicked</th>
                                <th className="border p-2">Sent Info</th>
                                <th className="border p-2">Reported</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(stats).map(([dept, count]) => {
                                const typedCount = count as { reported: number; total: number; viewed: number; clicked: number; sent: number; none: number; };
                                return (
                                    <tr key={dept}>
                                        <td className="border p-2">{dept}</td>
                                        <td className="border p-2 text-center">{typedCount.viewed}</td>
                                        <td className="border p-2 text-center">{typedCount.clicked}</td>
                                        <td className="border p-2 text-center">{typedCount.sent}</td>
                                        <td className="border p-2 text-center">{typedCount.reported}</td>
                                        <td className="border p-2 text-center">{typedCount.total}</td>
                                        <td className="border p-2 text-center">
                                            {((typedCount.reported / typedCount.total) * 100).toFixed(2)}%
                                        </td>
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
