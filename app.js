var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    
    Expense.prototype.calcPrcntg = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    
    Expense.prototype.getPrcntg = function() {
        return this.percentage;
    };
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var getTotal = function(type) {
        var sum = 0;
        dataAll.globalVal[type].forEach(function(cur) {
            sum += cur.value;
        });
        dataAll.totals[type] = sum;
    };
    
    
    var dataAll = {
        globalVal: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            if (dataAll.globalVal[type].length > 0) {
                ID = dataAll.globalVal[type][dataAll.globalVal[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            dataAll.globalVal[type].push(newItem);

            return newItem;
        },
        
        
        deleteItem: function(type, id) {
            var ids, index;

            ids = dataAll.globalVal[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                dataAll.globalVal[type].splice(index, 1);
            }
            
        },
        
        
        calculateBudget: function() {
            getTotal('exp');
            getTotal('inc');
            
            dataAll.budget = dataAll.totals.inc - dataAll.totals.exp;
            
            if (dataAll.totals.inc > 0) {
                dataAll.percentage = Math.round((dataAll.totals.exp / dataAll.totals.inc) * 100);
            } else {
                dataAll.percentage = -1;
            }                       
        },
        
        calcPrcntg: function() {
                       
            dataAll.globalVal.exp.forEach(function(cur) {
               cur.calcPrcntg(dataAll.totals.inc);
            });
        },
        
        
        getPrcntgs: function() {
            var allPerc = dataAll.globalVal.exp.map(function(cur) {
                return cur.getPrcntg();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: dataAll.budget,
                totalInc: dataAll.totals.inc,
                totalExp: dataAll.totals.exp,
                percentage: dataAll.percentage
            };
        },
        
        testing: function() {
            console.log(dataAll);
        }
    };
    
})();


var InterfaceController = (function() {
    
    var DOMarray = {
        budgetType: '.addType',
        budgetDescription: '.budgetDesc',
        budgetValue: '.budgetVal',
        actionButton: '.budgetBtn',
        incomeCont: '.incomeArray',
        expensesCont: '.expensesArray',
        sumLabel: '.moneyTotal',
        incomeLabel: '.moneyIncome--value',
        expensesLabel: '.moneyExpenses--value',
        percentageLabel: '.moneyExpenses--percentage',
        container: '.container',
        expensesPercLabel: '.percentageBox',
        dateLabel: '.mainTitle--month'
    };
    
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
    
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMarray.budgetType).value,
                description: document.querySelector(DOMarray.budgetDescription).value,
                value: parseFloat(document.querySelector(DOMarray.budgetValue).value)
            };
        },
        
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
           
            
            if (type === 'inc') {
                element = DOMarray.incomeCont;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="itemDesc">%description%</div><div class="right clearfix"><div class="itemVal">%value%</div><div class="removeBtn"><button class="removeBtn--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMarray.expensesCont;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="itemDesc">%description%</div><div class="right clearfix"><div class="itemVal">%value%</div><div class="percentageBox">21%</div><div class="removeBtn"><button class="removeBtn--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMarray.budgetDescription + ', ' + DOMarray.budgetValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMarray.sumLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMarray.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMarray.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMarray.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMarray.percentageLabel).textContent = '---';
            }
            
        },
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMarray.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMarray.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMarray.budgetType + ',' +
                DOMarray.budgetDescription + ',' +
                DOMarray.budgetValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMarray.actionButton).classList.toggle('red');
            
        },
        
        
        getDOMarray: function() {
            return DOMarray;
        }
    };
    
})();


var controller = (function(budgetCtrl, InterfaceCtrl) {
    
    var setupEventListeners = function() {
        var DOM = InterfaceCtrl.getDOMarray();
        
        document.querySelector(DOM.actionButton).addEventListener('click', addNewItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                addNewItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', deleteItem);
        
        document.querySelector(DOM.budgetType).addEventListener('change', InterfaceCtrl.changedType);        
    };
    
    
    var updateBudget = function() {
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        InterfaceCtrl.displayBudget(budget);
    };
    
    
    var updatePercentages = function() {   
        budgetCtrl.calcPrcntg();
        var percentages = budgetCtrl.getPrcntgs();
        InterfaceCtrl.displayPercentages(percentages);
    };
    
    
    var addNewItem = function() {
        var input, newItem;
        
        input = InterfaceCtrl.getInput();        
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            InterfaceCtrl.addListItem(newItem, input.type);
            InterfaceCtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };
    
    
    var deleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);
            
            InterfaceCtrl.deleteListItem(itemID);
            
            updateBudget();
            
            updatePercentages();
        }
    };
    
    
    return {
        init: function() {
            InterfaceCtrl.displayMonth();
            InterfaceCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, InterfaceController);


controller.init();