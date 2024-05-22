using Microsoft.AspNetCore.Mvc;

[Route("api/data/v9.1/customapi_addfieldtosales")]
[ApiController]
public class CustomApiController : ControllerBase
{
    // Dynamics365Helperクラスのインスタンスを保持するフィールド
    private readonly Dynamics365Helper _dynamics365Helper;

    // コンストラクタでDynamics365Helperの依存関係を注入
    public CustomApiController(Dynamics365Helper dynamics365Helper)
    {
        _dynamics365Helper = dynamics365Helper ?? throw new ArgumentNullException(nameof(dynamics365Helper));
    }

    /// <summary>
    /// Salesエンティティにフィールドを追加するAPIエンドポイント。
    /// </summary>
    /// <returns>フィールドが正常に追加された場合のステータスコードとメッセージ。</returns>
    [HttpPost]
    public IActionResult AddFieldToSales()
    {
        try
        {
            // Salesエンティティにフィールドを追加するメソッドを呼び出し
            _dynamics365Helper.EnsureFieldsInSales();

            // フィールドが正常に追加された場合のレスポンスを返す
            return Ok(new { message = "Field added successfully" });
        }
        catch (Exception ex)
        {
            // 例外が発生した場合、500ステータスコードとエラーメッセージを含むレスポンスを返す
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
