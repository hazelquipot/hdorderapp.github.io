var currentList = {};
var orderList = {};

function createOrderList(supplierName) {
    if (supplierName != "")
    {
        currentList.name = supplierName;
        currentList.items = new Array();

        // Web service call

        //showShoppingList();
        returnSupplierItems(supplierName);
    }
}

function showSupplierInfo() {
    $("#supplierEmail").val(currentList.supplierEmail);
}

function showShoppingList() {
    $("#shoppingListTitle").html(currentList.name);
    $("#shoppingListItems").empty();

    $("#createListDiv").hide();
    $("#shoppingListDiv").show();

    $("#newItemName").focus();
    $("#newItemName").keyup(function (event) {
        if (event.keyCode == 13) { //enter buton 
            addNewItem();
        }
    });
}

function addNewItem() {
    var newItem = {};
    newItem.name = $("#newItemName").val();
    currentList.items.push(newItem);

    drawItems();
    $("#newItemName").val("");
}

function drawItems() {
    var $list = $("#shoppingListItems").empty();

    for (var i = 0; i < currentList.items.length; i++) {
        var currentItem = currentList.items[i];

        var $li = $("<li>").html("<span class='item'>" + currentItem.name + "</span>")
            .attr("id", "item_" + i);

        var minusBtnHtml = "<span class='input-group-btn'><button type='button' class='btn btn-default btn-number' data-type='minus' data-field='quant[1]'>" +
                 "<span class='glyphicon glyphicon-minus'></span></button></span>";
        var $minusBtn = $(minusBtnHtml)
                .attr("id", "minus_item_" + i)
                .attr("onclick", "changeQty('minus', " + i + ")")
                .appendTo($li);
        
        var inputHtml = "<input type='text' name='quant[1]' class='form-control input-number' value='0' min='0' max='100000'>";

        var $qty = $(inputHtml).attr("id", "qty_item_" + i).appendTo($li);

        var addBtnHtml = "<span class='input-group-btn'><button type='button' class='btn btn-default btn-number' data-type='plus' data-field='quant[1]'>" +
                  "<span class='glyphicon glyphicon-plus'></span></button></span>";
        var $addBtn = $(addBtnHtml)
                .attr("id", "add_item_" + i)
                .attr("onclick", "changeQty('plus', " + i + ")")
                .appendTo($li);

        var s = currentItem.unit.split('/')[0];
        var p = currentItem.unit.split('/')[1];

        var $hdnS = $("<input type='hidden' value='" + s + "' />").attr("id", "single_unit_" + i).appendTo($li);
        var $hdnP = $("<input type='hidden' value='" + p + "' />").attr("id", "plural_unit_" + i).appendTo($li);

        var $unit = $("<span class='item_unit'>" + s + "</span>").attr("id", "unit_item_" + i).appendTo($li);

        $li.appendTo($list);
    }
}

function deleteItem(index) {
    currentList.items.splice(index, 1);
    drawItems();
}

function addItem(index) {

    if ($("#item_" + index).hasClass("added")) {
        $("#item_" + index).removeClass("added");
        $("#qty_item_" + index).css("pointer-events", "none");
        $("#qty_item_" + index).css("background-color", "#E8E8E8");
    }
    else { // user added the item to order list
        $("#item_" + index).addClass("added");
        $("#qty_item_" + index).removeAttr("style");
        $("#qty_item_" + index).css("background-color", "white");
    }
}

function getShoppingListById(id) {
    console.info(id);
    showShoppingList();
    drawItems();
}

function getItems(name) {
    var data = new Array();

    $.ajax({
        type: "GET",
        url: "supplierItems/" + name + ".json",
        dataType: "text",
        async: false,
        success: function (response) {
            var json = $.parseJSON(response);
            data = json;
        }
    });

    return data;
}

function returnSupplierItems(name) {
    currentList.name = name + " Products";
    currentList.supplierEmail = "supplierEmail@gmail.com";

    currentList.items = getItems(name);

    showShoppingList();
    showSupplierInfo();
    drawItems();
}

function submitOrder() {
    orderList.items = new Array();
    
    $('#shoppingListItems').each(function () {
        $(this).find('li').each(function () {
            var current = $(this);
            if (current.find('input').val() > 0)
            {
                var orderItem = {};
                orderItem.name = current.find('span.item').text();
                orderItem.quantity = current.find('input').val();
                orderItem.unit = current.find('span.item_unit').text();
                orderList.items.push(orderItem);
            }
        });
    });

    if (orderList.items.length > 0) {
        emailOrder();
    }
}

function emailOrder() {

    var message = 'Hi, \n\n Please see order below for delivery tomorrow:'
    message += '\n\n'

    $.each(orderList.items, function () {
        var orderItem = $(this);
        message += orderItem[0].name + ' - ' + orderItem[0].quantity + ' ' + orderItem[0].unit + '\n';
    });

    var uri = "mailto:" + currentList.supplierEmail + "?subject=";
    uri += "Henry Deane";
    uri += "&body=";
    uri += encodeURIComponent(message);
    window.location.href = uri;
}

//Dropdown
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function changeQty(operation, inputId)
{
    var newVal = 0;
    var fieldValue = parseInt($("#qty_item_" + inputId).val());
    if (operation == 'plus') {
        newVal = fieldValue + 1;
        $("#qty_item_" + inputId).val(newVal);
    } else if (operation == 'minus') {
        if (fieldValue > 0) {
            newVal = fieldValue - 1;
            $("#qty_item_" + inputId).val(newVal);
        }
    }

    var singular = $("#single_unit_" + inputId).val();
    var plural = $("#plural_unit_" + inputId).val();

    if (newVal > 1) {
        $("#unit_item_" + inputId).html(plural);
    } else {
        $("#unit_item_" + inputId).html(singular);
    }
}

$(document).ready(function () {
    $("#shoppingListName").focus();
    $("#shoppingListName").keyup(function (event) {
        if (event.keyCode == 13) { //enter buton 
            createOrderList();
        }
    });

    var pageUrl = window.location.href;
    var idIndex = pageUrl.indexOf("?id=");
    if (idIndex != -1) {
        getShoppingListById(pageUrl.substring(idIndex + 4));
    }
});




