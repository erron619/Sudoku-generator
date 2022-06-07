"use strict";

// ELEMENTS
const ELEMENT_sudoku_table = document.querySelector(".sudoku_table");
const ELEMENT_numberSelect_table = document.querySelector(".numberSelect_table");

// VARIABLES
let sudokuValues_solved = [];
let sudokuValues_user = [];

// OBJECTS
const blacklist = {
    /* DESCRIPTION:
    this object has a list (max 9 items), u can add items,
    clear all its items, an check if there is a repeated
    value in it or not */

    // list array:
    array: [],

    /* check for repeated value in array,
    returns TRUE if there is one: */
    check: function (value) {
        for (let i = 0; i < this.array.length; i++) {
            if (value == this.array[i]) {
                return true;
            }
        }
        return false;
    },

    // clear all values in array:
    clear: function () {
        this.array = [];
    },

    /* add a value into the list;
    if u have already 9 items in it,
    then clear it all, add new value: */
    add: function (value) {
        if (this.array.length >= 9) {
            this.clear();
        }
        this.array.push(value);
    }
};

const sudokuGenerator_stage1 = {
    /* DESCRIPTION:
    first stage of generating a solvable Sudoku:
    we should creat Sudoku array, 
    then place 1 to 9 into each boxes randomly */

    // creating a default 9*9 array:
    default: function () {
        for (let j = 0; j < 9; j++) {
            let row = [];
            for (let i = 0; i < 9; i++) {
                row.push(0);
            }
            sudokuValues_solved.push(row);
        }
    },

    // placing 1 to 9 numbers into each boxes:
    place: function () {
        // call default() for a default 9*9 array:
        this.default();

        // x and y => box position;
        // i and j => tile position (in the box);
        // position finding formula => box * 3 + tile;

        // box position:
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                // tile position:
                for (let j = 0; j < 3; j++) {
                    for (let i = 0; i < 3; i++) {
                        // repeat until a proper value found:
                        while (true) {
                            const value = Math.trunc(Math.random() * 9) + 1;
                            if (!blacklist.check(value)) {
                                // add it to array:
                                const xpos = x * 3 + i;
                                const ypos = y * 3 + j;
                                sudokuValues_solved[ypos][xpos] = value;
                                // add it to blacklist:
                                blacklist.add(value);
                                // break the while loop:
                                break;
                            }
                        }
                    }
                }
                // clear blacklist for next box:
                blacklist.clear();
            }
        }
    }
};

const sudokuGenerator_stage2 = {

    direction: "row",

    toggle_direction: function () {
        if (this.direction == "row") {
            this.direction = "col";
        }
        else {
            this.direction = "row";
        }
    },

    limitzone: {
        col: 0,
        row: 0
    },

    target: {
        col: 0,
        row: 0,
        value: 0,
        findValue: function () {
            this.value = sudokuValues_solved[this.row][this.col];
        }
    },

    twin: {
        col: 0,
        row: 0,
        value: 0,
        findValue: function () {
            this.value = sudokuValues_solved[this.row][this.col];
        }
    },

    boxPositionFinding: function (value) {
        for (let i = 0; i < 3; i++) {
            const max = 3 * i + 2;
            const min = 3 * i;
            if (value >= min && value <= max) {
                return i;
            }
        }
    },

    boxArrayFinding: function (x, y) {
        let boxArray = [];
        for (let j = 0; j < 3; j++) {
            let preArray = [];
            for (let i = 0; i < 3; i++) {
                const preRow = y * 3 + j;
                const preCol = x * 3 + i;
                const preValue = sudokuValues_solved[preRow][preCol];
                preArray.push(preValue);
            }
            boxArray.push(preArray);
        }
        return boxArray;
    },

    BASreplacing: function (person) {
        console.log(`## BAS start ##`);

        // STAGE 1 => obtaining box's array
        // finding person box position:
        const x = this.boxPositionFinding(this[person].col);
        const y = this.boxPositionFinding(this[person].row);
        // extracting box's values:
        const boxValues = this.boxArrayFinding(x, y);
        console.log(`${person} box => x: ${x} | y: ${y} | values: ${boxValues}`);

        // STAGE 2 => define replaceList
        // limitzone in the box:
        let inBox_limit_row = -1;
        if (y * 3 <= this.limitzone.row) {
            inBox_limit_row = this.limitzone.row % 3;
        }
        let inBox_limit_col = -1;
        if (x * 3 <= this.limitzone.col) {
            inBox_limit_col = this.limitzone.col % 3;
        }
        // extract valid values, make a replaceList:
        let replaceList = [];
        for (let j = 0; j < 3; j++) {
            if (j > inBox_limit_row) {
                for (let i = 0; i < 3; i++) {
                    if (i > inBox_limit_col) {
                        replaceList.push(boxValues[j][i]);
                    }
                }
            }
        }
        // check replaceList to has at least a value;
        // if it doesnt have, then BAS wont work:
        if (replaceList.length == 0) {
            console.log(`BAS failed: no replaceList found`);
            return false;
        }
        else {
            console.log(`replaceList: ${replaceList}`);
        }

        // STAGE 3 => swapping
        // find an unregistered value in replaceList;
        let replaceValue;
        for (let i = 0; i < replaceList.length; i++) {
            if (!blacklist.check(replaceList[i])) {
                replaceValue = replaceList[i];
                break;
            }
        }
        // if it doesnt find any, then BAS wont work:
        if (!replaceValue) {
            console.log(`BAS failed: no replaceValue found`);
            return false;
        }
        else {
            console.log(`replaceValue: ${replaceValue}`);
        }
        // swapping:
        const value1 = this[person].value;
        const value2 = replaceValue;
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < 3; i++) {
                const checkCol = x * 3 + i;
                const checkRow = y * 3 + j;
                const checkValue = sudokuValues_solved[checkRow][checkCol];
                if (checkValue == replaceValue) {
                    sudokuValues_solved[this[person].row][this[person].col] = value2;
                    sudokuValues_solved[checkRow][checkCol] = value1;
                    // BAS worked!
                    console.log(`BAS success: ${value1} (x: ${this[person].col}, y: ${this[person].row}) and ${value2} (x: ${checkCol}, y: ${checkRow}) swapped`);
                    return true;
                }
            }
        }

        // for some reasons, proccess has been failed:
        console.log(`BAS failed: unknown reason`);
        return false;
    },

    NASreplacing: function (person) {
        console.log(`## NAS start ##`);

        // STAGE 1 => obtaining box's array
        // finding person box position:
        const x = this.boxPositionFinding(this[person].col);
        const y = this.boxPositionFinding(this[person].row);
        // extracting box's values:
        const boxValues = this.boxArrayFinding(x, y);
        console.log(`${person} box => x: ${x} | y: ${y} | values: ${boxValues}`);

        // STAGE 2 => define replaceList
        // limitzone in the box:
        let inBox_limitRow = -1;
        if (y * 3 - 3 <= this.limitzone.row) {
            inBox_limitRow = this.limitzone.row % 3;
        }
        let inBox_limitCol = -1;
        if (x * 3 - 3 <= this.limitzone.col) {
            inBox_limitCol = this.limitzone.col % 3;
        }
        // extract valid values, make a replaceList:
        let replaceList = [];
        if (this.direction == "row") {
            for (let j = 0; j < 3; j++) {
                if (j > inBox_limitRow) {
                    replaceList.push(boxValues[j][this[person].col % 3]);
                }
            }
        }
        else {
            for (let i = 0; i < 3; i++) {
                if (i > inBox_limitCol) {
                    replaceList.push(boxValues[this[person].row % 3][i]);
                }
            }
        }
        if (replaceList.length == 0) {
            console.log(`NAS failed: no replaceList found`);
            return false;
        }
        else {
            console.log(`replaceList: ${replaceList}`);
        }

        // STAGE 3 => swapping
        // find an unregistered value in replaceList;
        let replaceValue;
        for (let i = 0; i < replaceList.length; i++) {
            if (!blacklist.check(replaceList[i])) {
                replaceValue = replaceList[i];
                break;
            }
        }
        // if it doesnt find any, then NAS wont work:
        if (!replaceValue) {
            console.log(`NAS failed: no replaceValue found`);
            return false;
        }
        else {
            console.log(`replaceValue: ${replaceValue}`);
        }
        // swapping:
        const value1 = this[person].value;
        const value2 = replaceValue;
        if (this.direction == "row") {
            for (let j = 0; j < 3; j++) {
                const checkRow = y * 3 + j;
                const checkValue = sudokuValues_solved[checkRow][this[person].col];
                if (checkValue == replaceValue) {
                    sudokuValues_solved[this[person].row][this[person].col] = value2;
                    sudokuValues_solved[checkRow][this[person].col] = value1;
                    // NAS worked!
                    console.log(`NAS success: ${value1} (x: ${this[person].col}, y: ${this[person].row}) and ${value2} (y: ${checkRow}) swapped`);
                    return true;
                }
            }
        }
        else {
            for (let i = 0; i < 3; i++) {
                const checkCol = x * 3 + i;
                const checkValue = sudokuValues_solved[this[person].row][checkCol];
                console.log(`check ${checkValue}`);
                if (checkValue == replaceValue) {
                    sudokuValues_solved[this[person].row][this[person].col] = value2;
                    sudokuValues_solved[this[person].row][checkCol] = value1;
                    // NAS worked!
                    console.log(`NAS success: ${value1} (x: ${this[person].col}, y: ${this[person].row}) and ${value2} (x: ${checkCol}) swapped`);
                    return true;
                }
            }
        }

        // for some reasons, proccess has been failed:
        console.log(`NAS failed: unknown reason`);
        return false;
    },

    PASreplacing: function (firstWanted) {
        console.log("## PAS start ##")

        let wantedValue = firstWanted;
        let lastSwapedCell;
        let everythingIsOk = false;
        let loopCount = 0;
        if (this.direction == "row") {
            while (!everythingIsOk && loopCount < 81) {
                console.log(`wantedValue: ${wantedValue}`);
                for (let i = 0; i <= this.target.col; i++) {
                    // finding wantedValue before target position:
                    const checkValue = sudokuValues_solved[this.target.row][i];
                    if (wantedValue == checkValue && i != lastSwapedCell) {
                        // swap it with its neighbor:
                        const swapValue = sudokuValues_solved[this.target.row + 1][i];
                        sudokuValues_solved[this.target.row][i] = swapValue;
                        sudokuValues_solved[this.target.row + 1][i] = checkValue;
                        console.log(`swap: ${checkValue} (col: ${i}, row: ${this.target.row}) with ${swapValue} (col: ${i}, row: ${this.target.row + 1})`);
                        lastSwapedCell = i;
                        // if checkValue was in blacklist then replace its value with swapValue:
                        if (blacklist.check(checkValue)) {
                            wantedValue = swapValue;
                            const a = blacklist.array.indexOf(checkValue);
                            blacklist.array[a] = swapValue;
                            break;
                        }
                        else {
                            blacklist.add(checkValue);
                            break;
                        }
                    }
                    else if (i == this.target.col - 1) {
                        everythingIsOk = true;
                    }
                }
                loopCount++;
            }

        }
        else {
            while (!everythingIsOk && loopCount < 81) {
                console.log(`wantedValue: ${wantedValue}`);
                for (let j = 0; j <= this.target.row; j++) {
                    const checkValue = sudokuValues_solved[j][this.target.col];
                    if (wantedValue == checkValue && j != lastSwapedCell) {
                        const swapValue = sudokuValues_solved[j][this.target.col + 1];
                        sudokuValues_solved[j][this.target.col] = swapValue;
                        sudokuValues_solved[j][this.target.col + 1] = checkValue;
                        console.log(`swap: ${checkValue} (col: ${this.target.col}, row: ${j}) with ${swapValue} (col: ${this.target.col + 1}, row: ${j})`);
                        lastSwapedCell = j;
                        if (blacklist.check(checkValue)) {
                            wantedValue = swapValue;
                            const a = blacklist.array.indexOf(checkValue);
                            blacklist.array[a] = swapValue;
                            break;
                        }
                        else {
                            blacklist.add(checkValue);
                            break;
                        }
                    }
                    else if (j == this.target.row - 1) {
                        everythingIsOk = true;
                    }
                }
                loopCount++;
            }
        }

        return everythingIsOk;
    },

    TWINreplacing: function () {
        let needsPAS = false;

        console.log("## TWIN start ##")
        console.log(`blackList before change: ${blacklist.array}`);

        if (this.direction == "row") {
            // finding twin's properties:
            this.twin.row = this.target.row;
            for (let i = 0; i < this.target.col; i++) {
                const checkValue = sudokuValues_solved[this.twin.row][i];
                if (checkValue == this.target.value) {
                    this.twin.col = i;
                }
            }
            this.twin.findValue();
            console.log(`twin => col: ${this.twin.col} | row: ${this.twin.row} | value: ${this.twin.value}`);
            // BAS or NAS replacing:
            if (this.twin.col > this.limitzone.col) {
                const a = this.twin.value;
                needsPAS = !this.BASreplacing("twin");
                this.twin.findValue();
                const b = this.twin.value;
                const c = blacklist.array.indexOf(a);
                blacklist.array[c] = b;
            }
            else {
                const a = this.twin.value;
                needsPAS = !this.NASreplacing("twin");
                this.twin.findValue();
                const b = this.twin.value;
                const c = blacklist.array.indexOf(a);
                blacklist.array[c] = b;
            }
        }
        else {
            // finding twin's properties:
            this.twin.col = this.target.col;
            for (let j = 0; j < this.target.row; j++) {
                const checkValue = sudokuValues_solved[j][this.twin.col];
                if (checkValue == this.target.value) {
                    this.twin.row = j;
                }
            }
            this.twin.findValue();
            console.log(`twin => col: ${this.twin.col} | row: ${this.twin.row} | value: ${this.twin.value}`);
            // BAS or NAS replacing:
            if (this.twin.row > this.limitzone.row) {
                const a = this.twin.value;
                needsPAS = !this.BASreplacing("twin");
                this.twin.findValue();
                const b = this.twin.value;
                const c = blacklist.array.indexOf(a);
                blacklist.array[c] = b;
            }
            else {
                const a = this.twin.value;
                needsPAS = !this.NASreplacing("twin");
                this.twin.findValue();
                const b = this.twin.value;
                const c = blacklist.array.indexOf(a);
                blacklist.array[c] = b;
            }
        }

        if (needsPAS) {
            this.PASreplacing(this.target.value);
        }
        console.log(`blackList after change: ${blacklist.array}`);
    },

    search: function () {
        for (let loop = 0; loop < 18; loop++) {
            console.log("\n\n\n");
            console.log(`limitzone => col: ${this.limitzone.col} | row: ${this.limitzone.row} | direction: ${this.direction}`);

            // check in rows:
            if (this.direction == "row") {
                this.target.row = this.limitzone.row;
                for (let i = 0; i < 9; i++) {
                    this.target.col = i;
                    this.target.findValue();
                    if (!blacklist.check(this.target.value)) {
                        blacklist.add(this.target.value);
                    }
                    else {
                        drawDashedLine();
                        console.log("a duplication found!");
                        console.log(`target => col: ${this.target.col} | row: ${this.target.row} | value: ${this.target.value}`);
                        if (this.target.col > this.limitzone.col) {
                            if (!this.BASreplacing("target")) {
                                this.TWINreplacing();
                            }
                            else {
                                const replaceValue = sudokuValues_solved[this.target.row][this.target.col];
                                blacklist.add(replaceValue);
                            }
                        }
                        else {
                            if (!this.NASreplacing("target")) {
                                this.TWINreplacing();
                            }
                            else {
                                const replaceValue = sudokuValues_solved[this.target.row][this.target.col];
                                blacklist.add(replaceValue);
                            }
                        }
                    }
                }
            }
            // check in cols:
            else {
                this.target.col = this.limitzone.col;
                for (let j = 0; j < 9; j++) {
                    this.target.row = j;
                    this.target.findValue();
                    if (!blacklist.check(this.target.value)) {
                        blacklist.add(this.target.value);
                    }
                    else {
                        drawDashedLine();
                        console.log("a duplication found!");
                        console.log(`target => col: ${this.target.col} | row: ${this.target.row} | value: ${this.target.value}`);
                        if (this.target.row > this.limitzone.row) {
                            if (!this.BASreplacing("target")) {
                                this.TWINreplacing();
                            }
                            else {
                                const replaceValue = sudokuValues_solved[this.target.row][this.target.col];
                                blacklist.add(replaceValue);
                            }
                        }
                        else {
                            if (!this.NASreplacing("target")) {
                                this.TWINreplacing();
                            }
                            else {
                                const replaceValue = sudokuValues_solved[this.target.row][this.target.col];
                                blacklist.add(replaceValue);
                            }
                        }
                    }
                }
                this.limitzone.row++;
                this.limitzone.col++;
            }

            // finalizing loop for next turn:
            this.toggle_direction();
            updateSudokuTable();
            this.target.col = 0;
            this.target.row = 0;
            blacklist.clear();
        }
    }
};

// FUNCTIONS
function setSudokuTable() {
    // sudoku table:
    for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            // tile creation:
            const item = document.createElement("div");
            item.id = `${i}-${j}`;
            item.classList.add("sudoku_tile");
            ELEMENT_sudoku_table.appendChild(item);
            // boxes bordering:
            if (j == 0) {
                item.style.borderTop = "0px solid"
            }
            if (j == 8) {
                item.style.borderBottom = "0px solid"
            }
            if (j == 2 || j == 5) {
                item.style.borderBottom = "2px solid"
            }
            if (j == 3 || j == 6) {
                item.style.borderTop = "2px solid"
            }
            if (i == 2 || i == 5) {
                item.style.borderRight = "2px solid"
            }
            if (i == 3 || i == 6) {
                item.style.borderLeft = "2px solid"
            }
        }
    }
    // number select table:
    for (let i = 0; i < 9; i++) {
        const item = document.createElement("div");
        item.innerText = i + 1;
        item.classList.add("numberSelect_tile");
        ELEMENT_numberSelect_table.appendChild(item);
    }
};

function updateSudokuTable() {
    for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            document.getElementById(`${i}-${j}`).textContent = sudokuValues_solved[j][i];
        }
    }
};

function generateSudokuTable() {
    sudokuGenerator_stage1.place();
    sudokuGenerator_stage2.search();
}

function drawDashedLine() {
    console.log("-------------------------------");
}

function checkSudokuTable() {
    let list = [];
    let mistakes = [];
    let errorFound = false;
    drawDashedLine();
    // check every rows:
    console.log("check rows:")
    for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            // pick target value:
            const value = sudokuValues_solved[j][i];
            // search in the list, if it was repeated:
            blacklist.array = list;
            if (blacklist.check(value)) {
                // search in the mistakes, if it wasn't there, add it:
                blacklist.array = mistakes;
                if (!blacklist.check(value)) {
                    mistakes.push(value);
                }
                // sudoku isn't complete :( we found an error:
                errorFound = true;
            }
            else {
                // add value into list:
                list.push(value);
            }
        }
        // show row's checking final information: 
        if (mistakes.length > 0) {
            console.log(`row ${j}: FAILED >> mistakes: ${mistakes}`);
        }
        else {
            console.log(`row ${j}: PASSED`);
        }
        // reset everything:
        list = [];
        mistakes = [];
        blacklist.clear();
    }

    // check every cols:
    console.log("\ncheck cols:")
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            // pick target value:
            const value = sudokuValues_solved[j][i];
            // search in the list, if it was repeated:
            blacklist.array = list;
            if (blacklist.check(value)) {
                // search in the mistakes, if it wasn't there, add it:
                blacklist.array = mistakes;
                if (!blacklist.check(value)) {
                    mistakes.push(value);
                }
                // sudoku isn't complete :( we found an error:
                errorFound = true;
            }
            else {
                // add value into list:
                list.push(value);
            }
        }
        // show row's checking final information: 
        if (mistakes.length > 0) {
            console.log(`row ${i}: FAILED >> mistakes: ${mistakes}`);
        }
        else {
            console.log(`row ${i}: PASSED`);
        }
        // reset everything:
        list = [];
        mistakes = [];
        blacklist.clear();
    }

    // check every boxes:
    console.log("\ncheck boxes:")
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < 3; i++) {
                    const checkCol = x * 3 + i;
                    const checkRow = y * 3 + j;
                    const checkValue = sudokuValues_solved[checkRow][checkCol];
                    // search in the list, if it was repeated:
                    blacklist.array = list;
                    if (blacklist.check(checkValue)) {
                        // search in the mistakes, if it wasn't there, add it:
                        blacklist.array = mistakes;
                        if (!blacklist.check(checkValue)) {
                            mistakes.push(checkValue);
                        }
                        // sudoku isn't complete :( we found an error:
                        errorFound = true;
                    }
                    else {
                        // add value into list:
                        list.push(checkValue);
                    }
                }
            }
            // show row's checking final information: 
            if (mistakes.length > 0) {
                console.log(`box (${x}, ${y}): FAILED >> mistakes: ${mistakes}`);
            }
            else {
                console.log(`box (${x}, ${y}): PASSED`);
            }
            // reset everything:
            list = [];
            mistakes = [];
            blacklist.clear();
        }
    }

    drawDashedLine();
    console.log(`completation state: ${!errorFound}`);
    drawDashedLine();
    return errorFound;
}

// MAIN
window.onload = function () {
    setSudokuTable();
    generateSudokuTable();
    updateSudokuTable();
    checkSudokuTable();

}

document.addEventListener("keydown", function (event) {
    if (event.key === "w") {
    }
})