// Toggle dark mode for all sections
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.querySelectorAll('header, section, footer, button, input, select, .alert-box, .matrix-wrapper, #operation-buttons, #results-container').forEach(el => {
        el.classList.toggle('dark-mode');
    });

    // Toggle the icon inside the button
    const icon = document.querySelector('#toggle-dark-mode i');
    if (icon.classList.contains('fa-moon')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Example usage: Add an event listener to the dark mode toggle button
document.getElementById('toggle-dark-mode').addEventListener('click', toggleDarkMode);
// Add event listeners to the dropdowns to generate matrices on change
document.getElementById('rowsA').addEventListener('change', generateMatrices);
document.getElementById('colsA').addEventListener('change', generateMatrices);
document.getElementById('rowsB').addEventListener('change', generateMatrices);
document.getElementById('colsB').addEventListener('change', generateMatrices);

// Function to generate matrices based on user input for rows and columns
function generateMatrices() {
    // Get the number of rows and columns for Matrix A and Matrix B from the dropdowns
    const rowsA = parseInt(document.getElementById('rowsA').value);
    const colsA = parseInt(document.getElementById('colsA').value);
    const rowsB = parseInt(document.getElementById('rowsB').value);
    const colsB = parseInt(document.getElementById('colsB').value);

    // Generate the input fields for Matrix A and Matrix B
    generateMatrix('matrixA', rowsA, colsA);
    generateMatrix('matrixB', rowsB, colsB);
}

function playSound() {
    const audio = new Audio('click.wav'); // Create a new audio object for each click
    audio.volume = 1.0; // Set volume (optional)
    audio.play().catch(error => {
        console.error("Audio playback failed:", error);
    });
}

function restrictToNumbers(event) {
    // Allow numbers, backspace, delete, tab, enter, and arrow keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const currentValue = event.target.value;
    // Allow only one decimal point
    if (event.key === '.' && currentValue.includes('.')) {
        event.preventDefault();
        return;
    }
    // Allow the negative sign only at the beginning and only once
    if (event.key === '-') {
        // Prevent if '-' is not at the beginning or already exists
        if (currentValue.includes('-') || event.target.selectionStart !== 0) {
            event.preventDefault();
        }
        return;
    }
    // Allow digits, decimal point, and negative sign only
    if (!/^[\d.]$/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault();
    }
}

function generateMatrix(containerId, rows, cols) {
    // Get the container element for the matrix
    const container = document.getElementById(containerId);
    // Clear any existing content in the container
    container.innerHTML = '';
    // Create a table element to hold the matrix input fields
    const table = document.createElement('table');
    for (let i = 0; i < rows; i++) {
        // Create a row for each row in the matrix
        const row = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            // Create a cell for each column in the matrix
            const cell = document.createElement('td');
            // Create an input field for each cell in the matrix
            const input = document.createElement('input');
            input.type = 'text'; // Change to text to allow custom validation
            input.value = 0;
            // Add data attributes to store the row and column indices
            input.dataset.row = i;
            input.dataset.col = j;
            // Add the event listener to restrict input
            input.addEventListener('keydown', restrictToNumbers);
            // Append the input field to the cell
            cell.appendChild(input);
            // Append the cell to the row
            row.appendChild(cell);
        }
        // Append the row to the table
        table.appendChild(row);
    }
    // Append the table to the container
    container.appendChild(table);
}

// Function to get the values from the matrix input fields
function getMatrixValues(containerId) {
    // Get the container element for the matrix
    const container = document.getElementById(containerId);
    // Get all the rows in the matrix
    const rows = container.getElementsByTagName('tr');
    const matrix = [];
    for (let i = 0; i < rows.length; i++) {
        // Get all the cells in the row
        const cells = rows[i].getElementsByTagName('td');
        const row = [];
        for (let j = 0; j < cells.length; j++) {
            // Get the value from the input field in the cell
            const value = parseFloat(cells[j].getElementsByTagName('input')[0].value);
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

// Function to perform matrix operations
function performOperation(operation) {
    const matrixA = getMatrixValues('matrixA');
    const matrixB = getMatrixValues('matrixB');
    let result;
    if (operation === 'add' || operation === 'subtract') {
        if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
            showAlert('Matrices must have the same dimensions for addition or subtraction.');
            return;
        }
        result = matrixA.map((row, i) => row.map((val, j) => operation === 'add' ? val + matrixB[i][j] : val - matrixB[i][j]));
    } else if (operation === 'multiply') {
        if (matrixA[0].length !== matrixB.length) {
            showAlert('Number of columns in Matrix A must equal number of rows in Matrix B for multiplication.');
            return;
        }
        result = Array(matrixA.length).fill().map(() => Array(matrixB[0].length).fill(0));
        for (let i = 0; i < matrixA.length; i++) {
            for (let j = 0; j < matrixB[0].length; j++) {
                for (let k = 0; k < matrixA[0].length; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
    } else if (operation === 'transposeA') {
        result = transposeMatrix(matrixA);
    } else if (operation === 'transposeB') {
        result = transposeMatrix(matrixB);
    } else if (operation === 'determinantA') {
        if (matrixA.length !== matrixA[0].length) {
            showAlert('Matrix A must be square to compute the determinant.');
            return;
        }
        result = determinant(matrixA);
        displayDeterminant(result, 'Matrix A');
        return;
    } else if (operation === 'determinantB') {
        if (matrixB.length !== matrixB[0].length) {
            showAlert('Matrix B must be square to compute the determinant.');
            return;
        }
        result = determinant(matrixB);
        displayDeterminant(result, 'Matrix B');
        return;
    } else if (operation === 'inverseA') {
        if (matrixA.length !== matrixA[0].length) {
            showAlert('Matrix A must be square to compute the inverse.');
            return;
        }
        result = inverse(matrixA);
        displayResult(result);
        return;
    } else if (operation === 'inverseB') {
        if (matrixB.length !== matrixB[0].length) {
            showAlert('Matrix B must be square to compute the inverse.');
            return;
        }
        result = inverse(matrixB);
        displayResult(result);
        return;
    }
    displayResult(result);
}

// Function to transpose a matrix
function transposeMatrix(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Function to calculate the determinant of a matrix
function determinant(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    let det = 0;
    for (let i = 0; i < n; i++) {
        const subMatrix = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
        det += matrix[0][i] * determinant(subMatrix) * (i % 2 === 0 ? 1 : -1);
    }
    return det;

}
// Function to calculate the inverse of a matrix
function inverse(matrix) {
    const n = matrix.length;
    const det = determinant(matrix);
    if (det === 0) {
        showAlert('Matrix is not invertible.');
        return null;
    }
    if (n === 1) return [[1 / matrix[0][0]]];
    const adjugate = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const subMatrix = matrix.slice(0, i).concat(matrix.slice(i + 1)).map(row => row.slice(0, j).concat(row.slice(j + 1)));
            adjugate[j][i] = determinant(subMatrix) * ((i + j) % 2 === 0 ? 1 : -1);
        }
    }
    return adjugate.map(row => row.map(val => Math.round((val / det) * 100) / 100));
}

// Function to display the result matrix
function displayResult(result) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';
    const table = document.createElement('table');
    for (let i = 0; i < result.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < result[i].length; j++) {
            const cell = document.createElement('td');
            cell.textContent = result[i][j];
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    resultsContainer.appendChild(table);
}

// Function to display the determinant result
function displayDeterminant(result, matrixName) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `${matrixName} Determinant: ${result}`;
}

// Function to convert a matrix to Row Reduced Echelon Form (RREF)
function rref(matrix) {
    const rowCount = matrix.length;
    const colCount = matrix[0].length;
    let lead = 0;
    for (let r = 0; r < rowCount; r++) {
        if (lead >= colCount) {
            return matrix;
        }
        let i = r;
        while (matrix[i][lead] === 0) {
            i++;
            if (i === rowCount) {
                i = r;
                lead++;
                if (lead === colCount) {
                    return matrix;
                }
            }
        }
        // Swap rows i and r
        [matrix[i], matrix[r]] = [matrix[r], matrix[i]];
        // Divide row r by matrix[r][lead]
        const val = matrix[r][lead];
        matrix[r] = matrix[r].map(x => x / val);
        // Subtract multiples of row r from all other rows
        for (let i = 0; i < rowCount; i++) {
            if (i !== r) {
                const val = matrix[i][lead];
                matrix[i] = matrix[i].map((x, j) => x - val * matrix[r][j]);
            }
        }
        lead++;
    }
    return matrix.map(row => row.map(val => Math.round(val * 100) / 100)); // Round to two decimal places
}

function showAlert(message) {
    // Check if an existing alert box is already displayed
    const existingAlert = document.querySelector('.alert-box');
    if (existingAlert) {
        existingAlert.remove(); // Remove the existing alert box
    }

    // Create a new alert box
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box show';
    alertBox.innerHTML = `
        <h2 class="alert-title">Error</h2>
        <p>${message}</p>
        <button class="close-btn">Close</button>
    `;
    // Add event listener to the close button
    alertBox.querySelector('.close-btn').addEventListener('click', () => {
        playSound(); // Play the click sound
        alertBox.remove(); // Remove the alert box when the close button is clicked
    });

    // Append the new alert box to the body
    document.body.appendChild(alertBox);
}

// Function to fill matrix with predefined values
function fillMatrix(containerId, type) {
    const rows = parseInt(document.getElementById(`rows${containerId.charAt(containerId.length - 1)}`).value);
    const cols = parseInt(document.getElementById(`cols${containerId.charAt(containerId.length - 1)}`).value);
    const container = document.getElementById(containerId);
    const inputs = container.getElementsByTagName('input');
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = inputs[i * cols + j];
            if (type === 'identity') {
                input.value = (i === j) ? 1 : 0;
            } else if (type === 'zero') {
                input.value = 0;
            } else if (type === 'random') {
                input.value = Math.floor(Math.random() * 10); // Random number between 0 and 9
            }
        }
    }
}

// Add event listeners to the predefined matrix buttons
document.getElementById('identity-matrixA').addEventListener('click', () => {
    playSound();
    fillMatrix('matrixA', 'identity');
});
document.getElementById('zero-matrixA').addEventListener('click', () => {
    playSound();
    fillMatrix('matrixA', 'zero');
});
document.getElementById('random-matrixA').addEventListener('click', () => {
    playSound();
    fillMatrix('matrixA', 'random');
});
document.getElementById('identity-matrixB').addEventListener('click', () => {
    playSound();
    fillMatrix('matrixB', 'identity');
});
document.getElementById('zero-matrixB').addEventListener('click', () => {
    playSound();
    fillMatrix('matrixB', 'zero');
});
document.getElementById('random-matrixB').addEventListener('click', () => {
    playSound();
    fillMatrix('matrixB', 'random');
});
// Add event listeners to the operation buttons
document.getElementById('add-matrices').addEventListener('click', () => {
    playSound();
    performOperation('add');
});
document.getElementById('subtract-matrices').addEventListener('click', () => {
    playSound();
    performOperation('subtract');
});
document.getElementById('multiply-matrices').addEventListener('click', () => {
    playSound();
    performOperation('multiply');
});
document.getElementById('transpose-matrixA').addEventListener('click', () => {
    playSound();
    performOperation('transposeA');
});
document.getElementById('transpose-matrixB').addEventListener('click', () => {
    playSound();
    performOperation('transposeB');
});
document.getElementById('determinant-matrixA').addEventListener('click', () => {
    playSound();
    performOperation('determinantA');
});
document.getElementById('determinant-matrixB').addEventListener('click', () => {
    playSound();
    performOperation('determinantB');
});
document.getElementById('inverse-matrixA').addEventListener('click', () => {
    playSound();
    performOperation('inverseA');
});
document.getElementById('inverse-matrixB').addEventListener('click', () => {
    playSound();
    performOperation('inverseB');
});
document.getElementById('rref-matrixA').addEventListener('click', () => {
    playSound();
    const matrixA = getMatrixValues('matrixA');
    const result = rref(matrixA);
    displayResult(result);
});
document.getElementById('rref-matrixB').addEventListener('click', () => {
    playSound();
    const matrixB = getMatrixValues('matrixB');
    const result = rref(matrixB);
    displayResult(result);
});

// Initial call to generate matrices based on default dropdown values
generateMatrices();