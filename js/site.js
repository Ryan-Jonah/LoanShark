//Helper Functions
let $ = function(id){
    return document.getElementById(id);
}

let USD = function(num){
    return num.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
}

/**
 * Controller Function
 * Gather form data
 */
function gatherInput(){

    //User Input
    let loanAmount       = parseInt($('inputLoanAmount').value);   //Principal Amount
    let numberOfPayments = parseInt($('inputLoanPayments').value); //Number of Months
    let loanRate         = parseInt($('inputLoanRate').value);     //Interest Rate

    //array of result objects for each individual month
    let statements = [];

    //Validation
    if (Number.isInteger(loanAmount) && Number.isInteger(numberOfPayments) 
        && Number.isInteger(loanRate)){

            //generate statements array containg an object for each month
            let statements = generateReport(loanAmount, numberOfPayments, loanRate);

            //View function
            displayResults(statements);

        } else alert('Invalid Input');
}

/**
 * Logic Functions
 * Calculate prices and rates, then return a array of objects 
 * containing payment statemens for each month
 */
function generateReport(loanAmount, numberOfPayments, interestRate){

    //Results array used to contain statements for each individual month
    let monthlyStatements = [];

    //Used in for loop to determine previous statement's balance
    let previousRemainingBalance = loanAmount;

    for (let index = 0; index < numberOfPayments; index++) {
        //Statement object used for holding calculation results for current idividual month
        let statement = {};

        //Feeding calculations into statement object 
        statement.totalMonthlyPayment = (loanAmount) * (interestRate/1200) / (1 - (1 + interestRate/1200)**(-Math.abs(numberOfPayments)));
        statement.interestPayment = previousRemainingBalance * (interestRate/1200)
        statement.principalPayment = statement.totalMonthlyPayment - statement.interestPayment;
        statement.remainingBalance = previousRemainingBalance - statement.principalPayment;

        //Push results into monthly statements array
        monthlyStatements.push(statement);

        //Adjust previous payment for the next iteration
        previousRemainingBalance = statement.remainingBalance;
    }

    return monthlyStatements;
}


/**
 * View Functio
 * Post overview results + detail table
 */
function displayResults(statements){

    //Gather HTML
    let tableBody    = $('tableResults');
    let templateHead = $('headTemplate');
    let templateRow  = $('rowTemplate');

    //Clear HTML
    tableBody.innerHTML = '';

    //Generate total amounts
    let totalPrincipal = 0;
    let totalInterest  = 0;

    for (let index = 0; index < statements.length; index++) {
        totalPrincipal += statements[index].principalPayment;
        totalInterest += statements[index].interestPayment;
    }

    let totalCost = totalPrincipal + totalInterest;

    //Convert results to currency and display on page
    $('totalMonthlyPayment').innerHTML  = USD(statements[0].totalMonthlyPayment);
    $('totalPrincipalResult').innerHTML = USD(totalPrincipal);
    $('totalInterestResult').innerHTML  = USD(totalInterest);
    $('totalCostResult').innerHTML      = USD(totalCost);

    //Generate table head 
    let tableHead = document.importNode(templateHead.content, true);
    let headCols = tableHead.querySelectorAll("th");

    headCols[0].textContent = 'Month';
    headCols[1].textContent = 'Payment';
    headCols[2].textContent = 'Principal';
    headCols[3].textContent = 'Interest';
    headCols[4].textContent = 'Total Interest';
    headCols[5].textContent = 'Balance';

    tableBody.appendChild(tableHead);

    //Generate table Body
    tableBody.innerHTML += "<tbody>";

    //Reset to calculate each monthly total
    totalInterest = 0;

    //Create each table row using objects created in generateReport()
    for (let index = 0; index < statements.length; index++) {
        totalInterest += statements[index].interestPayment;

        let tableRow = document.importNode(templateRow.content, true);

        let rowCols = tableRow.querySelectorAll("td");

        rowCols[0].textContent = index+1; //Current Month accounting for 0 index
        rowCols[1].textContent = USD(statements[index].totalMonthlyPayment);
        rowCols[2].textContent = USD(statements[index].principalPayment);
        rowCols[3].textContent = USD(statements[index].interestPayment);
        rowCols[4].textContent = USD(totalInterest);
        rowCols[5].textContent = USD(statements[index].remainingBalance);

        tableBody.appendChild(tableRow);
    }
    tableBody.innerHTML += "<tbody>";
}