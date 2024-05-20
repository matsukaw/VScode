// 合計価格を計算して更新する関数
function calculateTotalPrice(formContext) {
    // 合計価格を初期化
    var totalPrice = 0;
    // 商品名フィールドを取得
    var itemFields = formContext.data.entity.attributes.get().filter(attr => attr.getName().startsWith("cr11a_sales_itemname"));
    
    itemFields.forEach(field => {
        var itemName = field.getValue();
        if (itemName) {
            // 商品名を使用して関連する商品レコードを検索
            Xrm.WebApi.retrieveMultipleRecords("cr11a_item", "?$filter=cr11a_itemName eq '" + itemName + "'").then(
                function success(result) {
                    if (result.entities.length > 0) {
                        // 商品の価格を取得して合計価格に加算
                        var itemPrice = result.entities[0].cr11a_sellingprice;
                        totalPrice += itemPrice;
                        
                        // 合計価格フィールドを更新
                        var totalPriceField = formContext.getAttribute("cr11a_totalprice");
                        if (!totalPriceField) {
                            // 合計価格フィールドが存在しない場合は追加する
                            formContext.getControl("cr11a_sales_itemname").addCustomView("total_price_view", "Total Price View", "Total Price", "Enter total price", totalPrice);
                        }
                        totalPriceField.setValue(totalPrice);

                        // 複数の商品がある場合には個々の価格フィールドを非表示にし、合計価格フィールドを表示
                        if (itemFields.length > 1) {
                            formContext.getControl("cr11a_sellingprice").setVisible(false);
                            formContext.getControl("cr11a_totalprice").setVisible(true);
                        }
                    }
                },
                function(error) {
                    // エラーメッセージをログに出力
                    console.log(error.message);
                }
            );
        }
    });
}
