// 商品名が変更されたときに実行される関数
function onItemNameChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var itemName = formContext.getAttribute("cr11a_sales_itemname").getValue();
    
    if (itemName) {
        // 商品名が指定されている場合は価格と数量を設定
        setItemPriceAndQuantity(formContext, itemName);
    }
}

// 商品の価格と数量を設定する関数
function setItemPriceAndQuantity(formContext, itemName) {
    // 選択された商品名の価格を取得
    Xrm.WebApi.retrieveMultipleRecords("cr11a_item", "?$filter=cr11a_itemName eq '" + itemName + "'").then(
        function success(result) {
            if (result.entities.length > 0) {
                var itemPrice = result.entities[0].cr11a_sellingprice;
                
                // 初期数量を設定
                var quantityField = formContext.getAttribute("cr11a_quantity");
                if (!quantityField) {
                    formContext.getControl("cr11a_sales_itemname").addCustomView("quantity_view", "Quantity View", "Quantity", "Enter quantity", 1);
                }
                quantityField.setValue(1);
                
                // 販売価格を設定
                var priceField = formContext.getAttribute("cr11a_sellingprice");
                if (!priceField) {
                    formContext.getControl("cr11a_sales_itemname").addCustomView("price_view", "Price View", "Price", "Enter price", itemPrice);
                }
                priceField.setValue(itemPrice);
                
                // 合計価格を計算して設定
                calculateTotalPrice(formContext);

                // 新しい商品フィールドを追加
                addNewItemField(formContext);
            }
        },
        function(error) {
            console.log(error.message);
        }
    );
}

// 合計価格を計算する関数
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
                        
                        // 合計価格フィールドを更新
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

// 新しい商品フィールドを追加する関数
function addNewItemField(formContext) {
    // サーバーサイドAPIを呼び出してエンティティのスキーマを更新する実装
    // 単純化のため、この目的のためのカスタムAPIが利用可能であると仮定します
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
