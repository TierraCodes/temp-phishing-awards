'use client'

export default function DisplayWinners(){
    const month = "June"
    const year = "2024"
    const winnerList: string[] = []

    return(
        <div>
            <h1>Individual Winners for {getMonth(month)}, {getYear(year)}</h1>
            <div>
                <ul>

                </ul>
            </div>
        </div>
    )
}

function getMonth(month: string){
    return month
}

function getYear(year: string) {
    return year
}