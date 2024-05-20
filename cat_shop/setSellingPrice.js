function setSellingPriceOnItemChange(executionContext) {
    var formContext = executionContext.getFormContext();

    var itemNameField = formContext.getAttribute("cr11a_sales_itemname");
    var sellingPriceField = formContext.getAttribute("cr11a_sellingprice");

    if (!itemNameField || !sellingPriceField) {
        Xrm.Utility.alertDialog("The required fields are not present on the form.");
        return;
    }

    itemNameField.addOnChange(function() {
        var selectedItem = itemNameField.getValue();
        if (selectedItem && selectedItem[0] && selectedItem[0].id) {
            var itemId = selectedItem[0].id.replace(/[{}]/g, ""); // Remove curly braces from GUID

            // Fetch the item record to get the selling price
            Xrm.WebApi.retrieveRecord("cr11a_item", itemId, "?$select=cr11a_sellingprice").then(
                function success(result) {
                    if (result.cr11a_sellingprice != null) {
                        sellingPriceField.setValue(result.cr11a_sellingprice);
                        formContext.data.entity.save().then(
                            function success() {
                                Xrm.Utility.alertDialog("Selling price updated successfully.");
                            },
                            function error(error) {
                                Xrm.Utility.alertDialog("Failed to save record: " + error.message);
                            }
                        );
                    } else {
                        Xrm.Utility.alertDialog("Selling price not found for the selected item.");
                    }
                },
                function error(error) {
                    Xrm.Utility.alertDialog("Failed to retrieve item record: " + error.message);
                }
            );
        } else {
            sellingPriceField.setValue(null);
        }
    });
}
