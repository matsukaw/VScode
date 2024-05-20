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

                        // Hide individual price fields if there are multiple items
                        if (itemFields.length > 1) {
                            formContext.getControl("cr11a_sellingprice").setVisible(false);
                            formContext.getControl("cr11a_totalprice").setVisible(true);
                        }
                    }
                },
                function(error) {
                    console.log(error.message);
                }
            );
        }
    });
}
