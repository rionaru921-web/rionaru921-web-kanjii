export interface AreaOption {
  // 楽天トラベルAPIの middleClassCode (都道府県相当)。largeClassCode は
  // 全都道府県共通で "japan" を使う。
  code: string;
  name: string;
  // 主要な観光地・エリア名(市区町村コードではなく、検索キーワードとして
  // 都道府県名と組み合わせて使う表示名)。未確認の smallClassCode を
  // 誤って使わないよう、あえてプレーンな文字列のみ保持している。
  cities?: string[];
}

// 出典: https://webservice.rakuten.co.jp/documentation/simple-hotel-search
// middleClassCode は都道府県ローマ字表記に準拠しているが、実際にAPIを
// 叩いて確認したものではないため、0件 or エラー時は
// app/api/rakuten/hotels/route.ts 側でキーワード検索にフォールバックする。
export const RAKUTEN_PREFECTURES: AreaOption[] = [
  { code: "hokkaido", name: "北海道", cities: ["札幌", "函館", "小樽", "旭川", "ニセコ", "登別・洞爺湖"] },
  { code: "aomori", name: "青森県" },
  { code: "iwate", name: "岩手県" },
  { code: "miyagi", name: "宮城県", cities: ["仙台", "松島"] },
  { code: "akita", name: "秋田県" },
  { code: "yamagata", name: "山形県", cities: ["蔵王"] },
  { code: "fukushima", name: "福島県" },
  { code: "ibaraki", name: "茨城県" },
  { code: "tochigi", name: "栃木県", cities: ["日光", "那須"] },
  { code: "gunma", name: "群馬県", cities: ["草津温泉", "軽井沢周辺"] },
  { code: "saitama", name: "埼玉県" },
  { code: "chiba", name: "千葉県", cities: ["舞浜・ディズニーリゾート", "成田", "木更津"] },
  { code: "tokyo", name: "東京都", cities: ["新宿", "渋谷", "浅草", "銀座", "お台場", "池袋"] },
  { code: "kanagawa", name: "神奈川県", cities: ["横浜", "鎌倉", "箱根", "江の島"] },
  { code: "niigata", name: "新潟県" },
  { code: "toyama", name: "富山県" },
  { code: "ishikawa", name: "石川県", cities: ["金沢"] },
  { code: "fukui", name: "福井県" },
  { code: "yamanashi", name: "山梨県", cities: ["河口湖・富士五湖"] },
  { code: "nagano", name: "長野県", cities: ["軽井沢", "松本", "長野市", "志賀高原"] },
  { code: "gifu", name: "岐阜県", cities: ["高山"] },
  { code: "shizuoka", name: "静岡県", cities: ["熱海", "伊豆", "浜松"] },
  { code: "aichi", name: "愛知県", cities: ["名古屋"] },
  { code: "mie", name: "三重県", cities: ["伊勢志摩"] },
  { code: "shiga", name: "滋賀県" },
  { code: "kyoto", name: "京都府", cities: ["京都市内", "嵐山", "天橋立"] },
  { code: "osaka", name: "大阪府", cities: ["大阪市内", "梅田", "難波", "ユニバーサル・スタジオ・ジャパン周辺"] },
  { code: "hyogo", name: "兵庫県", cities: ["神戸", "有馬温泉", "姫路"] },
  { code: "nara", name: "奈良県", cities: ["奈良市内"] },
  { code: "wakayama", name: "和歌山県", cities: ["白浜"] },
  { code: "tottori", name: "鳥取県" },
  { code: "shimane", name: "島根県" },
  { code: "okayama", name: "岡山県" },
  { code: "hiroshima", name: "広島県", cities: ["広島市内", "宮島"] },
  { code: "yamaguchi", name: "山口県" },
  { code: "tokushima", name: "徳島県" },
  { code: "kagawa", name: "香川県" },
  { code: "ehime", name: "愛媛県", cities: ["道後温泉"] },
  { code: "kochi", name: "高知県" },
  { code: "fukuoka", name: "福岡県", cities: ["福岡市内", "博多"] },
  { code: "saga", name: "佐賀県" },
  { code: "nagasaki", name: "長崎県", cities: ["長崎市内", "ハウステンボス"] },
  { code: "kumamoto", name: "熊本県", cities: ["熊本市内", "阿蘇"] },
  { code: "oita", name: "大分県", cities: ["別府", "由布院"] },
  { code: "miyazaki", name: "宮崎県" },
  { code: "kagoshima", name: "鹿児島県", cities: ["鹿児島市内", "指宿"] },
  { code: "okinawa", name: "沖縄県", cities: ["那覇", "恩納村", "石垣島", "宮古島"] },
];
