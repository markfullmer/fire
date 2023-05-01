/*
This code is licensed under GPL-3.0.

Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license.

Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
*/
function set() {
  const urlParams = new URLSearchParams(window.location.search);
  var currentAge = urlParams.get('currentAge') ?? 30;
  var partTimeYears = urlParams.get('partTimeYears') ?? 0;
  var fireAge = urlParams.get('fireAge') ?? 45;
  var nestEgg = urlParams.get('nestEgg') ?? 150000;
  var expenses = urlParams.get('expenses') ?? 36000;
  var returnRate = urlParams.get('returnRate') ?? 7.5;
  var retireReturnRate = urlParams.get('retireReturnRate') ?? 5;
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
  document.getElementById("retireReturnRate").value = retireReturnRate;
  document.getElementById("retireReturnRateDisplay").innerHTML = retireReturnRate;
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
    retireReturnRate: document.getElementById("retireReturnRate").value,
    salaryIncrease: document.getElementById("salaryIncrease").checked,
  });
  var url = window.location.origin + '?' + params.toString();
  document.getElementById("shareUrl").innerHTML = '<a href="' + url + '">' + url + '</a>';
}

function calculateContribution(currentAge, partTimeYears, fireAge, nestEgg, returnRate, retireReturnRate, expenses, salaryIncrease) {
  var preSocial = 65 - fireAge;
  var fullTimeYears = Number(fireAge - partTimeYears - currentAge);
  var balance = Number(nestEgg);
  var contribution = 0;
  var partTimeContribution = 0;
  var breakeven = false;
  var returnRate = returnRate / 100;
  var retireReturnRate = retireReturnRate / 100;
  var currentYear = new Date().getFullYear();
  let medianExpenses = expenses * 1.2;
  let startingExpenses = expenses;
  let fullTimeTable = [];
  let partTimeTable = [];
  let preSocialTable = [];
  let socialTable = [];
  var catcher = 0;
  while (breakeven == false) {
    balance = Number(nestEgg);
    expenses = startingExpenses;
    if (catcher > 100) {
      // Something went wrong. Avoid infinite loop.
      breakeven = true;
    }
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
      let row = new Map();
      row.set('year', currentYear);
      row.set('age', Number(currentAge) + i);
      row.set('start', balance);
      row.set('contribution', adjustedContribution);
      // Calculate ROI to include 50% of the annual contribution.
      var returnOnInvestment = Math.round(Number((balance + adjustedContribution / 2) * returnRate));
      row.set('return', returnOnInvestment);
      row.set('withdrawal', 0);
      balance = Number(returnOnInvestment + balance + adjustedContribution);
      row.set('balance', Math.round(balance));
      fullTimeTable.push(row);
      currentYear++;
      adjustedContribution = adjustedContribution + increase;
    }
    if (partTimeYears > 0) {
      for (let j = 1; j <= partTimeYears; j++) {
        let row = new Map();
        row.set('year', currentYear);
        row.set('age', Number(currentAge) + Number(fullTimeYears) + j);
        row.set('start', balance);
        row.set('contribution', partTimeContribution);
        // Calculate ROI to include 50% of the annual contribution.
        var returnOnInvestment = Number(Math.round((balance + partTimeContribution / 2) * returnRate));
        row.set('return', returnOnInvestment);
        row.set('withdrawal', 0);
        balance = returnOnInvestment + balance + partTimeContribution;
        row.set('balance', Math.round(balance));
        partTimeTable.push(row);
        currentYear++;
      }
    }

    // Calculate post-retirement, pre-Social Security period
    for (let i = 1; i <= preSocial; i++) {
      let row = new Map();
      row.set('year', currentYear);
      row.set('age', Number(fireAge) + i);
      row.set('start', balance);
      row.set('contribution', 0);
      var returnOnInvestment = Number(Math.round((balance - expenses) * retireReturnRate));
      row.set('return', returnOnInvestment);
      row.set('withdrawal', expenses);
      balance = balance + returnOnInvestment - expenses;
      row.set('balance', Math.round(balance));
      preSocialTable.push(row);
      // Calculate expenses based on 2% inflation.
      expenses = expenses * 1.02;
      currentYear++;
    }

    // Calculate Social Security period.
    let sscontribution = Number(Math.round(expenses / 3));
    for (let i = 66; i <= 90; i++) {
      let row = new Map();
      row.set('year', currentYear);
      row.set('age', i);
      row.set('start', balance);
      row.set('contribution', sscontribution);
      // Calculate ROI to include 50% of annual contribution, minus expenses.
      var returnOnInvestment = Number(Math.round((balance - expenses + sscontribution / 2) * retireReturnRate));
      row.set('return', returnOnInvestment);
      row.set('withdrawal', expenses);
      balance = balance + returnOnInvestment - expenses + sscontribution;
      row.set('balance', Math.round(balance));
      socialTable.push(row);
      // Calculate expenses based on 2% inflation.
      expenses = expenses * 1.02;
      currentYear++;
    }
    if (balance > 0) {
      breakeven = true;
      let table = new Map();
      table.set('fullTime', fullTimeTable);
      table.set('partTime', partTimeTable);
      table.set('preSocial', preSocialTable);
      table.set('social', socialTable)
      return table;
    }
    else {
      contribution = contribution + 1000;
      partTimeContribution = contribution / 3;
      catcher++;
      table = new Map();
    }
  }
}

function generateTable(list, title, returnRate) {
  var table = document.createElement("table");
  if (list.length == 0) {
    return table;
  }
  table.setAttribute("class", "chart");
  table.innerHTML = '<caption>' + title + '</caption>';
  var tr = table.insertRow(-1);
  var header = ['Year', 'Age', 'Starting balance', 'Return (' + returnRate + '%)', 'Contribution', 'Withdrawal', 'Ending balance'];
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

    var start = trow.insertCell(-1);
    start.innerHTML = '$' + Number(Math.round(list[i].get('start'))).toLocaleString();

    var returnOnInvestment = trow.insertCell(-1);
    returnOnInvestment.innerHTML = '$' + Number(Math.round(list[i].get('return'))).toLocaleString();

    var contribution = trow.insertCell(-1);
    contribution.innerHTML = '$' + Number(Math.round(list[i].get('contribution'))).toLocaleString() + ' ($' + Number(Math.round(list[i].get('contribution') / 12)).toLocaleString() + ' monthly)';

    var withdrawal = trow.insertCell(-1);
    withdrawal.innerHTML = '$' + Number(Math.round(list[i].get('withdrawal'))).toLocaleString();

    var balance = trow.insertCell(-1);
    balance.innerHTML = '$' + Number(Math.round(list[i].get('balance'))).toLocaleString();
  }
  return table;
}

function generateChart(data) {
  var el = document.getElementById("chart");
  el.innerHTML = "";
  var chartData = [];
  console.log(data);
  if (typeof data !== 'undefined') {
  var fullTime = data.get('fullTime');
  for (var i = 0; i < fullTime.length; i++) {
    chartData.push({ x: fullTime[i].get('year'), y: fullTime[i].get('balance'), color: "green" });
  }
  var partTime = data.get('partTime');
  for (var i = 0; i < partTime.length; i++) {
    chartData.push({ x: partTime[i].get('year'), y: partTime[i].get('balance'), color: "blue" });
  }
  var preSocial = data.get('preSocial');
  for (var i = 0; i < preSocial.length; i++) {
    chartData.push({ x: preSocial[i].get('year'), y: preSocial[i].get('balance'), color: "red" });
  }
  var social = data.get('social');
  for (var i = 0; i < social.length; i++) {
    chartData.push({ x: social[i].get('year'), y: social[i].get('balance') });
  }
  var chart = new CanvasJS.Chart("chart", {
    animationEnabled: true,
    theme: "light2",
    axisX: {
      valueFormatString: '#'
    },
    data: [{
      type: "line",
      indexLabelFontSize: 16,
      dataPoints: chartData,
    }]
  });
  chart.render();
  }

}

function fire() {
  var currentAge = document.getElementById('currentAge').value;
  var partTimeYears = document.getElementById('partTimeYears').value;
  var fireAge = document.getElementById("fireAge").value;
  var nestEgg = document.getElementById('nestEgg').value;
  var expenses = document.getElementById('expenses').value;
  var returnRate = document.getElementById('returnRate').value;
  var retireReturnRate = document.getElementById('retireReturnRate').value;
  var salaryIncrease = document.getElementById('salaryIncrease').checked;
  // Output.
  var data = calculateContribution(currentAge, partTimeYears, fireAge, nestEgg, returnRate, retireReturnRate, expenses, salaryIncrease);
  if (typeof data == 'undefined') {
    return;
  }
  generateChart(data);
  var fullTime = generateTable(data.get('fullTime'), 'Full-time phase', returnRate);
  var el = document.getElementById("fullTime");
  el.innerHTML = "";
  el.appendChild(fullTime);
  var partTime = generateTable(data.get('partTime'), 'Part-time phase', returnRate);
  var el = document.getElementById("partTime");
  el.innerHTML = "";
  el.appendChild(partTime);
  var preSocial = generateTable(data.get('preSocial'), 'Pre-Social Security phase', retireReturnRate);
  var el = document.getElementById("preSocial");
  el.innerHTML = "";
  el.appendChild(preSocial);
  var social = generateTable(data.get('social'), 'Social Security phase', retireReturnRate);
  var el = document.getElementById("social");
  el.innerHTML = "";
  el.appendChild(social);

  var fullTimeContributionDisplay = 0;
  if (data.get('fullTime')[0]) {
    fullTimeContributionDisplay = Number(Math.round(data.get('fullTime')[0].get('contribution') / 12)).toLocaleString()
  }
  document.getElementById("contribution").innerHTML = '$' + fullTimeContributionDisplay;

  var partTimeContributionDisplay = 0;
  if (data.get('partTime')[0]) {
    partTimeContributionDisplay = Number(Math.round(data.get('partTime')[0].get('contribution') / 12)).toLocaleString()
  }
  document.getElementById("partTimeContribution").innerHTML = '$' + partTimeContributionDisplay;

  // Update displays.
  document.getElementById("currentAgeDisplay").innerHTML = currentAge;
  document.getElementById("partTimeYearsDisplay").innerHTML = partTimeYears;
  document.getElementById("fireAgeDisplay").innerHTML = fireAge;
  document.getElementById("nestEggDisplay").innerHTML = '$' + Number(nestEgg).toLocaleString();
  document.getElementById("expensesDisplay").innerHTML = '$' + Number(expenses).toLocaleString();
  document.getElementById("returnRateDisplay").innerHTML = returnRate + '%';
  document.getElementById("retireReturnRateDisplay").innerHTML = retireReturnRate + '%';
}
