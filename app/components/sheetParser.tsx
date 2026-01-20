'use client'
import React, { useState } from 'react';
import * as xlsx from 'xlsx'

export default function SheetParser(){
    const [fileData, setFileData] = useState<unknown[] | null>(null);
    const [departmentList, setDepartmentList] = useState<Set<string>>();

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
            }
            fileReader.readAsArrayBuffer(file)
        }
    }
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        fileData?.forEach((row) => {
            const dept = (row as Record<string, unknown>)['Department'];
            if (typeof dept === 'string'){
                setDepartmentList((prev) => new Set(prev).add(dept));
            }
        })
        console.log(departmentList);
    }

    return(
        <div>
            <form action="">
                <label htmlFor="sheetInput">Upload this month's spreadsheet:</label>
                <input type="file" id="sheetInput" name="sheetInput" accept=".xlsx, .xls, .csv" onChange={handleFileUpload}/>
                <button type="submit" onClick={handleButtonClick}>Parse Sheet</button>
            </form>
            <div>
                {fileData && JSON.stringify((fileData as Record<string, unknown>[])[1]['Department'])}
            </div>
            <div>
                {departmentList && Array.from(departmentList).map((dept) => (
                    <p key={dept}>{dept}</p>
                ))}
            </div>
        </div>
    )
}
