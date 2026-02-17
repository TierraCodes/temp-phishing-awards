"use client"

import {FileMinus, FileUp, Calculator, RotateCcw, Search, SearchIcon} from "lucide-react";
import React, {useState} from "react";

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import * as xlsx from "xlsx";


interface Column {
    id: 'department' | 'total' | 'viewed' | 'clicked' | 'sent' | 'reported' | 'password' | 'score' | 'rank';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: "department", label: "Department", minWidth: 170 },
    { id: "total", label: "Total", minWidth: 80 },
    { id: "viewed", label: "Viewed", minWidth: 80 },
    { id: "sent", label: "Sent Info", minWidth: 100 },
    { id: "reported", label: "Reported", minWidth: 90 },
    { id: "clicked", label: "Clicked", minWidth: 80 },
    { id: "password", label: "Password", minWidth: 100 },
    { id: "score", label: "Score", minWidth: 80 },
    { id: "rank", label: "Rank", minWidth: 70 },
];

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
    department: string;
    password: number;
    score: number;
    rank: number;
}

export default function Page() {
    const [pageLarge, setPageLarge] = useState(0);
    const [rowsPerPageLarge, setRowsPerPageLarge] = useState(10);

    const [pageMedium, setPageMedium] = useState(0);
    const [rowsPerPageMedium, setRowsPerPageMedium] = useState(10);

    const [pageSmall, setPageSmall] = useState(0);
    const [rowsPerPageSmall, setRowsPerPageSmall] = useState(10);

    const [clickedPointValue, setClickedPointValue] = useState(-100);
    const [sentInfoPointValue, setSentInfoPointValue] = useState(-100);
    const [passwordPointValue, setPasswordPointValue] = useState(-100);
    const [reportedPointValue, setReportedPointValue] = useState(0);

    const [largeDepartmentRange, setLargeDepartmentRange] = useState<number[]>([0, 5]);
    const [mediumDepartmentRange, setMediumDepartmentRange] = useState<number[]>([0, 5]);
    const [smallDepartmentRange, setSmallDepartmentRange] = useState<number[]>([0, 5]);

    const [largeDepartmentStats, setLargeDepartmentStats] = useState<DepartmentStatsWithScore[]>([]);
    const [mediumDepartmentStats, setMediumDepartmentStats] = useState<DepartmentStatsWithScore[]>([]);
    const [smallDepartmentStats, setSmallDepartmentStats] = useState<DepartmentStatsWithScore[]>([]);

    const [largeDepartmentSearchValue, setLargeDepartmentSearchValue] = useState('');
    const [mediumDepartmentSearchValue, setMediumDepartmentSearchValue] = useState('');
    const [smallDepartmentSearchValue, setSmallDepartmentSearchValue] = useState('');

    const [largeDepartmentFilteredList, setLargeDepartmentFilteredList] = useState<DepartmentStatsWithScore[]>([]);
    const [mediumDepartmentFilteredList, setMediumDepartmentFilteredList] = useState<DepartmentStatsWithScore[]>([]);
    const [smallDepartmentFilteredList, setSmallDepartmentFilteredList] = useState<DepartmentStatsWithScore[]>([]);

    const [fileData, setFileData] = useState<unknown[] | null>(null);
    // const [departmentList, setDepartmentList] = useState<Set<string>>();
    const [stats, setStats] = useState<Record<string, DepartmentStats> | null>(null);
    const [arrangedStats, setArrangedStats] = useState<DepartmentStatsWithScore[]>([]);

    // const [clickedScore, setClickedScore] = useState(0);
    // const [sentInfoScore, setSentInfoScore] = useState(0);

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

    if (fileData){
        console.log("hello world")
    } else{
        console.log("hello world2")
    }

    const handleProcessData = (event: React.FormEvent) => {
        event.preventDefault();
        if (!fileData) return;

        const depts = new Set<string>();
        fileData.forEach((row) => {
            const typedRow = row as Record<string, unknown>;
            if (typedRow.department) depts.add(String(typedRow.department));
        });
        // setDepartmentList(depts);
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
    };

    const rankingBasedOnScoreAndNormalization = () => {
        if (!stats) return;

        const updatedStats: DepartmentStatsWithScore[] = Object.entries(stats).map(([department, items]) => ({
            department,
            ...items,
            password: 0,
            score: (items.clicked * clickedPointValue) + (items.sent * sentInfoPointValue) + (items.reported * reportedPointValue),
            rank: ((items.clicked * clickedPointValue) + (items.sent * sentInfoPointValue) + (items.reported * reportedPointValue)) / 100,
        }));

        const arrangedStats =  updatedStats.sort((a, b) => b.rank - a.rank);

        const largeDepartmentArrangedStats = arrangedStats.filter(stat => stat.total >= largeDepartmentRange[0] && stat.total <= largeDepartmentRange[1]);
        const mediumDepartmentArrangedStats = arrangedStats.filter(stat => stat.total >= mediumDepartmentRange[0] && stat.total <= mediumDepartmentRange[1]);
        const smallDepartmentArrangedStats = arrangedStats.filter(stat => stat.total >= smallDepartmentRange[0] && stat.total <= smallDepartmentRange[1]);

        setArrangedStats(arrangedStats);

        setLargeDepartmentStats(largeDepartmentArrangedStats);
        setMediumDepartmentStats(mediumDepartmentArrangedStats);
        setSmallDepartmentStats(smallDepartmentArrangedStats);

        console.log(arrangedStats);
        console.log(largeDepartmentArrangedStats[0].department);
    };

    const handleLargeDepartmentInputChange = (event) => {
        const largeDepartmentSearchTerm = event.target.value;
        setLargeDepartmentSearchValue(largeDepartmentSearchTerm);

        const filteredLargeDepartmentStats = largeDepartmentStats.filter((department) => {
            return department.department.toLowerCase().includes(largeDepartmentSearchTerm.toLowerCase());
        });

        setLargeDepartmentFilteredList(filteredLargeDepartmentStats);

    };

    const handleMediumDepartmentInputChange = (event) => {
        const mediumDepartmentSearchTerm = event.target.value;
        setMediumDepartmentSearchValue(mediumDepartmentSearchTerm);

        const filteredMediumDepartmentStats = mediumDepartmentStats.filter((department) => {
            return department.department.toLowerCase().includes(mediumDepartmentSearchTerm.toLowerCase());
        });

        setMediumDepartmentFilteredList(filteredMediumDepartmentStats);

    };

    const handleSmallDepartmentInputChange = (event) => {
        const smallDepartmentSearchTerm = event.target.value;
        setSmallDepartmentSearchValue(smallDepartmentSearchTerm);

        const filteredSmallDepartmentStats = smallDepartmentStats.filter((department) => {
            return department.department.toLowerCase().includes(smallDepartmentSearchTerm.toLowerCase());
        });

        setSmallDepartmentFilteredList(filteredSmallDepartmentStats);
    };

    // const getLargeDepartmentStats = () => {
    //     if (!arrangedStats) return;
    //
    //     const updatedLargeDepartmentRange : DepartmentStatsWithScore[] = arrangedStats.filter((department) => ({
    //
    //     }));
    //
    //     return arrangedStats.filter(stat => stat.total >= largeDepartmentRange[0] && stat.total <= largeDepartmentRange[1]);
    // }
    //
    // const getMediumDepartmentStats = () => {
    //     if (!arrangedStats) return;
    //     return arrangedStats.filter(stat => stat.total >= largeDepartmentRange[0] && stat.total <= largeDepartmentRange[1]);
    // }
    //
    // const getSmallDepartmentStats = () => {
    //     if (!arrangedStats) return;
    //     return arrangedStats.filter(stat => stat.total >= largeDepartmentRange[0] && stat.total <= largeDepartmentRange[1]);
    // }



    // console.log(getLargeDepartmentStats());
    // console.log(getMediumDepartmentStats());
    // console.log(getSmallDepartmentStats());



    // const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    //     setClickedScore(Number(e.target.value));
    // }
    //
    // const handleSentChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    //     setSentInfoScore(Number(e.target.value));
    // }

    const handleScoreFormAnalysis = (e: React.FormEvent) => {
        e.preventDefault();
        rankingBasedOnScoreAndNormalization();
    };

    const handleChangePageLargeDepartment = (event: unknown, newPage: number) => {
        setPageLarge(newPage);
    };

    const handleChangeRowsPerPageLargeDepartment = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageLarge(+event.target.value);
        setPageLarge(0);
    };

    const handleChangePageMediumDepartment = (event: unknown, newPage: number) => {
        setPageMedium(newPage);
    };

    const handleChangeRowsPerPageMediumDepartment = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageMedium(+event.target.value);
        setPageMedium(0);
    };

    const handleChangePageSmallDepartment = (event: unknown, newPage: number) => {
        setPageSmall(newPage);
    };

    const handleChangeRowsPerPageSmallDepartment = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageSmall(+event.target.value);
        setPageSmall(0);
    };

    const handleChangeLargeDepartment = (event: Event, newValue: number[]) => {
        setLargeDepartmentRange(newValue);
    };

    const handleChangeMediumDepartment = (event: Event, newValue: number[]) => {
        setMediumDepartmentRange(newValue);
    };

    const handleChangeSmallDepartment = (event: Event, newValue: number[]) => {
        setSmallDepartmentRange(newValue);
    };


    return (
        <main className="flex flex-col gap-10 px-4 md:px-6 lg:px-8 py-6 md:py-10 lg:py-16 h-full bg-[#101922]">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col items-start gap-1">
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-[#F6F7F8]">Dashboard Overview</h1>
                    <p className="text-[#9DABB9] text-sm md:text-md lg:text-lg">Visual overview for the phishing award data</p>
                </div>

                {/*<button className="flex items-center gap-2 bg-[#1A222D] text-[#F6F7F8] text-lg font-semibold px-6 py-2 border-3 border-[#3B4754] hover:cursor-pointer hover:bg-[#2F3944] mt-8 rounded-xl">*/}
                {/*    <FileMinus size={20} />*/}
                {/*    Instructions*/}
                {/*</button>*/}
            </div>

            <div className="flex flex-col gap-8 lg:gap-0 lg:flex-row justify-between">
                <div className="w-full lg:w-[39%] min-h-[20vh] flex flex-col gap-4 bg-[#1A222D] p-4 md:p-6 border-1 border-[#3B4754] rounded-xl">
                    <h2 className="flex flex-row items-center gap-2 text-[#F6F7F8] font-bold text-md md:text-lg lg:text-xl">
                        <FileUp className="text-[#137FEC] w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-12 lg:h-12" />
                        Data Upload
                    </h2>

                    <form onSubmit={handleProcessData}>
                        <label htmlFor="sheetInput" className="flex flex-col items-center justify-center w-full min-h-[15vh] sm:min-h-[20vh] md:min-h-[25vh] cursor-pointer rounded-xl border-2 border-dashed border-[#3B4754] bg-[#101922] text-center">
                            {fileData ? (
                                    <p className="text-[#F6F7F8] font-semibold text-sm sm:text-base md:text-lg">
                                        File Uploaded Successfully
                                    </p>
                                ) : (
                                    <p className="text-[#F6F7F8] font-semibold text-sm sm:text-base md:text-lg">
                                        Upload CSV File
                                    </p>
                                )
                            }
                        </label>
                        <input type="file" id="sheetInput" name="sheetInput" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload}/>
                    </form>

                    <div className="flex flex-col gap-2 md:gap-4">
                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Large Department Range</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{largeDepartmentRange[0]} --- {largeDepartmentRange[1]}</span>
                            </div>
                            <Box sx={{ width: '100%' }}>
                                <Slider
                                    getAriaLabel={() => 'Temperature range'}
                                    value={largeDepartmentRange}
                                    onChange={handleChangeLargeDepartment}
                                    valueLabelDisplay="auto"
                                    max={400}
                                    // getAriaValueText={valuetext}
                                />
                            </Box>
                        </div>

                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Medium Department Range</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{mediumDepartmentRange[0]} --- {mediumDepartmentRange[1]}</span>
                            </div>
                            <Box sx={{ width: '100%' }}>
                                <Slider
                                    getAriaLabel={() => 'Temperature range'}
                                    value={mediumDepartmentRange}
                                    onChange={handleChangeMediumDepartment}
                                    valueLabelDisplay="auto"
                                    max={400}
                                    // getAriaValueText={valuetext}
                                />
                            </Box>
                        </div>

                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Small Department Range</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{smallDepartmentRange[0]} --- {smallDepartmentRange[1]}</span>
                            </div>
                            <Box sx={{ width: '100%' }}>
                                <Slider
                                    getAriaLabel={() => 'Temperature range'}
                                    value={smallDepartmentRange}
                                    onChange={handleChangeSmallDepartment}
                                    valueLabelDisplay="auto"
                                    max={400}
                                    // getAriaValueText={valuetext}
                                />
                            </Box>
                        </div>
                    </div>

                    {/*<div className="flex flex-row justify-end mt-2 md:mt-4 lg:mt-8">*/}
                    {/*    <button className="flex flex-row items-center text-[#F6F7F8] text-sm md:text-md lg:text-lg font-bold gap-3 bg-[#137FEC] w-fit px-6 py-2 hover:cursor-pointer rounded-xl">*/}
                    {/*        /!*<Calculator className="text-[#F6F7F8] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-9 lg:h-9" />*!/*/}
                    {/*        Set Quarterlies*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>

                <div className="flex flex-col gap-6 w-full lg:w-[59%] min-h-[40vh] h-fit bg-[#1A222D] p-4 md:p-6 border-1 border-[#3B4754] rounded-xl">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <h2 className="flex flex-row items-center gap-2 text-[#F6F7F8] font-bold text-md md:text-lg lg:text-xl">
                            <Calculator className="text-[#137FEC] w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-12 lg:h-12" />
                            Scoring Parameters
                        </h2>

                        {/*<button className="flex flex-row items-center gap-2 justify-between text-[#137FEC] text-xs md:text-sm lg:text-md">*/}
                        {/*    <RotateCcw size={16} />*/}
                        {/*    Reset to Default*/}
                        {/*</button>*/}
                    </div>

                    <div className="flex flex-col gap-2 md:gap-4">
                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Clicked Point</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{clickedPointValue}</span>
                            </div>
                            <input type="range" min={-100} max={0} step={1} value={clickedPointValue} onChange={(event) => setClickedPointValue(Number(event.target.value))} className="w-full h-[20%] rounded-xl hover:cursor-pointer accent-[#137FEC]" />
                        </div>

                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Sent Info Point</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{sentInfoPointValue}</span>
                            </div>
                            <input type="range" min={-100} max={0} step={1} value={sentInfoPointValue} onChange={(event) => setSentInfoPointValue(Number(event.target.value))} className="w-full h-[20%] rounded-xl hover:cursor-pointer accent-[#137FEC]" />
                        </div>

                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Password Point</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{passwordPointValue}</span>
                            </div>
                            <input type="range" min={-100} max={0} step={1} value={passwordPointValue} onChange={(event) => setPasswordPointValue(Number(event.target.value))} className="w-full h-[20%] rounded-xl hover:cursor-pointer accent-[#137FEC]" />
                        </div>

                        <div className="flex flex-col gap-1 md:gap-3 lg:gap-5">
                            <div className="flex flex-row justify-between items-center">
                                <h3 className="text-[#F6F7F8] text-sm md:text-md lg:text-lg font-semibold">Reported Point</h3>
                                <span className="text-sm font-bold text-[#137FEC] bg-[#193759] px-[0.4rem] py-[0.08rem] rounded-sm">{reportedPointValue}</span>
                            </div>
                            <input type="range" min={0} max={100} step={1} value={reportedPointValue} onChange={(event) => setReportedPointValue(Number(event.target.value))} className="w-full h-[20%] rounded-xl hover:cursor-pointer accent-[#137FEC]" />
                        </div>
                    </div>

                    <hr className="border-[#3B4754] mt-1 md:mt-2 lg:mt-4" />

                    <div className="flex flex-row justify-end mt-2 md:mt-4 lg:mt-8">
                        <button className="flex flex-row items-center text-[#F6F7F8] text-sm md:text-md lg:text-lg font-bold gap-3 bg-[#137FEC] w-fit px-6 py-2 hover:cursor-pointer rounded-xl" onClick={handleScoreFormAnalysis}>
                            <Calculator className="text-[#F6F7F8] w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-9 lg:h-9" />
                            Recalculate Scores
                        </button>
                    </div>
                </div>
            </div>


            <div className="min-h-[20vh] h-fit bg-[#1A222D] p-4 md:p-6 border-1 border-[#3B4754] rounded-xl">
                <div>
                    <h2 className="text-md md:text-lg lg:text-xl font-bold text-[#137FEC] mb-4">Processed Results</h2>
                </div>

                <div className="">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <h2 className="text-sm md:text-md lg:text-lg font-semibold text-[#F6F7F8] mb-4">Large Departments <span className="text-xs md:text-sm lg:text-md">Total Dept: {largeDepartmentStats.length}</span></h2>

                        <div className="flex flex-row w-fit bg-[#1A222D] border-1 border-[#3B4754] rounded-lg px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-3 gap-2">
                            <SearchIcon size={25} className="text-[#94A3B8] " />
                            <input type="text" placeholder="Search..." className="w-full text-[#94A3B8] text-lg outline-none" value={largeDepartmentSearchValue} onChange={handleLargeDepartmentInputChange}  />
                        </div>
                    </div>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead className="accent-amber-300">
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth, backgroundColor: "#1A222D", color: "#F6F7F8", border: "1px solid #3B4754" }}
                                                className="accent-amber-300"
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(largeDepartmentFilteredList.length > 0 ? largeDepartmentFilteredList : largeDepartmentStats)
                                        // .slice(pageLarge * rowsPerPageLarge, pageLarge * rowsPerPageLarge + rowsPerPageLarge)
                                        .map((row) => {
                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={row.department} className="text-red-800">
                                                    {columns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <TableCell key={column.id} align={column.align} className="text-red-800">
                                                                {column.format && typeof value === 'number'
                                                                    ? column.format(value)
                                                                    : value}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/*<TablePagination*/}
                        {/*    rowsPerPageOptions={[100, 200, 300]}*/}
                        {/*    component="div"*/}
                        {/*    count={largeDepartmentStats.length}*/}
                        {/*    rowsPerPage={rowsPerPageLarge}*/}
                        {/*    page={pageLarge}*/}
                        {/*    onPageChange={handleChangePageLargeDepartment}*/}
                        {/*    onRowsPerPageChange={handleChangeRowsPerPageLargeDepartment}*/}
                        {/*/>*/}
                    </Paper>
                </div>

                <div className="mt-4 flex flex-col lg:flex-row w-[100%] gap-6 lg:justify-between">
                    <div className="w-[100%] lg:w-[49%]">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <h2 className="text-sm md:text-md lg:text-lg font-semibold text-[#F6F7F8] mb-4">Medium Departments <span className="text-xs md:text-sm lg:text-md">Total Dept: {mediumDepartmentStats.length}</span></h2>
                            <div className="flex flex-row w-fit bg-[#1A222D] border-1 border-[#3B4754] rounded-lg px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-3 gap-2">
                                <SearchIcon size={25} className="text-[#94A3B8] " />
                                <input type="text" placeholder="Search..." className="w-full text-[#94A3B8] text-lg outline-none" value={mediumDepartmentSearchValue} onChange={handleMediumDepartmentInputChange}  />
                            </div>
                        </div>

                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead className="accent-amber-300">
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    style={{ minWidth: column.minWidth, backgroundColor: "#1A222D", color: "#F6F7F8", border: "1px solid #3B4754" }}
                                                    className="accent-amber-300"
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(mediumDepartmentFilteredList.length > 0 ? mediumDepartmentFilteredList : mediumDepartmentStats)
                                            // .slice(pageMedium * rowsPerPageMedium, pageMedium * rowsPerPageMedium + rowsPerPageMedium)
                                            .map((row) => {
                                                return (
                                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.department} className="text-red-800">
                                                        {columns.map((column) => {
                                                            const value = row[column.id];
                                                            return (
                                                                <TableCell key={column.id} align={column.align} className="text-red-800">
                                                                    {column.format && typeof value === 'number'
                                                                        ? column.format(value)
                                                                        : value}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/*<TablePagination*/}
                            {/*    rowsPerPageOptions={[100]}*/}
                            {/*    component="div"*/}
                            {/*    count={mediumDepartmentStats.length}*/}
                            {/*    rowsPerPage={rowsPerPageMedium}*/}
                            {/*    page={pageMedium}*/}
                            {/*    onPageChange={handleChangePageMediumDepartment}*/}
                            {/*    onRowsPerPageChange={handleChangeRowsPerPageMediumDepartment}*/}
                            {/*/>*/}
                        </Paper>
                    </div>

                    <div className="w-[100%] h-full lg:w-[49%]">
                        <div className="flex flex-row justify-between items-center mb-4">
                            <h2 className="text-sm md:text-md lg:text-lg font-semibold text-[#F6F7F8] mb-4">Small Departments <span className="text-xs md:text-sm lg:text-md">Total Dept: {smallDepartmentStats.length}</span></h2>
                            <div className="flex flex-row w-fit bg-[#1A222D] border-1 border-[#3B4754] rounded-lg px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-3 gap-2">
                                <SearchIcon size={25} className="text-[#94A3B8] " />
                                <input type="text" placeholder="Search..." className="w-full text-[#94A3B8] text-lg outline-none" value={smallDepartmentSearchValue} onChange={handleSmallDepartmentInputChange}  />
                            </div>
                        </div>

                        <Paper sx={{ width: '7\0%', overflow: 'hidden' }}>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead className="accent-amber-300">
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                    style={{ minWidth: column.minWidth, backgroundColor: "#1A222D", color: "#F6F7F8", border: "1px solid #3B4754" }}
                                                    className="accent-amber-300"
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(smallDepartmentFilteredList.length > 0 ? smallDepartmentFilteredList : smallDepartmentStats)
                                            // .slice(pageSmall * rowsPerPageSmall, pageSmall * rowsPerPageSmall + rowsPerPageSmall)
                                            .map((row) => {
                                                return (
                                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.department} className="text-red-800">
                                                        {columns.map((column) => {
                                                            const value = row[column.id];
                                                            return (
                                                                <TableCell key={column.id} align={column.align} className="text-red-800">
                                                                    {column.format && typeof value === 'number'
                                                                        ? column.format(value)
                                                                        : value}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {/*<TablePagination*/}
                            {/*    rowsPerPageOptions={[100]}*/}
                            {/*    component="div"*/}
                            {/*    count={smallDepartmentStats.length}*/}
                            {/*    rowsPerPage={rowsPerPageSmall}*/}
                            {/*    page={pageSmall}*/}
                            {/*    onPageChange={handleChangePageSmallDepartment}*/}
                            {/*    onRowsPerPageChange={handleChangeRowsPerPageSmallDepartment}*/}
                            {/*/>*/}
                        </Paper>
                    </div>
                </div>

            </div>
        </main>
    );
}
