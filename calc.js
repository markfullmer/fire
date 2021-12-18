function set() {
  var fireAge = 45;
  var currentAge = 30;
  var nestEgg = 150000;
  var expenses = 40000;
  var returnRate = 7.5;
  document.getElementById("fireAge").value = fireAge;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("currentAge").value = currentAge;
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("nestEgg").value = nestEgg;
  document.getElementById("nestEggDisplay").innerHTML = '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expenses").value = expenses;
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRate").value = returnRate;
  document.getElementById("returnRateDisplay").innerHTML = returnRate;
  fire();
}

function calculateContribution(currentAge, fireAge, nestEgg, returnRate, expenses) {
  var preSocial = 65 - fireAge;
  balance = nestEgg;
  contribution = 100 * 12;
  breakeven = false;
  returnRate = returnRate / 100;
  var currentYear = 2021;
  let medianExpenses = expenses * 1.25;
  let table = [];
  while (breakeven == false) {
    table = [];
    currentYear = 2021;
    for (let i = currentAge; i <= fireAge; i++) {
      balance = (balance * returnRate) + balance + contribution;
      let row = new Map();
      row.set('year', currentYear);
      row.set('age', i);
      row.set('balance', balance);
      row.set('contribution', contribution);
      row.set('withdrawal', 0);
      table.push(row);
      currentYear++;
    }
    let returnOnInvestment = balance * returnRate;
    if (returnOnInvestment > medianExpenses) {
      breakeven = true;
    }
    else {
      balance = nestEgg;
      contribution = contribution + 1000;
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
    table.push(row);

    // Calculate expenses based on 2% inflation.
    expenses = expenses * 1.02;
    currentYear++;
  }
  // Show Social Security period.
  contribution = expenses / 2;
  for (let i = 66; i <= 90; i++) {
    balance = (balance + (balance * returnRate) - expenses + contribution);
    let row = new Map();
    row.set('year', currentYear);
    row.set('age', i);
    row.set('balance', balance);
    row.set('contribution', contribution);
    row.set('withdrawal', expenses);
    table.push(row);

    // Calculate a 1% annual social security increase;
    // contribution = contribution * 1.01;
    // Calculate expenses based on 2% inflation.
    expenses = expenses * 1.02;
    currentYear++;
  }
  return table;
}

function generateTable(list) {
  var table = document.createElement("table");
  var tr = table.insertRow(-1);
  var header = ['Year', 'Your Age', 'Balance', 'Contribution', 'Withdrawal'];
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

  // Add the newly created table containing json data
  var el = document.getElementById("table");
  el.innerHTML = "";
  el.appendChild(table);
}

function fire() {
  var currentAge = parseFloat($('#currentAge').val());
  var fireAge = document.getElementById("fireAge").value;
  var nestEgg = parseFloat($('#nestEgg').val());
  var expenses = parseFloat($('#expenses').val());
  var returnRate = parseFloat($('#returnRate').val());

  // Output.
  var table = calculateContribution(currentAge, fireAge, nestEgg, returnRate, expenses);
  generateTable(table);
  document.getElementById("contribution").innerHTML = '$' + Number(table[0].get('contribution') / 12).toLocaleString();
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("nestEggDisplay").innerHTML =  '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRateDisplay").innerHTML = returnRate + '%';
}

