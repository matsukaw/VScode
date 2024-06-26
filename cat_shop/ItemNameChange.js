const FIELD_NAMES = {
    ITEM_NAME: "cr11a_itemname",
    QUANTITY: "cr11a_quantity",
    SELLING_PRICE: "cr11a_sellingprice",
    TOTAL_PRICE: "cr11a_totalamount"
};

// フォームが読み込まれたときに実行される関数
function onLoad(executionContext) {
    try {
        if (!executionContext) {
            throw new Error("Execution context is not provided.");
        }

        var formContext = executionContext.getFormContext();

        // 商品名フィールドの値を取得
        var itemName = formContext.getAttribute(FIELD_NAMES.ITEM_NAME)?.getValue();

        // 商品名が設定されている場合は価格と数量を設定
        if (itemName) {
            setItemPriceAndQuantity(formContext, itemName);
        } else {
            // 商品名が設定されていない場合は価格と数量をクリア
            clearItemPriceAndQuantity(formContext);
        }

        // 商品名フィールドのOnChangeイベントを設定
        var itemNameField = formContext.getAttribute(FIELD_NAMES.ITEM_NAME);
        if (itemNameField) {
            itemNameField.addOnChange(onItemNameChange);
        }
    } catch (error) {
        console.error("Error in onLoad: " + error.message);
    }
}

// 商品名が変更されたときに実行される関数
function onItemNameChange(executionContext) {
    try {
        if (!executionContext) {
            throw new Error("Execution context is not provided.");
        }

        var formContext = executionContext.getFormContext();
        var itemName = formContext.getAttribute(FIELD_NAMES.ITEM_NAME)?.getValue();

        if (itemName) {
            setItemPriceAndQuantity(formContext, itemName);
        } else {
            clearItemPriceAndQuantity(formContext);
        }
    } catch (error) {
        console.error("Error in onItemNameChange: " + error.message);
    }
}

// 商品の価格と数量を設定する関数
function setItemPriceAndQuantity(formContext, itemName) {
    try {
        Xrm.WebApi.retrieveMultipleRecords("cr11a_item", "?$filter=cr11a_itemname eq '" + itemName + "'").then(
            function success(result) {
                if (result.entities.length > 0) {
                    var itemPrice = result.entities[0].cr11a_sellingprice;

                    // 初期数量を設定
                    setFieldValue(formContext, FIELD_NAMES.QUANTITY, 1);

                    // 販売価格を設定
                    setFieldValue(formContext, FIELD_NAMES.SELLING_PRICE, itemPrice);

                    // 合計価格を計算して設定
                    calculateTotalPrice(formContext);
                } else {
                    // データが見つからない場合は価格と数量をクリア
                    clearItemPriceAndQuantity(formContext);
                }
            },
            function(error) {
                console.error("Error in setItemPriceAndQuantity (retrieveMultipleRecords): " + error.message);
                clearItemPriceAndQuantity(formContext);
            }
        );
    } catch (error) {
        console.error("Error in setItemPriceAndQuantity: " + error.message);
        clearItemPriceAndQuantity(formContext);
    }
}

// 商品名が削除された場合に価格と数量をクリアする関数
function clearItemPriceAndQuantity(formContext) {
    try {
        setFieldValue(formContext, FIELD_NAMES.QUANTITY, null);
        setFieldValue(formContext, FIELD_NAMES.SELLING_PRICE, null);
        setFieldValue(formContext, FIELD_NAMES.TOTAL_PRICE, null);
    } catch (error) {
        console.error("Error in clearItemPriceAndQuantity: " + error.message);
    }
}

// フィールドの値を設定する関数
function setFieldValue(formContext, fieldName, value) {
    try {
        var field = formContext.getAttribute(fieldName);
        if (field) {
            field.setValue(value);
        }
    } catch (error) {
        console.error("Error in setFieldValue: " + error.message);
    }
}

// 合計価格を計算する関数
function calculateTotalPrice(formContext) {
    try {
        var quantity = formContext.getAttribute(FIELD_NAMES.QUANTITY)?.getValue();
        var sellingPrice = formContext.getAttribute(FIELD_NAMES.SELLING_PRICE)?.getValue();

        if (quantity != null && sellingPrice != null) {
            var totalPrice = quantity * sellingPrice;
            setFieldValue(formContext, FIELD_NAMES.TOTAL_PRICE, totalPrice);
        } else {
            setFieldValue(formContext, FIELD_NAMES.TOTAL_PRICE, null);
        }
    } catch (error) {
        console.error("Error in calculateTotalPrice: " + error.message);
    }
}
