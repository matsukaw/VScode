function calculateTotalPrice(formContext) {
    var totalPrice = 0;
    var itemFields = formContext.data.entity.attributes.get().filter(attr => attr.getName().startsWith("cr11a_sales_itemname"));
    
    var promises = itemFields.map(field => {
        var itemName = field.getValue();
        if (itemName) {
            // 商品の価格を取得する Promise を返す
            return Xrm.WebApi.retrieveMultipleRecords("cr11a_item", "?$filter=cr11a_itemName eq '" + itemName + "'").then(
                function success(result) {
                    if (result.entities.length > 0) {
                        var itemPrice = result.entities[0].cr11a_sellingprice;
                        totalPrice += itemPrice;
                    }
                },
                function(error) {
                    console.log(error.message);
                }
            );
        }
    });

    // すべての非同期操作が完了した後に処理を続行する Promise を返す
    return Promise.all(promises).then(function() {
        // 合計価格をフォームのフィールドに設定する
        var totalPriceField = formContext.getAttribute("cr11a_totalprice");
        if (!totalPriceField) {
            formContext.getControl("cr11a_sales_itemname").addCustomView("total_price_view", "Total Price View", "Total Price", "Enter total price", totalPrice);
        }
        totalPriceField.setValue(totalPrice);

        // 商品が複数ある場合、個々の価格フィールドを非表示にする
        if (itemFields.length > 1) {
            formContext.getControl("cr11a_sellingprice").setVisible(false);
            formContext.getControl("cr11a_totalprice").setVisible(true);
        }
    }).catch(function(error) {
        // エラーハンドリング
        console.log("Error in calculateTotalPrice: " + error.message);
    });
}
