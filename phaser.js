/* 
This code is licensed under GPL-3.0.

Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. 

Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
*/
function set() {
  const urlParams = new URLSearchParams(window.location.search);
  var currentAge = urlParams.get('currentAge') ?? 30;
  var partTimeYears = urlParams.get('partTimeYears') ?? 5;
  var fireAge = urlParams.get('fireAge') ?? 45;
  var nestEgg = urlParams.get('nestEgg') ?? 150000;
  var expenses = urlParams.get('expenses') ?? 40000;
  var returnRate = urlParams.get('returnRate') ?? 7.5;
  var salaryIncrease = urlParams.get('salaryIncrease') === 'true' ? true : false;

  document.getElementById("currentAge").value = currentAge;
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("partTimeYears").value = partTimeYears;
  document.getElementById("partTimeYearsDisplay").innerHTML = partTimeYears;
  document.getElementById("fireAge").value = fireAge;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("nestEgg").value = nestEgg;
  document.getElementById("nestEggDisplay").innerHTML = '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expenses").value = expenses;
  document.getElementById("salaryIncrease").checked = salaryIncrease;
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRate").value = returnRate;
  document.getElementById("returnRateDisplay").innerHTML = returnRate;
  fire();
}

function shareUrl() {
  const params = new URLSearchParams({
    currentAge: document.getElementById("currentAge").value,
    partTimeYears: document.getElementById("partTimeYears").value,
    fireAge: document.getElementById("fireAge").value,
    nestEgg: document.getElementById("nestEgg").value,
    expenses: document.getElementById("expenses").value,
    returnRate: document.getElementById("returnRate").value,
    salaryIncrease: document.getElementById("salaryIncrease").checked,
  });
  var url = window.location.origin + '?' + params.toString();
  document.getElementById("shareUrl").innerHTML = '<a href="' + url + '">' + url + '</a>';
}

function calculateContribution(currentAge, partTimeYears, fireAge, nestEgg, returnRate, expenses, salaryIncrease) {
  var preSocial = 65 - fireAge;
  var fullTimeYears = Number(fireAge - partTimeYears - currentAge);
  var balance = Number(nestEgg);
  var contribution = 0;
  var partTimeContribution = 0;
  var breakeven = false;
  var returnRate = returnRate / 100;
  var currentYear = new Date().getFullYear();
  let medianExpenses = expenses * 1.25;
  let fullTimeTable = [];
  let partTimeTable = [];
  let preSocialTable = [];
  let socialTable = [];
  while (breakeven == false) {
    balance = Number(nestEgg);
    fullTimeTable = [];
    partTimeTable = [];
    preSocialTable = [];
    socialTable = [];
    currentYear = new Date().getFullYear();
    adjustedContribution = contribution;
    let increase = 0;
    if (salaryIncrease) {
      increase = contribution * 0.05;
    }
    for (let i = 0; i <= fullTimeYears; i++) {
      var returnOnInvestment = Number(Math.round(balance * returnRate));
      balance = Number(returnOnInvestment + balance + adjustedContribution);
      let row = new Map();
      row.set('year', currentYear);
      row.set('age', Number(currentAge) + i);
      row.set('balance', balance);
      row.set('contribution', adjustedContribution);
      row.set('return', returnOnInvestment);
      row.set('withdrawal', 0);
      fullTimeTable.push(row);
      currentYear++;
      adjustedContribution = adjustedContribution + increase;
    }
    if (partTimeYears > 0) {
      for (let j = 1; j <= partTimeYears; j++) {
        var returnOnInvestment = Number(Math.round(balance * returnRate));
        balance = returnOnInvestment + balance + partTimeContribution;
        let row = new Map();
        row.set('year', currentYear);
        row.set('age', Number(currentAge) + Number(fullTimeYears) + j);
        row.set('balance', balance);
        row.set('contribution', partTimeContribution);
        row.set('return', returnOnInvestment);
        row.set('withdrawal', 0);
        partTimeTable.push(row);
        currentYear++;
      }
    }
    if (returnOnInvestment > medianExpenses) {
      breakeven = true;
    }
    else {
      balance = nestEgg;
      contribution = contribution + 1000;
      partTimeContribution = contribution / 3;
    }
  }
  // Show post-retirement, pre-Social Security period
  for (let i = 1; i <= preSocial; i++) {
    var returnOnInvestment = Number(Math.round(balance * returnRate));
    balance = balance + returnOnInvestment - expenses;
    let row = new Map();
    row.set('year', currentYear);
    row.set('age', Number(fireAge) + i);
    row.set('balance', balance);
    row.set('contribution', 0);
    row.set('return', returnOnInvestment);
    row.set('withdrawal', expenses);
    preSocialTable.push(row);
    // Calculate expenses based on 2% inflation.
    expenses = expenses * 1.02;
    currentYear++;
  }
  // Show Social Security period.
  contribution = expenses / 3;
  for (let i = 66; i <= 90; i++) {
    var returnOnInvestment = Number(Math.round(balance * returnRate));
    balance = balance + returnOnInvestment - expenses;
    let row = new Map();
    row.set('year', currentYear);
    row.set('age', i);
    row.set('balance', balance);
    row.set('contribution', 0);
    row.set('return', returnOnInvestment);
    row.set('withdrawal', expenses);
    socialTable.push(row);

    // Calculate a 1% annual social security increase;
    // contribution = contribution * 1.01;
    // Calculate expenses based on 2% inflation.
    expenses = expenses * 1.02;
    currentYear++;
  }
  let table = new Map();
  table.set('fullTime', fullTimeTable);
  table.set('partTime', partTimeTable);
  table.set('preSocial', preSocialTable);
  table.set('social', socialTable)
  return table;
}

function generateTable(list, title, returnRate) {
  var table = document.createElement("table");
  if (list.length == 0) {
    return table;
  }
  table.setAttribute("class", "chart");
  table.innerHTML = '<caption>' + title + '</caption>';
  var tr = table.insertRow(-1);
  var header = ['Year', 'Age', 'Balance', 'Return (' + returnRate + '%)', 'Contribution', 'Withdrawal'];
  for (var i = 0; i < header.length; i++) {
    var theader = document.createElement("th");
    theader.innerHTML = header[i];
    tr.appendChild(theader);
  }
  for (var i = 0; i < list.length; i++) {
    trow = table.insertRow(-1);
    var year = trow.insertCell(-1);
    year.innerHTML = list[i].get('year');
    var age = trow.insertCell(-1);
    age.innerHTML = list[i].get('age');
    var balance = trow.insertCell(-1);
    balance.innerHTML = '$' + Number(Math.round(list[i].get('balance'))).toLocaleString();
    var returnOnInvestment = trow.insertCell(-1);
    returnOnInvestment.innerHTML = '$' + Number(Math.round(list[i].get('return'))).toLocaleString();
    var contribution = trow.insertCell(-1);
    contribution.innerHTML = '$' + Number(Math.round(list[i].get('contribution'))).toLocaleString() + ' ($' + Number(Math.round(list[i].get('contribution') /12)) + ' monthly)';
    var withdrawal = trow.insertCell(-1);
    withdrawal.innerHTML = '$' + Number(Math.round(list[i].get('withdrawal'))).toLocaleString();
  }
  return table;
}

function fire() {
  var currentAge = document.getElementById('currentAge').value;
  var partTimeYears = document.getElementById('partTimeYears').value;
  var fireAge = document.getElementById("fireAge").value;
  var nestEgg = document.getElementById('nestEgg').value;
  var expenses = document.getElementById('expenses').value;
  var returnRate = document.getElementById('returnRate').value;
  var salaryIncrease = document.getElementById('salaryIncrease').checked;
  // Output.
  var data = calculateContribution(currentAge, partTimeYears, fireAge, nestEgg, returnRate, expenses, salaryIncrease);
  var fullTime = generateTable(data.get('fullTime'), 'Full-time phase', returnRate);
  var el = document.getElementById("fullTime");
  el.innerHTML = "";
  el.appendChild(fullTime);
  var partTime = generateTable(data.get('partTime'), 'Part-time phase', returnRate);
  var el = document.getElementById("partTime");
  el.innerHTML = "";
  el.appendChild(partTime);
  var preSocial = generateTable(data.get('preSocial'), 'Pre-Social Security phase', returnRate);
  var el = document.getElementById("preSocial");
  el.innerHTML = "";
  el.appendChild(preSocial);
  var social = generateTable(data.get('social'), 'Social Security phase', returnRate);
  var el = document.getElementById("social");
  el.innerHTML = "";
  el.appendChild(social);

  var fullTimeContributionDisplay = 0;
  if (data.get('fullTime')[0]) {
    fullTimeContributionDisplay = Number(data.get('fullTime')[0].get('contribution') / 12).toLocaleString()
  }
  document.getElementById("contribution").innerHTML = '$' + fullTimeContributionDisplay;

  var partTimeContributionDisplay = 0;
  if (data.get('partTime')[0]) {
    partTimeContributionDisplay = Number(data.get('partTime')[0].get('contribution') / 12).toLocaleString()
  }
  document.getElementById("partTimeContribution").innerHTML = '$' + partTimeContributionDisplay;

  // Update displays.
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("partTimeYearsDisplay").innerHTML = partTimeYears;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("nestEggDisplay").innerHTML =  '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRateDisplay").innerHTML = returnRate + '%';
}
