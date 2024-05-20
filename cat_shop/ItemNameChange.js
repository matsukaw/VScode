function onItemNameChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var itemName = formContext.getAttribute("cr11a_sales_itemname").getValue();
    
    if (itemName) {
        setItemPriceAndQuantity(formContext, itemName);
    }
}

function setItemPriceAndQuantity(formContext, itemName) {
    // Fetch the price for the selected item name
    Xrm.WebApi.retrieveMultipleRecords("cr11a_item", "?$filter=cr11a_itemName eq '" + itemName + "'").then(
        function success(result) {
            if (result.entities.length > 0) {
                var itemPrice = result.entities[0].cr11a_sellingprice;
                
                // Set initial quantity
                var quantityField = formContext.getAttribute("cr11a_quantity");
                if (!quantityField) {
                    formContext.getControl("cr11a_sales_itemname").addCustomView("quantity_view", "Quantity View", "Quantity", "Enter quantity", 1);
                }
                quantityField.setValue(1);
                
                // Set the selling price
                var priceField = formContext.getAttribute("cr11a_sellingprice");
                if (!priceField) {
                    formContext.getControl("cr11a_sales_itemname").addCustomView("price_view", "Price View", "Price", "Enter price", itemPrice);
                }
                priceField.setValue(itemPrice);
                
                // Calculate and set the total price
                calculateTotalPrice(formContext);

                // Add a new item field
                addNewItemField(formContext);
            }
        },
        function(error) {
            console.log(error.message);
        }
    );
}

function calculateTotalPrice(formContext) {
    var totalPrice = 0;
    var itemFields = formContext.data.entity.attributes.get().filter(attr => attr.getName().startsWith("cr11a_sales_itemname"));
    
    itemFields.forEach(field => {
        var itemName = field.getValue();
        if (itemName) {
            Xrm.WebApi.retrieveMultipleRecords("cr11a_item", "?$filter=cr11a_itemName eq '" + itemName + "'").then(
                function success(result) {
                    if (result.entities.length > 0) {
                        var itemPrice = result.entities[0].cr11a_sellingprice;
                        totalPrice += itemPrice;
                        
                        // Update total price field
                        var totalPriceField = formContext.getAttribute("cr11a_totalprice");
                        if (!totalPriceField) {
                            formContext.getControl("cr11a_sales_itemname").addCustomView("total_price_view", "Total Price View", "Total Price", "Enter total price", totalPrice);
                        }
                        totalPriceField.setValue(totalPrice);
                    }
                },
                function(error) {
                    console.log(error.message);
                }
            );
        }
    });
}

function addNewItemField(formContext) {
    // Implementation to dynamically add a new item name field
    // This can be done by calling a server-side API to update the entity schema
    // For simplicity, let's assume a custom API is available for this purpose
    var req = new XMLHttpRequest();
    req.open("POST", "/api/data/v9.1/customapi_addfieldtosales", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var result = JSON.parse(this.response);
                console.log("Field added successfully");
            } else {
                var error = JSON.parse(this.response).error;
                console.error(error.message);
            }
        }
    };
    req.send();
}
