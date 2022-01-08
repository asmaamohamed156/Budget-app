var budgetController=(function(){
    //create function constructor
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }
        else{
            this.percentage=-1;
        }
    }
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    var calculateTotal=function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]=sum;
    }

    //data structure
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };
    //expose to public
    return{
        addItem:function(type,des,val){
            var newItem,ID;
            //create new id
            //the next id=last id +1
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID=0;
            }
            
            //create new element based on type 'inc' or 'exp'
            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }
            else if(type==='inc'){
                newItem=new Income(ID,des,val);
            }
            //push it to our data structure
            data.allItems[type].push(newItem);
            //return the new item
            return newItem;
        },
        deleteItem:function(type,id){
            var ids,index;
            ids=data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }

        },
        calculateBudget:function(){
            //1. calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //2. calculate budget
            data.budget=data.totals.inc-data.totals.exp;
            //3. calculate percentage
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else{
                data.percentage=-1;
            }
        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget:function(){
            return{
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            };
            

        },
        testing:function(){
            console.log(data);
        }
    }
 
})();


var UIController=(function(){
    //so if we need to change we can do that in one place for just once
    var DOMStrings={
        inputType:'.add-type',
        inputDesc:'.add-description',
        inputValue:'.add-value',
        inputBtn:'.add-btn',
        incomeContainer:'.income-list',
        expensesContainer:'.expense-list',
        budgetLabel:'.budget-value',
        incomeLabel:'.budget-income-value',
        expensesLabel:'.budget-expenses-value',
        percentageLabel:'.budget-expenses-percentage',
        container:'.container',
        expensesPercLabel:'.item-percentage',
        dateLabel:'.budget-month'

    }
    //private method
    var formatNumber=function(num,type){
        var numSplit,int,dec,type;
        //abslute number without the sign
        num=Math.abs(num);
        //round the number to 2 decimals after the point(20=>20.00)
        num=num.toFixed(2);
        numSplit=num.split('.');
        int=numSplit[0];//20.34=>20
        if(int.length>3){
            //start at position 0 and take 3 numbers
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);//input 52134 ,output 52,134
        }
        dec=numSplit[1];//20.34=>34
        type==='exp'?sign='-':sign='+';
        return (type==='exp'?'-':'+')+' '+int+'.'+dec;
    };
     //loop return callback function in each itteration
     var nodeListForEach=function(list,callback){
        for(var i=0;i<list.length;i++){
            //(current,index)
            callback(list[i],i);
        }
    };
    return {
        //key:value
        getInput:function(){
            return{
                type:document.querySelector(DOMStrings.inputType).value,
                description:document.querySelector(DOMStrings.inputDesc).value,
                value:parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem:function(obj,type){
            var html,newHtml,element;
            //1. create html string with placeholder
            if(type==='inc'){
                element=DOMStrings.incomeContainer;
                html='<tr class="alert with-close alert-dismissible fade show h6 d-flex justify-content-between" id="inc-%id%"><td>%description%<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></td><td class="text-info">%value%</td></tr>';
            }
            else if (type==='exp'){
                element=DOMStrings.expensesContainer;
                html='<tr class="alert with-close alert-dismissible fade show h6 d-flex justify-content-between" id="exp-%id%"><td>%description%<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></td><td class="text-danger ml-5">%value%<span class="badge badge-danger ml-3 item-percentage">10%</span></td></tr>';
            }
            //2. replace the placeholder with actual data
            
            newHtml=html.replace('%id%', obj.id); 
            newHtml=newHtml.replace('%description%', obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));

            //3. insert the element into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        //  deleteListItem:function(selectorID){
        //     var el=document.getElementById(selectorID);
        //     el.parentNode.removeChild(el);
        // },
        clearFields:function(){
            var fields=document.querySelectorAll(DOMStrings.inputDesc + ','+DOMStrings.inputValue+','+DOMStrings.inputType);
            var fieldsArray=Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current,index,array){
                current.value="";
            });
            //set focus on the description field
            fieldsArray[0].focus();
        },
        displayBudget:function(obj){
            var type;
            obj.budget>0 ? type='inc' : type='exp';
            document.querySelector(DOMStrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0){
                document.querySelector(DOMStrings.percentageLabel).textContent=obj.percentage+'%';
            }
            else{
                document.querySelector(DOMStrings.percentageLabel).textContent='--%';
            }
        },
        displayPercentages:function(percentages){
            var fields=document.querySelectorAll(DOMStrings.expensesPercLabel);
           
            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+' %';
                }
                else{
                    current.textContent='--%';
                }
            });
            
        },
        displayMonth:function(){
            var now,year,month;
            now=new Date();
            month=now.getMonth();
            year=now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent=month+' '+year;
        },
        changeTheme:function(){
            var fields=document.querySelectorAll(
                DOMStrings.inputType+','+
                DOMStrings.inputDesc+','+
                DOMStrings.inputValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        //expose it to public so can use it in other modules
        getDomStrings:function(){
            return DOMStrings;
        }
    };
})();


//the global app controller
//this module connect the two other controllers 
var controller=(function(budgetCtrl,UICtrl){
    var setupEventListeners=function(){
        var Dom=UICtrl.getDomStrings();
        document.querySelector(Dom.inputBtn).addEventListener('click',ctrlAddItem);
        document.querySelector(Dom.inputType).addEventListener('change',UICtrl.changeTheme);
        document.addEventListener('keypress',function(event){
            if(event.code==="Enter"){
            ctrlAddItem();   
            }
        });
        document.querySelector(Dom.container).addEventListener('click',ctrlDeleteItem);

    };
    var updateBudget=function(){
        //1. calculate the budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        var budget=budgetCtrl.getBudget();
        //3. display the budget in the UI
        UICtrl.displayBudget(budget);
    };
    var updatePercentages=function(){
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        //2. read percentages fronm the budget controller
        var percentages=budgetCtrl.getPercentages();
        //3. update the ui with new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    // we will use it twice so make it outside then call it
    var ctrlAddItem=function(){
        var input,newItem;

        //1. get the input data
        input=UICtrl.getInput();
 
        if(input.description!=="" && !isNaN(input.value) && input.value>0){
        //2. add data to the budget controller
        newItem=budgetCtrl.addItem(input.type,input.description,input.value);

        //3. add the added items to the ui
        UICtrl.addListItem(newItem,input.type);
        //4. clear the fields
        UICtrl.clearFields();
        //5. update the final budget ui
        updateBudget();
        //6. calculate and update percentages
        updatePercentages();
        }
        
         
    };
    var ctrlDeleteItem=function(event){
       // console.log(event.target.parentNode.parentNode.parentNode.id);
        var itemID,splitID,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');//return array['inc','0'],['exp','0'],1,2,3
            type=splitID[0];
            ID=parseInt(splitID[1]);
            //1. delete the item from data structure
            budgetCtrl.deleteItem(type,ID);
            //2. delete the item from the ui
            //UICtrl.deleteListItem(itemID);
            //3. update new budget
            updateBudget();
            //4. calculate and update percentages
            updatePercentages();
        }
    };

    //function call
    return{
        init:function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:0
            });
            setupEventListeners();
        
        }
    }

})(budgetController,UIController);

controller.init();
