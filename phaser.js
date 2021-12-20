function set() {
  var currentAge = 30;
  var partTimeYears = 5;
  var fireAge = 45;
  var nestEgg = 150000;
  var expenses = 40000;
  var returnRate = 7.5;

  document.getElementById("currentAge").value = currentAge;
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("partTimeYears").value = partTimeYears;
  document.getElementById("partTimeYearsDisplay").innerHTML = partTimeYears;
  document.getElementById("fireAge").value = fireAge;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("nestEgg").value = nestEgg;
  document.getElementById("nestEggDisplay").innerHTML = '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expenses").value = expenses;
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRate").value = returnRate;
  document.getElementById("returnRateDisplay").innerHTML = returnRate;
  fire();
}

function calculateContribution(currentAge, partTimeYears, fireAge, nestEgg, returnRate, expenses) {
  var preSocial = 65 - fireAge;
  var fullTimeYears = Number(fireAge - partTimeYears - currentAge);
  var balance = Number(nestEgg);
  var contribution = 0 * 12;
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
    for (let i = 0; i <= fullTimeYears; i++) {
      balance = Number((balance * returnRate) + balance + contribution);
      let row = new Map();
      row.set('year', currentYear);
      row.set('age', Number(currentAge) + i);
      row.set('balance', balance);
      row.set('contribution', contribution);
      row.set('withdrawal', 0);
      fullTimeTable.push(row);
      currentYear++;
    }
    if (partTimeYears > 0) {
      for (let j = 1; j <= partTimeYears; j++) {
        balance = (balance * returnRate) + balance + partTimeContribution;
        let row = new Map();
        row.set('year', currentYear);
        row.set('age', Number(currentAge) + Number(fullTimeYears) + j);
        row.set('balance', balance);
        row.set('contribution', partTimeContribution);
        row.set('withdrawal', 0);
        partTimeTable.push(row);
        currentYear++;
      }
    }
    let returnOnInvestment = balance * returnRate;
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
    balance = (balance + (balance * returnRate) - expenses);
    let row = new Map();
    row.set('year', currentYear);
    row.set('age', Number(fireAge) + i);
    row.set('balance', balance);
    row.set('contribution', 0);
    row.set('withdrawal', expenses);
    preSocialTable.push(row);
    // Calculate expenses based on 2% inflation.
    expenses = expenses * 1.02;
    currentYear++;
  }
  // Show Social Security period.
  contribution = expenses / 3;
  for (let i = 66; i <= 90; i++) {
    balance = (balance + (balance * returnRate) - expenses + contribution);
    let row = new Map();
    row.set('year', currentYear);
    row.set('age', i);
    row.set('balance', balance);
    row.set('contribution', contribution);
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

function generateTable(list, title) {
  var table = document.createElement("table");
  table.setAttribute("class", "chart");
  table.innerHTML = '<caption>' + title + '</caption>';
  var tr = table.insertRow(-1);
  var header = ['Year', 'Age', 'Balance', 'Contribution', 'Withdrawal'];
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
    var contribution = trow.insertCell(-1);
    contribution.innerHTML = '$' + Number(Math.round(list[i].get('contribution'))).toLocaleString();
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

  // Output.
  var data = calculateContribution(currentAge, partTimeYears, fireAge, nestEgg, returnRate, expenses);
  if (data.get('fullTime').length !== 0) {
    var fullTime = generateTable(data.get('fullTime'), 'Full-time phase');
    var el = document.getElementById("fullTime");
    el.innerHTML = "";
    el.appendChild(fullTime);
  }
  if (data.get('partTime').length !== 0) {
    var partTime = generateTable(data.get('partTime'), 'Part-time phase');
    var el = document.getElementById("partTime");
    el.innerHTML = "";
    el.appendChild(partTime);
  }
  if (data.get('preSocial').length !== 0) {
    var preSocial = generateTable(data.get('preSocial'), 'Pre-Social Security phase');
    var el = document.getElementById("preSocial");
    el.innerHTML = "";
    el.appendChild(preSocial);
  }
  if (data.get('social').length !== 0) {
    var social = generateTable(data.get('social'), 'Social Security phase');
    var el = document.getElementById("social");
    el.innerHTML = "";
    el.appendChild(social);
  }
  document.getElementById("contribution").innerHTML = '$' + Number(data.get('fullTime')[0].get('contribution') / 12).toLocaleString();

  // Update displays.
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("partTimeYearsDisplay").innerHTML = partTimeYears;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("nestEggDisplay").innerHTML =  '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRateDisplay").innerHTML = returnRate + '%';
}

